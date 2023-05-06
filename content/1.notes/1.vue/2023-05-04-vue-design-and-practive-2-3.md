---
date: 2023-05-06 15:44:06
title: 「Vue 設計與實現」響應系統原理（三）- 更完善的副作用桶子
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 更完善的副作用桶子
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

為了解決桶不夠完善的問題，需要把結構調整一下，原本只是簡單的 Set 收集副作用，現在需要調整為把各個物件、屬性、副作用分別收集。

::code-group

```md [Before]
// 單層
effectFn 
```

```md [After]
 target
   └── key
     └── effectFn
```

::

## 修改前的桶

只有 Set 的單層結構，每個物件、屬性被讀取（get），都會被收集到同一個 Set 內，當任一個屬性被設值（set），就會把所有的副作用拿出來執行，這樣是不合理的。

在下面的程式碼中，我們使用 new Set 當作桶子，在 setTimeout 2 秒後，修改了不存在的屬性 `proxy.notExist`，卻觸發了副作用函式的執行，log 了 `'effect run'`，但是 notExist 這個屬性是**沒有在任何地方被讀取**的，不需要執行副作用。當 proxy 越來越龐大，這會是一個**效能問題**。

[不完善的桶 - stackblitz](https://stackblitz.com/edit/js-266sve?file=index.js)

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
  activeEffect = fn
  fn()
}

const bucket = new Set()

const data = { text: 'hello world', age: 22 }

const proxy = new Proxy(data, {
  get(target, key) {
    if (activeEffect)
      bucket.add(activeEffect)
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
  proxy.notExist = 'goodbye'
  // 這邊讀取不存在的屬性，仍會執行整個 proxy 副作用收集的回調 `bucket.forEach(fn => fn()`
}, 2000)
```

## 修改後的桶

有以下的結構

1. 用 WeakMap 把目標物件當作 key，使用 Map 當作 value
2. Map 當中使用目標屬性的 key 當作 key，使用 Set 來當作 value
3. value 內收集副作用函式

![完善的桶](https://i.imgur.com/5IYbElS.png)

如此一來，在新的桶的設計當中，若任一個屬性沒有被讀取過，在 js 內去修改該屬性，也不會觸發副作用函式。

[新的桶 - stackblitz](https://stackblitz.com/edit/js-nsw85h?file=index.js)

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
  activeEffect = fn
  fn()
}

const data = { text: 'hello world', age: 22 }

const bucket = new WeakMap()
const proxy = new Proxy(data, {
  get(target, key) {
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

    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    const effects = bucket.get(target)?.get(key)
    effects && effects.forEach(fn => fn())

    return true
  },
})

effectRegister(() => {
  console.log('effect run')
  document.body.innerText = proxy.text
})

setTimeout(() => {
  proxy.noExist = '222'
}, 2000)
```

## 為什麼使用 WeakMap

主要原因是怕**記憶體流失（Memory Leak）**`，WeakMap` 具有較好的垃圾回收機制，這邊需要提一下 `WeakMap` & `Map` 的差異:

```js [weak-map.js]
const map = new Map()
const weakMap = new WeakMap();
(function () {
  const foo = { foo: 1 }
  const bar = { bar: 2 }
  map.set(foo, 1)
  weakMap.set(bar, 2)
})()
```

在上方的程式碼中，map & weakMap 分別在 IIFE 執行當中，將 foo, bar 當作 key 引用，當函式執行完畢，foo 這個物件，因為仍被 map 引用，所以垃圾回收器（grabage collector）不会把它從內存記憶體中移除。仍然可以通過 `map.keys` 列出 foo 物件，但是 bar 物件在函式執行完畢後就會被釋放掉，因為 WeakMap 的 key 是弱引用，不會影響垃圾回收器的工作。

::alert{type="info"}

- WeakMap 經常用於儲存那些只有當 key 所引用的物件存在時（没有被回收）才有價值的資料。
- WeakMap 的 weak 就是弱引用的意思
::

在桶的設計當中，如果 target 物件沒有任何引用了，說明 client side 已經不需要它了，就讓垃圾回收器自動運作完成回收任務。如果使用 Map 來代替 WeakMap，即使 client side 對 target 沒有任何引用，這個物件也不會被回收，最終會導致 Memory Leak。

## 封裝 track & trigger 函數

- 將副作用的收集封裝為 track 函數，在 get 函數中調用 track 函數追蹤變化
- 將副作用的執行為 trigger 函數，在 set 函數内調用 trigger 函數觸發變化

這樣一來，就可以提高對 track, trigger 的擴展性。

[封裝 track, trigger 函數 - stackblitz](https://stackblitz.com/edit/js-c7ey4t?file=index.js)

```js [track-trigger.js]
/**
 * 副作用函式
 */
let activeEffect

/**
 * 註冊副作用的函式
 * effect => effectRegister
 */
function effectRegister(fn) {
  activeEffect = fn
  fn()
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
}

// 在 set 函數内調用 trigger 函數觸發變化
function trigger(target, key) {
  const effects = bucket.get(target)?.get(key)
  effects && effects.forEach(fn => fn())
}

effectRegister(() => {
  console.log('effect run')
  document.body.innerText = proxy.text
})

setTimeout(() => {
  proxy.text = '222'
}, 2000)
```
