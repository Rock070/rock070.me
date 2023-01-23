import { defineNuxtConfig } from 'nuxt/config'
import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
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
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content:
          'Rock070 的部落格網站，分享網頁前端學習心得與生活',
        },
        {
          property: 'og:title',
          content: 'Rock070 的部落格',
        },
        {
          property: 'og:description',
          content:
          'Rock070 的部落格網站，分享網頁前端學習心得與生活',
        },
        {
          property: 'og:url',
          content: process.env.BASE_URL,
        },
        {
          property: 'og:image',
          content: '',
        },
        {
          property: 'og:image:width',
          content: '1200',
        },
        {
          property: 'og:image:height',
          content: '628',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:locale',
          content: 'zh_TW',
        },
        {
          property: 'og:site_name',
          content: 'Rock070 Blog',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:site',
          content: '@Rock070000',
        },
        {
          name: 'twitter:description',
          content:
          'Rock070 的部落格網站，分享網頁前端學習心得與生活',
        },
        {
          name: 'twitter:title',
          content: 'Rock070 的部落格網站',
        },
      ],
    },
  },
})
