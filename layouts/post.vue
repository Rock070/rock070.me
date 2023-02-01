<script setup lang="ts">
import { useRoute } from 'vue-router'
import MolHeader from '~/components/Molecules/MolHeader.vue'
import { useContent, useRuntimeConfig } from '#imports'
import useQueryPathGetPublishedPost from '~/service/useQueryPathGetPublishedPost'

const content = await useContent()

const config = useRuntimeConfig()

const { page } = content

useSeoMeta({
  // title
  ogTitle: page?.value?.title,
  twitterTitle: page?.value?.title,

  // url
  ogUrl: config.public.baseUrl + page?.value?._path,
  twitterSite: config.public.baseUrl + page?.value?._path,

  // description
  ogDescription: page?.value?.description,
  twitterDescription: page?.value?.description,

  // image
  ogImage: `${config.public.baseUrl}/og-images/og-${encodeURI(page?.value?.title)}.png`,
  twitterImage: `${config.public.baseUrl}/og-images/og-${encodeURI(page?.value?.title)}.png`,
  twitterCard: 'summary_large_image',
})

useContentHead(page)

const route = useRoute()

const { data: article } = await useQueryPathGetPublishedPost(route.path)
</script>

<template>
  <NuxtLayout name="basic">
    <div class="inline-block mb-6 lg:mb-10">
      <h1 class="font-bold text-2xl lg:text-4xl text-center">
        {{ article?.title }}
      </h1>
      <span class="flex justify-center items-center space-x-2 text-sm opacity-60">
        <time :datetime="article?.date" class="whitespace-nowrap min-w-70px"> {{ article?.date_format }} </time>
        <span>-</span>
        <span class="whitespace-nowrap">{{ article?.durations }} min read</span>
      </span>
      <article class="prose min-w-80vw lg:min-w-60vw break-all">
        <slot />
      </article>
    </div>
  </NuxtLayout>
</template>
