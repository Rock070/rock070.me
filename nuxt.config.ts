import { defineNuxtConfig } from 'nuxt/config'
import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },
  extends: ['@nuxt-themes/docus'],
  modules: ['@unocss/nuxt'],

  runtimeConfig: {
    // Public keys that are exposed to the client
    public: {
      baseUrl: process.env.BASE_URL,
      algolia: {
        applicationId: process.env.ALGOLIA_APPLICATION_ID,
        apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
        lang: 'zh-Hant-TW',
        langAttribute: 'lang',
        docSearch: {
          indexName: 'rock070',
        },
      },

    },
  },
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
    ignores: [
      'drafts',
    ],
    navigation: {
      fields: ['icon'],
    },
    // https://content.nuxtjs.org/api/configuration
    documentDriven: {
      globals: {
        theme: {
          where: [
            {
              _id: 'content:_theme.yml',
            },
          ],
          without: ['_'],
        },
      },
      // Will use `theme` global to search for a fallback `layout` key.
      layoutFallbacks: ['theme'],
    },

  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-Hant-TW',
      },
      title: 'rock070.me',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
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
          content: process.env.BASE_URL && `${process.env.BASE_URL}/og-images/og-Rock070.png`,
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
          content: 'summary_large_image',
        },
        {
          name: 'twitter:image',
          content: process.env.BASE_URL && `${process.env.BASE_URL}/og-images/og-Rock070.png`,
        },
        {
          name: 'twitter:site',
          content: process.env.BASE_URL,
        },
        {
          name: 'twitter:creator',
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
