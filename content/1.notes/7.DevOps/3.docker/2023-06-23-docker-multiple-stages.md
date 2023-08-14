---
date: 2023-06-03 16:00:23
title: docker multiple stage 
description: 使用 docker multiple stage 減少 image 體積
draft: true
categories: docker
---

::Association
關聯： [[docker]]
::

在 docker 還沒出現之前，這些流程都是在本機上跑 (版本 0)，因為環境的不一致可能導致不同主機執行結果不相同。將這些流程步驟撰寫成 dockerfile 直接在容器裡執行就可以解決上述問題 (版本 1)，但也衍伸出了新的問題。為了執行代碼檢查和編譯，下載了許多套件或是相依工具，造成映像檔肥大，很多套件或是相依工具在部署時是不需要的。

## ㄧ、沒有使用 DockerFile

## 二、全部塞在一個映像檔

```
FROM node:hydrogen-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY . .
COPY package*.json .
RUN ls -a
RUN pnpm i
RUN pnpm lint
# RUN pnpm test
RUN pnpm run build
ENTRYPOINT [ "pnpm", "preview" ]
```

`docker build -t pnpm-0623 .`

::alert{type="info"}
若專案是在本機上練習，記得使用 .dockerignore 將 node_modules 忽略掉，否則可能會因為作業系統差異，在 linux 無法執行 node_modules 內的 shell script
::

## 三、拆分成兩個 Dockerfile，兩個映像檔

## 四、使用 Docker multi stage

## 結論

## 參考文章

- [dockerfile best practice # use multi-stage-builds - docker](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds)

- [Dockerfile - Multi-stage build 筆記 - amikai blog](https://amikai.github.io/2021/03/01/docker-multi-stage-build/)

- [multi stage - docker](https://docs.docker.com/build/building/multi-stage)

- [什麼是 Docker multi stage? - cindyliu923 blog](https://cindyliu923.com/2021/05/23/What-is-docker-multi-stage/)
