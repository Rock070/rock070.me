---
date: 2023-8-20 21:28:28
title: Laravel Vue Conf 2023
description: 紀錄參加 Laravel Vue Conf 2023 心得
categories: 生活紀錄
---

這是我第一次參加 [Laravel & Vue Conf](https://laravelconf.tw/agendas)，與之前參加的 conference 不太一樣的是，以往的範圍都是涉及軟體開發的大範圍，如：前端、後端、DevOps、UI/UX、PM、職涯規劃等等，這次比較限縮在前端的 Vue.js 框架 & PHP Laravel 框架。

這次難得邀請到了 Vue 的創造者**尤雨溪**大大，所以肯定要買票進場支援的 XDD。

記錄一下這次的內容，有些有拍投影片，有些沒拍，所以大部分都憑印象，能記就記，希望下次大會能開個共筆給會眾共同編輯 XDD

## 本次議程

<img src="https://i.imgur.com/K4QHa3Q.jpg" height="100" width="100" style="width:85%;display:flex;justify-content:center;margin:auto;"/>

## 重新發明 Vue：經驗與教訓 - 尤雨溪

第一次現場看到尤雨溪本人，他分享了 Vue 的發展簡史，與在 Vue.js 的開源過程當中，Vue 2 遇到的困難、Vue3 的目標，與在過程中他認為正確與錯誤的決定。

### Vue 發展簡史

- 2013 年第一次發佈帶有 VueJS 名字的版本
- 2014 年第一是公開宣傳
- 2015 年 10 月：1.0 版本發佈
- 2016 年 10 月：2.0 版本發佈
- 2018 年 9 月：3.0 版本發佈
- 2020 年 9 月：3.0 軟發佈
- 2022 年 1 月：3.0 正式成為默認版本

### Vue 2 遇到的問題

- 純 Virtual DOM，在性能成本上，多了很多額外的開銷。
- 編譯器過於簡單，能夠進行分析的有限
- 元件實例化的開銷過大
- Options API 易用，但限制了程式碼的可重構性，在大型、長期的應用中，可維護性出現問題。
- Options API 對型別推斷不友好，Edge 狀況多、型別實現維護度高。
- Flow 語言的更新頻繁，在開發 vue 時，需要花蠻多力氣跟上版本更新。
- 邏輯抽取服用依賴 Mixin，容易導致屬性來源不清晰

### Vue 3 的目標

- 程式碼重構
  - 遷移到 TypeScript + 自動生成型別提示
  - 重新設計內部模組分層，如抽象核心、編譯器等等
  - 為以後的維護度打好基礎，至少 10 年不用再重構
- 性能
  - Virtual DOM 算法重構
  - 結合編譯器對 Virtual 進行優化，透過在編譯階段對 VNode 進行標記，來減少無意義的副作用收集
  - 優化元件實例化的開銷
- API
  - 引入對重構、複用、型別推斷更有好的新 API
- 瀏覽器
  - 語言支持對低要求 ES2015+

### 周邊配套設施的工程巨大

- 新文件
- 建構工具（Vue Cli / Vite）
- Vue Router
- Vuex -> Pinia （Pinia 其實就是 Vuex5）
- DevTools
- IDE 支援（Vetur -> Volar）
- SFC type check（vue-tsc）
- Lint（eslint-plugin-vue）
- Unit Testing（@vue/test-utils）

#### 錯誤的決定

##### 1. 太多微小的 Breaking Change

大部分的破壞性改動，單獨看都不難處理，但是在實際應用中湊在一起就會變成很大的改動，對開發者來說複雜指數高。

應該不要一次發佈大量的破壞性改動，將小的破壞性改動分批慢慢發布，在保證向後兼容的基礎上，採用 `deprecate` -> `opt-in` -> `remove` 的步驟，漸進式且溫和的發佈改動，如 Angular 框架，每次將改動變成一個選擇性的變更，告訴開發者，目前還可以使用這個功能，但是未來將會被廢棄，並用一些方式發出此種警告，開發者可能會更能接受慢慢的去汰換掉將被淘汰的功能。

##### 2. 低估對生態中依賴的影響

簡單來說就是 Vue 3 剛推出的時候，生態中的相關 Library，來不及跟上，導致在實際應用中，升級了 Vue，但是依賴套件的功能會壞掉，造成了升級上的障礙。

另外很多的大型依賴大量的使用了「內部 API」，就是那種官方文件都沒寫但是其實有 export 出來的 API，如：Element UI。所以在升級 Vue3 的時候，花了大量的時間需要去改寫這些寫法。

##### 3. 發佈節奏的處理

Vue 3.0 發佈，但相關的配套措施尚未完善，如

- 文件較粗糙，缺少 Composition API 作為一等公民的學習流程。

::alert{type:info}
一等公民：該語言中的某功能可以作為函數參數、函數返回值，也可以賦值給變數。
::

- Router / VueX 還在 beta / rc

- 無提供 Migrate Build

- 瀏覽器插件尚未支援

對於開發者來說，第一印象很重要，不要發佈半成品，在正式發佈前，可以積極的向社區的庫維護者尋求協作，幫助他們提前適配。

- <script setup> 尙未穩定

#### 正確的決定

##### 1. 擁抱 TypeScript

為開發者提供了良好的型別支援，與框架本身的維護性也大大的提升。

##### 2. 堅持 Composition API

`<script setup>` 提昇了開發體驗，也提升了 DX，提升了可維護性與可重構性。提升了邏輯複用性，如 VueUse 這樣的 hook Library。

##### 3. 對開發體驗 DX 持續投入

- Vite 的投入雖然花了很大的成本，但是作為一個 dev server，大大的提升了啟動 dev server 的速度，也從框架中獨立出來，支援其他框架，甚至其他語言。
- 對 Vue 3 的官方文件進行大規模的重寫（超過 50%）與結構調整，提升對文件的重視度。
- Volar：因為 TypeScript 無法支援 Vue SFC 檔案的型別檢查，Volar 工具的投入，帶來的是大幅度地提升了 Vue SFC 的 TypeScript 支援。

### 小總結

整體來說框架的開源更新應兼顧「可重構性」、「大項目的可維護性」、「可複用性」、「開發者體驗」，且在發佈破壞性變動時，應該先發佈一些 `Opt-in` 的版本，來柔性的告訴用戶，未來將要遺棄該功能，如果要跟上更新的話，請找時間重構程式碼。

### 與偶像合照

在下午茶時段的時候，看到在排隊拍照，因為隊伍剛形成還沒有很多人，就趕快加入隊伍中等待拍照 XDD

<img src="https://i.imgur.com/lzOHOz5.jpg" height="100" width="100" style="width:30%;display:flex;justify-content:center;margin:auto;"/>

## 被 Vue 框架耽誤的建構工具 - Vite - 高見龍

Vite 作為一個 dev server 之所以快的原因是 ES Module，不同於 webpack 要把所有程式碼都包成一包後才能啟動 server。加上使用 `esbuild`，提供了更快的建構速度。

之後就開始了 Vite 的源碼探索，感覺因為尤雨溪在台下的關係，龍哥有點太緊張了 XD，可以感覺到他有些不太自信，在看源碼的過程當中有看到 websocket 的應用，以及 cli 邏輯的撰寫與別名的功能，本來期待講到核心的模組地圖，但是時間不夠，就停下來了，有點可惜，只能之後有空再自己去挖原始碼。

## 從 Vorms 出發的一場開源大冒險 - Alex Liu

因為跟 Alex 是同公司，在開演之前有聽過他的簡報並給他一些建議，本來還很擔心他會超時，但是這次表現完全超過練習的時候，講完的時候完美的剩下一分鐘，完全在預期內，而且講話中為了思考而產生的贅詞，這次也減少很多，使用「**停頓取代贅詞**」，並在停頓後切重要點的語句，讓聽的人可以專注並持續接受訊息，不只是誇獎他，也是我需要筆記下來且不斷練習的。

在這個表單驗證套件中我覺得有學習到的觀念是，可以透過對 inject & provider 的封裝，讓 composition API 可以完全脫離元件的父層子層的傳遞，達到開箱即用的方便，也透過封裝 smart component 的封裝，讓表單內的元素，如 input、select、checkbox 等等保留響應屬性，且更方便使用。還有重視開發者可能會使用自己熟悉的第三方驗證庫，來提供一個接口，讓使用者可以自己傳入想要的驗證工具，如 zod, yup, valibot 等等來做驗證，「策略模式」的設計，如 vue 3 對開放編譯器的接口、tanstack query 對 query function 的接口，我認為都是類似的手法，值得學習。

之前有幸為 Vorm 提交了一個 [PR](https://github.com/Mini-ghost/vorms/pull/18)，在此次演講的簡報中有被提到，覺得非常開心。

![](https://i.imgur.com/470M1WZ.jpg)

## 從 MVC 到前後分離的策略 - Erik

來自加坡商鈦坦科技的senior product developer，分享如何把 C# 與前端程式碼耦合的專案，拆解成前後分離。

坦白說抽離的方法超乎我的想像，我的理解是後端出 API 給前端打，然後 client 請求的是前端的 server，但是因為公司的 scrum 機制，需要支援「每個更新都要可以 rollback」、「每兩週都可以發佈更新」，所以將想達成的目標架構，拆分成好幾個單元。

模式是讓前端的每個元件都變成一個獨立的資源，讓 C# 在接到 client 請求之後，對前端 server 請求元件資源，然後在 C# 內拼湊所有前端元件，再送給 client 端。完全顛覆我的想像，讓前端變為 C# 的資源，算是開眼界，原來還有這種做法，只不過因為元件都彼此獨立，所以這樣做還算好做，但是如果元件需要頻繁的交互溝通，就會變得比較複雜。

一個元件使用一個 Vue 實例，切割所有元件的資源，並且透過反向代理，讓存取資源更方便。

另外，Erik 説「scrum 的精神在於頻繁更新，但效率不一定比瀑布流更快」，也讓我對 scrum 有全新看法。

## 開發的未來，Nuxt 3 重新定義開發體驗 - Mike

Mike 這次分享 Nuxt 3 的開發體驗，從 virtual router, plugin, module, env, auto import, 內建 composable, nuxt devtool 等等開箱即用的方便功能做介紹，但因為我本身就是 Nuxt3 的使用者，所以大部分的內容，我在一些專案上都有使用過，較可惜的是沒有聽到更深入的講解，如源碼解析之類的，不過還是很謝謝 Mike 的分享！

## 成為火影還是航海王！？踏上升級與重構的冒險

由 104 的前端工程主管 Alex 來分享如何漸進式的從 Vue2 migrate 到 Vue 3，當中讓我學習到的是當更換工具時，首先最重要的是去了解專案中哪些寫法是被遺棄的，不要取代原本的寫法，而是在專案設定中，使用變數的方式讓舊寫法也可以相容，如：不要去改寫 `$router` 的寫法，而是透過使用 globalProperty 的 $router 變數來讓舊寫法也可以被支援。

```ts
const instance = getCurrentInstance();
instance.appContext.config.globalProperties.$router = useRoute();
```

另外就是與其使用 nvm 來切各個專案，不如使用工具 `remote develop` 設定好各個專案的 docker 環境 + init CLI，讓 code reviewer 或是新成員，可以更簡單、快速的啟動專案。

## 工作坊：使用 Vue3！自己的 UI Framework 自己做

工作坊主要目的就是讓學員分組可以製作一個開源專案，並且發佈到 npm 上，但是時間有限，我跟組員共同開發了一個 [vue3-noti](https://www.npmjs.com/package/vue3-noti) 的套件，是想要嘗試做自己的 Vue3 toast 元件，但是時間真的不太夠，不到一個小時的時間，我們使用 live share extension 共同在我的電腦上的 main 分支共同開發，第一次五個人一起用，沒想到居然沒啥問題，超讚的！

最後因為時間問題，連功能都沒寫完，就急著先發佈了，然後就下課了 XD，所以現在安裝基本上是完全不能用的 XDD，之後有機會來重新製作一個！

接下來是筆記：

### 前期計畫

- Framework 定位，例如是前台高度客製化還是後台
- Framework Name
- 框架要解決的問題

### 開發規劃

- 支援框架版本，如 Vue3
- 是否要向下相容
- 是否要支援其他框架
- 是否要依賴其他套件

### Releases 的準備

- 文件撰寫
- 範例準備
- 測試項目
- 如何宣傳

### 分析一個開源專案

#### 人物

- 作者：專案發起者。
- 擁有者：專案核心主要成員，有權限直接修改專案的管理員。
- 維護者：維護專案與開發，同時參與專案的方向與組織的管例。
- 貢獻者：只要是為專案做出了貢獻的人，包含抖內。
- 社群成員：會積極地參與專案討論的使用者們，表達他們對專案走向的看法。

#### 說明文件

- 協議許可（license）：根據開源定義每個開源專案都必須有個開源許可協議。
- README：就是一個說明說書，通常會解釋專案有何用處，為何發起，以及如何快速入門等
- 貢獻（CONTRIBUTE）：幫助人認識與使用專案，「貢獻」這個文件則是針對想對專案貢獻的人寫的指南
- 行為準則（CODE_OF_CONDUCT）：設定基本規範來約束參與者的行為（非必要），如 lint 規則
- 其他文件：有些專案也許還有其他文件，例如教學、專案規範

#### 社群

- 問題追蹤（issue tracker）：一些專案討論過程，人們討論專案問題的地方
  請求提取（PR）：給人們檢查程式碼、以及相關問題的討論
  即時在線聊天：大部分的專案會使用聊天頻道（Slack, Discord）

### 開始使用 Vite

### 打包格式

| 格式        |     | 說明      |
| ----------- | --- | --------- |
| xxx.cjs     |     | CommonJS  |
| xxx.esm     |     | ES Module |
| xxx.iife.js |     | IIFE 版本 |

### README 撰寫的重點項目

- 項目名稱與一行簡介
- 詳細描述
- 重點功能介紹
- 安裝指南
- 使用範例
- 授權條款
- 聯絡方式與支援
- 感謝

### 精美的 icon 服務

- shidlds.io
- badgen
- nodeICO

### GitHub README Status

### Contrib.rocks 產生參與者頭像

### 文件網站開發 VitePress

### npm 上傳

登入：npm adduser & npm login
上傳：npm publish

每次上傳版本號都不能一樣

## 總結

整體來說此次的 Conf 有學習到東西，也有認識到新朋友，甚至還遇到了前同事，都聊了很多，我想這也是參加 Conference 的大優點吧！

但可能是因為範圍侷限的關係，或是我對這個生態系比較熟悉，我認為沒有之前參加 Conf 給我一連串新知識的震撼體驗。

但是有跟尤雨溪大大拍到照片好像已經值回票價了 XDD

另外希望下次大會能提供共筆連結、提供瓶裝水、會眾的牌子可以使用硬質的 XDD
