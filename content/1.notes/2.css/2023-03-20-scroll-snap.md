---
date: 2023-03-19 04:03:23
title: scroll-snap
description: 使用 CSS scroll-snap 滾輪事件像幻燈片一樣滑順
categories: [[CSS]]
---

**snap** 是指「突然地移動到某個位置」。`scroll-snap` 和 `grid` 以及 `flex` 一樣，`scroll-snap` 也會有一個 `container` 以及裡面的 `child`。

實際效果就像幻燈片一樣，滾動的時候若滾動到元素中間，會自動移動到讓元素跟容器對齊的地方，可以嘗試滾動下面這個範例。

<iframe height="300" style="width: 100%;" scrolling="no" title="scroll-snap-type" src="https://codepen.io/rock070/embed/WNggzZE?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/rock070/pen/WNggzZE">
  scroll-snap-type</a> by Rock070 (<a href="https://codepen.io/rock070">@rock070</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

要達到這樣的效果需要分為「子層」與「父層」，父層有 `scroll-snap-type` 子層要有 `scroll-snap-align` 才會作用。

## 父層樣式

### scroll-snap-type[​](https://pjchender.dev/css/css-scroll-snap/#scroll-snap-type "scroll-snap-type的直接連結")

- `mandatory` 指的是當使用者停止捲動的時候，瀏覽器會自動捲到到一個斷點上。
- `proximity` 則沒這麼嚴格，瀏覽器只有在當捲到接近的地方時，才會自動捲到斷點上。

效果可以在 [scroll-snap-type MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type#try_it) 上看到，也可以選擇軸的方向，如：

```css
scroll-snap-type: x mandatory;
scroll-snap-type: y proximity;
scroll-snap-type: both mandatory;
```

## 子層樣式

### scroll-snap-align

設定在父層中所有可視的子層，要以哪個為準對其父曾容器，開頭、中間、或是結尾。

start： 對齊可視子層元素中開頭的。
center： 對齊可視子層元素中間的。
end： 對齊可視子層元素結尾的。

```css
scroll-snap-align: none;
scroll-snap-align: start;
scroll-snap-align: center;
scroll-snap-align: end;
```

### scroll-snap-stop

在帶有觸摸板的設備上，可以考慮設定這個屬性。嘗試一次滾動瀏覽所有項目，若行經的元素有設定 `scroll-snap-stop: always;` 將會停留在該元素上面，不會一直滑下去；若設定 normal
就會一次滑過去，不會停下。

## 參考文章

[[CSS] scroll-snap PJCHENder](https://pjchender.dev/css/css-scroll-snap/)

[scroll-snap-type - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)
