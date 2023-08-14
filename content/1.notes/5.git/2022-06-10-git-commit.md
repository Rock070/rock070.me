---
title: 建立可讀性高的 git 提交吧！
description: 良好的 git message 可以使提交紀錄看起來更友善，也更好在未來追蹤
date: 2022-06-10 21:04:33
categories: Git

---

在討論之前，我們應該先知道什麼是「可讀性低的提交」。

![git](https://i.imgur.com/MLKNF02.png)

上方這個提交紀錄，可以四個提交大概看到提交的內容是什麼，但是又好像不太確定提交訊息所指的內容。
「會員登入」這個提交，可以看出是跟會員登入有關係，但是然後呢？可能會有些疑問浮出心頭：「他是製作了會員登入的功能嗎？」、「修改了會員登入的樣式？」、「修正了會員登入的 bug？」、「還是重構了？」
再看「調整會員登入」這個提交，「他修改了會員登入的什麼東西啊？」。

我相信在開發的過程中如果看到其他成員的提交訊息是這樣，心中可能會冒起這些疑問。如果還沒有冒出這些疑問，那讓我們看看下面的範例：

![git](https://i.imgur.com/eJR9MaC.png)

可以看到又有人提交了一個訊息叫做「會員登入」，跟第一個提交命名居然一樣，這時候團隊其他成員就生氣了：「這到底誰看得懂？」。

## **低可讀性造成什麼問題？**

- 無法一眼看出提交的主要內容
- 可能導致很多重複性的提交訊息
- 使合併提交的人，無法簡單的了解為什麼需要這個變更

這樣的提交訊息無論我們是要整理分支、cherry-pick、還是根據節點 code review，就會無法一眼就知道這個節點的修改內容，也因為這樣，整理起來就會變得困難。

## **高可讀性帶來什麼好處？**

讓我們再來看看下面這個提交：

![git](https://i.imgur.com/XcDeQRH.png)

跟剛剛相比，新增了以下幾點描述，使提交更清楚，「feat(會員登入): 登入功能與切版」可以很清楚知道，製作了「會員登入」頁面的「功能」與「切版」；「refactor(會員登入): 重構 useLogin 程式碼」可以清楚知道「重構」了「會員登入」頁面的 「useLogin」 函式。

如此，就能更清楚提交的內容了，而在不久的未來，可能會因為這樣貼心的舉動而感謝自己。
另外，我們其實可以建立一套提交規範，讓團隊去遵守，更可以透過提交工具來簡單化這個過程。

## **建立一套提交規範**

規範可以根據團隊自己建立，就像感情一樣，沒有絕對好的，只有最適合的，最適合就是最好的。

目前被廣泛使用的就是 Angular 團隊使用的 [Git Commit Guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md) ，也衍生了這一套規格： [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) ，目前我也是採用這一套。

接下來我會大概闡述一下這套規範，加上一些我個人的想法：

```vue
<type>(<scope>): <subject>

<body>

<footer>
```

每個提交都必須要有 header, body, footer，header 是由 type, scope, subject 所組成

而我們可以透過指令： `git commit -m 'header' -m 'body' -m 'footer'` 來達到這種提交訊息，如：

```shell
git commit -am 'fix(全站): 修正 IOS 裝置頁面高度跑版問題' -m '因為用戶 在 IOS 裝置上收放 Toolbar 會導致頁面跑版，所以將 100vh 寫死更改為監聽 web resize 事件，每次 resize 都重新調整頁面高度 ' -m 'fix #22'
```

git log 出來看看

```shell
commit 88700ed8418fc8aa99c545cf5804fe3ba0d3c1b2 (HEAD -> master)
Author: rock070
Date:   Fri Jun 10 09:54:17 2022 +0800

    fix(全站): 修正 IOS 裝置頁面高度跑版問題
    
    因為用戶在 IOS 裝置上收放 Toolbar 會導致頁面跑版，所以將 100vh 寫死更改為監聽 web resize 事件，每次 resize 都重新調整頁面高度
    
    fix #22
```

### **type 類型**

下面是可以選用的類型：

```javascript
feat: 新功能
fix: 修正 bug
docs :文件內容修改
style: 跟程式碼語意無關的修改，包含修改縮排、新增分號 ... 等等之類的
refactor: 無關新功能與 bug 修正的程式碼修改
perf: 程式碼對於提升效能有幫助的修改
test: 新增或修改測試
ci: 修改 ci 的配置檔
chore: 無關 `src`, `test` 路徑內的檔案修改
revert: 恢復某個提交
build: 改變打包流程
```

#### **Scope 範圍**

任何可以劃分程式碼改變的範圍，例如：page, router, compile, component ... 等等。

#### **Subject 主題**

對程式碼的修改做簡單的敘述

#### **body 內文**

敘述這次程式碼變更的動機，並說明這個提交與改變前的對比。

若不知道怎麼寫，可以參考這三個問題：

1. 為什麼這個提交是必要的？
 告訴審核 pull request 的人你的提交會帶來什麼改變，使他可以更簡單的辨認是否為不相干的提交。
2. 它如何解決問題？
3. 這個提交對專案有什麼副作用？
   這個是很重要的，他可以有效地幫助你辨認，這個提交是否做太多改變了，如果一兩個副作用還可以接受，但如果是五、六個以上，就代表你做了太多了改變。

#### **Footer 結尾**

結尾通常會有兩種：

1. 標註 Breaking Change
   超級大更新，通常需要以 `BREAKING CHANGE:` 為開頭，或是在 header 前面加上 `!`，如 `!feat(UI Library): 提供全新的 UI Library`。
2. 指出修正了什麼 issue，並關閉 issue，或是關閉了哪則 Pull Request。

另外可以到 GitHub 上看一些關注度較高的開源專案的提交訊息，例如：[Linux 的 commit](https://github.com/torvalds/linux/commits/master)，基本上都是長篇大論的，或是 [Facebook/react](https://github.com/facebook/react/commits/main)。

### **使用工具建立團隊 commit 規範**

- 使用 [commitlint](https://github.com/conventional-changelog/commitlint) 檢查 comit message
- 搭配 [husky](https://github.com/typicode/husky)
  - 在 pre-commit 階段 lint 程式碼，搭配 eslint（可自由搭配不同 lint 工具）。
  - 在建立 commit message 前就自動執行 commitlint
- 使用 [standard version](https://github.com/conventional-changelog/standard-version) 來同時更新版本號和產生 CHANGELOG 檔

這邊會使用 commitlint 官方推薦的規範，或是可以根據[官方文件](https://commitlint.js.org/#/reference-configuration?id=configuration) 建立自己的一套規範。

- @commitlint/cli 是用來執行 commitlint 的工具
- @commitlint/config-conventional 是根據 [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) 所建立的規範，詳細規則可以看這份 [source code](https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/index.js)。

根據官方建議的安裝步驟：

```shell
npm install -D @commitlint/{cli,config-conventional}

// 建立 commitlint.config.js 檔案，並繼承 node_modules 內的 @commitlint/config/config-conventional/index.js 設定檔
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

可以自己簡單測試一下：

```shell
echo 123 | npm exec commitlint
```

若是不符合規範，就會顯示錯誤訊息：

![git](https://i.imgur.com/fIKfxA5.png)

補充：[npm exec](https://docs.npmjs.com/cli/v7/commands/npm-exec) 是 npm v7 推出的功能，可以執行本地依賴或遠端 npm packages 庫內的指令，當執行本地依賴沒有安裝的庫時，會問你要不要安裝，類似 npx，若本來沒有安裝，執行後會自動刪除。

### **搭配 husky**

建立 husky 是一款類似於捕捉 git 生命週期的一個工具，使我們可以 git 的每個階段都可以設定一段指令執行。

因此，我們用來在「提交訊息」的時候，使用 commit lint 檢查訊息是否有符合 conventional commit。

安裝

```shell
npm install husky -D
```

接著執行 husky 的初始化

```shell
npm exec husky install

# husky - Git hooks installed
```

執行完後會出現 .husky 資料夾

![git](https://i.imgur.com/D0tJeVW.png)

接著新增 hook

```shell
npm exec -- husky add .husky/commit-msg 'npm test'                              
```

執行後會產生 `.husky/commit-msg` 的檔案：

![git](https://i.imgur.com/ky3xB8t.png)

藉著我們要把 `commit-msg` 階段要執行的指令 `npm test` 更換成 `npm exec --no -- commitlint --edit "\${1}"`

意思是抓取從 git commit 最後一個提交訊息，用 commitlint  檢查

![git](https://i.imgur.com/iXXtGjN.png)

--edit 意思是會從某個指定檔案讀取最後一個 commit message ，或是到 ./.git/COMMIT_EDITMSG 裡面讀取

![git](https://i.imgur.com/sRfxw6J.png)

接著來隨便 commit 看看，出現錯誤就代表成功啦，因為需要提交符合規範的訊息。

![git](https://i.imgur.com/34fXcAf.png)

## 在提交前執行**eslint**

在協作開發的情況下，我們會使用 eslint 來統一 coding style，所以就會希望每個節點都是符合 codeing style。因此我們可以搭配 husky 的 `pre-commit` hook 來檢查。

建立 pre-commit hook

```shell
npm exec -- husky add .husky/pre-commit 'npm test'                              
```

用 eslint 檢查 js, vue 檔案，並指定要忽略 `.gitignore` 內的檔案。

```shell
#!/usr/bin/env sh

. "$(dirname -- "$0")/_/husky.sh"

eslint --ext \".js,.vue\" --ignore-path .gitignore .",
```

但光是這樣還不夠，現在這樣只要做提交，eslint 就會去會檢查所有的檔案，若專案檔案一大，每次都要跑很久。

所以我們只需要檢查 git 有偵測到變更的檔案就好了。

修改為：

```shell
#!/usr/bin/env sh

. "$(dirname -- "$0")/_/husky.sh"

npm run eslint $(git diff --diff-filter=ACM --name-only HEAD | grep -E '\.(js|vue)$') --ignore-path .gitignore .eslintignore
```

- git diff --name-only HEAD :列出與目前分支有變更的檔案名稱
- -diff-filter=ACM 過濾出 Add, Copy, Modified 檔案，排除 Delete
- grep -E '\.(js|vue)$' 過濾出 js 檔 & vue 檔
- 忽略 ignore-path 指定「忽略文件」的位置

### **[Standard Version](https://github.com/conventional-changelog/standard-version) 更新版本號、產生 change log**

![git](https://i.imgur.com/eiqp54i.png)

standard 是一套幫你自動化產生 changelog 跟更新版本號的工具，簡單來說會分為以下步驟：

1. 抓取上一個版本之前的 fix, feat 類型的提交訊息
2. 貼入 `CHANGELOG.md` 檔案中
3. 更新 package.json 的版本
4. 自動 commit

安裝

```shell
npm install -D standard-version
```

package.json
``

```javascript
"scripts": {
 "release": "standard-version"
},
```

執行 `npm run release` 就會發現它自動幫你產生了 `CHANGELOG.md` 檔案（上圖），並把你提交內 type 為 feat & fix 的變更抓進來，換句話說 refactor, build, chore 都不會被抓進來，這用來發布更新文件，真的非常方便！

另外看 git 的線圖，也可以看到他幫我自動做了提交，也把 package.json 的 `version` 更新為新版號。

![git](https://i.imgur.com/52BjeZr.png)

## **結語**

上面我們透過工具 commit + husky + lint library + standard version，可以建立完整的提交流程：
阻擋不符合規範的提交，並透過 pre-commit hook 檢查 coding style，最後再自動戶產生 changelog 與更新版本號。

具有語意化的提交訊息，與詳細的描述，對我而言目前只有優點沒有缺點，但並不是要我們每個提交都需要長篇大論，可以根據狀況做調整，最適合你的方式就是最好的。

另外也有 [Commitizen/cz-cli](https://github.com/commitizen/cz-cli) 自動化提交工具，在你提交的時候問你一些問題，有些是選擇題，互動的方式，幫你自動產生提交，你只要回答他問你的問題就夠了；也可以參考 [Git Emoji](https://gitmoji.dev/)，設定屬於自己的 Emoji 提交，非常有趣，有興趣可以上去看看。

最後，我想就算是自己一個人的專案，設定可讀性高的提交，未來在回顧 git 紀錄的時候，也是一個提高檢視效率的方法，所以開始讓提交的可讀性變高吧，Why not ?

### **參考文章**

- [知乎 - 如何写好 Git commit log?](https://www.zhihu.com/question/21209619)
- [优雅的提交你的 Git Commit Message](https://juejin.cn/post/6844903606815064077)
- [5 Useful Tips For A Better Commit Message](https://thoughtbot.com/blog/5-useful-tips-for-a-better-commit-message)
- [pjchender - 透過工具建立有規範的 git commit message 吧](https://pjchender.blogspot.com/2021/07/git-commit-message.html)
