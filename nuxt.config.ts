import { defineNuxtConfig } from 'nuxt/config'
import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@unocss/nuxt',
  ],
  ssr: false,
  css: [
    '@unocss/reset/tailwind.css',
    '~/styles/themes.css',
  ],
  vite: {
    plugins: [
      svgLoader(),
    ],
  },
  content: {
  // https://content.nuxtjs.org/api/configuration
    documentDriven: true,
  },
})
