---
date: 2023-08-24 00:13:26
title: 觀察者模式
description: 觀察者模式
categories: [設計模式]
---

::Association
關聯：[[設計模式]]、[[行為模式]]
::

在軟體工程中，「觀察者模式」（Observer Pattern）是一種行為型設計模式，它用於定義對象之間的一種一對多（一個主題對多個觀察者）的依賴關係，當一個對象的狀態發生變化時，所有依賴於它的對象都會得到通知並自動更新。觀察者模式有時也被稱為「發布-訂閱模式」（Publish-Subscribe Pattern）或「模型-視圖模式」（Model-View Pattern）。

![](https://i.imgur.com/ohgY3bx.png)

## 問題

假如你有兩種類型的對象： ​ 顧客和 商店 。顧客對某個特定品牌的產品非常感興趣 （例如最新型號的 iPhone 手機）， 而該產品很快將會在商店裡出售。

顧客可以每天來商店看看產品是否到貨。但如果商品尚未到貨時， 絕大多數來到商店的顧客都會空手而歸。

![](https://i.imgur.com/uCxnIbT.png)

另一方面， 每次新產品到貨時， 商店可以向所有顧客發送郵件 （可能會被視為垃圾郵件）。這樣， 部分顧客就無需反覆前往商店了， 但也可能會惹惱對新產品沒有興趣的其他顧客。

我們似乎遇到了一個矛盾： 要麼讓顧客浪費時間檢查產品是否到貨， 要麼讓商店浪費資源去通知沒有需求的顧客。

##  解决方案

擁有一些值得關注的狀態的對象通常被稱為「主題」， 它要將自身的狀態改變通知給其他對象。 所有希望關注發布者狀態變化的其他對像被稱為「觀察者」（observer）。

在這個例子中，商店就是一個主題（被觀察者），商店會將有興趣的顧客加入觀察者清單中，當有新產品到貨時，他會向觀察者清單內的顧客（觀察者們），發送通知，顧客們收到通知後，就會執行將對應的行動（搶購或是其他行動）。

## 角色

在觀察者模式中，觀察者模式本身只需要 2 個關鍵角色便可成型，即觀察者和主題（被觀察者），其中主題（被觀察者）是重點：

1. 主題（Subject）：也稱為「被觀察者」，它是一個具有狀態的對象，當它的狀態發生變化時，會通知所有的觀察者。

2. 觀察者（Observer）：觀察者是依賴於主題的對象，它們會訂閱主題，並在主題的狀態發生變化時收到通知，然後根據收到的通知來更新自己的狀態。

詳細具體實現中，包含一些方法與屬性來實現觀察者模式

1. 具體主題（Concrete Subject）：這是主題的具體實現，它維護著一個觀察者列表，並提供方法來註冊、移除和通知觀察者。

2. 具體觀察者（Concrete Observer）：這是觀察者的具體實現，它實現了接收通知並根據主題的狀態進行更新的方法。

## 優缺點

觀察者模式的優點包括：

- 減少對象之間的耦合：主題和觀察者之間的關係是鬆散的，主題不需要知道觀察者的詳細信息，從而降低了對象之間的耦合性。
- 支持一對多的關係：一個主題可以有多個觀察者，並且它們之間的關係是動態的，可以在運行時添加或移除觀察者。
- 增加可擴展性：新增觀察者或主題並不影響現有的程式碼，使系統更具可擴展性。

缺點：

- 訂閱者的通知順序是隨機的。
- 如果一個被觀察者對象有很多的直接和間接的觀察者的話，將所有的觀察者都通知到會花費很多時間。
- 如果在觀察者和觀察目標之間有循環依賴的話，觀察目標會觸發它們之間進行循環調用，可能導致系統崩潰。
- 觀察者模式沒有相應的機制讓觀察者知道所觀察的目標對象是怎麼發生變化的，而僅僅只是知道觀察目標發生了變化。

總之，觀察者模式允許對象之間建立一種彼此依賴的關係，使得當一個對象的狀態變化時，其他相關對象可以自動做出反應，從而實現了鬆散耦合的設計。

## 實作程式碼

```js
// 觀察者類別
class Observer {
  constructor(name) {
    this.name = name;
  }

  update(message) {
    console.log(`${this.name} 收到訊息: ${message}`);
  }
}

// 主題類別
class Subject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(message) {
    this.observers.forEach(observer => observer.update(message));
  }
}

// 建立觀察者
const observer1 = new Observer("觀察者A");
const observer2 = new Observer("觀察者B");

// 建立主題
const subject = new Subject();

// 將觀察者加入主題的觀察者列表
subject.addObserver(observer1);
subject.addObserver(observer2);

// 發送通知給所有觀察者
subject.notify("重要訊息：明天有重要會議！");

// 從主題中移除觀察者
subject.removeObserver(observer2);

// 再次發送通知，只有觀察者A會收到
subject.notify("更新：會議時間改為下週。");
```

在這個範例中，我們建立了一個觀察者模式的實現。`Observer` 類別表示觀察者，具有名稱和 `update` 方法，當接收到通知時會打印訊息。`Subject` 類別表示主題，具有觀察者列表，並有方法用於新增、移除觀察者以及發送通知。

## IntersectionObserver

若有接觸瀏覽器 API 的人，可能會聽說過 `intersectionObserver`，他是一個用來檢測目標元素與 root 元素相交情況的觀察器。

我們可以使用以下的方法來建立一個 intersectionObserver 觀察者，並設定好當交互發生的時候，要執行的 callback，callback 會拿到的第一個參數 entries 是一個物件陣列，物件內有交互情況發生時的上下文。

```js
function callback(entries, observer) {
 entries.forEach((entry) => {
  // update: do something
 })
}

const observer = new IntersectionObserver(callback)
```

型別是陣列是因為一個觀察者可以同時觀察好幾個主題，例如我可以觀察 root 與 `<div class="example_1">example1</div>` 交互的情況，也可以同時觀察 root 與  `<div class="example_2">example2</div>` 交互的情況，如下：

```js
const target1 = document.querySelector('.example_1')
const target2 = document.querySelector('.example_2')

observer.observe(target1)
observer.observe(target2)
```

這個 Web API 就是一個典型的觀察者模式的範例，「與 target1 元素交互」& 「與 target2 元素交互」的這兩個「主題」，被 observer 觀察，當交互發生時，主題發出通知給「觀察者」，並執行觀察者原先設定好的 callback。

### 完整程式碼

```js
function callback(entries, observer) {
 entries.forEach((entry) => {
  // update: do something
 })
}

const observer = new IntersectionObserver(callback)

const target1 = document.querySelector('.example_1')
const target2 = document.querySelector('.example_2')

observer.observe(target1)
observer.observe(target2)
```

## 生活中的情境

現在，讓我們將這個範例套用到生活中的情境：

假設你是一個新聞社的主編，你的編輯團隊是觀察者，他們需要隨時接收最新的新聞通知。當有重要新聞發生時，你將這些新聞通知發送給所有的編輯，他們會根據通知進行相應的編輯工作。有時候，一些編輯可能不再負責某個領域，你可以從觀察者列表中移除他們，以確保只有負責相關領域的編輯會收到通知。

例如，我是一個物理科學家，很多其他領域的學者是觀察者，我則為主題（被觀察者），他們需要隨時接受最新的超導體材料方面的進度。當有顯著的進度發生時，我將這些消息發送給所有的學者，他們會根據消息進行相對應的反應，有時候有些人不再對超導體方面的消息感到興趣，我可以從觀察者列表中移除他們，以確保只有有興趣的學者會收到通知。

![](https://i.imgur.com/BZ3kBmY.png)

如果你觀察了一份雜誌或報紙， 那就不需要再去報攤查詢新出版的刊物了。 出版社 （即應用中的 被觀察者） 會在刊物出版後 （甚至提前） 直接將最新一期寄送至你的郵箱中。

出版社負責維護觀察者列表， 了解觀察者對哪些刊物感興趣。 當訂閱者希望出版社停止寄送新一期的雜誌時， 他們可隨時從該列表中退出。

這個生活中的情境反映了觀察者模式的概念，主題（新聞）和觀察者（編輯）之間建立了一個一對多的依賴關係，並且主題的變化（新聞通知）會影響到所有的觀察者（編輯）。

## 參考文章

- [觀察者模式 - 菜鳥教程](https://www.runoob.com/design-pattern/observer-pattern.html)
- [理解【观察者模式】和【发布订阅】的区别](https://juejin.cn/post/6978728619782701087)
- [观察者模式 - 22 種設計模式](https://refactoringguru.cn/design-patterns/observer)
- [Intersection_Observer_API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)
- [發佈/訂閱模式 vs 觀察者模式 - 技術客](https://notfalse.net/11/pub-sub-pattern)
