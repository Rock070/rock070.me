---
date: 2023-05-05 00:44:06
title: 「Vue 設計與實現」響應系統原理（二）- 提高響應系統對副作用函式收集的彈性
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 提高響應系統對副作用函式收集的彈性
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

為了讓 effect 函式可以彈性的接受不同的 function 名稱與接受匿名函式，可以把原本的 effect **副作用函式**改造為 effectRegister **註冊並且執行副作用的函式**

1. 新增全域變數 activeEffect
2. effect 改為 effectRegister

::code-group

  ```js [Before]
  function effect() {
    console.log('effect run')
    document.body.innerText = proxy.text
  }
  ```

  ```js [After]
  // 副作用函式
  let activeEffect

  // 註冊副作用的函式並執行
  function effectRegister(fn) {
    activeEffect = fn // 註冊
    fn() // 執行
  }

  // 執行註冊
  effectRegister(() => {
    document.body.innerText = proxy.text
  })
  ```

::

從上面的程式碼可以看到，effect 不再是硬編碼，而是保有函式名稱彈性的。

接下來需要調整 get 的流程，從原本收集 effect 改為收集 activeEffect

::code-group

```js [Before]
const proxy = new Proxy(data, {
  get(target, key) {
    bucket.add(effect) // 舊版直接拿 effect 收集進桶中
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    bucket.forEach(fn => fn())

    return true
  },
})
```

```js [After]
const proxy = new Proxy(data, {
  get(target, key) {
    if (activeEffect)
      bucket.add(activeEffect) // 新版改為拿 activeEffect 收集進入桶中
    console.log(target, key)
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    bucket.forEach(fn => fn())

    return true
  },
})
```

::

## 完整程式碼

[effect 改為 effect 註冊器 - stackblitz](https://stackblitz.com/edit/js-wzmhdt?file=index.js)

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
  activeEffect = fn // 註冊
  fn() // 執行
}

// 桶
const bucket = new Set()

const data = { text: 'hello world', age: 22 }

const proxy = new Proxy(data, {
  get(target, key) {
    if (activeEffect)
      bucket.add(activeEffect)
    console.log(target, key)
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    bucket.forEach(fn => fn())

    return true
  },
})

effectRegister(() => {
  console.log('effect run')
  document.body.innerText = proxy.text
})

setTimeout(() => {
  proxy.text = 'goodbye'

  // proxy.notExist = 'goodbye' 這邊讀取不存在的屬性，仍會執行整個 proxy 副作用收集的回調 `bucket.forEach(fn => fn()`
}, 2000)
```

解決了函式彈性的問題，上方的程式碼仍有一個問題：**proxy 的每一個屬性會共享所有的副作用**。

若我對 proxy 不存在的屬性設值，如 `proxy.notExist = 'goodbye'`，按照目前的設計，仍會執行 set 當中的副作用回調 `bucket.forEach(fn => fn())`，但響應系統理想的設計，應只**收集被讀取的屬性，而不是整個物件被收集**，所以我們需要對「桶」`net Set()`做重新設計。
