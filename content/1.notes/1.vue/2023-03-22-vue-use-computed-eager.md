---
date: 2023-03-21 23:56:36
title: 使用 computedEager 優化渲染效能
description: 使用 vueuse computedEager 來優化 computed 因為懶計算的特性，間接導致的無意義重新渲染
categories: [Vue]
---

看到朋友分享的這篇
[Vue: When a computed property can be the wrong tool](https://dev.to/linusborg/vue-when-a-computed-property-can-be-the-wrong-tool-195j)，「
當 computed 可能是錯誤的工具」，綜合我對 Vue 的理解，來寫一下筆記。

## computed 快取 & 懶計算可以降低效能成本

computed 非常優美，可以作為響性式屬性的代理 (proxy)，設定 set & get，也可以當作一種唯讀的計算屬性。另外有兩個特性比較可能不會注意到的：

1. computed 會在**內部建立快取**， computed 會去監聽其相依的響應式資料是否有更新，若相依資料有更新，就會記錄為 dirty 並安排重新計算，若資料沒有更新則該屬性在 DOM 會顯示上一次計算好的內容，稱為 **「computed cache」**。
2. computed 會進行 **Lazy Evaluation 懶計算**（或稱惰性求值），意思是 computed 的 callback 函數僅在「讀取計算值」後才執行，例如畫面上有顯示，或是其他被其他程式碼讀取。白話一點就是說 computed 的 callback 執行，會發生在「被讀取」時，例如在畫面上有使用、被其他程式碼引用，而不是宣告的時候就執行。

因此，computed 因為「快取」與「懶計算」，在節省效能成本上，有很大的優勢。
如果具有昂貴計算的計算屬性未被任何東西使用，甚至不會完成該昂貴的計算。

::alert{type="info"}
昂貴的計算：複雜高的演算法、很高的渲染成本（大元件）、....等等
::

這是一個 computed 的範例：

```vue [computed-demo.vue]
<script setup>
const showList = ref(false)
const newTodo = ref('')

const todos = reactive([
  { title: 'Wahs Dishes', done: true },
  { title: 'Throw out trash', done: false }
])

const openTodos = computed(
  () => todos.filter(todo => !todo.done)
)

const hasOpenTodos = computed(
  () => !!openTodos.value.length
)

function addTodo() {
  todos.push({
    title: todo.value,
    done: false
  })
}
</script>

<template>
  <input v-model="newTodo" type="text">
  <button type="button" @click="addTodo">
    Save
  </button>
  <button @click="showList = !showList">
    Toggle ListView
  </button>
  <template v-if="showList">
    <template v-if="hasOpenTodos">
      <h2>{{ openTodos.length }} Todos:</h2>
      <ul>
        <li v-for="todo in openTodos">
          {{ todo.title }}
        </li>
      </ul>
    </template>
    <span v-else>No todos yet. Add one!</span>
  </template>
</template>
```

由於 `showList` 最初為 `false`，template（render function）將不會讀取 `openTodos`，因此，filter 過濾甚至不會執行，無論是在新增待辦事項和 `todos.length` 更改的最初還是之後。只有在 `showList` 被設置為 `true` 之後，這些計算屬性才會被讀取並觸發它們的 callback。

## 懶計算導致效能降低的情境

如果 computed 返回的結果依賴了另一個 computed 或是其他未知的計算結果，意味著 Vue 的反應性系統無法事先知道這個返回值。

也因為 Vue 可以偵測到 computed 內部的依賴值是否更改，將其標註為 dirty，因此在下次讀取的時候，會重新跑一次 computed 的回調函式，但 Vue 無法知道，依賴項在更改後是否跟之前的值相同。

如果這些操作成本高昂，則即使 computed 返回的值與以前相同，也可能觸發了昂貴的重新計算，因此應該不需要重新計算。

[SFC Playground](https://sfc.vuejs.org/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cD5cbiAgaW1wb3J0IHsgcmVmLCByZWFjdGl2ZSwgY29tcHV0ZWQsIG9uVXBkYXRlZCB9IGZyb20gJ3Z1ZSdcblxuICBjb25zdCBsaXN0ID0gcmVhY3RpdmUoWzEsMiwzLDQsNV0pXG4gIFxuICBjb25zdCBjb3VudCA9IHJlZigwKVxuICBmdW5jdGlvbiBpbmNyZWFzZSgpIHtcbiAgICBjb3VudC52YWx1ZSsrXG4gIH1cbiAgXG4gIGNvbnN0IGlzT3ZlcjEwMCA9IGNvbXB1dGVkKCgpID0+IGNvdW50LnZhbHVlID4gMTAwKVxuICBcbiAgY29uc3Qgc29ydGVkTGlzdCA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAvLyBpbWFnaW5lIHRoaXMgdG8gYmUgZXhwZW5zaXZlXG4gICAgcmV0dXJuIGlzT3ZlcjEwMC52YWx1ZSA/IFsuLi5saXN0XS5yZXZlcnNlKCkgOiBbLi4ubGlzdF1cbiAgfSlcbiAgXG4gIG9uVXBkYXRlZCgoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2NvbXBvbmVudCByZS1yZW5kZXJlZCEnKVxuICB9KVxuICBcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxidXR0b24gQGNsaWNrPVwiaW5jcmVhc2VcIj5cbiAgICBDbGljayBtZVxuICA8L2J1dHRvbj5cbiAgPGJyPlxuICA8aDM+XG4gICAgTGlzdFxuICA8L2gzPlxuICA8dWw+XG4gICAgPGxpIHYtZm9yPVwiaXRlbSBpbiBzb3J0ZWRMaXN0XCI+XG4gICAgICB7eyBpdGVtIH19XG4gICAgPC9saT5cbiAgPC91bD5cbjwvdGVtcGxhdGU+In0=)

<iframe
  title="vue-entry-mistake-1" height="600" style="width: 100%;"
  allowtransparency="true"  
  allowfullscreen="true"
  frameborder="no" loading="lazy" scrolling="no"
  src="https://sfc.vuejs.org/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cD5cbiAgaW1wb3J0IHsgcmVmLCByZWFjdGl2ZSwgY29tcHV0ZWQsIG9uVXBkYXRlZCB9IGZyb20gJ3Z1ZSdcblxuICBjb25zdCBsaXN0ID0gcmVhY3RpdmUoWzEsMiwzLDQsNV0pXG4gIFxuICBjb25zdCBjb3VudCA9IHJlZigwKVxuICBmdW5jdGlvbiBpbmNyZWFzZSgpIHtcbiAgICBjb3VudC52YWx1ZSsrXG4gIH1cbiAgXG4gIGNvbnN0IGlzT3ZlcjEwMCA9IGNvbXB1dGVkKCgpID0+IGNvdW50LnZhbHVlID4gMTAwKVxuICBcbiAgY29uc3Qgc29ydGVkTGlzdCA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAvLyBpbWFnaW5lIHRoaXMgdG8gYmUgZXhwZW5zaXZlXG4gICAgcmV0dXJuIGlzT3ZlcjEwMC52YWx1ZSA/IFsuLi5saXN0XS5yZXZlcnNlKCkgOiBbLi4ubGlzdF1cbiAgfSlcbiAgXG4gIG9uVXBkYXRlZCgoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2NvbXBvbmVudCByZS1yZW5kZXJlZCEnKVxuICB9KVxuICBcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxidXR0b24gQGNsaWNrPVwiaW5jcmVhc2VcIj5cbiAgICBDbGljayBtZVxuICA8L2J1dHRvbj5cbiAgPGJyPlxuICA8aDM+XG4gICAgTGlzdFxuICA8L2gzPlxuICA8dWw+XG4gICAgPGxpIHYtZm9yPVwiaXRlbSBpbiBzb3J0ZWRMaXN0XCI+XG4gICAgICB7eyBpdGVtIH19XG4gICAgPC9saT5cbiAgPC91bD5cbjwvdGVtcGxhdGU+In0="
  >
  Power By sfc.vuejs.org
</iframe>

例如這個範例，當 `sortedList` 是一個拿到畫面上渲染的 computed 陣列，當`count > 100` 的時候，就將陣列反轉顯示。

`sortedList` 內部依賴了另一個 computed `isOver100`，`isOver100` 又依賴了一個響應式 ref `count`，當點擊增加 `count` 的時候，觸發 `isOver100`的計算，但因為要點擊 100 下才會反轉，所以我心裡想著畫面應該會等到 `isOver100.value` 為 true 的時候，才會觸發 `sortedList` 的計算，並且重新渲染畫面。

但事情並不是這樣的，雖然 `isOver100` 點擊 100 下以前都是 false，但在畫面重繪後的生命週期 `OnUpdated` 裡面 console.log，會發現**每次點擊 count 增加的時候，都會重新渲染一次畫面 ！！！**，**所以當我按下按鈕 101 次，`sortedList` 反轉了，畫面也重新渲染了 101 次**，實際產生了一個效能問題。

原因是因為 `sortedList` 只會知道 `isOver100` 已經重新計算過了，所以會標記為 dirty，但是因為**懶計算**的特性，會在**讀取時才重新計算**，讓 `sortedList` 安排重新計算，卻不知道結果可能是一樣的，所以只能別無選擇地重新渲染。

我們來一步一步解析一下：

1. 當按鈕被點擊，`count` 增加，元件不會重新渲染，因為 `count` 並沒有在 template 上被引用。
2. 但因為依賴 `count` 的改變，`isOver100` 這個 computed 屬性被標記為「dirty」，所以必須重新計算。
3. 但是因為懶計算的原因，`isOver100` 的重新計算只會觸發在當它「被讀取」的時候，在那之前，Vue 只知道他是 dirty，但卻不知道他是仍然返回 `false` 還是改回傳 `true`。
4. `sortedList`因為依賴了 `isOver100`，當 `isOver100` 被標記為 dirty 時，`sortedList` 也會被標記為 dirty，且也不會馬上觸發重新計算，會等到被讀取的時候才會計算。
5. 因為 `sortedList` 在 template 內使用，且狀態為 dirty，所以直接觸發了 `sortedList` 與 `isOver100` 的計算，並觸發重新渲染。
6. `sortedList` 重新計算時，裡面讀取了重新計算仍為 `false` 的 `isOver100`。
7. 新的 Virtual DOM 與 template 結果一樣，意味著這一切都不必要，但在上面的過程中，還是觸發了「重新渲染」、「 `sortedList` 昂貴的重新計算」。

真正的罪魁禍首是 `isOver100`，因為需要經常計算，但總是回傳計算出相同的值，這是一個相當簡單的計算，但卻無法從 computed 的優勢「快取」與「懶計算」中獲得好處，反而在這案例中造成了無意義的重新渲染。

發生這種情況，本質上可能是因為這幾個因素：

1. 一個昂貴的 computed 屬性，watcher 或是 template 依賴項。
2. 一個 computed 屬性，經常重新計算後返回相同的值。

## 如何解決這個問題

雖然這是一個問題，但卻**不是一個大問題**，因為 Vue 的響應式系統已經非常的有效率，特別是 Vue 3，即使發生無意義的狀態更新，仍不會對效能造成很大的影響。

只需要特別注意某些特別的場景，例如當把兩個經常更新的響應式資料依賴在一起，被依賴項經常無意義的更新，回傳相同的結果。導致依賴的一方需要一直重新執行複雜度很高（很大的元件、複雜的演算法等等），但也無意義的程式碼。

### ComputedEager

中文翻譯為「迫切的計算」，簡單的理解就是，去掉懶計算的 computed，在每次依賴更新的時候，都會直接更新返回值，不會等到被讀取。

內部實作非常簡單，就是把 `computed` 改成用 `ref + watch (flush: sync)`

::alert{type="info"}
**flush**：用來指定 watch 回調函式的執行時間，「sync」 意思是偵測到變更後立即執行。預設是 「pre」，在 Vue 更新之前調用，「post」 在 DOM 更新完成後調用。
::

```ts
import { readonly, shallowRef, watchEffect } from 'vue'

export function eagerComputed(fn) {
  const result = shallowRef()
  watchEffect(() => {
    result.value = fn()
  },
  {
    flush: 'sync' // needed so updates are immediate.
  })

  return readonly(result)
}
```

vueuse 的版本：[computedEager](https://vueuse.org/shared/computedeager/)

那在上面的 `counter > 100` 反轉陣列的範例中，可以把 `isOver100` 更換成 `computedEager`，因為即時更新的關係，所以 `sortedList` 就很快可以知道依賴項沒有更新，所以就不會標記為「 dirty」，也不會觸發「重新計算」跟「重新渲染」。

可以看這個修正版的 [SFC Playground](https://sfc.vuejs.org/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cD5cbiAgaW1wb3J0IHsgcmVmLCByZWFjdGl2ZSwgc2hhbGxvd1JlZiwgcmVhZG9ubHksIGNvbXB1dGVkLCBvblVwZGF0ZWQsIHdhdGNoRWZmZWN0IH0gZnJvbSAndnVlJ1xuXG4gIGZ1bmN0aW9uIGVhZ2VyQ29tcHV0ZWQoZm4pIHtcbiAgICBjb25zdCByZXN1bHQgPSBzaGFsbG93UmVmKClcbiAgICB3YXRjaEVmZmVjdCgoKSA9PiB7XG4gICAgICByZXN1bHQudmFsdWUgPSBmbigpXG4gICAgfSwgXG4gICAge1xuICAgICAgZmx1c2g6ICdzeW5jJyAvLyBuZWVkZWQgc28gdXBkYXRlcyBhcmUgaW1tZWRpYXRlLlxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVhZG9ubHkocmVzdWx0KVxuICB9XG4gIFxuICBjb25zdCBsaXN0ID0gcmVhY3RpdmUoWzEsMiwzLDQsNV0pXG4gIFxuICBjb25zdCBjb3VudCA9IHJlZigwKVxuICBmdW5jdGlvbiBpbmNyZWFzZSgpIHtcbiAgICBjb3VudC52YWx1ZSsrXG4gIH1cbiAgXG4gIGNvbnN0IGlzT3ZlcjEwMCA9IGVhZ2VyQ29tcHV0ZWQoKCkgPT4gY291bnQudmFsdWUgPiAxMDApXG4gIFxuICBjb25zdCBzb3J0ZWRMaXN0ID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIC8vIGltYWdpbmUgdGhpcyB0byBiZSBleHBlbnNpdmVcbiAgICByZXR1cm4gaXNPdmVyMTAwLnZhbHVlID8gWy4uLmxpc3RdLnJldmVyc2UoKSA6IFsuLi5saXN0XVxuICB9KVxuICBcbiAgb25VcGRhdGVkKCgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnY29tcG9uZW50IHJlLXJlbmRlcmVkIScpXG4gIH0pXG4gIFxuPC9zY3JpcHQ+XG5cbjx0ZW1wbGF0ZT5cbiAgPGJ1dHRvbiBAY2xpY2s9XCJpbmNyZWFzZVwiPlxuICAgIENsaWNrIG1lXG4gIDwvYnV0dG9uPlxuICA8YnI+XG4gIDxoMz5cbiAgICBMaXN0XG4gIDwvaDM+XG4gIDx1bD5cbiAgICA8bGkgdi1mb3I9XCJpdGVtIGluIHNvcnRlZExpc3RcIj5cbiAgICAgIHt7IGl0ZW0gfX1cbiAgICA8L2xpPlxuICA8L3VsPlxuPC90ZW1wbGF0ZT4ifQ==)，

<iframe
  title="vue-entry-mistake-1" height="600" style="width: 100%;"
  allowtransparency="true"  
  allowfullscreen="true"
  frameborder="no" loading="lazy" scrolling="no"
  src="https://sfc.vuejs.org/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cD5cbiAgaW1wb3J0IHsgcmVmLCByZWFjdGl2ZSwgc2hhbGxvd1JlZiwgcmVhZG9ubHksIGNvbXB1dGVkLCBvblVwZGF0ZWQsIHdhdGNoRWZmZWN0IH0gZnJvbSAndnVlJ1xuXG4gIGZ1bmN0aW9uIGVhZ2VyQ29tcHV0ZWQoZm4pIHtcbiAgICBjb25zdCByZXN1bHQgPSBzaGFsbG93UmVmKClcbiAgICB3YXRjaEVmZmVjdCgoKSA9PiB7XG4gICAgICByZXN1bHQudmFsdWUgPSBmbigpXG4gICAgfSwgXG4gICAge1xuICAgICAgZmx1c2g6ICdzeW5jJyAvLyBuZWVkZWQgc28gdXBkYXRlcyBhcmUgaW1tZWRpYXRlLlxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVhZG9ubHkocmVzdWx0KVxuICB9XG4gIFxuICBjb25zdCBsaXN0ID0gcmVhY3RpdmUoWzEsMiwzLDQsNV0pXG4gIFxuICBjb25zdCBjb3VudCA9IHJlZigwKVxuICBmdW5jdGlvbiBpbmNyZWFzZSgpIHtcbiAgICBjb3VudC52YWx1ZSsrXG4gIH1cbiAgXG4gIGNvbnN0IGlzT3ZlcjEwMCA9IGVhZ2VyQ29tcHV0ZWQoKCkgPT4gY291bnQudmFsdWUgPiAxMDApXG4gIFxuICBjb25zdCBzb3J0ZWRMaXN0ID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIC8vIGltYWdpbmUgdGhpcyB0byBiZSBleHBlbnNpdmVcbiAgICByZXR1cm4gaXNPdmVyMTAwLnZhbHVlID8gWy4uLmxpc3RdLnJldmVyc2UoKSA6IFsuLi5saXN0XVxuICB9KVxuICBcbiAgb25VcGRhdGVkKCgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnY29tcG9uZW50IHJlLXJlbmRlcmVkIScpXG4gIH0pXG4gIFxuPC9zY3JpcHQ+XG5cbjx0ZW1wbGF0ZT5cbiAgPGJ1dHRvbiBAY2xpY2s9XCJpbmNyZWFzZVwiPlxuICAgIENsaWNrIG1lXG4gIDwvYnV0dG9uPlxuICA8YnI+XG4gIDxoMz5cbiAgICBMaXN0XG4gIDwvaDM+XG4gIDx1bD5cbiAgICA8bGkgdi1mb3I9XCJpdGVtIGluIHNvcnRlZExpc3RcIj5cbiAgICAgIHt7IGl0ZW0gfX1cbiAgICA8L2xpPlxuICA8L3VsPlxuPC90ZW1wbGF0ZT4ifQ=="
  >
  Power By sfc.vuejs.org
</iframe>

在這個版本中，點擊按鈕 100 次，`onUpdated` 生命週期的回調，就不會執行 100 次了。

## 結論

總結一下，什麼時候要選擇 `computed`，什麼時候要選擇 `computedEager` ？

- `computed`：當進行複雜的計算時，該計算可以從「快取」與「懶計算」中受益，並且只有在必要的時候才重新計算。
- `computedEager`：計算簡單，且返回值很少更改時（通常是布林值）。

## 參考文章

- [computedEager](https://vueuse.org/shared/computedEager/)
- [Vue: When a computed property can be the wrong tool](https://dev.to/linusborg/vue-when-a-computed-property-can-be-the-wrong-tool-195j)
