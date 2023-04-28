---
date: 2023-04-11 21:50:06
title: 「Vue 設計與實現」1-2 框架設計的核心要素
description: 閱讀由 Vue 核心成員霍春陽寫作的 「Vue.js 設計與實現」之讀書心得
categories: [Vue]
---

## 一、框架應該思考的問題

- 打包後的產物
- 產物的模組格式
- 將非預期的用法捕捉，並顯示出警告訊息，提升 DX
- 熱加載的配合
- 每個功能是否能手動決定要不要打開，以此減少打包體積
- 開發環境與生產環境的打包產物，是否有差異

## 二、Vue.js 在 DX 方面的設計

### 1. 更好定位問題的警告信息

針對錯誤用法，印出警告訊息，提供更好的問題定位方向，而不是 JS runtime 噴出的錯誤，提升框架的可靠度。

::code-group
  ```ts [Before]
Uncaught TypeError: cannot read property 'xxx' of null.
  ```
  ```ts [After]
[Vue warn]：Failed to mount app: mount target selector "#not-exist" return null
  ```
::

在底層內會有這種程式碼，主要是在開發時才會 console.warn 出來，`__DEV__` 在打包時期就會被 rollup 編譯，用來判斷現在是否為生產環境的打包，底層使用 `process.env.__DEV__` 來判斷。

```ts
if (__DEV__ && !res) {
  warn(
    `Failed to mount app: mount target selector "${container}" returned null.`)
}
```

### 2. 可讀性更高的打印

為了提供更好的打印，VueJS 可以在 DevTool 中的 console 中開啟 "Enable custom formatters"，提高打印的可讀性，例如：Ref、Reactive、ComputeRef。

底層是使用 `window.devtoolsFormatters` 來實現

::code-group
  ```ts [Before]
RefImpl {_rawValue: 0,_shallow: false, __v_isRef: true, _value: 0}
  ```
  ```ts [After]
Ref<0>
  ```
::

## 三、控制框架的程式碼體積

Vue.js 在打包之後會有兩個產物，一個是開發環境用的，如：vue.global.js，一個是生產環境用的，如： vue.global.prod.js。

看檔案名稱就可以區分出來，那為什麼要這樣做呢？

因為一個良好的框架就應該減少程式碼的體積，但為了提高 DX 時，多了很多 warn 的警告訊息，卻與減少程式碼的原則衝突了。所以在 Vue.js 中的 warning 會有一個 `if (__DEV__)` 的判斷，`__DEV__`就是透過 rollup 的插件 [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace#readme)，在打包的時候靜態分析這段字串，並取代為設定檔內的宣告，如：判斷環境，並將其取代為布林值，若為 `true` 就是在開發環境，`false` 是在生產環境。

```js [rollup.config.js]
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [
    replace({
      __DEV__: process.env.NODE_ENV !== 'production'
    })
  ]
}
```

有了字串取代的功能，來看看下面這個範例：

這是未打包的原始碼

```js [vue.js]
if (__DEV__ && !res) {
  warn(
    `Failed to mount app: mount target selector "${container}" returned null.`)
}
```

打包後開發環境的程式碼

```js [vue.global.js]
if (true && !res) {
  warn(
    `Failed to mount app: mount target selector "${container}" returned null.`)
}
```

打包後生產環境的程式碼

```js [vue.global.js]
if (false && !res) {
  warn(
    `Failed to mount app: mount target selector "${container}" returned null.`)
}
```

在上面可以看到 `__DEV__` 會根據當前環境來編譯為 `true` or `false`，當一個判斷式永遠為 `false` 的時候，打包工具就會認為它是「dead code」，所以自然的 tree shake 掉，不會被裝進打包後的產物。

同樣的功能，在 Vite 中可以用 define 來取代字串（[vite - define](https://cn.vitejs.dev/config/shared-options.html#define)）。

## 四、良好的 Tree-Shaking

使用 es module，用不到的模組就不會打包到產出中。

在靜態分析下可能會判斷當下的程式碼有副作用，所以不會 Tree Shaking 掉，這時可以使用 `/*__PURE__*/` 的註解方式，告訴 rollup.js，該函式不會有副作用，可以放心的 Tree Shaking。

如：

```ts
export const isHTMLTag = /* #__PURE__ */ makeMap(HTML_TAGS)
```

## 五、打包後的多個產物

Vue 打包後，可以看到有非常多產出

![](https://i.imgur.com/W8fnW7p.png)

| 產物                            | 描述                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| vue.cjs.js                      | 遵循 commonjs 規範，使用                                           |
| vue.cjs.prod.js                 | 遵循 commonjs 規範，生產環境使用                                           |
| vue.esm-browser.js              | 遵循 esm 規範， 用於 script 標籤 type="module"，開發環境使用               |
| vue.esm-browser.prod.js         | 遵循 esm 規範，用於 script 標籤 type="module"，生產環境使用                |
| vue.esm-bundler                 | 遵循 esm 規範，開發環境使用                                                |
| vue.global.js                   | iife 立即执行函数，開發環境使用                                            |
| vue.runtime.esm-browser.js      | 遵循 esm 規範， 用於 script 標籤 type="module"，開發環境使用，只包含運行時 |
| vue.runtime.esm-browser.prod.js | 遵循 esm 規範， 用於 script 標籤 type="module"，生產環境使用，只包含運行時 |
| vue.esm-bundler.js              | 遵循 esm 規範，開發環境使用，只包含運行時                                  |
| vue.runtime.global.js           | iife 立即执行函数，開發環境使用，只包含運行時                              |
| vue.esm-bundler.js              | 遵循 esm 規範，開發環境使用，只包含運行時                                  |
| vue.runtime.global.prod.js      | iife 立即执行函数，生產環境使用，只包含運行時                              |

### 1. Vue 是如何區分不同的環境，引入不同的產物？

在 vue 的 index.js 中，有以下程式碼，透過 `process.env.NODE_ENV === 'production'` 來區分使用哪個環境的打包產物。

```js [index.js]
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vue.cjs.prod.js')
}
else {
  module.exports = require('./dist/vue.cjs.js')
}
```

另外，如何區分不同的模組規範？其實一般 package.json中的 main 和 module 来指定的
```json [package.json]
{
  "main": "index.js",
  "module": "dist/vue.runtime.esm-bundler.js" // rollup, webpack 打包工具，會優先使用 module
}
```

### 2. IIFE 立即執行函式

為了供 script 標籤引入可以直接使用，需要輸出一種 IIFE（Immediately Invoked Function Expression）立即執行函式。

使用方式

```html
<body>
 <script src="/path/to/vue.js"></script>
 <script>
  const { createApp } = vue
  // ..
 </script>
```

IIFE 結構

```js [vue.global.js]
const Vue = (function (exports) {
  // ...
  exports.createApp = createApp
  // ...
  return exports
}({}))
```

rollup.js 設定方式

```js [rollup.config.js]
const config = {
  input: 'input.js',
  output: {
    file: 'output.js',
    format: 'iife'
  }
}

export default config
```

### 3. ESM 模組

`<script>` 標籤除了支援 IIFE 之外，也可以直接引入 ESM 格式的資源

`vue.esm-browser.js"`

```html
<script type="module" src="/path/to/vue.esm-browser.js"></script>
```

### 4. 專給打包器使用的產出

把 `-browser` 換成 `-bundler` 的 `vue.runtime.esm-bundler.js` 是專門給打包工具用的，可以在 package.json 中指定為 module，會被打包工具優先使用

差異在於 `__DEV__` 的設定 `-browser` 的在開發環境會把 `__DEV__` 設為 true，生產環境設為 false。

但在 `-bundler` 中，`__DEV__` 會變成 `process.env.NODE_ENV === 'production'`

```json [package.json]
{
  "main": "index.js",
  "module": "dist/vue.runtime.esm-bundler.js" // 打包工具 rollup, webpack 會優先使用 module
}
```

### 5. CommonJS

為了給「伺服器端渲染」，Vue js 必須要可以在 nodejs 中運行，所以需要輸出一個符合 CommonJS 格式的產物

`vue.cjs.js"`

```js [rollup.config.js]
const config = {
  input: 'input.js',
  output: {
    file: 'output.js',
    format: 'cjs'
  }
}

export default config
```

## 六、特性開關

為了提高框架的靈活性與更好的 Tree Shaking，Vue 提供了「開關」的方式可以把某些功能關掉，如在 Vue3 中可以使用 option API 來寫 code，但在 Vue3 中更推薦的寫法是 composition API，所以當我們不需要用 option API，就可以透過開關把它關掉，讓他被 Tree Shaking 掉，減少打包體積。

所以在原始碼中可以看到很多 `__FEATURE_OPTIONS_API__` 字串，就是用來判斷是有打開 option API 的功能，以及是否要 tree shake 掉。

主要是因為這一段的 rollup 設定：

```js [rollup.config.js]
{
  __FEATURE_OPTIONS_API__: isBundlerESMBuild ? '__VUE_OPTIONS_API__' : 'true'
}
```

下面是一個有此判斷的原始碼範例：

```js [component.ts]
// support for 2.x options

if (__FEATURE_OPTIONS_API__ && !(__COMPAT__ && skipOptions)) {
  setCurrentInstance(instance)
  pauseTracking()
  applyOptions(instance)
  resetTracking()
  unsetCurrentInstance()
}
```

在 ES Module 且有 -bundler 字樣的打包產物中，會被編譯為下面這樣：

```js [component.js]
// support for 2.x options

if (__VUE_OPTIONS_API__ && !(__COMPAT__ && skipOptions)) {
  setCurrentInstance(instance)
  pauseTracking()
  applyOptions(instance)
  resetTracking()
  unsetCurrentInstance()
}
```

使用者就可以在打包工具裡面去宣告開關，如：

```js [vite.config.js]
export default {
  define: {
    __VUE_OPTIONS_API__: false // 這一行
  },

  build: {
    rollupOptions: {
      input: ['src/index.ts'],
      output: {
        entryFileNames: '[name].js'
      }
    },
  }
}
```

## 七、錯誤處理

Vue.js 內部封裝了 `callWithErrorHandling` 與 `registerErrorHandler` ，可以在 `main.ts` 中的 `app.config.errorHandler` 宣告統一的錯誤處理函式，並在元件內部引用 `callWithErrorHandling` 來更安全的呼叫函式，並按照設定的錯誤處理流程執行。

```ts
export function callWithErrorHandling(
  fn: Function,
  instance: ComponentInternalInstance | null,
  type: ErrorTypes,
  args?: unknown[]
) {
  let res

  try {
    res = args ? fn(...args) : fn()
  }
  catch (err) {
    handleError(err, instance, type)
  }
  return res
}
```

```ts [main.ts]
import App from 'App.vue'

const app = createApp(App)
app.config.errorHandler = () => {
  // 錯誤處理程式
}
```

```ts
import { callWithErrorHandling } from 'vue'

function test() {
  throw new Error('Error happened')
}

callWithErrorHandling(test)
```

## 八、良好的 TypeScript 型別支持

TypeScript 是由微軟開源的編程語言，簡稱 TS，它是 JavaScript 的超集，能夠為弱型別的 JavaScript 提供類型支持。現在越來越多的開發者和團隊在項目中使用 TS。使用 TS 的好處有很多，如程式碼即文檔、編輯器自動提示、一定程度上能夠避免低級 bug、代碼的可維護性更強等。因此對 TS 類型的支持是否完善也成為評價一個框架的重要指標。

## 參考文章

- [Vue.js 设计与实现阅读笔记（二）第 2 章-框架设计的核心要素](https://juejin.cn/post/7140914670554054670)
