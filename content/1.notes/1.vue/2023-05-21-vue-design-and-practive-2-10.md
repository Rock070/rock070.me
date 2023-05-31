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

## 立即執行的 watch

預設情況下，一個 watch 的回調只會在響應式數據發生變化時才執行：

```js [watch.js]
// 回調函數只有在響應式數據 proxy 後續發生變化時才執行
watch(proxy, () => {
  console.log('變化了')
})
```

在 Vue.js 中可以透過 options.immediate 來指定回調是否要立即執行：

```js [watch.js]
watch(obj, () => {
  console.log('變化了')
}, {
// 回調函數會在 watch 創建時立即執行一次
  immediate: true
})
``` 

要實現 immediate 非常簡單，響應式資料變更後執行的函式與立即執行函式，其實要執行的東西都是一樣的，只需要將 scheduler 原本做的事情，封裝成一個 job 函式，就可以拿來使用：

::code-group

```js [Before]
function watch(source, cb, options = {}) {
  let getter
  let oldValue, newValue

  if (typeof source === 'function')
    getter = source
  else getter = () => traversal(source)

  const effectFn = effectRegister(() => getter(), {
    lazy: true,
    // 需要把 scheduler 執行的內容，封裝成 job 函式
    scheduler() {
      newValue = effectFn()
      cb(newValue, oldValue)
      oldValue = newValue
    },
  })

  oldValue = effectFn()
}
```

```js [After]
function watch(source, cb, options = {}) {
  let getter
  let oldValue, newValue

  if (typeof source === 'function')
    getter = source
  else getter = () => traversal(source)

  // 封裝 scheduler 調度函數為一個獨立的 job 函數
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  const effectFn = effectRegister(() => getter(), {
    lazy: true,
    scheduler: job,
  })

  // 當 immediate 為 true 時立即執行 job，從而觸發回調執行
  if (options.immediate)
    job()
  else oldValue = effectFn()
}
```

::

如此一來便實現了 watch 的立即執行功能。

## 使用 flush 來指定 watch 回調的執行時機

在 Vue.js 3 中 watch 可以使用 flush 選項來指定執行回調的時機

```js [watch.js]
watch(proxy, () => {
  console.log('變化了')
}, {
// 回調函數會在 組件更新前 執行
  flush: 'pre' // 還可以指定為 'post' | 'sync'
})
```

flush 可指定的三個執行時機：

- pre: 組件更新前執行 (預設)
- sync: 偵測到變更後立即執行
- post: 組件更新後執行，能訪問被 Vue 更新之後的 DOM

當 flush 的值為 `post` 時，代錶調度函數需要將副作用函式放到一個**微任務隊列**中，並等待 DOM 更新結束後再執行，如以下程式碼為例：

```js [watch.js]
function watch(source, cb, options = {}) {
  let getter
  let oldValue, newValue

  if (typeof source === 'function')
    getter = source
  else getter = () => traversal(source)

  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  const effectFn = effectRegister(() => getter(), {
    lazy: true,

    // 在調度函數中判斷 flush 是否為 'post'，如果是，將其放到微任務隊列中執行
    scheduler() {
      if (options.flush === 'post') {
        const p = Promise.resolve(
          p.then(job)
        )
      }
      else {
        job()
      }
    }
  })

  if (options.immediate)
    job()
  else oldValue = effectFn()
}
```

在調度器函數內檢測 options.flush 的值是否為 post，如果是，則將 job 函數放到微任務隊列中，從而實現非同步延遲執行。
