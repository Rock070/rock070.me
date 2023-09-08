/* eslint-disable no-undef */
/* eslint-disable prefer-rest-params */
import { defineNuxtPlugin, onNuxtReady, useHead } from '#app'

export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    setTimeout(() => {
      useHead({
        script: [{
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-3LSL8R2FN8',
        }],
      })
      window.dataLayer = window.dataLayer || []

      function gtag() {
        dataLayer.push(arguments)
      }

      gtag('js', new Date())
      gtag('config', 'G-3LSL8R2FN8')
    }, 4000)
  })
})
