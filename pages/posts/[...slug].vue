<script setup lang="ts">
import { useRoute } from 'vue-router'

import useQueryPathGetPublishedPost from '~/service/useQueryPathGetPublishedPost'
const route = useRoute()

const { data: article } = useQueryPathGetPublishedPost(route.path)
</script>

<template>
  <div class="inline-block mb-10">
    <h1 class="font-bold text-4xl">
      {{ article?.title }}
    </h1>
    <span class="flex justify-center items-center space-x-2 text-sm opacity-60">
      <time class="whitespace-nowrap min-w-70px"> {{ article?.date }} </time>
      <span>-</span>
      <span class="whitespace-nowrap">{{ article?.durations }} min read</span>
    </span>
  </div>
  <article v-if="article">
    <ContentRenderer class="prose min-w-80vw lg:min-w-70vw break-all" :value="article" />
  </article>
</template>
