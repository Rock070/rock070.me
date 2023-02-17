---
date: 2023-02-12 17:39:15
title: 用 Nuxt Content 重寫我的部落格
description: 分享 Nuxt 官方網站文件使用的 Nuxt Content 重寫我的部落格心得
categories: [Vue, Nuxt]
---

![](https://i.imgur.com/ssonaYl.png)

## 一、前言

2021-10-04 開始架自己的[部落格](https://rock070.github.io/blog.rock070/)，主要是想分享我的學習筆記、一些想法跟生活片段。

一開始想說先簡單架一個，拿人家都用好的直接套，因為我很懶惰，我怕我花很多時間架好之後，就沒再發文章了，想把重點放在文章，所以直接參考 [Huli 部落格](https://blog.huli.tw) 的框架跟主題 [Hexo](https://hexo.io/zh-tw/) + [Minos](https://github.com/ppoffice/hexo-theme-minos)，也很快就架起來了。

期間發文次數也算不上多，但還是有在做學習的筆記，大部分都放在自己的電腦裡用 [obsidian](https://obsidian.md/) 紀錄，零零散散的不知道該不該發，但最近看到 [How to learn in public](https://dev.to/blackgirlbytes/how-to-learn-in-public-1coh) ，覺得應該把自己的心路歷程與筆記公開，因為事實上每個發佈在網路上的東西都不是完美的，但有些時候卻可以幫助在正在經歷不同階段的人，詳細的內容可以看我的另一篇筆記文章：[如何在公開場合學習](https://rock070.me/thinks/soft-skills/2023-01-04-learn-in-public)。

新部落格：[rock070.me](https://rock070.me/)

![](https://i.imgur.com/BS6BjVE.png)

## 二、為什麼我不用 Hexo 了？

- 彈性：原本是使用使用別人的主題，我想要客製化我的 layout 會比較麻煩，對我來說彈性不高。另外，久了也有點看膩了這個主題，需要另外去找主題，但找到的主題不一定每個地方的版面都讓我滿意。

- 熟悉度：坦白說很多 Hexo 周邊套件應該有更多功能可以使用，但我只專注在發文章，沒有考慮到 SEO, dark mode, rss, og:image, 多語言（i18n） ...等等。
  
- 我想用 TypeScript。

總之就是因為太多東西想要調整，考慮到時間成本、客製化、熟悉度與好奇心，最後還是選擇我更熟悉的 Vue 生態系： [Nuxt Content](https://content.nuxtjs.org/) 去做。

## 三、我的需求

一開始只是想要嘗試玩玩看，但沒想到就整個上頭了，功能越想加越多，寫這篇文章的時候梳理了一下我的需求：

- 編譯 markdown 檔自動生成 html
- 靜態檔案雲端儲存
- sitemap 產生器
- 支援 SSG & SSR
- og-image 產生器
- 多語系（i18n）
- 搜尋功能
- 客製化程度高

## 四、Nuxt Content 是什麼？

其實我最初的想法是直接用 Nuxt 這個框架做，然後自己用 [markdown it](https://github.com/markdown-it/markdown-it) 來編譯 markdown, 用 [shiki](https://github.com/shikijs/shiki) 來幫程式碼區塊配色，所有東西都自己做，但後來發現 Nuxt Content 都有提供了這些功能，[Nuxt](https://nuxt.com/) 官方的文件也是使用這個套件，所以就直接用了。

### 功能

以下是 [Nuxt Content](https://content.nuxtjs.org/) 的一些功能介紹：

- 可以讀取你的專案中的 content/ 目錄，解析 `.md`, `.yml`, `.csv` 和 `.json` 檔案，生成 html，並且透過 query 的語法可以取得更完整的文章資料。
- 可以用 Vue 開發不同的 layout，且可以在 `.md` 檔中指定要用哪一個。
- 可以使用 MDC (markdown component) 語法在 Markdown 中使用 Vue 元件，這真的超方便的。
- 可以使用 Nuxt Content 內建的元件來渲染你的內容。
- 可以使用類似 MongoDB 的 API 來查詢文章的內容。
- 可以利用 Nuxt 3 的特性，如 Vue 3, Auto-imports, Vite 和 Nitro server。
- 支援 SSG & SSR。

簡單來說就是可以用 Vue 檔創造自己的 layout，並在 markdown 文章中指定你要用哪個 layout，就可以自動渲染。並且可以在 vue 檔中，使用 `queryContent()` API + query 來搜尋文章，把資料全部交給你，看你要怎麼渲染。

我用 `queryContent` 簡單搜尋一篇我的文章：

```ts
queryContent()
  .where({ _type: { $ne: 'yaml' } })
  .sort({ date: -1 })
  .limit(1)
  .find()

// Returns
{
  _path: '/notes/devops/docker/2023-02-02-docker-command-line',
  _dir: 'docker',
  _draft: false,
  _partial: false,
  _locale: '',
  _empty: false,
  title: 'Docker 指令',
  description: '紀錄關於 docker 的指令',
  date: '2023-02-02T23:30:22.000Z',
  categories: 'docker',
  body: {
    type: 'root',
    children: [
      {
        type: 'element',
        tag: 'h2',
        props: {
          id: 'image',
        },
        children: [
          {
            type: 'text',
            value: 'Image',
          },
        ],
      },
      // ...
    ],
  },
  _type: 'markdown',
  _id: 'content:1.notes:6.DevOps:3.docker:2023-02-02-docker-command-line.md',
  _source: 'content',
  _file: '1.notes/6.DevOps/3.docker/2023-02-02-docker-command-line.md',
  _extension: 'md',
}

```

### Nuxt Content 缺點

#### TypeScript 型別還不完整

目前很多型別是待加強的，官方說明是[未來的計畫](https://content.nuxtjs.org/guide/displaying/typescript/#the-future)之一，

![](https://i.imgur.com/ITKcJFQ.png)

## 五、更多的 markdown 元件

原本 Nuxt Content 提供了一些[基礎元件](https://content.nuxtjs.org/api/components/prose)，在讀取 markdown file 後，自動用這些元件來套用在不同的 html tag，例如：h1, h2, h3, h4, code, img, ...等等。

後來發現 [@nuxt-themes/docus](https://github.com/nuxt-themes/docus)，提供了更多的元件，在官網上可以看到，例如 [Video player](https://docus.dev/api/components#videoplayer)、[callout](https://docus.dev/api/components#callout) 、[Terminal](https://docus.dev/api/components#terminal) ...等等，

我第一次看到這個的時候，真的是太震驚了，覺得跟魔法一樣，一開始我還不相信，太神了吧，所以跑去我的部落格中試用看看，還真的就是這樣。

只需要在 markdown 中用這樣的語法，就可以渲染出 terminal 的樣式。

```md
:terminal{content="nuxi build"}
```

![](https://i.imgur.com/as639BZ.png)

video-player：

```md
::div
  :video-player{src="https://www.youtube.com/watch?v=o9e12WbKrd8"}
::
```

<img src="https://i.imgur.com/rTBvwsP.png)" width="400px" />

另外，我後來在[原始碼](https://github.com/nuxt-themes/docus/tree/main/components)中看到了文件上沒有提到，但也有提供的元件，例如 `AppHeader`, `AppFooter`, `ThemeSelect`... 等等元件，包含「搜尋」、「黑夜模式」、「排版」、「側邊欄」、「文章結構」、「頁首」、「頁尾」、「上一篇文章」、「下一篇文章」等等功能，真的非常方便。

![docus-component](https://i.imgur.com/6J4KLsD.png)

## 六、我開發了近一個月

我在熟悉 vue 的情況下，開發了近一個月

主要的打造時間是今年的農曆過年，我預計在過年結束後要可以上架，所以我初一到初五都很專注在做這個部落格。

一開始沒有完整的看完文件，想說邊做邊看，什麼都自己做：Header、黑夜模式、文章 meta 資訊、icon ...等等。

![](https://i.imgur.com/7G27rvY.png)

![](https://i.imgur.com/TeO8Ibi.png)

後來才發現  [@nuxt-themes/docus](https://github.com/nuxt-themes/docus) ，雖然覺得很讚，但還是想自己做出所有東西，但一直到初四，我發現我做不完，而且 docus 越看越讚，雖然有點不甘還但還是直接用了 XDD，反正彈性也很高，未來想客製也是沒問題的。

另外一點就是 [nuxt-content](https://content.nuxtjs.org/) 跟 [docus](https://github.com/nuxt-themes/docus) 的文件有點不太齊全，所以我花了大量的時間在這兩個官網跟 [Nuxt](https://nuxt.com/) 文件三個 GitHub 的原始碼中尋找他們是怎麼生成自己的官網的，包含搜尋功能是怎麼 work 的、`<DocsPageLayout />` 這個高等元件裡面包含了什麼功能、`app.config.ts` 是怎麼設定的 ...等等。

後來開工之後，我發現我越來越想要更多功能，就一直維護了快一個月，才到目前現在我覺得算可以端上檯面的樣子。

## 七、自己計算文章閱讀時間

因為我很喜歡在讀者讀文章之前，提供一個大約的閱讀時間，讓讀者評估是否現在讀文章，還是等有足夠的時間再讀，所以我透過前面提到的 `queryContent()`，算出文章的總字數，並以每個人「一分鐘閱讀 550 字」的基數來算出閱讀總時間，這個基數是我以相同文章在 medium 上閱讀時間算出來的，當然我猜 Medium 一定不是用這種「線性」的算法，而是用「曲線」的算法，按照不同 HTML 區塊做不同的演算，例如程式碼區塊是一個算法、標題是一個算法，或是透過一段時間的統計資料讓機器學習並隨時改變算法，但這都是我的猜測哈哈。

## 八、我寫了自己的 og-image 產生器

我的需求是每次打包都要根據每篇文章的 meta title (front matter)，去自動生成一張 og-image 可以讓我放在 header。

我參考了 [vueuse](https://github.com/vueuse/vueuse) 產生 og-image 的方法：在 svg 的中間挖空，然後用 node.js 去抓 markdown 的 front matter 填補，最後在輸出成 png 檔案。

### 程式碼實作過程

- 讀取 svg template
- 用 [fast-glob](https://github.com/mrmlnc/fast-glob) 捕捉所有文章的路由
- 用 node.js fs 讀取所有路由的檔案 markdown 內容
- 參考 nuxt-conent 用 [remark-mdc](https://www.npmjs.com/package/remark-mdc) 抓取 markdown 的 front matter
- 用正則表達式鎖定要替換的地方
- 替換成功後用 [sharp](https://github.com/lovell/sharp)， resize 並輸出成 png

### og-image svg 模板

我是用 [Figma](https://www.figma.com/)  自己拉一個 svg 模板，但我是第一次用 Figma 設計，所以學 + 弄就花了我一個下午 XD

![og-image Template](https://i.imgur.com/Npn21gg.png)

### 原始碼

[svg-generate 原始碼](https://github.com/Rock070/rock070.me/blob/main/scripts/svg-generate.ts)

### 指令化產生 og-image

最後我成功實踐了使用 `pnpm svg:build`  就可以自動產出所有的圖片。

![og-image](https://i.imgur.com/5kYUKWm.png)

### 發文測試

過程中遇到很多圖片大小不合跟不熟悉 meta 設定的問題，所以就在 Facebook, Twitter，瘋狂發文測試 XDD

![](https://i.imgur.com/tFruxiF.png)

![](https://i.imgur.com/4BTpVoO.png)

## 九、第一次申請 GA，有夠新鮮

[Google Analytics](https://analytics.google.com/analytics/web/)

這對我來說非常新鮮，因為我第一次可以追蹤自己的網站流量，並看到後台分析，我可以看到觸及率、瀏覽次數、每個頁面的瀏覽次數、瀏覽的裝置、瀏覽者的國家、進入我網站的管道 ...等等，非常多資訊，雖然流量不高，但看了就很爽，有種我真的在管理我的網站的感覺。

另外，因為是自己要用的，所以我現在只申請一個放在全域的，之後看有沒有要特別觀察某個行為再考慮，要不要設定行為分析，例如：點擊特定按鈕時紀錄並分析。

### 流量總覽

![](https://i.imgur.com/Y7rR2W5.png)

### 瀏覽者來自什麼國家、進入網站的管道、各別頁面瀏覽分析

![](https://i.imgur.com/LeQI8Nf.png)

### 使用者人次的時間序變化

![](https://i.imgur.com/btyzfFd.png)

## 十、Search Engine Optimization 搜尋引擎優化

以前都沒有做過 SEO 相關的處理，所以對我來說也是非常新鮮

Search Engine Optimization （SEO）搜尋引擎優化，意思就是我再 Google 的搜尋我網站中有的關鍵字，可以出現在搜尋結果中，且排名在前面。

如此我就需要一些工具 & 文件來幫我達成，例如：`sitemap.xml`、`robots.txt`、`Google Search Console`。

### Google Search Console

> 網站管理員可以通過該工具了解自己網站的收錄情況並優化其網站的曝光率

自己第一次搞 SEO 才發現，原來 [Google Search Console](https://search.google.com/search-console) 有這個介面可以看自己的網站被 Google 收錄的情況，意思是說，如果沒有被收錄，我都不會出現在 Google 的搜尋結果中

我要被 Google 收錄，也就代表我需要提交我的 `sitemap.xml` 跟準備好我的 `robots.txt`，

我的 sitemap: <https://rock070.me/sitemap.xml>

可以在這個頁面提交 sitemap 的網址，讓 google 知道要收錄。

![](https://i.imgur.com/HU1RW8h.png)

可以在這個頁面看到 sitemap 中所有頁面被收錄的情況。

![](https://i.imgur.com/xei5Oaa.png)

![](https://i.imgur.com/eQkxtcM.png)

可以看到我目前只有首頁被收錄了，所以我使用「搜尋特定網站裡面的內容的語法」： `site:[url]`，搜尋，只會搜尋到我的首頁，沒有包含其他頁面

![](https://i.imgur.com/9o6aFuG.png)

並且，我透過首頁的關鍵字查詢，是真的會出現在搜尋結果中的：

![](https://i.imgur.com/qlMR4vp.png)

### Sitemap

Nuxt content 的 sitemap 產生我是看這邊的官方文章： [sitemap](https://content.nuxtjs.org/guide/recipes/sitemap)

所以我在 sitemap generator 中指定特定路由下的文章會匯出成 sitemap 的內容，排除掉目錄頁面等等。

## 十一、使用 Algolia 做搜尋功能

我是透過 [Algolia](https://www.algolia.com/) 底下的一個服務 [docsearch](https://docsearch.algolia.com/docs/what-is-docsearch) 來做申請，使用是免費的，我理解他的原理是根據網站提供的 sitemap，每週去你的網站爬蟲，並且以存在他們的 DB 中，我在前端的搜尋框搜尋的時候，每打一個字就會 Request 一次搜尋結果。

申請網址：<https://docsearch.algolia.com/apply>

### 申請條件

是免費的服務，但需要符合一些條件：

>1. 您必須是網站的**擁有者**，或者至少具有更新其內容的許可權。您需要在前端[嵌入一段JavaScript 程式法](https://docsearch.algolia.com/docs/DocSearch-v3)才能實現DocSearch。
>
>2. 您的網站必須**公開可用**。我們不會為僅在身份驗證后可用或託管在專用網路上的網站託管搜索索引。
>
> 3. 您的網站必須是**開源項目的技術文檔或技術博客**。我們不索引商業內容。
>
> 4. 您的網站必須**做好生產準備**。我們不會為空網站或包含佔位元元內容的網站編製索引。請等到您寫了一些內容後再申請。一旦您有一個穩定的設計，我們很樂意為您提供説明。

### 手動審核

看過官網文件後，會發現他們是手動審核每個申請的請求，所以會花一些時間在等待，不過我大概等兩天就收到核准 Email 了。

### 心得

- 可以查看爬蟲的結果的 db，並且手動做調整。
- 可以直接在後台做搜尋的測試
- 可以客製化搜尋的結果，有過濾、排序、語系、等等功能，例如：只搜尋內容，不搜尋標題，或是不要出現重複路徑的結果等等。
- 功能比我想像的多，還要再多研究

### Demo

![](https://i.imgur.com/u0HjmeH.png)

## 十二、買了新的網域

在 GoDaddy 買了一年的網域： `rock070.me`，花了我 $NTD 617，還算便宜，希望之後不要暴漲。

## 十三、首次嘗試了 vercel 部署

[Vercel](https://vercel.com/) 是一個由開發 Next.js 的 Vercel 公司（同名）提供的「網站託管平台」，支援許多現代網頁框架的部署，包含 Next.js、React、Vue、Nuxt、Angular、Gatsby、Svelte ...等等，雖然是 Next.js 的公司，但對 Vue 框架的支援也是沒有問題的。

使用方式非常方便，只要綁定 GitHub Repo 就可以了，

讓我非常驚訝的是 Vercel 會在我每個分支每次更新的時候（包含 push），部署在兩個不同的網域，且可以**在網站中像 Figma 一樣留言**，非常適合拿來團隊協作跟記錄東西。

![](https://i.imgur.com/SGYa0xq.png)

![](https://i.imgur.com/E8hQwuM.png)

### 設定

可以在設定頁面設定很多東西：

- 環境變數
- 綁定網域
- 打包指令
- install 指令
- output 路徑
- node 版本

![](https://i.imgur.com/V0HC8ws.png)

## 十四、目前部落格的不足，未來想怎麼改善

### 效能問題

目前發現內容少的頁面，電腦版的效能分數沒有問題，**內容多的頁面，效能分數比較低**，且兩者的**手機版都是偏低**，可能以下是幾個問題，未來會優先針對這部分做優化

#### 可能的問題

 1. Nuxt 效能瓶頸
 2. 機器問題
 3. 我的某功能寫法有問題

#### 內容少的頁面

[自己打包一個 docker image（linux + git + node + pnpm）](https://rock070.me/notes/devops/docker/2023-02-02-build-my-own-docker-image)

- 電腦版：97 分
- 手機版：61 分

![](https://i.imgur.com/j7tNA40.png)

![](https://i.imgur.com/anA1gKP.png)

#### 內容多的頁面

[CSS 設計模式研究筆記](https://rock070.me/notes/css/2021-10-07-css-pattern)

- 電腦版：75 分
- 手機版：50 分

![](https://i.imgur.com/gR0zqOD.png)

![](https://i.imgur.com/bww0l8q.png)

## 十六、未來要做的功能

- 多語言（i18n）
- 擴充首頁自我介紹內容

## 十七、可能會做的功能（不一定會做）

- 文章心智圖，像 Obsidian 一樣關聯各文章，就不需要把文章特別分資料夾了。
- 禪模式，新增一個按鈕可以讓 側邊欄跟右側的 TOC 隱藏起來，讓版面更乾淨，只顯示文章，讓使用者專心的看內容。
- side project 頁面，可以 Demo 或列出我做過的 side project，達到一個彙整的作用。
- 靜態資源儲存：舊部落格是把所有圖片都上傳 imgur，雖然可以永久存放，但想嘗試看看 S3。

## 十八、總結心得

這次重構比我想像中的久，主要是越做越有勁，自然就越想把東西弄到最好，也大量參考別人的東西，拼拼湊湊成自己的東西，在這個過程中學到很多東西。

### 學到的東西

- 挖掘原始碼的經驗值：因為文件寫得不夠完整，所以需要去原始碼中挖掘，學習到很多東西，也越挖越快。
- SEO：這次自己想辦法把 SEO 做好，所以也接觸到了很多沒接觸過的知識，包含 og-image, google search console, GA ...等等，希望可以持續學習。
- 效能優化：這次有因為效能分數，做一些優化，如把 GA Script 放到 [Nuxt Ready](https://nuxt.com/docs/api/utils/on-nuxt-ready#onnuxtready)後再執行，不要阻塞執行緒，導致延遲畫面第一次渲染。
- nodejs 的理解：產 og-image 的過程中學到很多 nodejs 的用法。
- 搜尋服務：以前就一直很好奇 [Vue](https://vuejs.org/)、[Nuxt](https://nuxt.com/) 的搜尋功能是怎麼做的，這是自己申請一次，學習到了，且可以持續根據需求調整。
- Vercel 的服務：認識到 vercel 的強大，也在另一個專案內有使用 serverless function 的功能，覺得是非常棒的工具。
- 黑夜模式：這次挖掘內建的黑夜模式的原始碼發現，可以透過 `window.matchMedia('(prefers-color-scheme: dark)').matches` 來偵測使用者對瀏覽器的主題模式偏好並直接帶入，例如我本來就設定瀏覽器要是 dark mode，那進入網站的時候就應該直接顯示 dark mode。另外，如果有切換模式的話，可以記在瀏覽器中，例如 localStorage 中，來保持每次進入的主題模式。

此外對於 Nuxt 團隊對於「抽象」的能力非常佩服，把文件網站的核心抽象出來，讓使用者可以保有彈性的情況下，還可以方便、簡單的直接拿來產生文件、部落格。

最後，希望自己可以持續發文。
