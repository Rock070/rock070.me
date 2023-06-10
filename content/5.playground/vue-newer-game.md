---
date: 2023-03-21 11:37:30
title: Vue.js 常犯的幾個錯誤
description: 整理 Vue.js 常犯的幾個錯誤
categories: [Vue]
layout: playground
---

### 第一關

資料壞掉了，畫面上的 「Hellow World」應該要顯示人名「Rachel Howell」，請幫忙修正

<iframe
  title="vue-entry-mistake-1" height="600" style="width: 100%;"
  allowtransparency="true"  
  allowfullscreen="true"
  frameborder="no" loading="lazy" scrolling="no"
  src="
https://sfc.vuejs.org/#eNqVU8GK2zAQ/ZVZsRAHEovtMXUCpRR6KfTWi6DrOuPYW1tSR3J6MP73zsiJm6awsBdLmnkzI733PKoP3ufnAdVOFaGi1kcIGAcPXWlPe6NiMOpgbNt7RxFGIKxhgppcDysuWy2pj673l3iu5SBdOW1s5WyIYMseYS/12eozdp2Db46648NqLZgaY9VkqyZGH3ZaE/4iDHlrdelbPQSkoJ/eCRQgjw3ajNOwP8AoEYC2huxBKtzPNcSG3G/4RORIYPlLcDZbp1rg+XEgy8s1/l7i003nbIRjGUuO3QyY3zBC3VKI3+Utu3m/YaKWiGyZnX1qkBrP1ZLNz2U3CAPPj2OqnOBxlILpWQhY7lCVwgQS3U13HeadO0lGGIszXEoLPQvHMvEhYu+7MiKfoEii7GQ8SymLUaA5U+gbmLFqo2YVt33pEy9shzTbXBLsgt31NkaxsnI26qpXqCuR+4UFoJPmXU6DjS2/GkO//cF6sITc2KjNTQ/NwTPSltAekZBe63kH/a9vYtDYiZ9yNd8bLL0BZ784vjIe79wtFLccp7qsEL6S82HmYVY8RGrtiefOyNkmPqHYBVi3FlNNkb6H7CLajOsxhPK0/BXJ3sYuN8myvw68QBcTpRF5UtSKE15zARTN02Ecl3HTVGiO/OMCNf0BPLtgmw==">
  Power By sfc.vuejs.org
</iframe>

（onMounted 的時候寫入非同步資料）

### 第二關

（在 setup 的第一層以外的地方，使用含有生命週期的 「use」函式，失效的案例）

### 第三關

（v-for 的 key 使用 index 導致 Virtual DOM 比對時錯誤，導致畫面壞掉）

### 第四關

（在 computed 裡面使用非響應式物件）

### 第五關

（解構 reactive 物件（失去響應））

### 第六關

（直接修改 props）

### 第七關

（在 computed 裡面使用 computed）

### 第八關

（覆蓋 reactive 物件（失去響應））

### 第九關

（DOM 尚未渲染前調用，結果不如預期）
