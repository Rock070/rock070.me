<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import type { RouteLocationRaw } from 'vue-router'

import useToggleDarkMode from '~/composables/useToggleDarkMode'

interface Menu {
  type: 'text' | 'icon'
  name: string
  to: 'string' | RouteLocationRaw
  description?: string
  external?: boolean
  icon?: string
}
const {
  iconName,
  isDark,
  toggleDark,
} = useToggleDarkMode()

const menus: Menu[] = [
  {
    name: 'Posts',
    type: 'text',
    to: '/posts',
  },
  {
    name: 'Categories',
    type: 'text',
    to: '/categories',
  },
  {
    name: 'GitHub',
    type: 'icon',
    to: 'https://github.com/Rock070/',
    external: true,
    description: 'Go to my GitHub Profile',
    icon: 'ri:github-line',
  },
  {
    name: 'Twitter',
    type: 'icon',
    to: 'https://twitter.com/Rock070000',
    description: 'Go to my Twitter Profile',
    external: true,
    icon: 'ri:twitter-line',
  },
  {
    name: 'Instagram',
    type: 'icon',
    description: 'Go to my Instagram Profile',
    to: 'https://www.instagram.com/___maochi/',
    external: true,
    icon: 'ri:instagram-line',
  },

]
</script>

<template>
  <header class="flex justify-between">
    <div>
      <nuxt-link to="/" aria-label="Go to Home page">
        <Icon class="w-6 h-6" icon="mdi-light:home" />
      </nuxt-link>
    </div>
    <nav>
      <ul class="basis-60% flex justify-end items-start space-x-4 grow-0">
        <li v-for="menu in menus" :key="menu.name">
          <nuxt-link :to="menu.to" :external="menu.external" :aria-label="menu.description">
            <span v-if="menu.type === 'text'">{{ menu.name }}</span>
            <Icon v-else-if="menu.type === 'icon'" class="w-6 h-6" :icon="menu.icon" />
          </nuxt-link>
        </li>

        <li>
          <button type="button" :aria-label="isDark ? 'Switch to light color theme' : 'Switch to light dark theme'" @click="toggleDark">
            <Icon class="w-6 h-6" :class="isDark ? 'text-white' : 'text-balck'" :icon="iconName" />
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>
