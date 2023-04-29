---
date: 2023-04-30 03:43:34
title: JS 雙波浪符（~~）
description:
categories: [JavaScript]
---

雙波浪號運算符（~~)  在數字為正數使用，結果相當於 Math.floor()

```js
console.log(~~-1) // -1
console.log(~~0) // 0
console.log(~~1) // 1
console.log(~~'-1') // -1
console.log(~~'0') // 0
console.log(~~2.4) // 2
console.log(~~3.9) // 3
```

在負數時使用會有差別

```js
console.log(Math.floor(-2.2)) // -3
console.log(~~-2.2) // -2
```

優點

- 效能有一點點點點優於 Math.floor()
- 寫起來快速簡單，`~~` 即可

缺點

- 可讀性低
- 正負數邏輯差異需注意

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

有小數點的拖曳

::div
  :video-player{src="video/vue-sfc-playground-2.mov"}
::

沒有小數點的拖曳

::div
  :video-player{src="video/vue-sfc-playground-1.mov"}
::

## 參考文章

- [The Mysterious Double Tilde (~~) Operation](https://dev.to/asadm/the-mysterious-double-tilde-operation-mih)
- [Exploring the Vue SFC Playground](https://www.youtube.com/watch?v=CcDWPyA6dwU)
