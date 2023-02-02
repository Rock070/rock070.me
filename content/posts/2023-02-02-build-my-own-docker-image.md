---
date: 2023-02-02 23:00:22
title: 自己打包一個 docker image（linux + git + node + pnpm）
description: 透過 alpine image 建立容器，並在容器內建立環境，包含 git + node + pnpm，重新把容器打包成 image，並上傳到 DockerHub
categories: docker
layout: post
---

## 基礎鏡像：alpine images

alpine 是基於 Alpine Linux 的最小 Docker 鏡像，大小僅為 5 MB。

## 建立具有 git, node, pnpm 的 image

```zsh
# 拉 DockerHub 上 Alpine Linux image 下來
docker pull alpine 

# 啟動容器，並進入終端機互動模式
docker run -it --name alpine-git-pnpm alpine

# 安裝 curl
# apk 是 Alpine Linux 下的包管理工具
apk --no-cache add curl

# 安裝 git
apk add git

# 檢查 git
git --version

# 安裝 node, npm
apk add --update nodejs npm

# 檢查 node
node -v

# 安裝 pnpm
npm install -g pnpm

# 檢查 pnpm
pnpm -v

# 將容器打包成鏡像，在本機執行，不是容器內
# docker container commit [容器名稱] [鏡像名稱]
docker container commit alpine-git-pnpm alpine-git-pnpm

# 為鏡像打 tag，因为鏡像推到 Docker Hub 中，要用 tag 来區分版本，這裡我们先設定为 latest。
# tag 中加上了用戶名做命名空間，防止與 Docker Hub 上的鏡像衝突。
docker tag alpine-git-pnpm rock070/alpine-git-pnpm:latest

# 將 tag 推送至 Docker Hub。
docker push rock070/alpine-git-pnpm:latest
```

## 拉取已建立的 image

```zsh
# 將本地所有關於 alpine-git-pnpm 的鏡像和容器删除
# 拉取剛剛推送到 Docker Hub 的鏡像
docker pull rock070/alpine-git-pnpm:latest

# 使用 image 執行容器

docker run -it --name alpine-git-pnpm-test rock070/alpine-git-pnpm

# 驗證環境是否正常
git --version
node -v 
npm -v
pnpm -v
```

### 參考文章：[如何用 docker 打造前端开发环境](https://juejin.cn/post/7017129520649994253)
