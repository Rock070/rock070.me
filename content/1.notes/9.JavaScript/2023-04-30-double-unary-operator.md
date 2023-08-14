---
date: 2023-04-17 03:43:34
title: JS 雙波浪符（~~）
description: JavaScript NOT 運算符在實際場景的運用案例
categories: [JavaScript]
---

::Association
關聯： [[JavaScript]]
::

雙 NOT 運算符（~~）使用在數字上，結果相當於 Math.trunc()

```javascript
console.log(~~-1) // -1
console.log(Math.trunc(-1))// -1
console.log(~~0) // 0
console.log(Math.trunc(0)) // 0
console.log(~~1) // 1
console.log(Math.trunc(1)) // 1
console.log(~~'-1') // -1
console.log(Math.trunc('-1'))// -1
console.log(~~'0') // 0
console.log(Math.trunc('0')) // 0
console.log(~~2.4) // 2
console.log(Math.trunc(2.4)) // 2
console.log(~~3.9) // 3
console.log(Math.trunc(3.9)) // 3
```

## 優點

- 效能有一點點點點優於 `Math.trunc()`，因為 JS 數學運算的底層，會轉換為位元運算，`~~` 是直接使用位元運算，故效率更好
- 寫起來快速簡單，`~~` 即可

## 缺點

- 可讀性低


## 範例

::alert{type=info}
補充： [Vue SFC Playground](https://github.com/vuejs/repl/blob/main/src/SplitPane.vue#L40) 用此來計算拖曳視窗的寬度比例，永遠不會出現小數點，藉此將拖曳的觸發範圍拉大（拉的範圍超過整數，才會作動）而不這麼敏感。
::

```ts
function dragMove(e: MouseEvent) {
  if (state.dragging) {
    const position = isVertical.value ? e.pageY : e.pageX
    const totalSize = isVertical.value
      ? container.value.offsetHeight
      : container.value.offsetWidth

    const dp = position - startPosition
    state.split = startSplit + ~~((dp / totalSize) * 100) // this line
  }
}
```

### 有小數點的拖曳

可以看到需要拖曳的距離只拉一點點，畫面就會跟著拖曳，靈敏度較高

::div
  :video-player{src="https://www.youtube.com/watch?v=Ki1mWUAOIp8"}
::

### 沒有小數點的拖曳

可以看到需要拖曳的距離需要拉多一點，畫面才會跟著拖曳

::div
  :video-player{src="https://www.youtube.com/watch?v=OYb0_ORu3cg"}
::

## 參考文章

- [The Mysterious Double Tilde (~~) Operation](https://dev.to/asadm/the-mysterious-double-tilde-operation-mih)
- [Exploring the Vue SFC Playground](https://www.youtube.com/watch?v=CcDWPyA6dwU)
