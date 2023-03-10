---
title: 緯育 Tibame【手把手帶你跑敏捷】如何落實技術實踐心得
description: 學習敏捷開發流程實踐的心得紀錄
date: 2022-06-22 21:15:34
categories: [CI/CD, 敏捷開發]

---

[課程網址](https://hqtraining.tibame.com/course/453/)

## 心得

此課程讓我對敏捷式開發有更深入的了解，不是只停留在敏捷的大原則，而是從開發面切入講解，理論面偏重，個人認為較適合已經有 CI/CD 基本操作經驗者修課。

在現代敏捷式開發架構中，「自動化」變得非常重要，在開發過程中，為了降低產品上線的時間成本，大致上會有以下的流程：

## 一、開發流程

### 1. 使用版本控制 + 自動化持續地整合

```md
持續整合意思是高頻率的把開發中的程式碼合到主線上，並到正式環境上建置，出現問題時可以立即發現並修正。
```

### 2. 自動化測試

   在正式環境建置之後，代表程式碼可以被編譯，但功能使用上還是可能會出現錯誤，所以需要撰寫自動化測試來測試功能，好處多多，可以在將來放心的重構程式碼，達到一樣的功能規格。

### 3. 自動化佈署

```md
相對傳統部署（單一環境、直接覆蓋新版本、出錯回復慢、服務易中斷）藍綠部署 + 金絲雀部署 + 自動化部署，將微服務切成好幾個 server、透過 load-balancer 將使用者分配到不同的群組，使得部署可以逐步進行，先部署到一部分的使用者，若無問題，逐步直至到全部的使用者，若有問題，則會自動 roll back，停止部署，更換舊版本。
```

### 4. 自動化監測

```md
在 CI/CD 的過程中，難免會有錯誤的發生，所以自動化監測可以幫助「即時」處理錯誤，並通知開發人員處理。
```

​

## 二、敏捷開發的好處

- 最低化的使用者體驗影響
- 降低總開發時間
- 降低建置、部署的時間成本
- 允許大膽重構程式碼，提高編譯效率

## 三、敏捷開發的缺點

- 環境較多，需要的主機也較多，導致成本高
- 初期需要花大量時間架構自動化流程

## 筆記

## 一、過度設計(over design)

### 1. 什麼是過度設計(over design)

提供的功能比需求多太多，很多甚至用不到

例子：瑞士刀、手機預設 APP

### 2. 過度設計造成的問題

浪費時間、增加複雜度、降低可維護性、可讀性

### 3. 情境解說

常見情況有「我想這個以後會用得到」。

保持 KISS 原則：Keep It Sample and Stupid

使一般人都可以看得懂

## 二、結隊編程(Pair Programming) – 多一雙手會更快

結隊編程：兩人一起共同寫扣，一人口頭敘述，一人寫 code，從而互相學習，從討論中提高效率

好處：知識傳播、互相監督

## 三、持續整合(CI) - 每個人都伸手來摸你的Code，誰來整合

持續整合，其實就是大家在利用版本控制遠端開發的時候，經常性的將本地端的 code 合併到遠端的 master 內，藉此降低衝突的發生，也可以持續的測試在正式環境是否一切正常。

持續整合的工具 Jankins

- 可以有多種方法可以觸發自動建置，例如：每天早上、每次提交時...等等

透過自動化整合的工具，可以持續交付、建置程式碼到環境上（包含開發、測試、客戶測試、正式），最好的實踐就是每天整合，需要把測試的功能也整合到 CI 的工具上，有發生問題的時候應該設定通知給開發團隊，且應該把修復 CI 作為優先處理。

## 四、自動化測試(Automation Test) - 不做自動化，就等肝硬化

### 1. 單元測試

- 可以在開發早期就發現問題
- 符合 FIRST 原則
  - Fast
  - Independent
  - Repeatable
  - Self-Validating
  - Timely(TDD 概念)
    測試要能快速、獨立而不會互相影響、可以重複執行、並自我驗證，說明哪個測試成功了、即時性的，最好是在寫 code 之前就寫測試

- 3A 原則
  - arrange 目標物件、參數、預期結果
  - act 驗證邏輯
  - assert 驗證結果是否符合預期

### 2. 整合測試（單元合在一起

把多個程式模組合一起進行驗證，例如：資料庫測試、API 接口測試、傳輸協定的驗證。

### 3. E to E 測試（從頭到尾）

以使用者行為進行測試，又屬於「黑箱測試」。

### 測試經常會被工程師以各種理由逃避，例如

1. 開發時間不夠
2. 不會寫測試
3. 維護測試很花時間
4. 跑測試也很花時間

### 測試帶來的好處

1. 可以專心在開發
2. 可以放心大膽重構程式碼，提高質量
3. 遇到 bug 就把測試補上，避免重複的問題
4. 大量降低建置的時間成本

### 測試的進階實踐 TDD (Test-Driven Development) 測試驅動開發

- 測試先寫，再寫 code
- 先釐清需求，列出實例化需求
- TDD 的循環：綠燈、紅燈、重構
- 排列需求逐步增加產品代碼
- 即時重構
- 測試全通過 -> 產品完成

### 自動化測試總結

可以將測試整合在 CI 裡面，通過自動化建置後，進行自動化測試，若產生錯誤，一樣會通知開發人員。

`大量的單元測試` + `適當的整合測試` + `少量的 End-to-End 測試` ＝ `幫助維持開發速度`。

## 五、重構(Refactor) – 改善既有的程式碼

所謂重構，就是在不改變程式碼外在行為（例如：元件結合、API 接口）的情況下，改變內部行為。

### 重構的好處

1. 幫助找到 bug，重構需要提高對程式碼的理解，也可以幫助你更好的找到程式漏洞。
2. 提高編程速度: 有良好的設計添加新功能才更容易、理解度高的程式碼也更好維護。

### 什麼時候該重構

1. 三次法則：功能經常重複使用，達三次以上的時候
2. 添加功能時：
    - 理解架構
    - 調整架構
    - 下次更容易
3. 修補錯誤時：修改掉原本的問題

### 程式碼的壞味道

1. 重複的程式碼：當要修改一個功能的時候，需要去修改很多地方，就代表這個程式碼需要被重構，或打包來重複使用。
2. 過長函式（不容易理解）
3. 過長參數列

重構後的程式碼必須要經過測試（單元測試、整合測試、End to End 測試）

## 六、持續交付(CD) – 系統維護中，請稍候

- Continuous delivery 持續交付
- Continuous deploy 持續部署

符合敏捷原則，在 CI 與自動化測試的輔助下進行。，持續地交付產品給客戶。

### 良好的 CD 流程

### 1. 傳統部署

```md
- 環境單一，直接覆蓋新版本
- 簡單成本低
- 服務會中斷
- 出錯時回覆問題也慢
- 適合用在測試環境上
```

![img](https://i.imgur.com/v6tplPB.png)

### 2. 傳統部署 + feature toggle

```md
 - 環境單一，直接覆蓋新版本
- 簡單成本低
- 服務會中斷
- 切換 toggle 來開放新功能
- 出現問題時把 toggle 切換
```

![img](https://i.imgur.com/Kbna9GM.png)

### 3. 金絲雀部署

```md
以前礦工在挖掘時，不是到礦道內是否有毒，所以利用金絲雀來做測試，因為金絲雀對有毒氣體非常敏感。
- 多個環境，慢慢覆蓋新版本
- 容錯率高，發生問題立刻回覆
- 使用者體驗影響較小
- 若沒自動化流程過程繁瑣
```

![img](https://i.imgur.com/sUulBN0.png)

### 4. 藍綠部署

```md
- 兩個環境群組(線上、現下) ，線下覆蓋新版本再交換
- 需要有 load-balance 環境
- 需要有 state server
- 不影響使用者
- 發生問題，切回舊版本，容錯率低
- 出錯版本對使用者時間短
- 錯誤版本可以線下修改
```

![img](https://i.imgur.com/lNUq7pj.png)
![img](https://i.imgur.com/HmqBMd3.png)

### 5. 藍綠部署 + 金絲雀 + 自動化

```md
- 自動化部署，一段時間後逐漸增量
（切成四個 server，逐一上服務，沒出現錯誤就繼續執行）
- 超高容錯，發生問題就切回舊版
- 使用者影響最小化（四個 server 逐步部署）
- 需要良好的監控服務（例如：重啟 container、有 bug 通知開發人員...等）
```

![img](https://i.imgur.com/6NcZIHo.png)

### 完整的 CI/CD 流程

`正式環境 / UAT 環境`

↑

`版本控制 -> CI 伺服器 -> 自動化測試 -> 發布版本控制 ->`

↑

`開發環境 / PC / Local`

## 課程重點

- 使用 Jenkins 等工具來運行 CI/CD
- 版本控制是必須的
- 自動化建置
- 自動化測試
- 自動化部署
- 自動化監控
