<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import type { RouteLocationRaw } from 'vue-router'

import { onMounted } from 'vue'

interface Menu {
  type: 'text' | 'icon'
  name: string
  to: 'string' | RouteLocationRaw
  external?: boolean
  icon?: string
}

const [isDark, useToggleDark] = useToggle(true)

const toggleDarkClass = (val: boolean) => {
  const root = document.querySelector('html')
  if (!root)
    return
  if (val) {
    root?.classList.add('dark')
    return
  }
  root?.classList.remove('dark')
}

onMounted(() => {
  toggleDarkClass(isDark.value)
})

const onClickButton = () => {
  useToggleDark(!isDark.value)
  toggleDarkClass(isDark.value)
}

const themeModeIcon = computed(() =>
  isDark.value ? 'ri:sun-line' : 'ri:moon-fill',
)

const menus: Menu[] = [
  {
    name: 'Posts',
    type: 'text',
    to: '/posts',
  },
  {
    name: 'GitHub',
    type: 'icon',
    to: 'https://github.com/Rock070/',
    external: true,
    icon: 'ri:github-line',
  },
  {
    name: 'Twitter',
    type: 'icon',
    to: 'https://twitter.com/Rock070000',
    external: true,
    icon: 'ri:twitter-line',
  },
  {
    name: 'Instagram',
    type: 'icon',
    to: 'https://www.instagram.com/___maochi/',
    external: true,
    icon: 'ri:instagram-line',
  },

]
</script>

<template>
  <header class="flex justify-between">
    <div>
      <nuxt-link to="/">
        <Icon class="w-6 h-6" icon="mdi-light:home" />
      </nuxt-link>
    </div>
    <nav>
      <ul class="basis-60% flex justify-end items-center space-x-4 grow-0">
        <li v-for="menu in menus" :key="menu.name">
          <nuxt-link :to="menu.to" :external="menu.external">
            <span v-if="menu.type === 'text'">{{ menu.name }}</span>
            <Icon v-else-if="menu.type === 'icon'" class="w-6 h-6" :icon="menu.icon" />
          </nuxt-link>
        </li>

        <li>
          <button type="button" @click="onClickButton">
            <Icon class="w-6 h-6" :class="isDark ? 'text-white' : 'text-balck'" :icon="themeModeIcon" />
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>
