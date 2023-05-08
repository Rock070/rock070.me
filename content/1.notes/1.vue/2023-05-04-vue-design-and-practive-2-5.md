---
date: 2023-05-07 01:44:06
title: 「Vue 設計與實現」響應系統原理（四）- 巢狀的 effect
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 巢狀的 effect
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

## 巢狀導致收集到錯誤的 effect

在目前的實現中，若使用到巢狀的 effect，會有收集錯誤的問題，如下面這個範例：

[收集錯誤的巢狀 effect - stackblitz](https://stackblitz.com/edit/js-hkvqta?file=index.js)

```js [effect.js]
effectRegister(() => {
  console.log('effectRegister 1')
  effectRegister(() => {
    console.log('effectRegister 2')
    document.body.innerText = proxy.age
  })
  document.body.innerText = proxy.text
})

setTimeout(() => {
  proxy.text = '222'
}, 2000)
```

在 `effectRegister` 第一層打印 `effectRegister 1`，第二層打印 `effectRegister 2`，原本預期當 setTimeout 2 秒後，更改 `proxy.text`，會執行 effectRegister 第一層，印出 `effectRegister 1`，但結果不如預計，會印出 `effectRegister 2`：

```js []
'effectRegister 1'
'effectRegister 2'
'effectRegister 2'
```

這個問題的原因是源於 activeEffect 的設計，是單一個變數，所以當 effectRegister 第二層執行的時候， activeEffect 就被覆寫了，所以當 `proxy.text` 被 track 的時候，就會收集到第二層的 effectRegister。

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
```

## 重新設計 activeEffect

為了解決這個問題，我們會需要一個 stack 變數： `activeEffectStack`，在執行副作用函式前收集起來，執行完 pop 出來，並切換 activeEffect 到前一個 effect。

依照 stack 的**後進先出**的設計，就可以解決**巢狀執行帶來被覆寫的問題**。

```js
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
```

## 完整程式碼

[activeEffectStack - stackblitz](https://stackblitz.com/edit/js-qdaeco?file=index.js)

```js [effect-stack.js]
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

const data = { text: 'hello world', age: 22 }

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
}

effectRegister(() => {
  console.log('effectRegister 1')
  effectRegister(() => {
    console.log('effectRegister 2')
    document.body.innerText = proxy.age
  })
  document.body.innerText = proxy.text
})

setTimeout(() => {
  proxy.text = '222'
}, 2000)
```