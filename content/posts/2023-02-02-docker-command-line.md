---
date: 2023-02-02 23:30:22
title: Docker 指令
description: 紀錄關於 docker 的指令
categories: docker
---

## Image

### 建立 image

docker build -t [鏡像名稱]  [Dockerfile 路徑]

Ex: `docker build -t pnpm-git .`

### 拉取 image

docker pull  [鏡像名稱]

### 推送 image

docker push  [鏡像名稱]

### 使用 image 啟動容器

docker run -it --name [容器名稱]  [鏡像名稱]

- `-it` interactive mode 互動模式
- `-d` detached 在背景執行
- `-p` [電腦上的port]:[容器內的 port]

Ex: `docker run -it --name alpine-git-pnpm alphine`

### 移除 image

`docker rmi ${imagesName}`

## Container

### 查詢目前 container

`docker ps`
`docker container ls`

### 關閉 Container

`docker stop ${containerID}`
