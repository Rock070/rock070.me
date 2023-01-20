<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { onMounted } from 'vue'
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
</script>

<template>
  <main class="min-h-100vh dark:bg-black dark:text-white">
    <button @click="onClickButton">
      {{ isDark ? 'light' : 'dark' }} mode
    </button>
    <ContentDoc />
  </main>
</template>
