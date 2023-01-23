---
title: 樹的走訪：寬度優先走訪（BFS）、深度優先走訪（DFS）
date: 2022-04-27 23:17:41
---

走訪的意思是，從根節點開始，逐個走訪各個節點，不同的拜訪順序，在程式碼的實作有很大的落差。

依照走訪原則，可以分為兩種：

1. 寬度優先走訪 Breadth-First Tree Traversal
2. 深度優先走訪 Depth-First Tree Traversal(PreOrder, InOrder, PostOrder)

### **一、寬度優先走訪 Breadth-First Tree Traversal**

![](https://res.cloudinary.com/practicaldev/image/fetch/s--1Aaplbiq--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://miro.medium.com/max/1400/1%2A3NKvODZparRFVKEwtVmrkw.gif)

寬度優先的概念其實很簡單，從根開始，同一層都先走訪完之後，再進入下一層：如圖：level 1 的 1 開始，走訪完後進入 level 2 走訪 2, 3，再進入 level 走訪 4, 5, 6, 7。

![](https://i.imgur.com/lNZAO62.png)

以上圖為例，這個樹狀圖有四層，分別為
第一層: 2
第二層: 7, 5
第三層: 2, 10, 6, 9
第四層: 5, 11, 4

走訪的順序就會是： [ 2, 7, 5, 2, 10, 6, 9, 2, 11, 4 ]

#### 用 JavaScript 實作寬度優先走訪

實作一個 `BFTT` 函式，input 為 `Tree`，output 為依照 `寬度優先走訪` 的順序組成 `result` 陣列。

有一個 Tree，每個節點都叫做 `TreeNode`，`TreeNode` 有兩個屬性 `value` 與 `children`，value 為數字，children 為 `TreeNode` 陣列或是 `null`。

##### Tree Node 型別

```js
/**
 * @typedef { Object } TreeNode
 * @property { number } value
 * @property { Array[TreeNode] | null }
 * /
```

##### Tree

```JS
const tree = {
  value: 2,
  children: [
    { 
      value: 7,
      children: [
        { value: 2, children: null },
        { value: 10, children: null },
        {
          value: 6,
          children: [
            { value: 5, children: null },
            { value: 11, children: null },
          ],
        },
      ],
    },
    {
      value: 5,
      children: [
        {
          value: 9,
          children: [
            { value: 4, children: null }
          ],
        },
      ],
    },
  ],
};
```

#### 思路

一層層遍歷 children，存進 queue，然後依照 `queue 的特性：先進先出`，從 queue 內排序第一的開始處理，處理完則離開 queue。

[完成程式碼 - GitHub](https://github.com/Rock070/algorithms-data-structure-repo/tree/master/data-structure/tree/BFS)

```js
const BFTT = (root) => {
  const result = []
  const queue = []

  queue.push(root)

  const traversal = (tree) => {
    result.push(tree.value)
    const subTree = tree.children
    if (subTree) {
      for (let i = 0; i < subTree.length; i++)
        queue.push(subTree[i])

    }
  }

  while (queue.length !== 0) {
    traversal(queue[0])
    queue.shift()
  }

  return result
}
const result = BFTT(tree)
console.log(result)

// [2, 7, 5, 2, 10, 6, 9, 2, 11, 4];
```

### **二、Depth-First Tree Traversal（深度優先走訪）**

`深度優先走訪` 根據每個 `subTree` 的走訪順序，又可以區分為三種：`Pre-Order`、`In-Order`、`Post-Order`。

#### **1. Pre-Order**

![](https://upload.wikimedia.org/wikipedia/commons/a/ac/Preorder-traversal.gif)
先遇到的節點先處理。

順序：root, left, right

從圖片中可以看到從根節點 F 開始，藍色為走訪順序，若顯示紅色則為無法再走下去的情況，這時就會則回到上一層繼續走訪，直到沒辦法再繼續下去。

[完整程式碼 - GitHub](https://github.com/Rock070/algorithms-data-structure-repo/blob/master/data-structure/tree/DFS/pre-order-binary.js)

實作方法：先遇到的節點先走訪，並採用遞迴方式，若有 left, right 節點則繼續遞迴。

```js
const preOrder = (root) => {
  const result = []

  const traversal = (node) => {
    result.push(node.value)
    if (node.left)
      traversal(node.left)
    if (node.right)
      traversal(node.right)
  }

  traversal(root)

  return result
}

// PreOrder: ["F", "B", "A", "D", "C", "E", "G", "I", "H"]
```

#### **2. In-Order**

![](https://upload.wikimedia.org/wikipedia/commons/4/48/Inorder-traversal.gif)

順序： left, root, right

從圖片中可以看到從根節點 F 開始，藍色為走訪順序，若該節點為目前最左邊的節點，則推入 `Inorder` 陣列中；若顯示紅色則為無法再走下去的情況，這時就會則繼續尋找最左邊的節點，直到沒辦法再繼續下去。

[完整程式碼 - GitHub](https://github.com/Rock070/algorithms-data-structure-repo/blob/master/data-structure/tree/DFS/in-order-binary.js)

實作方法：越左的節點先走訪，並採用遞迴方式，若有 left, right 節點則繼續遞迴。

```js
const InOrder = (root) => {
  const result = []

  const traversal = (node) => {
    if (node.left)
      traversal(node.left)
    result.push(node.value)
    if (node.right)
      traversal(node.right)
  }

  traversal(root)
  return result
}
// // ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
```

#### **3. Post-Order**

w
![](https://upload.wikimedia.org/wikipedia/commons/2/28/Postorder-traversal.gif)

順序：left, root, right

從圖片中可以看到從根節點 F 開始，藍色為走訪順序，若該節點為目前最左邊的節點，則推入 `Postorder` 陣列中，若找不到最左節點，就會將右邊的節點推入；若顯示紅色則為無法再走下去的情況，這時就會則繼續尋找，直到沒辦法再繼續下去。

[完整程式碼 - GitHub](https://github.com/Rock070/algorithms-data-structure-repo/blob/master/data-structure/tree/DFS/post-order-binary.js)

實作方法：越左的節點先走訪，並採用遞迴方式，若有 left, right 節點則繼續遞迴。

```js
const PostOrder = (root) => {
  const queue = []

  const traversal = (node) => {
    if (node.left)
      traversal(node.left)
    if (node.right)
      traversal(node.right)

    queue.push(node.value)
  }

  traversal(root)

  return queue
}
// ['A', 'C', 'E', 'D', 'B', 'H', 'I', 'G', 'F']
```
