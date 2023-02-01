<script setup lang="ts">
import MolHeader from '~~/components/Molecules/MolHeader.vue'
const { page } = useContent()
</script>

<template>
  <NuxtLayout name="basic">
    <div class="text-center mb-10">
      <img :width="345 * 0.5" :height="331 * 0.5" src="/favicon.png" alt="Rock070 Avatar" class="mb-2">
      <h1>{{ page.title }}</h1>
    </div>
    <article>
      <slot />
    </article>
  </NuxtLayout>
</template>
