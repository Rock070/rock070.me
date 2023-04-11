---
title: Linked List(連結串列)
description: Linked List(連結串列) 資料結構的學習
date: 2022-04-20 19:33:03
categories: data structure

---

Linked List 連結串列，是資料結構中是常見、基本的資料型態，由 Node(節點）組成，每個節點各自儲存在非連續的記憶體位址，並透過 Pointer(指標) 來紀錄下一個節點的位址，最後一個節點的 pointer 指向 Null。

#### Linked List 有兩項屬性

  1. length(連結長度)
  2. head(第一個 Node 位址)

#### Node 有兩項屬性

  1. value
  2. Pointer（下一個 Node 的位址，最後一個 Node 指向 null）

從下圖可以看到每一個 Node 都指向下一個 Node 位址，最後一個指向 Null。

![](https://i.imgur.com/nIFp6SU.png)

### 用 JavaScript 實作一個 Linked List

[完整程式碼 - GitHub](https://github.com/Rock070/algorithms-data-structure-repo/blob/master/data-structure/linked-list/index.js)，可以先 clone 下來，或是跟著下面一步一步建立函式。

本來想用 class 來實作，但最近看了這一篇關於為什麼不應該在 JS 中使用 class 的文章
[（stop-writing-classes-in-javascript）](https://javascript.plainenglish.io/stop-writing-classes-in-javascript-you-dont-need-to-use-this-instead-f6d143ef7a28) ，所以下面就直接使用函式來實作。

先定義一個 Node，擁有 value 與 next(等於 Pointer，指向下一個 Node) 屬性

```js
const Node = (value) => {
  return {
    value,
    next: null
  }
}
```

再來定義一個 Linked List，擁有 length(連結長度) 與 head（指向第一個 Node）屬性

```js
const LinkedList = () => {
  const head = null
  const length = 0
  return {
    head,
    length,
  }
}
```

接下來我們會在 `LinkedList` 這個函式內建立一些方法，有些方法，類似於 JS 中 Array.prototype 提供的方法：

```
push
pop
printAll
shift
get
unshift
insertAt
removeAt
```

### Push

在連結的結尾加上一個 Node

```js
const push = (value) => {
  // 建立一個 Node
  const newNode = Node(value)
  // 當連結內沒有 Node 的時候，指定新的 Node 為第一個 Node
  if (head === null) { head = newNode }
  // 當連結內已經有 Node 的時候，把最後一個 Node 的 next 指定為新的 Node
  else {
    let currentNode = head
    while (currentNode.next !== null)
      currentNode = currentNode.next

    currentNode.next = newNode
  }
  // 連結長度 +1
  length++
}
```

### Pop

把最後一個 Node 排除

```js
const pop = () => {
  // 當 Linked List 沒有 Node 的時候返回 null
  if (head === null)
    return null
  // 當 linked List 長度為 1 的時候把 head 跟 length 調整為初始化
  if (length === 1) {
    const node = head
    head = null
    length = 0
    return node
  }
  // 把倒數第二個 Node 的 next 改成 null，並把 Linked List 的長度 - 1
  let currentNode = head
  while (currentNode.next.next !== null)
    currentNode = currentNode.next

  const popNode = currentNode.next
  currentNode.next = null
  length--
  return popNode
}
```

### printAll

印出 Linked List 內所有的值

```js
const printAll = () => {
  // 沒有節點則印出 nothing
  if (head === null) {
    console.log('Nothing in this linked list')
    return
  }
  // 遍歷所有節點
  let currentNode = head
  while (currentNode !== null) {
    console.log(currentNode.value)
    currentNode = currentNode.next
  }
}
```

### shift

將 Linked List 的第一個節點移除，只需要將 Linked List 的 Head 改成第二個節點就可以了。

```js
const shift = () => {
  // 若沒有節點則回傳 null
  if (head === null)
    return null
  // 若節點只有一個，就把 linkedList 初始化
  if (length === 1) {
    const node = head
    head = null
    length = 0
    return node
  }
  // 若不止一個節點，則把 head 變成第二個節點開始，並長度 - 1
  head = head.next
  length--
}
```

### get

根據 index 來找值，與 array 不同的是，需要從第一個節點開始找，直到找到 index 指定的節點

```js
const get = (index) => {
  // 若 index 大於 Linked List 長度或小於 0 則回傳 null
  if (index > length || index < 0)
    return null
  // 若只有一個節點，則回傳第一個節點的值
  if (head === null)
    return head.value
  // 若不止一個節點則進入迴圈開始尋找
  let currentNode = head
  // 從 i = 1 開始是因為上一行已經指定第一個節點了
  for (let i = 1; i <= index; i++)
    currentNode = currentNode.next

  return currentNode.value
}
```

### unshift

在 head 前新增一個節點，並指定新節點為 head

```js
const unshift = (value) => {
  // 建立新節點
  const newNode = Node(value)
  // 若已經有至少一個節點，則將新節點的 next 指向原本的 head
  if (head !== null)
    newNode.next = head
  head = newNode
  length++
  return newNode
}
```

### insertAt

在某個 index 插入一個節點

```js
const insertAt = (index, value) => {
  // 若 index 大於長度或小於 0 則返回 null
  if (index > length || index < 0)
    return null
  // 若 index = 0 或是原本就沒有節點，則使用上方寫過的 unshift 來新增
  if (index === 0 || head === null) {
    unshift(value)
    return true
  }
  // 若 index 剛好等於串列的長度，則使用上方寫過的 push 來新增
  if (index === length) {
    push(value)
    return true
  }
  // 若都沒有上述情況，使用遍歷的方式找到 index 的節點，將前一個節點的 next 指向新節點，並將新節點的 next 指向原本的該 index 的節點
  let prevNode
  for (let i = 0; i < index; i++) {
    if (i === 0)
      prevNode = head
    else prevNode = prevNode.next
  }
  const newNode = Node(value)
  newNode.next = prevNode.next
  prevNode.next = newNode
  length++
  return true
}
```

### removeAt

刪除某個 index 的節點，邏輯跟 `insertAt` 很像，但是方法改使用 pop & shift。

```js
const removeAt = (index) => {
  if (index > length || index < 0)
    return null
  if (index === 0 || head === null)
    return shift()
  if (index === length)
    return pop()

  let prevNode
  let nextNode
  let value
  // 使用遍歷的方式找到該節點，並結把前一個節點的 next 指向原節點的下一個節點
  for (let i = 0; i < index; i++) {
    if (i === 0)
      prevNode = head
    else prevNode = prevNode.next
  }
  // 要移除的 node 的 value
  value = prevNode.next.value
  nextNode = prevNode.next.next
  prevNode.next = nextNode
  length--
  return value
}
```

# Linked List 與 Array 的比較

### Big O

|                    | Array | Linked List |
| ----------         | ------| ---------- |
| 存取資料             | O(1) | O(n) |
| 插入與刪除第一筆資料   | O(n) | O(1) |
| 插入與刪除最後一筆資料 | O(1) | O(n) |
| 插入與刪除中間值的資料 | O(n) | O(n) |

## Linked List

特性

- 沒有 index
- 每個節點連結是透過 "next" 指標

優點

- 新增刪除資料較快，因為不需要調整 index
- 資料數量是動態的，不像 Array 有 resize 的問題。

缺點

- 因為沒有 index，所以在查找特定 node 的時候，需要從連結的頭開始找，時間複雜度為 O(N)
- 比 Array 使用更多的記憶體空間，因為每一個 node 都需要額外的空間來存儲存 pointer
- 儲存在記憶體的位址並不連續，需要到各個 node 位址去存取，相對 Array 連續的位址會更花時間。
- 因為單向性的關係，要反向存取是非常麻煩的。

適用時機

- 無法預期資料數量的時候，因為不用 resize
- 需要頻繁地進行新增或刪除的動作
- 不需要快速查詢資料

## Array

特性

- 有 index

優點

- 可以快速的存取任意的 index 元素，時間複雜度為 O(1)。
- 不需存 pointer 紀錄，較省記憶體空間

缺點

- 插入與刪除的方法是較花時間的，以 shift 為例，刪掉第一個元素之後，陣列中所有的元素的 index 都需調整

適用時機

- 希望可以快速存取資料
- 已知陣列大小
- 較少的記憶體空間使用

## 總結

在 JavaScript 中實在想不到什麼情境會使用 Linked List，目前想到只有在大量的資料處理的時候會用的，若有其他的情境可以使用，請分享給我知道 XD

## leetcode 練習

[206. Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)

[141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

[234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/)

## 參考文章

- [鏈結串列 Linked List - 第 11 屆 iThome 鐵人賽
](https://ithelp.ithome.com.tw/articles/10216257)
- [Linked List: Intro(簡介)](alrightchiu.github.io/SecondRound/linked-list-introjian-jie.html)
