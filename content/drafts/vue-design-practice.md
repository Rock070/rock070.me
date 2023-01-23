---
title: Vue.js 設計與實現心得
date: 2022-05-10 23:27:41
categories: Vue
---

### 2.3 框架要做到良好的 Tree Shaking

Tree-Shaking 依賴 ESM 的靜態結構，所以想要實現 Tree-Shaking，就必須是 ESM 結構。

常數可以在建構配置的檔案中設定，在 webpack 中是使用 definePluging 來定義：

```js
new webpack.DefinePlugin({
  __DEV__: JSON.stringify(false),
  PRODUCTION: JSON.stringify(true),
  VERSION: JSON.stringify('5fa3b9'),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
});
```

### 2.4 框架應該輸出怎樣的產物

Vue.js 會為不同環境（生產與開發）輸出不同的包。

例如：
vue.global.js 用於開發環境，且為了可以直接在 HTML 頁面使用 `<script>` 引入就可以直接使用，所以需要輸出 IIFE 的格式，
vue.prod.js 用於生產環境，警告訊息會被視為 Dead Code 並 Tree Shake 掉。
vue.esm-browser.js 輸出 ESM 格式，使用 `<script type="module">` 就可以引入使用
vue.runtime.esm-bundler.js 是給使用者使用 webpack、rollup 打包工具使用的 esm 格式

補充：webpack 與 rollup 中抓取輸出資源的時候，會優先使用 package.json 內定義為 module 的資源，而不是 main 的資源，以下的程式碼就可以看出在使用打包工具的時候，會優先使用 `dist/run.runtime.esm-bundler.js` 的資源。

todo: 兩者差異
<!-- vue.esm-browser.js && vue.runtime.esm-bundler.js 兩者雖然都是 esm 格式，但因為使用方式不同，所以程式碼的寫法會不一樣。一般我們可以透過設置 `__DEV__` 為 true or false，來判斷是否為開發環境。但在提供給打包工具的情境下，是需要把 `__DEV__` 更換成 `process.env.NODE_ENV !== 'production'` 的。 -->

```js
// browser
if (__DEV__) {
  warn(`useCssModule() is not supported in the global build`)
}
```

```js
// bundler
if (process.env.NODE_ENV !== 'production') {
  warn(`useCssModule() is not supported in the global build`)
}
```

```json
main: "index.js",
module: "dist/run.runtime.esm-bundler.js,
```


針對不同的輸出都可以在 rollup 中設定

```js
// rollup.config.js
const config = {
  input: 'input.js',
  output: {
    file: 'output.js',
    format: 'cjs' // 指定模組形式：cjs、esm
  }
}

export default config
```