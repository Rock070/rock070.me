---
date: 2023-05-14 20:44:06
title: 「Vue 設計與實現」響應系統原理（八）- 基於 scheduler 實作任務隊列 jobQueue
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 基於 scheduler 實作任務隊列 jobQueue
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

接續前面的調度器，接下來會簡單實現在 Vue.js 當中，如何做到**多次修改響應式資料，卻只會觸發一次副作用執行**

以下面的例子來說，副作用會先執行一次，然後在 `proxy.age` 被更改的時候觸發副作用執行，所以會打印出 1, 2, 3。

```javascript [case.js]
const data = { age: 1 }
const proxy = new Proxy(data, { /* ... */ })

effectRegister(() => {
  console.log(proxy.age)
})

proxy.age++
proxy.age++

// 1
// 2
// 3
```

而我們會希望略過「**過渡狀態**」，只打印出 1, 3，原因是因為想要**節省執行副作用函式的次數**，以**最近最後一次更改**響應式資料來 trigger 執行副作用函式，藉此**提升效能**，而這部分也是響應系統非常重要的一個設計。

因此我們需要建立一個**任務隊列 jobQueue**，創建一個 **promise 微任務隊列（MicroTask Queue**），並使用 **flushJob** 來刷新任務隊列，用 **isFlushing** 來表示當前是否在執行任務隊列。

```javascript [jobQueue.js]
const jobQueue = new Set()

const p = Promise.resolve()

let isFlushing = false
function flushJob() {
  if (isFlushing)
    return

  isFlushing.value = true

  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}

effectRegister(() => {
  console.log(proxy.age)
}, {
  scheduler(fn) {
    jobQueue.add(fn)
    flushJob()
  }
})

proxy.age++
proxy.age++

// 1
// 3
```

## 執行細節

在上方的程式碼中，執行起來會是像這樣

- 建立 jobQueue 任務隊列，並使用 Set 達到去重的功用。
- 使用 Promise 建立 p 微任務隊列，方便在當下的宏任務執行完成後，下一個宏執行前就先執行副作用函式。
- 宣告 isFlushing 來判斷當前是否在刷新隊列，所謂刷新隊列意思就是完成任務隊列裡面的任務，執行每一個函式，且清除隊列。
- 宣告 flushJob 刷新隊列函式，使用 isFlushing 來控制是否要執行刷新隊列，若 `isFlushing = false` 沒有正在刷新，則將 isFlushing 調整為 true，並開始刷新隊列，並在完成後把 isFlushing 改回 false，並清空隊列。若執行 flushJob 時 `isFlushing = true`，代表正在刷新隊列，就不刷新，保留在隊列中。
- 註冊一個副作用函式，讀取 `proxy.age`，並把函式 track 到副作用桶子內，並執行一次 function，宣告 scheduler 在下次 proxy.age 被改動後，使用 scheduler 來 trigger 觸發副作用函式。
- 每次 trigger 都會執行 scheduler，每次都會把副作用收集到 jobQueue 任務隊列中，並觸發刷新隊列。

## 完整程式碼

[jobQueue 任務隊列 - stackblitz](https://stackblitz.com/edit/js-hepk1j?file=index.js)

```javascript [jobQueue.js]
/**
 * 副作用函式
 */
let activeEffect

const activeEffectStack = []

/**
 * 註冊副作用的函式
 * effect => effectRegister
 */
function effectRegister(fn, options = {}) {
  const effectFn = () => {
    // 從桶中清除當前要執行的副作用
    cleanup(effectFn)

    // 寫入全域副作用變數，方便下次追蹤可以正常抓取
    activeEffect = effectFn
    activeEffectStack.push(effectFn)

    // 執行副作用
    fn()

    activeEffectStack.pop()
    activeEffect = activeEffectStack.at(-1)
  }

  effectFn.options = options
  // 初始化 effectFn.deps
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn) {
  // 跑迴圈刪除，確保當前 effect 內收集的所有相同的副作用，只會執行一次
  for (let i = 0; i < effectFn.deps.length; i++) {
    const depsSet = effectFn.deps[i]
    depsSet.forEach((i) => {})
    depsSet.delete(effectFn)
  }

  // 清理 effectFn.deps
  effectFn.deps.length = 0
}

const data = { age: 1 }

const bucket = new WeakMap()
const proxy = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    trigger(target, key)

    return true
  },
})

// 在 get 函數中調用 track 函數追蹤變化
function track(target, key) {
  if (!activeEffect)
    return
  const _depsMap = bucket.get(target)
  const hasDepsMap = !!_depsMap

  // 檢查是否有對應的 Map，沒有就創建一個新的
  const depsMap = hasDepsMap ? _depsMap : new Map()
  !hasDepsMap && bucket.set(target, depsMap)

  const _deps = depsMap.get(key)
  const hasDeps = !!_deps

  // 檢查是否有對應的 Set，沒有就創建一個新的
  const deps = hasDeps ? _deps : new Set()
  !hasDeps && depsMap.set(key, deps)

  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

// 在 set 函數内調用 trigger 函數觸發變化
function trigger(target, key) {
  const effects = bucket.get(target)?.get(key)
  const effectToRun = new Set()
  effects.forEach((effectfn) => {
    if (effectfn !== activeEffect)
      effectToRun.add(effectfn)
  })

  effectToRun
    && effectToRun.forEach((fn) => {
      const scheduler = fn.options.scheduler
      if (scheduler)
        scheduler(fn)
      else fn()
    })
}

const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false
function flushJob() {
  if (isFlushing)
    return
  isFlushing = true

  p.then(() => {
    jobQueue.forEach((job) => {
      job()
    })
  }).finally(() => {
    jobQueue.clear()
    isFlushing = false
  })
}

effectRegister(
  () => {
    console.log(proxy.age)
  },
  {
    scheduler(fn) {
      jobQueue.add(fn)
      flushJob()
    },
  }
)

proxy.age++
proxy.age++
```

## 參考文章

- [微任务、宏任务与Event-Loop - 稀土掘金](https://juejin.cn/post/6844903657264136200)
- [JS 原力覺醒 Day15 - Macrotask 與 MicroTask - iT 邦幫忙](https://ithelp.ithome.com.tw/articles/10222737)
