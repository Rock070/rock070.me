---
date: 2023-08-24 00:13:26
title: 訂閱發佈者模式
description: 訂閱發佈者模式
categories: [設計模式]
---

::Association
關聯：[[設計模式]]、[[行為模式]]
::

訂閱者模式（Publish-Subscribe Pattern）是一種軟體設計模式，也是觀察者模式的一個變體。在訂閱者模式中，一個主題（或稱為「發佈者」）將訊息發佈給多個訂閱者（或稱為「訂閱者」），而訂閱者可以選擇訂閱自己感興趣的主題，並在主題的狀態發生變化時接收通知。

## 生活中的範例

讓我們來想像一下郵件系統，你可以作為訂閱者訂閱某個網站的通知，郵件系統在其中充當發佈訂閱中心的角色，而發佈者則是你訂閱的網站。

整個鏈路是從你的訂閱開始，雖然在你訂閱之前，別人可能已經訂閱過某些網站並不斷接收來自網站更新所發出的消息。你的訂閱動作是在某個你想訂閱的網站填入自己的郵箱，如果這一步以郵件系統為中心，那麼則是在的郵箱內記錄這個網站信息，後續當網站有內容更新時，郵件系統會及時接收到並向你發送郵件，以達到通知你這個訂閱者的目的。

## 觀察者模式與訂閱發佈者模式的差異

實現兩者所需的角色數量有著明顯的區別。

- 觀察者模式：只需要 2 個角色便可成型，即觀察者和被觀察者，其中被觀察者是重點。
- 發佈訂閱者模式：需要至少 3 個角色來組成，包括發佈者、訂閱者和發佈訂閱中心，其中發佈訂閱中心是重點。

| 觀察者模式     | 發佈訂閱模式       |
| -------------- | ------------------ |
| 2個角色        | 3個角色            |
| 重點是被觀察者 | 重點是發佈訂閱中心 |

與觀察者模式相比，發佈訂閱核心基於一個中心來建立整個體系。其中發佈者和訂閱者不直接進行通信，而是發佈者將要發佈的消息交由中心管理，訂閱者也是根據自己的情況，按需訂閱中心中的消息。

![](https://i.imgur.com/2p9einh.png)

### 1. 降級為觀察者模式

這裡說的是以郵件系統為中心，假如以網站為中心，那麼你對於網站就相當於一個觀察者，你希望觀察網站的一舉一動，即網站內容的更新。那麼訂閱動作本身便成了你讓網站將你的郵箱加入網站維護的觀察者列表。這樣當網站有內容更新後，便會通知所有觀察者，也就是訂閱者，這時發佈訂閱模型則退化成了觀察者模式。

### 2. 升級為發佈訂閱

可以看出，此時網站和用戶間其實是有耦合的，也就是網站除了要維護自身功能外，還需要維護訂閱者列表，並且在內容更新後完成通知工作。這樣在用戶和網站之間有一部分關係是維護在網站內部的。如果網站想把這部分任務抽離出來，自然便恢復至發佈訂閱模型，即建立單獨的消息中心來管理髮布者和訂閱者之間的關係以及接收變化和通知消息的工作。

經過這樣的對比，我們可以知道為什麼要區分觀察者模式和發佈訂閱，以及它們之間的差別。

### 3. 與觀察者模式的關聯

但是發佈訂閱真的和觀察者模式是割裂開來的嗎？並不是。其實發佈訂閱的實現內部利用了觀察者模式，讓我們回顧一下觀察者模式的核心，觀察者模式由觀察者和被觀察者組成，其中被觀察者是重點。二者的關聯可以是在創建被觀察者後，調用其添加觀察者方法主動建立和某個觀察者的關係，或是在創建觀察者時即聲明要觀察的對象，即被觀察者。其中觀察者和被觀察者一般為一對多關係，即一個被觀察者可以被多個觀察者觀察。

那麼分析發佈訂閱模型即可發現，其中訂閱者和發佈訂閱中心的關係類似觀察者和被觀察者的關係。注意只是類似，因為雖然其中訂閱者和觀察者都是消費的一方，期待能夠即時接收到其他方的變化。

但區別在於**觀察者模式中的被觀察者需要在每次自身改變後都綁定式地觸發對觀察者的通知**，因為這是觀察者模式這一模式所要實現的核心，也就是類似事件處理系統的機制，**被觀察者有義務針對自身的變化給出響應式的反饋到觀察者們**，這就是為什麼說**觀察者模式是松耦合**的，因為被觀察者的功能不純粹，要包含一部分觀察者和自身關係的邏輯。

而發佈訂閱與之的區別在於，因為發佈者把消息通知的權限交由發佈訂閱中心管理，**發佈者只需關心自身的發佈邏輯，而不會直接和其所發佈內容的訂閱者直接通信**。訂閱者也如此，其只關心向發佈訂閱中心註冊自己想要接收通知的欄目，並實現自己在接收到通知後的邏輯，而無需關心消息來自何方，發佈者是誰。因此**發佈者和訂閱者由於發佈訂閱中心的出現而完全解耦**。

由於發佈訂閱中心這一中間層的出現，對於生產方和消費方的通信管理變得更加的**可管理**和**可拓展**。比如這樣同樣可以實現通過觀察者模式實現的事件機制，即消息中心在接收到新的消息發佈後即時通知到該類目下的所有訂閱者，只不過此時的發佈者與消息中心的關係為一對一，並且消息中心與訂閱者為一對多，消息中心只相當於發佈者的一層代理。

![](https://i.imgur.com/EWJH3pC.png)

## 實現程式碼

發佈訂閱中心

```js

class PubSub {
  constructor() {
    this.messages = {};
    this.listeners = {};
  }
  publish(type, content) {
    const existContent = this.messages[type];
    if (!existContent) {
      this.messages[type] = [];
    }
    this.messages[type].push(content);
  }
  subscribe(type, cb) {
    const existListener = this.listeners[type];
    if (!existListener) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(cb);
  }
  notify(type) {
    const messages = this.messages[type];
    const subscribers = this.listeners[type] || [];
    subscribers.forEach((cb) => cb(messages));
  }
}
```

發佈者

```js

class Publisher {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  publish(type, content) {
    this.context.publish(type, content);
  }
}
```

訂閱者

```js
class Subscriber {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  subscribe(type, cb) {
    this.context.subscribe(type, cb);
  }
}
```

使用

```js
const TYPE_A = 'music';
const TYPE_B = 'movie';
const TYPE_C = 'novel';

const pubsub = new PubSub();

const publisherA = new Publisher('publisherA', pubsub);
publisherA.publish(TYPE_A, 'we are young');
publisherA.publish(TYPE_B, 'the silicon valley');
const publisherB = new Publisher('publisherB', pubsub);
publisherB.publish(TYPE_A, 'stronger');
const publisherC = new Publisher('publisherC', pubsub);
publisherC.publish(TYPE_B, 'imitation game');

const subscriberA = new Subscriber('subscriberA', pubsub);
subscriberA.subscribe(TYPE_A, (res) => {
console.log('subscriberA received', res);
});
const subscriberB = new Subscriber('subscriberB', pubsub);
subscriberB.subscribe(TYPE_C, (res) => {
console.log('subscriberB received', res);
});
const subscriberC = new Subscriber('subscriberC', pubsub);
subscriberC.subscribe(TYPE_B, (res) => {
console.log('subscriberC received', res);
});

pubsub.notify(TYPE_A);
pubsub.notify(TYPE_B);
pubsub.notify(TYPE_C);
```

以上發佈訂閱中心、發佈者和訂閱者三者有各自的實現，其中發佈者和訂閱者實現比較簡單，只需完成各自發佈、訂閱的任務即可。其中訂閱者可以在接收到消息後做後續處理。重點在於二者需要確保在與同一個發佈訂閱中心進行關聯，否則兩者之間的通信無從關聯。
發佈者的發佈動作和訂閱者的訂閱動作相互獨立，無需關注對方，消息派發由發佈訂閱中心負責。

## 實際應用

在實際應用中，對於以上二者的實現可能會更加的複雜，同時也會根據各自的場景進行變形，所以大可不必拘泥於二者的標準實現。因為不論是設計模式還是技術模型大多都只是前人根據經驗總結而成的編程思想，知道它們可能會對某些複雜問題的解決有啟發性的幫助，進而藉助這類思想巧妙地解決特定場景的問題。

- Node.js中自帶的 [EventEmiter](https://nodejs.dev/en/learn/the-nodejs-event-emitter/) 模組
- Vue.js 中數據響應式的實現（副作用桶、track、trigger）

其他比如你在代碼中發現有 watch、watcher、observe、observer、listen、listener、dispatch、trigger、emit、on、event、eventbus、EventEmitter 這類單詞出現的地方，很有可能是在使用觀察者模式或發佈訂閱的思想。等下次你發現有這些詞的時候，不妨點進它的源碼實現看看其他 coder 在實現觀察者模式或發佈訂閱時有哪些巧妙的細節。

## 優點

**時間的解耦**

訊息傳遞，可以是 同步 (synchronous) 或 非同步/異步 (asynchronous)，也可以說是等待 (blocking) 或 非等待 (non-blocking)。

快遞送貨到某處，結果對方家裏沒人，若快遞在門口一直等待，就會影響到其他貨的運送。

意思是，發佈訊息時，訂閱者 (Subscriber) 不一定會在線上，因此大部分 Pub/Sub 透過非同步(async) 的方式，使訊息的傳遞不需等待回應、不依賴對方為等待接收 (blocking receive) 的狀態，透過 先存再送 (store-and-forward) 的機制，確保訊息將可靠地送達。換句話說，一旦訊息送出之後，  程式不會停止下來等待回應，而是繼續進行後續的操作，實現了時間的解偶。

## 缺點

1. 如果一個發佈者有很多的直接和間接的訂閱者的話，將所有的訂閱者都通知到會花費很多時間。
2. 如果在訂閱者和發佈者之間有循環依賴的話，發佈者會觸發它們之間進行循環調用，可能導致系統崩潰。
3. 訂閱發佈模式沒有相應的機制讓訂閱者知道發佈者是怎麼發生變化的，而僅僅只是知道觀察目標發生了變化。

## 參考文章

- [觀察者模式 - 菜鳥教程](https://www.runoob.com/design-pattern/observer-pattern.html)
- [理解【观察者模式】和【发布订阅】的区别](https://juejin.cn/post/6978728619782701087)
- [观察者模式 - 22 種設計模式](https://refactoringguru.cn/design-patterns/observer)
