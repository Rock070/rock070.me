---
date: 2023-05-10 01:44:06
title: 「Vue 設計與實現」響應系統原理（七）- scheduler 調度器
description: 「Vue.js 設計與實現」之讀書筆記與整理 - scheduler 調度器
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

## 調度器概念

調度器是響應系統非常重要的特性之一，主要指的是在 trigger 觸發副作用函式重新執行時，透過「**調度器**」來決定副作用函式觸發的幾項因素：

- **時機點**
- **次數**
- **觸發方式**

使用起來大概會長像這樣，在 `effectRegister` 的第二個參數傳入一個 `options` 的物件，物件內包含屬性 **scheduler**。 在 trigger 的時候，取代 effectFn，執行 scheduler，如使用 setTimeout 來延後執行副作用函式。

```javascript
effectRegister(
  () => {
    console.log(proxy.age)
  },
  // options
  {
    scheduler(effectFn) {
      // do something...
      setTimeout(effectFn)
    }
  }
)
```

## 調度器實作

要實作調度器其實非常簡單，有兩個地方要實作：

### 1. 擴充 effectRegister 函式

在 `effectRegister` 註冊副作用函式的時候，把 options 也存在 effectFn 上一起被 track 函示收集。

```javascript [effectRegister.js]
function effectRegister(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)

    activeEffect = effectFn
    activeEffectStack.push(effectFn)

    fn()

    activeEffectStack.pop()
    activeEffect = activeEffectStack.at(-1)
  }

  effectFn.options = options // 新增這行
  effectFn.deps = []
  effectFn()
}
```

### 2. 擴充 trigger 函式

在 `trigger` 函式執行的時候將執行 effectFn 取代為執行將 effectFn 當作參數傳入的 scheduler。

```javascript [trigger.js]
function trigger(target, key) {
  const effects = bucket.get(target)?.get(key)
  const effectToRun = new Set()
  effects.forEach((effectfn) => {
    if (effectfn !== activeEffect)
      effectToRun.add(effectfn)
  })

  effectToRun
    && effectToRun.forEach((fn) => {
      // 新增這段邏輯
      const scheduler = fn.options.scheduler
      if (scheduler)
        scheduler(fn)

      else
        fn()

    })
}
```

## 調度器使用範例

這是一個尚未實作調度器前的應用：

```javascript [case.js]
const data = { age: 1 }
const proxy = new Proxy(data, { /* ... */ })

effectRegister(() => {
  console.log(proxy.age)
})

proxy.age++

console.log('结束了')

// 1
// 2
// 結束了
```

按照目前的實作，會按照順序打印：

```javascript
1
2
結束了
```

但如果今天想要改變打印順序，變為：

```javascript
1
結束了
2
```

就可以使用 scheduler 調度器來延後第二次副作用函式的執行，讓「結束了」先打印出來：

```javascript [case.js]
const data = { age: 1 }
const proxy = new Proxy(data, { /* ... */ })

effectRegister(
  () => {
    console.log(proxy.age)
  },
  {
    scheduler(fn) {
      setTimeout(fn)
    }
  }
)

proxy.age++

console.log('结束了')

// 1
// 2
// 結束了
```

## 完整程式碼

[scheduler 調度器 - stackblitz](https://stackblitz.com/edit/js-utfxu7?file=index.js)

```javascript [scheduler.js]
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

effectRegister(
  () => {
    console.log(proxy.age)
  },
  {
    scheduler(fn) {
      setTimeout(fn)
    },
  }
)

proxy.age++

console.log('結束了')
```
