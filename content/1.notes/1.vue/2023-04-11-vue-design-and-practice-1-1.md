---
date: 2023-04-10 21:44:06
title: 「Vue 設計與實現」1-1 權衡的藝術
description: 閱讀由 Vue 核心成員霍春陽寫作的 「Vue.js 設計與實現」之讀書心得
categories: [Vue]
---

## 一、命令式編程 V.S 聲明式編程

### 1. 命令式編程 Imperative

**重視過程**，一步一步的命令機器如何處理一件事情，以達到你想要的結果。

**優點**

- 彈性較高，控制力較強
- 較容易做到效能優化

**缺點**

- 使用起來較繁瑣
- 可讀/維護性較低

例如：JQuery 的設計

從**取得 DOM 元素**到**設定文字**到**綁定 click 事件**，一行一行聲明。

```
$('.about') // 取得 class: about 的 DOM
  .text('Hello World') / 設置文字內容
  .on('click', () => { alert('OK') }) // 綁定 click 事件
```

### 2. 聲明式編程 Declarative

**重視結果**，只告訴機器想要的結果，交由機器自行找出最好的方式去執行，在內部 **封裝了過程**。

**優點**

- 使用起來較簡易
- 可讀/維護性較高

**缺點**

- 彈性較低
- 較難做到效能優化

從這個 Vue.js 模板的範例來看，一行的程式碼，主要是告訴 Vue，我要一個 div，內容是 Hello World，要綁定一個 click 事件，內部要怎麼實作，交給 Vue 來處理。

```vue [example.vue]
<template>
  <div @click="() => alert('ok')">
    Hello World
  </div>
</template>
```

### 命令與聲明小範例

例如在從公司回家的路上搭計程車，

**1. 命令式編成的做法（重視過程）：**

  1. 200 公尺後右轉三民路
  2. 直走四個路口
  3. 左轉崇德路
  4. 在崇德路 200 號旁邊的空地停車。

**2. 聲明式編程的做法（重視結果）：**

  在崇德路 200 號旁邊的空地停車。

### Vue 內部封裝是「命令式」，暴露給使用者是「聲明式」

從上面 Vue.js 模板的範例來看，更像是「聲明結果」，一行的程式碼與上面 JQuery 三行相比，就可以明顯看出差異。

Vue.js 幫我們封裝了「過程」，讓我們用「聲明」的方式即可使用，因此我們能推斷內部一定是使用「命令式」的方式封裝。

## 「聲明式」的效能較難優於「命令式」

在理論上，命令式相對聲明式較能寫出效能極致優化的程式碼。

若想要把一個 div 的 Hello World 文字改成 Hello Mike，兩種做法：

**命令式：**

在命令式中的作法，因為明確知道要修改的目標是什麼，可以直接用相關命令去修改文字即可。

```js
document.querySelector('.about').textContent = 'Hello Mike'
```

**聲明式：**

在聲明式中，不一定能做到較高的效能優化，因為是「描述結果」。

::code-group

  ```vue [Before]
  <template>
    <div @click="() => alert('ok')">
      Hello World
    </div>
</template>
  ```

  ```vue [After]
  <template>
    <div @click="() => alert('ok')">
      Hello Mike
    </div>
</template>
  ```

::

## 二、性能消耗的差異

**命令式的性能消耗 = 直接修改的性能消耗**
<br/>
**聲明式的性能消耗 = 找出差異的性能消耗 + 直接修改的性能消耗**

若可以將「找出差異的性能消耗」縮減到 0，就可以與命令式性能相同，但無法超越。

## 三、虛擬 DOM 的效能

::alert{type="success"}
效能比較：
**innerHTML 的性能 < 虛擬 DOM 的性能 < JavaScript 操作 DOM 的性能**
::

我們可以把目前處理 DOM 的方法分為三種：

- **innerHTML  更新**
- **虛擬 DOM 更新**
- **JavaScript 操作 DOM**

之所以把 innerHTML 從 JavaScript 操作 DOM 中特別匡列出來，是因為 innerHTML 較其他 DOM 操作，多了 **「字串解析」的消耗**，要將字串解析成 DOM 結構。

### 1. innerHTML

看下面這串程式碼，因為結構不一定只有一層，可能有很多層，所以需要先將字串解析成 DOM 結構，才能去真的操作 DOM。

且 innerHTML 在面對儘管是一個文字的改變，都會需要銷毀所有的 DOM，再新建所有新的 DOM，當模板很大的時候，會造成非常大的效能損耗。

```js
document.querySelector('.about').innerHTML = `
  <ul>
    <li data-pid="3qvuZhSf">命令式編程（imperative）：詳細描述路徑</li>
    <ul>
      <li data-pid="lov7Pa1n">下個路口左轉</li>
      <li data-pid="pr_M9N_r">下個有紅燈的路口右轉</li>
      <li data-pid="majA9u_t">前進100米</li>
      <li data-pid="6HF00gOj">在下個路口掉頭</li>
      <li data-pid="tmnVGVl5">前進1500米</li>
      <li data-pid="FrL3DfRh">到達王府井大街出租車停車區</li>
    </ul>
    <li data-pid="pmFtuxPA">聲明式編程（Declarative）：只告訴目的地</li>
    <ul>
      <li data-pid="mIbVO9Px">帶我到王府井大街。</li>
    </ul>
  </ul>
`
```

### 2. 虛擬 DOM

透過創建 JS Object 來模擬真實的 DOM 結構，再遞迴的遍歷 Object，透過 Diff 算法，算出要更新的 DOM，依賴 Vue 的內部封裝命令式的指令去操作更改真實的 DOM。

效能較原生操作 DOM 多了一個 diff 的性能消耗，但不需要使用命令式的方式來操作 DOM，可讀性較高。

### 3. 原生 JavaScript 操作 DOM

使用命令式來操作 DOM，效能最高，但寫出來的程式碼可讀性與可維護度較低。

```js
document.querySelector('.about').textContent = 'Hello Mike'
```

### 虛擬 DOM 與 innerHTML 的比較

虛擬 DOM 的優勢在於根據 diff 算法的結果，對於 **必要 DOM 進行更新**，不需全部刪除新建。

|                    | 虛擬 DOM                  | innerHTML                         |
| ------------------ | ------------------------- | --------------------------------- |
| 純 JavaScript 運算 | 創建新的 JS Object + diff 運算 | 解析渲染 HTML 字串                |
| DOM 運算           | 必要的 DOM 更新           | 銷毀所有的舊 DOM + 新建所有新 DOM |
| 性能因素           | 與資料變化量相關          | 與模板大小相關                    |

### innerHTML、虛擬 DOM、原生 JS 的比較

| 性能差       |            | 性能高          |
| ------------ | ---------- | --------------- |
| innerHTML    | 虛擬 DOM   | 原生 JavaScript |
| 心智負擔中等 | 心智負擔小 | 心智負擔高      |
| 性能差       | 性能不錯   | 性能高          |

**虛擬 DOM 的消耗 = Diff 的性能消耗 + 操作必要更新的 DOM 消耗。**

虛擬 DOM 擁有「**維護度與可讀性較高**」、「**相較於 innerHTML 性能較好**」這些優點，若能再透過**不斷優化 Diff 算法**，使 Diff 的性能消耗接近於 0，那就可以逼近「原生 JavaScript」的性能。

## 四、Vue 是一個 runtime & compile time 框架

Vue.js 是一個包含編譯與執行的框架，其中的編譯主要是為了提高開發者體驗，指的是在「**程式碼的編譯階段**」將 SFC 的 template 與 render function 的 HTML 字串解析為 JavaScript 物件，並在 runtime 執行。

為什麼會需要提供這樣的編譯功能，以下用程式碼表達：

**1. 虛擬 DOM Object + Render Function**

最初的 Vue 實現，僅僅是宣告一個虛擬 DOM 物件，與一個渲染函式，然後將虛擬 DOM 傳入渲染函式執行

```ts [vue.ts]
function Render(obj, root) {
  const el = document.createElement(obj.tag)
  if (typeof obj.children === 'string') {
    const text = document.createTextNode(obj.children)
    el.appendChild(text)
  }
  else if (obj.children) {
    // array，遞歸調用 Render，使用 el 作為 root 參數
    obj.children.forEach(child => Render(child, el))
  }

  // 將元素添加到 root
  root.appendChild(el)
}

const obj = {
  tag: 'div',
  children: [
    { tag: 'span', children: 'hello world' }
  ]
}

// 將虛擬 DOM 傳入渲染函式執行
Render(obj, document.body)
```

但使用一陣子之後，就會發現有一個缺點是，**每次都需要自己宣告虛擬 DOM 物件，很麻煩**，使用起來不方便。

::alert{type="info"}
補充：所以在 Vue 當中自己傳 Virtual DOM 進入 Render Function 也是可以渲染的哦！
::

**2. Compile(HTML 字串) + Render Function**

為了解決不方便使用的問題，Vue 容許使用者直接**在模板內寫 HTML 字串**，並封裝 **Compile Function 把字串編譯成虛擬 DOM**，讓開發者只需要寫好 HTML 字串即可方便的使用。

```ts [hello.ts]
// 修改前
const obj = {
  tag: 'div',
  children: [
    { tag: 'span', children: 'hello world' }
  ]
}
```

```vue [hello.vue]
<!-- 修改後 -->
<template>
  <div>
    <span> hello world </span>
  </div>
</template>
```

**把修改後的模板字串在編譯階段丟入 Compiler Function 執行，就會得到虛擬 DOM 的物件**，在 runtime 執行 Render Function。

## 五、結論

- Vue.js 內部封裝命令式（ Imperative）程式碼，但暴露給開發者的是聲明式（Declarative）。
- 虛擬 DOM 的效能不會優於使用原生 JS 操作 DOM。但遇到較大模板更新，而使用 innerHTML 時，虛擬 DOM 可以只更新必要的 DOM，效能較佳。且維護度最高。
- Vue.js 是一個設計為 compile + runtime 的框架，編譯是為了提高開發者體驗，進而封裝了 Compiler 來針對 HTML 字串解析。
