---
title: binary-search-tree BST 二元搜尋樹
date: 2022-04-27 23:17:41
categories: data structure
---

二元搜尋樹比二元樹的定義多了一些限制：

1. 右邊所有節點都必須比 root 大
2. 左邊所有節點都必須比 root 小
3. 所有子樹都必須符合上述兩點

## 什麼時候會用到二元搜尋樹 BST

簡單來說如果你有一個系統，需要可以讓使用者不斷新增資料，你可以有兩種做法：

1. 以 Array 的型態儲存資料，但是前面有提到，若要對這些資料進行搜尋，因為 Sequential Search 的特性，所以時間複雜度為 O(n)。

2. 以 Hash Table 的型態儲存資料，搜尋資料的時間複雜度為 O(1)，但是 Hash Table 的設計，是需要預先知道有多少資料需要儲存的，所以也不是一個好選擇。

3. 這時就可以使用 Binary Tree

Binary Search Tree(BST)

- Binary Tree: 每個節點最多只能有兩個子節點：左節點、右節點
- Binary Search Tree: 是一種 Binary Tree，節點的大小要符合規則：left < root < right。

## 二元搜尋樹的 Big O
