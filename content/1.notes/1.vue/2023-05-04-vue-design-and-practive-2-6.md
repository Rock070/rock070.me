---
date: 2023-05-09 21:44:06
title: 「Vue 設計與實現」響應系統原理（六）- 避免無限遞迴
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 避免無限遞迴
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

## 無限遞迴的情境

在副作用函數裡面讀取 & 修改同時發生

如這個範例：

```js [infinity.js]
const data = { foo: 1 }
const proxy = new Proxy(data, { /* ... */ })

effectRegister(() => proxy.foo++)
```

可以看到在 effectRegister 註冊的副作用函式，有一個複寫自己的操作，會導致 stack overflow

```terminal
Uncaught RangeError: Maximum call stack size exceeded
```

## 發生的流程

1. 讀取 proxy.foo 的值
2. 觸發 track，將副作用收集到桶中
3. 賦值給 proxy.foo
4. 觸發 trigger，把桶中的副作用拿出來執行
5. 因為整個副作用函式還沒執行完，就調用副作用函式，導致 stack 堆疊
6. 1 - 5 重複執行

## 防護機制

因為這樣的問題，所以導致無限遞迴的發生，需要避免這個問題，就需要建立一個防衛機制，如果 trigger 觸發執行的副作用函式，與當前正在執行的 activeEffect 副作用函式相同，則不觸發執行

```js [trigger.js]
effects && effects.forEach((effectFn) => {
// 如果 trigger 觸發執行的副作用函式與當前正在執行的副作用函式相同，则不觸發執行
  if (effectFn !== activeEffect) { // 新增
    effectsToRun.add(effectFn)
  }
})
effectsToRun.forEach(effectFn => effectFn())
```

## 完整程式碼

[避免無限遞迴 - stackblitz](https://stackblitz.com/edit/js-hdu8cr?file=index.js)

```js [infinity.js]
/**
 * 副作用函式
 */
let activeEffect

const activeEffectStack = []

/**
 * 註冊副作用的函式
 * effect => effectRegister
 */
function effectRegister(fn) {
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

  effectToRun && effectToRun.forEach(fn => fn())
}

effectRegister(() => {
  console.log('effectRegister')

  proxy.age++
})
```