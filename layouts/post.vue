<script setup lang="ts">
import { useContent, useRuntimeConfig } from '#imports'
import getReadingTime from '~/helpers/getReadingTime'

import dateFormatter from '~/utils/dateFormatter'

const config = useRuntimeConfig()
const { page } = await useContent()

const date_format = computed(() => {
  const date = page.value.date
  return date ? dateFormatter(new Date(date)) : ''
})

const durations = computed(() => {
  const body = page.value.body

  return body ? getReadingTime(body)?.minutes : ''
})

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
</script>

<template>
  <AppHeader />

  <DocsPageLayout>
    <div class="inline-block mb-6 lg:mb-10">
      <h1 class="font-bold text-2xl lg:text-4xl text-center mb-2">
        {{ page?.title }}
      </h1>
      <span class="flex justify-center items-center space-x-2 text-sm opacity-60">
        <time :datetime="page?.date" class="whitespace-nowrap min-w-70px"> {{ date_format }} </time>
        <span>-</span>
        <span class="whitespace-nowrap">{{ durations }} min read</span>
      </span>
      <div>
        <slot />
      </div>
    </div>
  </DocsPageLayout>
  <AppFooter />
</template>
