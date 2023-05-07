---
date: 2023-05-07 01:44:06
title: 「Vue 設計與實現」響應系統原理（四）- cleanup 副作用回收機制
description: 「Vue.js 設計與實現」之讀書筆記與整理 - cleanup 副作用回收機制
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

## 遺留的副作用函式

先前設計的桶子更完善了，會根據各個屬性收集副作用，也進行了 track, trigger 封裝，提高擴充性。

但在某些情況，還是會有不夠完善的問題，以下面的程式碼為例，按照目前的實現，當 `proxy.ok` 改為 false 之後，觸發副作用函式執行，此時 `proxy.text` 不會被讀取，理想上副作用桶裡應該不存在 `proxy.text` 的收集，但當 `proxy.text` 重新賦值後，仍會觸發副作用函式，打印出「effect run」，稱為「**遺留的副作用函式**」。

[副作用遺留 - stackblitz](https://stackblitz.com/edit/js-m7rv8n?file=index.js)

```js [effect.js]
const data = { ok: true, text: 'hello world' }
const proxy = new Proxy(data, { /* ... */ })
effect(() => {
  console.log('effect run')
  document.body.innerText = proxy.ok ? proxy.text : 'not'
})

setTimeout(() => {
  proxy.ok = false

  setTimeout(() => {
    proxy.text = '222'
  }, 2000)
}, 2000)
```

### 副作用遺留

![](https://i.imgur.com/MqMxkoi.png)

### 理想的副作用收集

![](https://i.imgur.com/7iL9lvM.png)

## 副作用回收機制（clean up）

為了解決這個問題，需要設計一個**副作用回收**的機制，在每次 trigger 副作用函式執行前，就將桶中對應的的副作用函式刪除，這樣當副作用函式執行時，就可以依照當前情境去 track 當前作用域內的所有 proxy 的讀取。

### 實作 cleanup

會有三個步驟：

#### 1. cleanup function

創建一個 cleanup 函式，將 effectFn 傳入，並需要讓 effectFn 知道自己被哪些副作用函示集合（effectFn Set）收集。

effectFn 需要擴充一個屬性 `deps: Set[]`，在屬性讀取並 track 時，將 effectFn Set 收集，cleanup 執行時，去所有桶子內清除當前相關的 effectFn。

```js [clean-up.js]
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    effectFn.deps[i].forEach((i) => {
      i.delete(effectFn)
    })
  }

  effectFn.deps.length = 0
}
```

#### 2. 在 effectRegister 內封裝 effectFn

```js [effectRegister.js]
let activeEffect

function effectRegister(fn) {
  const effectFn = () => {
    // 從桶中清除當前要執行的副作用
    cleanup(effectFn)

    // 寫入全域副作用變數，方便下次追蹤可以正常抓取
    activeEffect = effectFn

    // 執行副作用
    fn()
  }

  // 初始化 effectFn.deps
  effectFn.deps = []
  effectFn()
}
```

3. track 時收集

在 track 函式內新增收集 `activeEffect.deps.push(deps)`

```js [track.js]
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

  // 新增這一行
  activeEffect.deps.push(deps)
}
```

## 無限迴圈問題

[ECMA-2023 Set.prototype.forEach](https://tc39.es/ecma262/2023/#sec-set.prototype.foreach)

根據 2023 ECMA Script 規範當中提到，在調用 forEach 遍歷 Set 集合時，如果在訪問某個值後將其刪除，然後在 forEach 調用完成之前重新添加該值，則會重新訪問該值。

::alert{type="info"}s
Each value is normally visited only once. However, a value will be revisited if it is deleted after it has been visited and then re-added before the forEach call completes.

每個值通常只被訪問一次。但是，如果在訪問某個值後將其刪除，然後在 forEach 調用完成之前重新添加該值，則會重新訪問該值。
::

簡單以程式碼實現無限迴圈會是這樣：

```js [infinity-loop.js]
const set = new Set([1])

const newSet = new Set(set)
newSet.forEach((item) => {
  set.delete(1)
  set.add(1)
  console.log('遍歷中')
})
```

## 解決無限迴圈問題

加上目前 cleanup 回收的機制後，會有無限迴圈的問題，問題出在 trigger 函數內 forEach 執行 Set 導致的。

effect Set 迴圈執行 -> cleanup -> 副作用函式 -> track -> 重新收集進 effect Set -> 因為 effect Set 迴圈還沒結束就重新收集 -> 無限迴圈

```js [trigger.js]
function trigger(target, key) {
  /**
   * ...
   */
  effects && effects.forEach(fn => fn())
}
```

解決辦法很簡單，就是在 trigger 內創建一個新的 Set 集合 `effectToRun` 遍歷。

```js [trigger.js]
function trigger(target, key) {
  /**
   * ...
   */
  const effectToRun = new Set(effects)
  effectToRun && effectToRun.forEach(fn => fn())
  // effects && effects.forEach((fn) => fn());
}
```

## 完整程式碼

[完整程式碼 - stackblitz](https://stackblitz.com/edit/js-desqvb?file=index.js)

```js
/**
 * 副作用函式
 */
let activeEffect

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

    // 執行副作用
    fn()
  }

  // 初始化 effectFn.deps
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn) {
  // 跑迴圈刪除，確保當前 effect 內收集的所有相同的副作用，只會執行一次
  for (let i = 0; i < effectFn.deps.length; i++) {
    const depsSet = effectFn.deps[i]
    depsSet.delete(effectFn)
  }

  // 重置 effectFn.deps
  effectFn.deps.length = 0
}

const data = { text: 'hello world', ok: true }

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
  const effectToRun = new Set(effects)
  effectToRun && effectToRun.forEach(fn => fn())
  // effects && effects.forEach((fn) => fn());
}

effectRegister(() => {
  console.log('effect run')

  document.body.innerText = proxy.ok ? proxy.text : 'not'
})

setTimeout(() => {
  proxy.ok = false

  setTimeout(() => {
    proxy.text = '222'
  }, 2000)
}, 2000)
```