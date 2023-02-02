---
date: 2023-02-02 23:40:22
title: Dockerfile 撰寫
description: Dockerfile 撰寫的各指令意思
categories: docker
layout: post
---

## 參數

- FROM: base image, alpine 輕量 linux OS。
- ENV: 環境變數
- ARG: 接受創建 image 指定參數，如：`docker build --build-arg whoami=Rock070 -t rock/007 .`
- WORKDIR: 指令了此行之後的 Docker 命令的工作路徑
- RUN: 在 base images 中可以執行的指令，創建 image 時執行。
- COPY: 複製 Linux 虛擬環境中的檔案至 docker 容器中。語法：`COPY [電腦路徑] [容器路徑(WORKDIR)]`
- CMD: shell script，在容器啟動時執行。語法：`CMD: ["可執行文件", "參數一", "參數二"]`
- ENTRYPOINT:  進入點，`ENTRYPOINT` 跟 `CMD` 很像，一樣是啟動 container 的時候會用到

範例：

```zsh
FROM alpine:latest
ENV myworkspace /var/www/localhost/htdocs/
ENV greet "hello I'm ${whoami}, have a nice day!"
ARG whoami='Sam'
WORKDIR ${myworkspace}

RUN apk --update add apache2
RUN rm -rf /var/cache/apk/*
RUN echo "<h1> hello I'm ${whoami}, have a nice day! 1</h1>" >> index.html
RUN echo "<h2> hello I'm ${whoami}, have a nice day! 2</h2>" >> index.html
RUN echo "<h3> hello I'm ${whoami}, have a nice day! 3</h3>" >> index.html

ENTRYPOINT [ "httpd", "-D", "FOREGROUND" ]
```
