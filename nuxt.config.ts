import { defineNuxtConfig } from 'nuxt/config'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@unocss/nuxt',
  ],
  ssr: false,
  css: [
    '@unocss/reset/antfu.css',
    '~/styles/themes.css',
  ],
  // content: {
  // https://content.nuxtjs.org/api/configuration
  // }
})
