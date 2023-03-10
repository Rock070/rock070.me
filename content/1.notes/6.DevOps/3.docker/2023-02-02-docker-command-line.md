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
- `-v` [電腦上的資料夾路徑]:[容器內的資料夾路徑]，與本機共用 volume（儲存空間）

Ex: 使用 `alphine` 鏡像，來啟動一個名稱為「alpine-git-pnpm」的容器，並且開啟終端機互動模式：

`docker run -it --name alpine-git-pnpm alphine`

Ex: 使用 `rock070/alpine-git-pnpm` 鏡像，來啟動一個名稱為「alpine-git-pnpm-test」的容器，
並且可透過本機 port 80 來拜訪容器內 80 port 的服務，
並且將容器內路徑 `/project` 的資料夾映射到本機路徑為 `/Users/rock/Desktop/cs/project` 資料夾，來使用本機的儲存空間，避免容器刪除時檔案變更消失：

`docker run -p 80:80 -v /Users/rock/Desktop/cs/project:/project -it --name alpine-git-pnpm-test rock070/alpine-git-pnpm`

### 移除 image

`docker rmi ${imagesName}`

## Container

### 查詢目前 container

`docker ps`
`docker container ls`

### 關閉 Container

`docker stop ${containerID}`
