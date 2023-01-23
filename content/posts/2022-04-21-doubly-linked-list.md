---
title: Doubly Linked List（雙向連結串列）
description: Doubly Linked List（雙向連結串列） 資料結構的學習
date: 2022-04-21 00:21:50
categories: data structure
---

在 [singly linked list](https://rock070.github.io/blog.rock070/2022/04/20/linked-list/) 的基礎上，做一些變更：

1. 每個節點都新增一個 prev 屬性，指向上一個節點，第一個節點的 prev 指向 null。
2. Linked List 屬性新增 tail 指向最後一個節點。

![](https://i.imgur.com/RNy8pQg.png)

### 相對於 singly linked list 的優缺點

優點
- 可以簡單地做到反向存取，從尾巴的節點開始取值
- 因為可以反向存去的關係，時間複雜度較 singly linked list 少一半

缺點
- 要花更多的記憶體空間

## leetcode 練習

[430. Flatten a Multilevel Doubly Linked List](https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/)