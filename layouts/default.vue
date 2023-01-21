<script setup lang="ts">
import MolHeader from '~~/components/Molecules/MolHeader.vue'
</script>

<template>
  <div class="min-h-100vh dark:bg-black dark:text-white">
    <MolHeader class="p-4 lg:p-8" />
    <main class="px-4 py-5 lg:px-7 lg:py-10 flex flex-col items-center">
      <NuxtPage />
    </main>
    <slot />
  </div>
</template>
