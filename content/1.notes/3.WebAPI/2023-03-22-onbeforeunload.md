---
date: 2023-03-22 22:37:10
title: onbeforeunload 
description: 使用 onbeforeunload 在即將離開當前頁面時，執行事件
categories: [Web API]
---

onbeforeunload 事件在即將離開當前頁面（刷新或關閉）時觸發。

```javascript
window.onbeforeunload = function (e) {
  const dialogText = 'Dialog text here'
  e.returnValue = dialogText
  return dialogText
}
```

該事件可用於彈出對話框，提示使用者是繼續瀏覽頁面還是離開當前頁面。對話框默認的提示信息根據不同的瀏覽器有所不同，標準的信息類似 「確定要離開此頁嗎？」，且該信息不能刪除。

<img src="https://i.imgur.com/wjf32Dp.png" width="50%" style="marginLeft:auto; marginRight:auto;" />

原本可以根據 return 的字串自定義一些提示訊息，與標准信息一起顯示在對話框，但在 [2016 年 4 月 chrome 版本 51]([https://developer.chrome.com/blog/chrome-51-deprecations/#remove-custom-messages-in-onbeforeunload-dialogs](https://developer.chrome.com/blog/chrome-51-deprecations/#remove-custom-messages-in-onbeforeunload-dialogs)) 開始就不能改了，因為官方認為會成為一個有心人士「詐騙」的方法。
