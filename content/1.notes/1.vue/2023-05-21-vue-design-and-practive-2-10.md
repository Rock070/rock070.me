---
date: 2023-05-21 20:44:06
title: 「Vue 設計與實現」響應系統原理（十）- watch 監聽器
description: 「Vue.js 設計與實現」之讀書筆記與整理 - watch 監聽器
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

## watch 的設計

接下來要來設計，在 vue.js 當中經常用到的 API 「watch」，watch 本質就是觀測一個響應式數據，變且傳入一個回調函數，當修改響應式數據的值時，會觸發該回調函式執行，用來起來像這樣：

```js [watch.js]
watch(proxy, () => {
  console.log('值變了')
})

// 修改響應式數據的值，會導致回調函數執行
proxy.age++
```

跟 `computed` 很像，有了 `effectRegister` + `scheduler` 就可以拿來追蹤響應式數據的變化，與在其更新時使用調度器。如：

```js [watch.js]
// watch 函數接收兩個參數，source 是響應式數據，cb 是回調函數
function watch(source, cb) {
  effectRegister(
    // 觸發讀取操作，從而建立聯繫
    () => proxy.age,
    {
      // 設置 scheduler，避免執行副作用函式
      scheduler() {
        // 當數據變化時，調用回調函數 cb
        cb()
      }
    })
}

const data = { age: 1 }
const proxy = new Proxy(data, { /* ... */ })

watch(proxy, () => {
  console.log('資料變更了')
})

proxy.foo++
```

利用 `effectRegister` 來追蹤 `proxy.age` 的變化，並使用 `scheduler` 避免副作用被執行，在 `scheduler` 內調用傳入的 cb 在 `trigger` 時回調想要執行的函式。

## 深度遞迴讀取響應數據

但這樣的問題是 watch 內「**硬編碼**」了 `proxy.age` 的屬性，為了讓 watch 函數有具有**通用性**，我們需要封裝一個通用的讀取操作：

```js [watch.js]
function traversal(value, seen = new Set()) {
  // 如果要讀取的數據是原始值，或者已經被讀取過了，那麼什麼都不做
  if (typeof value !== 'object' || value === null || seen.has(value))
    return
  // 將數據添加到 seen 中，代表遍歷地讀取過了，避免循環引用引起的死循環
  seen.add(value)
  // 暫時不考慮陣列等其他結構

  // 假設 value 就是一個物件，使用 for...in 讀取對象的每一個值，並遞迴的調用 traverse 進行處理
  for (k in value)
    traversal(value[k], seen)

  return value
}

function watch(source, cb) {
  effectRegister(() => traversal(source), {
    scheduler() {
      cb()
    },
  })
}

watch(proxy, () => {
  console.log('資料變化了')
})

proxy.age++
```

在 watch 內部的 effect 中調用 traverse 函數進行遞迴的讀取操作，代替硬編碼的方式，這樣就能讀取一個物件上的任意屬性，從而當任意屬性發生變化時都能夠觸發回調函數執行。

## watch getter

watch 函數除了可以監測響應式數據，還可以接收一個 getter 函數：

```js [watch.js]
watch(
  // getter 函數
  () => proxy.age,
  // 回調函數
  () => {
    console.log('proxy.age 的值變了')
  }
)
```

傳遞給 watch 函數的第一個參數不再是一個響應式數據，而是一個 getter 函數。在 getter 函數內部，使用者可以指定該 watch 依賴哪些響應式數據，只有當這些數據變化時，才會觸發回調函數執行。

```js [watch.js]
function watch(source, cb) {
  let getter
  // 如果 source 是函數，說明使用者傳遞的是 getter，所以直接把 source 賦值給 getter
  if (typeof source === 'function')
    getter = source
  else
    getter = () => traversal(source)

  effectRegister(() => getter(), {
    scheduler() {
      cb()
    },
  })
}

watch(
  () => proxy.age,
  () => {
    console.log('資料變化了')
  }
)

proxy.age++

// 資料變化了
```

首先判斷 source 的型別，如果是函數型別，說明使用者直接傳遞了 getter 函數，這時直接使用使用者的 getter 函數。如果不是函數型別，那麼保留之前的做法，即調用 traverse 函數遞迴地讀取。

[完整程式碼 - watch - 基本實現與遞迴 getter - stackblitz](https://stackblitz.com/edit/js-29tehm?file=index.js)

## 新值與舊值

通常我們在使用 Vue.js 中的 watch 函數時，能夠在回調函數中得到變化前後的值：

```js [watch.js]
watch(
  () => proxy.age,
  (newValue, oldValue) => {
    console.log(newValue, oldValue) // 2, 1
  }
)

proxy.age++
```

為了實現這個，我們可以透過 lazy 選項來，手動執行 effect 拿到 getter 回傳的值，並在每次 trigger 執行 scheduler 的時候，更新新值與舊值：

```js [watch.js]
function watch(source, cb) {
  let getter

  if (typeof source === 'function')
    getter = source
  else getter = () => traversal(source)

  // 定義舊值與新值
  let oldValue, newValue
  // 使用 effect 註冊副作用函數時，開啟 lazy 選項，並把返回值存儲到 effectFn 中以便後續手動調用
  const effectFn = effectRegister(() => getter(), {
    lazy: true,
    scheduler() {
      // 在 scheduler 中重新執行副作用函數，得到的是新值

      newValue = effectFn()
      // 將舊值和新值作為回調函數的參數
      cb(newValue, oldValue)
      // 更新舊值，不然下一次會得到錯誤的舊值
      oldValue = newValue
    },
  })
  // 手動調用副作用函數，拿到的值就是舊值
  oldValue = effectFn()
}

watch(
  () => proxy.age,
  (newVal, oldVal) => {
    console.log('資料變化了')
    console.log('newVal: ', newVal)
    console.log('oldVal: ', oldVal)
  }
)

proxy.age++

// 資料變化了
// newVal: 2
// oldVal: 1
```

[完整程式碼 - watch - 新值與舊值 - stackblitz](https://stackblitz.com/edit/js-9feci7?file=index.js)
