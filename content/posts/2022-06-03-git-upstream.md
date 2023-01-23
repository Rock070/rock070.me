---
title: 如何切換 Git 遠端分支
description: 更換 Git 綁定好的遠端分支的方法
date: 2022-06-03 21:32:00
categories: Git
---

## 檢查對應的遠端分支  

`git branch -vv`

```shell
git branch -vv


* develop 5c22fb6 [origin/develop] docs(README): 新增分支介紹
  main    bc952a8 [origin/main: ahead 4, behind 13] deploy
(END)
```


## 更換分支 

- 方法一

`git branch -u 遠端庫名/分支名`

```shell
# 假設現在本地的 HEAD 在 develop
git branch -u origin main

Branch 'develop' set up to track remote branch 'main' from 'origin'.

git branch -vv 

* develop 5c22fb6 [origin/main: ahead 42, behind 13] docs(README): 新增分支介紹
  main    bc952a8 [origin/main: ahead 4, behind 13] deploy
(END)
```


> [!NOTE] 什麼是 HEAD
> 目前所在的分支。 
> 可參考：[【冷知識】HEAD 是什麼東西？](https://gitbook.tw/chapters/using-git/what-is-head)

- 方法二

git push -u 遠端庫名/分支名

同時會把 commit 推向遠端

```shell
# 假設現在本地的 HEAD 在 develop

git push -u origin main

Branch 'develop' set up to track remote branch 'main' from 'origin'.
Everything up-to-date

git branch -vv 

* develop 5c22fb6 [origin/main: ahead 42, behind 13] docs(README): 新增分支介紹
  main    bc952a8 [origin/main: ahead 4, behind 13] deploy
(END)
```