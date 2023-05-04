---
date: 2023-05-04 23:44:06
title: 「Vue 設計與實現」響應系統原理（一）
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 使用 Proxy 簡單設計一個響應系統
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

響應式系統式 Vue.js 的重要組成之一，本篇會先介紹「副作用函式」與「響應式資料」，並簡單實現一個響應式系統

## 副作用函式

副作用函式指的是函式的執行會直接或間接影響到其他函數的執行，就可以說此函數產生了副作用，如下面這個範例，effect 函數修改了全域變數 val，因為 val 也可能會被其他函式引用，effect 的執行影響到了其他函數的執行結果，所以 effect 就是副作用函式。

```js [effect.js]
let val = 1

function effect() {
  val = 2 // 修改到全域變數，產生副作用
}

function getVal() {
  return val
}
```

## 響應式資料

響應式資料的概念是，當一筆資料在某些程式碼內被讀取了，則這些讀取的程式碼，應該被收集起來，當該資料改變後，重新執行一次收集起來的有讀取到該資料的程式碼，例如如，下面的 effect 函式中，`document.body.innerText = obj.text` 讀取了 `obj.text`，所以當 `obj.text` 更改後，預期要重新執行一次 `document.body.innerText = obj.text` 這個副作用程式碼。

- 當副作用函式 effect 執行的時候，會觸發 `obj.text` 的**讀取**（**get**）操作。
- 當修改 `obj.text` 的時候，會出發 `obj.text` 收集起來的**設值**（**set**）操作。

```js [effect.js]
const obj = { text: 'hello world' }
function effect() {
  // effect 函式的執行會讀取 obj.text
  document.body.innerText = obj.text
}
```

故我們需要設計一個攔截器（Proxy），可以在我們讀取時（get）實現收集副作用程式碼，設值（get）時執行副作用程式碼。

::alert{type="warning"}

1. 執行 `effect()`
2. 觸發讀取操作
3. 收集副作用存進副作用的桶子
4. `obj.text = 'goodbye'`
5. 取出存儲副作用的桶內的副作用，執行
::

## 簡單實現

下面這段程式碼簡單實現響應式資料的基本原理：

1. 宣告一個副作用桶子 `const bucket = new Set()`，專門收集副作用。
2. 宣告一個攔截器 `new Proxy`，在讀取與設值時攔截，並在 proxy 被**讀取時把 effect 收集進 bucket 桶子中**，在被**設值時把 bucket 用 forEach 執行一遍**

```js [effect.js]
const proxy = new Proxy(data, {
  get(target, key) {
    bucket.add(effect) // 讀取時收集副作用
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    bucket.forEach(fn => fn()) // 設值時收集的副作用每個都執行一次

    return true // return true 代表設值成功
  },
})
```

3. 執行 effect 函式，把 body 的 `innerText` 改為 `proxy.text`（hello world)，並把修改 `body.innerText` 這件事情收集進去副作用桶子`bucket`內。
4. 等待兩秒，執行 `proxy.text = 'goodbye'`
5. proxy 攔截到**設值**，所以把 bucket 拿出來迴圈執行一遍
6. `body.innerText` 被設定為 proxy.text 的新值 `'goodbye'`。

## 完整程式碼

[簡單實現響應式資料 - stackblitz](https://stackblitz.com/edit/js-wd154u?file=index.js)

```js
// 副作用函式
function effect() {
  document.body.innerText = proxy.text
}

// 副作用收集「桶子」
const bucket = new Set()

const data = { text: 'hello world', age: 22 }

const proxy = new Proxy(data, {
  get(target, key) {
    bucket.add(effect) // 讀取時收集副作用
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    bucket.forEach(fn => fn()) // 設值時收集的副作用每個都執行一次

    return true // return true 代表設值成功
  },
})

effect()

setTimeout(() => {
  proxy.text = 'goodbye'
}, 2000)
```

實際上這個系統還有很多缺陷，例如 effect 的函式名稱是固定的，這樣很不彈性。
