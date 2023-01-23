<script setup lang="ts">
import MolHeader from '~~/components/Molecules/MolHeader.vue'
</script>

<template>
  <div class="min-h-100vh dark:bg-black dark:text-white">
    <MolHeader class="px-4 py-3 lg:p-8" />
    <main class="px-5 pt-5 pb-16 lg:px-8 lg:pt-5 lg:pb-20 flex flex-col items-center">
      <NuxtPage />
    </main>
    <slot />
  </div>
</template>
