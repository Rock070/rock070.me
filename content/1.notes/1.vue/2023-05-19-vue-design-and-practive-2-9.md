---
date: 2023-05-14 20:44:06
title: 「Vue 設計與實現」響應系統原理（九）- 透過調度器、懶執行實現 computed 計算屬性 
description: 「Vue.js 設計與實現」之讀書筆記與整理 - 透過 effectRegister 的調度器、懶執行特性，來實現 computed 計算屬性的封裝，並在內部建立快取功能節省計算成本
categories: [Vue]
---

::Association
關聯： [[「Vue 設計與實現」第二篇 - 響應系統的作用與實現]]
::

這一個章節主要會介紹 `computed` 計算屬性的兩個特性：

- lazy 懶執行（副作用函式懶執行）
- cache 快取

## 懶執行

這邊要說的懶執行指的是「**副作用函式**」的懶執行，英文可稱 **lazy effect**。

原本的 `effectRegister` 副作用註冊函式，會立即執行傳入的副作用函式，但在有些場景下，我們**不希望它立即執行**，而是希望它**在需要的時候才執行**，例如：`computed` 計算屬性，可以透過前面設計的「**調度器 scheduler**」來實現看看，用起來會像這樣：

::code-group

```js [懶執行]
effect(
  // 指定了 lazy 選項，這個函數不會立即執行
  () => {
    console.log(obj.foo)
  },
  {
    lazy: true
  }
)
```

```js [立即執行]
effect(
  // 這個函數會立即執行
  () => {
    console.log(obj.foo)
  }
)
```

::

### 實作

有了 lazy 參數的傳入，就可以在 `effectRegister` 來實現了，透過判斷 `options.lazy` 參數，決定要不要再註冊副作用函式的時候，就立即執行一次。

```js [effectRegister.js]
function effectRegister(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)

    activeEffect = effectFn
    activeEffectStack.push(effectFn)

    fn()

    activeEffectStack.pop()
    activeEffect = activeEffectStack.at(-1)
  }

  effectFn.options = options
  effectFn.deps = []

  // 新增：若 options.lazy 為 true 則不執行
  if (!options.lazy)
    effectFn()

  // 新增：返回副作用函式
  return effectFn
}
```

接下來重新執行一次 `effectRegister` 來測試看看，可以看到有 `lazy: true` 的不會執行，沒有設定懶執行的會立即執行，最終印出「Run Not lazy: 1」。

```js [effectRegister.js]
effectRegister(
  () => {
    console.log('Run Lazy: ', proxy.age)
  },
  {
    lazy: true,
  }
)

effectRegister(() => {
  console.log('Run Not Lazy: ', proxy.age)
})

// Run Not lazy: 1
```

### 完整程式碼

[computed - lazy 懶執行 － stackblitz](https://stackblitz.com/edit/js-27mvkp?file=index.js)

## 手動執行副作用函式

在前面的範例中，若 `lazy: true` 設定為懶執行，在 `effectRegister` 中就不會立即執行，那要在什麼時候執行呢？

答案就是可以拿著 return 出來的 `effectFn` 自己**手動執行**，所以就會印出「Run Lazy: 1」、「Run Not lazy: 1」。

```js [effectRegister.js]
const effectFn = effectRegister(
  () => {
    console.log('Run Lazy: ', proxy.age)
  },
  {
    lazy: true,
  }
)

effectRegister(() => {
  console.log('Run Not Lazy: ', proxy.age)
})

// 手動執行副作用函式
effectFn()

// Run Lazy: 1
// Run Not lazy: 1
```

### 完整程式碼

[computed - lazy 懶執行 - 手動執行 － stackblitz](https://stackblitz.com/edit/js-couqgh?file=index.js)

## effectFn 的 getter 功能

但只有手動執行意義不大，讓我們把傳給 `effectRegister` 的函數當作一個 getter，這個 getter 函數可以返回任何值，例如：

```js [effectRegister.js]
const effectFn = effectRegister(
  () => {
    return proxy.age + 22
  },
  {
    lazy: true,
  }
)

const value = effectFn()
console.log(value)

// proxy.age + 22
```

### 實作 getter

其實實現起來很簡單，只需要把 `fn` 的返回值在 `effectFn` 返回就好了。

```js [effectRegister.js]
function effectRegister(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)

    activeEffect = effectFn
    activeEffectStack.push(effectFn)

    // 新增：將 fn 的執行結果存在 res 中
    const res = fn()

    activeEffectStack.pop()
    activeEffect = activeEffectStack.at(-1)

    // 新增：將 res 作為 effectFn 的返回值
    return res
  }

  effectFn.options = options
  effectFn.deps = []

  if (!options.lazy)
    effectFn()

  return effectFn
}
```

### 完整程式碼

[computed - 手動執行 effectFn -  getter － stackblitz](https://stackblitz.com/edit/js-retmq7?file=index.js)

## computed 封裝

有了「getter 返回值」+「lazy」手動執行的特性之後，我們就可以開始封裝 `computed` 了

```js [computed.js]
function computed(fn) {
  const effectFn = effectRegister(fn, {
    lazy: true,
  })

  const obj = {
    get() {
      // 讀取時才執行副作用
      return effectFn()
    }
  }

  return obj
}

const sumRefs = computed(() => proxy.age + 22)
console.log(sumRefs.value)

// 23
```

### 完整程式碼

[computed - 封裝 － stackblitz](https://stackblitz.com/edit/js-n7mh1a?file=index.js)

## cache + dirty 屬性

接下來介紹的是 `computed` 的 cache 快取與 dirty 屬性，getter 執行完之後，`computed` 內部會把值快取住，當 `computed` 再次被讀取時，若內部的響應式數據沒有改變過（not dirty），就會直接返回快取的值，若改變過（dirty）就重新執行一次。

在下面實作的程式碼中，若 `console.log(sumRef.value)` 兩次，`getter` 函數只會執行一次。

```js [computed-cache-dirty.js]
function computed(fn) {
  let cacheValue
  let dirty = true
  const effectFn = effectRegister(fn, {
    lazy: true,
    scheduler() {
      // 在響應式數據發生改變的時候，觸發 scheduler，把 dirty 重置為 true
      dirty = true
    }
  })

  const obj = {
    get() {
      if (dirty) {
        // 若 dirty = true 就執行 getter，並把 dirty 標記為 false
        cacheValue = effectFn()
        dirty = false
      }

      return cacheValue
    }
  }

  return obj
}

const sumRefs = computed(() => {
  console.log('run getter')
  return proxy.age + 22
})

console.log(sumRefs.value)
console.log(sumRefs.value)

// run getter
// 23
// 23
```

### 完整程式碼

[computed - dirty & cache － stackblitz](https://stackblitz.com/edit/js-pcysk4?file=index.js)

## 嵌套響應式資料的問題

在前面[巢狀導致收集到錯誤的 effect](https://rock070.me/notes/vue/2023-05-04-vue-design-and-practive-2-5#%E5%B7%A2%E7%8B%80%E5%B0%8E%E8%87%B4%E6%94%B6%E9%9B%86%E5%88%B0%E9%8C%AF%E8%AA%A4%E7%9A%84-effect)的章節，為了避免巢狀的 `effectRegister` 導致副作用函式收集錯誤的問題，我們實作了 `activeEffectStack` 的機制，讓外層的副作用收集可以正常收集。

對於計算屬性的 getter 函數來說，它裡面訪問的響應式數據只會把 `computed` 內部的 `effectRegister` 收集為依賴。而當把計算屬性用於另外一個 `effectRegister` 時，
就會發生 `effectRegister` 嵌套，外層的 `effectRegister` 不會被內層 `effectRegister` 中的響應式數據收集。

如我們使用 `registerRegister` 打印 `computed` 回傳的 `sumRefs`，但按照目前的實現，當 `computed` getter 收集的 `proxy.age` 改變時，並不會觸發 `effectRegister` 的副作用函式執行，這樣用起來就不夠方便，因為我們希望 `computed` 的變更也會被 `effectRegister` 一起 track & trigger，因此，我們需要來解決這個問題。


```js [computed.js]
const sumRefs = computed(() => {
  return proxy.age + 22
})

effectRegister(() => {
  console.log(sumRefs.value)
})

proxy.age++

// 23
```

### 實現

要解決這個問題，我們只需要在 `computed` 內部在 obj 被讀取時使用 `track`，在響應式數據改變時，在 scheduler 觸發 `trigger`。

```js [computed.js]
function computed(fn) {
  let cacheValue
  let dirty = true

  const obj = {
    get value() {
      if (dirty) {
        cacheValue = effectFn()
        dirty = false
      }

      // obj 被讀取時 track 當前的 activeEffect
      track(obj, 'value')
      return cacheValue
    },
  }

  const effectFn = effectRegister(fn, {
    lazy: true,
    scheduler() {
      dirty = true
      // 響應式數據改變時 trigger 收集的 effectFn
      trigger(obj, 'value')
    },
  })

  return obj
}
```

如此一來，以之前的範例來說，當 computed 內部響應式數據 `proxy.age` 被改變後，也同時會觸發 `effectRegister` 傳入的副作用函式 `() => { console.log(sumRefs.value) }`。當我們執行 `proxy.age++` 時，再次打印出 `sumRefs.value`，也就是「24」。

```js [computed.js]
const sumRefs = computed(() => {
  return proxy.age + 22
})

effectRegister(() => {
  console.log(sumRefs.value)
})

proxy.age++

// 23
// 24
```

### 完整程式碼

[computed - effectRegister 嵌套 － stackblitz](https://stackblitz.com/edit/js-fbbj8d?file=index.js)