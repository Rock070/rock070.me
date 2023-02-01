<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const { meta } = useRoute()

const layoutName = computed(() =>
  meta?.layout || 'default',
)
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
