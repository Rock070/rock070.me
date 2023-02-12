---
title: CSS 設計模式研究筆記
description: 關於 CSS 歷史進展：OOCSS, SMACSS, BEM, CSS In JS, Atomic CSS 的研究
date: 2021/10/07 01:00:11
categories: CSS

---

CSS 是一個好理解但不好使用跟維護的語言，所以衍生出非常多的理論跟方法，目的是為了提高程式碼在開發時的可讀性、維護性、模組化、效率 ...等等

良好的 CSS 架構

1. 預測 Predictable
3. 複用 Reusable：樣式可以重複使用的，避免重複性高
5. 維護 Maintainable：可讀性高，後續調整或加東西，不需要大幅調整架構
6. 延展 Scalable：後續加東西，不需要大幅調整架構

## 一、物件導向 CSS：OOCSS By Nicole Sullivan

### 兩大原則

* ### Sperate Structure & Skin - 分離結構與顏色

即將顏色樣式與大小樣式分離，針對元素中的顏色的樣式單獨抽出做分離，避免重複性高的 CSS。

```css
.box-1 {
  width: 200px;  
  height: 200px;
  background-color: yellow;
  border: 1px solid black;
  box-shadow: rgba(0, 0, 0, 0.5) 2px 0px 2px;
}

.box-2 {
  width: 320px;
  height: 400px;
  overflow: hidden;
  background-color: yellow;
  border: 1px solid black;
  box-shadow: rgba(0, 0, 0, 0.5) 2px 0px 2px;
};

.button {
  width: 120px;
  height: 48px;
  background-color: yellow;
  border: 1px solid black;
  box-shadow: rgba(0, 0, 0, 0.5) 2px 0px 2px;
}
```

```css
.box-1 {
  width: 200px; 
  height: 200px;
}

.box-2 {
  width: 320px;
  height: 400px;
  overflow: hidden;
 
};

.button {
  width: 120px;
  height: 48px;
}

.skin {
  background-color: yellow;
  border: 1px solid black;
  box-shadow: rgba(0, 0, 0, 0.5) 2px 0px 2px;
}
```

* ### Sperate Container & Content - 容器與內容分離

分離 html 與 css，盡量將可共用的 class 單獨分離出來，這樣好處是若有多處重複的樣式，可使用同一個 class。

範例：box 內有一個標題跟一個內文，標題內有一部分特殊樣式：

```css
.box-1 div {
  color: red;
}

.box-1 p {
  color: black;
}

.box-1 div span {
  color: green;
}
```

```css
.title {
  color: red;
}

.content {
  color: black;
}

.green-text {
  color: green;
}
```

簡單來說：使用 class 寫樣式，每個 class 又有不同用途，如大小、顏色等等

範例：

``<button class="btn btn-primary btn-large"></button>``

btn: 按鈕的基本樣式
btn-primary: 按鈕的顏色
btn-large: 按鈕的大小

透過這樣分離的方式，來讓網頁樣式更便於管理、可讀性高、好維護的效果。

範例：[Bootstrap](https://getbootstrap.com/)。

## 二、SMACSS(Scalable and Modular Architecture for CSS)

[SMACSS](http://smacss.com/) 由 Jonathan Snook 提出

顧名思義就是可擴展與模組化的設計模式。

基本架構：

### 1. Base

包含 reset CSS 與 HTML tag 常用的樣式設定。

你應該有聽過、甚至使用過 reset CSS，
若不知道是什麼的話，我來解釋一下，由於瀏覽器預設會有一些 CSS 樣式（例如：間距），所以為了確保畫面樣式的一致性及達到設計需求，通常我們在 CSS 最前面放上 reset CSS，把一些 padding、margin 給清空。

而 Base 的觀念裡面，除了 reset CSS，前端還要去思考哪些 HTML Tag 會經常用到樣式的設定，並直接在此處就加上 CSS。

```css
# reset css
body, html {
  padding: 0,;
  margin: 0,
}


# html tag 常用設定

input {
  outline: none;
}

a:focus {
  text-decoration: none;
}
```

### 2. Layout

每頁都會出現的元素（主要組件）：header、footer

通常會使用 ID 選擇器，如：

```css
#header, #article, #footer {
  width: 960px;
  height: auto;
}

#article {
  border: solid #CCC;
  border-width: 1px 0 0;
}
```

### 3. Module

兩頁以上會出現的元素（次要組件）：form、navigation item 之類的

避免使用 ID 和元素選擇器，只使用 class，每個組件內可能都會有個別的元素

當元素內只有一個 span 的時候，這樣使用起來是沒有問題的：

```html
<div class="fld">
    <span>Folder Name</span>
</div>

<style>
.fld span {
  padding-left: 20px;
  background: url(icon.png);
}
</style>
```

但當 span 增加並需要另外的樣式時，就可能會需要同時修改 CSS 跟 html 的架構，具有較低的維護性，所以作者推薦這樣的寫法，向元素增加 class，提高了元素樣式的語意，更清楚知道當中的區別

```html
<div class="fld">
  <span class="fld-name">Folder Name</span> 
  <span class="fld-items">(32 items)</span>
  <span class="fld-items">(32 items)</span>
</div>

<style>

.fld {
  padding-left: 20px;
  background: url(icon.png);
}

.fld-name {
  font-size: 24px;
  color: orange;
}

.fld-item {
  font-size: 14px;
  color: green;
}

</style>  
```

### 4. State

元素的狀態

1. 可使用 is 前綴符
2. 使用 JavaScript DOM 事件來為元素加上 class
3. 允許使用 !important，因為作者認為一個元素同時不會存在兩個狀態。

例如點擊下拉選單後，選項欄位要延展出來變成 active 狀態，以下已重點樣式描述，

```css
.options {
  display: none
}
.is-options-active {
  display: block !important
}
```

### 5. Theme

根據不同主題單獨抽離樣式的設計方法，以下範例可以看到，有三個 css 檔案，

`all.css`：主要管理主題間共同的樣式
`theme-morning.css`： 定義 morning 主題的樣式
`theme-night.css`： 定義 night 主題的樣式

此架構可以讓主題可以切開來，按照需求引入主題檔案

morning 主題：引入 `all.css` 與 `theme-morning.css`
night 主題：引入 `all.css` 與 `theme-night.css`

```css
### all.css

.mod {
  border: solid 1px 
}

### theme-morning.css

.mod {
  border-color: white
}

### theme-night.css

.mod {
  border-color: black
}

```

## 三、BEM

Block(區塊)-Element（元素）-Modifier（修飾子）

```html
<ul class="menu">
  <li class="item"></li>
  <li class="item active"></li>
  <li class="item"></li>
</ul>
```

```html
<ul class="menu">
  <li class="menu__item"></li>
  <li class="menu__item menu__item--active"></li>
  <li class="menu__item"></li>
</ul>
```

Element 使用雙底線做分隔，Modifier 使用雙 dash 做分隔。

menu 是區塊，menu__item 是 menu 的元素，active 是 menu__item 的一種狀態。

## 四、CSS in JS

隨著前端框架的出現，前端的開發逐漸 component 化，一個頁面的個別元素可以切分 component

![](https://ithelp.ithome.com.tw/upload/images/20191001/20114645O78QEhrJLG.png)

圖片來源：六角學院

例如在 Vue 中，一個元件一個檔案，將一個元件的樣式、事件、結構都封裝在 .vue 檔中內，這樣的格式可以達到 HTML、CSS、JS 分離的寫法，並非網頁的標準格式，所以還會需要通過 Vue-cli 中的 `vue-loader` 來做編譯，所以這樣的寫法是屬於 CSS in JS 的一種，只是透過 Vue 提供的語法糖變成這樣的架構。

```html
<template>
<div @click="clickHandler"> {{ message }} </div>

</template>

<script>
export default {
  setup () {
    const message = 'Hello Vue'
    const clickHandler = () => { 
      alert('good!!') 
    }
    return {
      message,
      clickHandler
    }
  } 
}
</script>

<style scope>
div {
  color: red;
  font-size: 24px;
}
</style>
```

特別講一下，style 中的 scope 代表 Vue 會對該元件生成一個隨機的屬性（Attribute），透過 CSS Attribute selector 的方式來做到 CSS 的切分，這樣在不同的元件中的 div 樣式就不會互相干擾囉

![](https://i.imgur.com/x21vNi8.png)

### styled-component（CSS in JS Library）

React 社群推出的 [styled-component](https://styled-components.com/)，將 CSS 寫在 component 內，達到 CSS in JS 的作用，可以很直接的接收元件的 props 來控制 CSS，透過這樣的方式可以做到讓 CSS 狀態控制變得更彈性。

```javascript=
const Button = styled.button`
  background: ${props => props.primary ? "palevioletred" : "white"};
  color: ${props => props.primary ? "white" : "palevioletred"};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

render(
  <div>
    <Button>Normal</Button>
    <Button primary>Primary</Button>
  </div>
);
```

**優點：**

* 單一元件的樣式、結構、邏輯，都寫在一個檔案內，比起舊式寫法（HTML、JS、CSS 檔案切開）好管理，若其他專案需要使用，元件也方便單獨切割。
* 維護時不需另外去找對應的樣式檔案。
* html 與 css 命名合在一起，不必去彼此對照。

**缺點：**

* 元件切換主視覺需要重新寫一個 `<ThemeComponent />`，因為若要使用單一元件，樣式差異很大的情況，透過 props 控制會變得很麻煩
* 用字串的方式寫入樣式，少了 CSS 的 auto complete、編輯器提供的顏色
* 要達到共用樣式必須將元件切小，才會有一定的共用度

## 五、原子化樣式（Atomic CSS）

Atomic CSS 由 Thierry Koblentz (Yahoo!)在 2013 年挑戰 [CSS 最佳實踐](https://www.smashingmagazine.com/2013/10/challenging-css-best-practices-atomic-approach/)中首次使用，將樣式的名稱指向每個單獨的 class ，並把名稱縮小化，將結構 html 與樣式 css 結合，當按鈕的樣式需要修改的時候，我們修改的是 HTML 而不是 CSS。

```html
<div class="bw-2x bss p-1x"> 這是原子 CSS 範例 </div>
```

```css
/* 原子 CSS */
/* Atomic CSS */
.bw-2x {
  border-width: 2px;
}
.bss {
  border-style: solid;
}
.sans {
  font-style: sans-serif;
}
.p-1x {
  padding: 10px;
}
/* Not atomic, because the class contains 2 rules */
.p-1x-sans {
  padding: 10px;
  font-style: sans-serif;
}
```

但會衍伸出的問題是，沒有一個命名的約定，若每個專案的命名者不同，那當你加入一個新專案的時候，就必須重新學習該專案的 class 命名方式，例如 A 專案對於 `border-width: 2px` 的命名是 `bw-2`，B 專案的命名是 `b-2`，這樣專案一多起來，使用上就會帶來大大的不便。

後來誕生的 CSS 框架 [tailwindcss](https://tailwindcss.com/docs/utility-first) 提出了一個命名規範，並可以自行擴充樣式。

![圖ㄧ](https://i.imgur.com/oH9feYW.png)

圖片源自 tailwindcss.com

![圖二](https://i.imgur.com/8ZZD8e5.png)

圖片源自 tailwindcss.com

### Tailwindcss 優缺點比較

優點

* 不需要去想 CSS 命名
* CSS 樣式的量通常不會變多，因為很少在撰寫 CSS 檔案了，共用性高
* 修改樣式只需要修改 HTML
* 沒有使用到的 CSS 將會在生產環境編譯時清除，達到輕巧化

缺點

* 需要學習一個既定的命名約定
* HTML 會變得更加龐大

## 六、寫在 JS 中的原子樣式（Atomic CSS in JS ）

*待更新*

推薦文章：[Atomic-css-in-js](https://sebastienlorber.com/atomic-css-in-js)

### 延伸閱讀

[Atomic CSS 優化樣式開發
](https://linyencheng.github.io/2020/05/27/css-atomic-css/?utm_source=link&utm_medium=article&utm_campaign=internal_link)

### 參考來源

[CSS 的模組化方法：OOCSS、SMACSS、BEM、CSS Modules、CSS in JS](https://cythilya.github.io/2018/06/05/css-methodologies/)

[從 Vue 來看 CSS 管理方案的發展](https://kuro.tw/posts/2017/07/26/%E5%BE%9EVue%E4%BE%86%E7%9C%8BCSS%E7%AE%A1%E7%90%86%E6%96%B9%E6%A1%88%E7%9A%84%E7%99%BC%E5%B1%95/)

[SMACSS 教學](https://medium.com/@savemuse/smacss-%E6%95%99%E5%AD%B8-c94e858aa762)

[Sass教學 (30) - SMACSS - State Rules](https://ithelp.ithome.com.tw/articles/10160128)

[Day5. CSS 設計模式(一) - SMACSS
](https://ithelp.ithome.com.tw/articles/10236146)
