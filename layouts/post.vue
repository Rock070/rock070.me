<script setup lang="ts">
import { breakpointsTailwind, isClient, useBreakpoints } from '@vueuse/core'
import { useContent, useRuntimeConfig } from '#imports'
import getReadingTime from '~/helpers/getReadingTime'

import dateFormatter from '~/utils/dateFormatter'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isPc = breakpoints.isGreaterOrEqual('lg')
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
  <div>
    <AppHeader />
    <div class="grid grid-cols-[20%_60%_20%]">
      <aside>
        <DocsAside class="post__aside custom-scroll" />
      </aside>
      <Container>
        <main class="px-5 pt-5 pb-16 lg:px-8 lg:pt-5 lg:pb-20 items-center">
          <article class="">
            <div class="inline-block mb-6 lg:mb-10">
              <h1 class="font-bold text-2xl lg:text-4xl text-center">
                {{ page?.title }}
              </h1>
              <span class="flex justify-center items-center space-x-2 text-sm opacity-60">
                <time :datetime="page?.date" class="whitespace-nowrap min-w-70px"> {{ date_format }} </time>
                <span>-</span>
                <span class="whitespace-nowrap">{{ durations }} min read</span>
              </span>
              <div class="prose">
                <slot />
              </div>
            </div>
          </article>
        </main>
        <ul role="navigation" class="mb-4">
          <li>
            <DocsPageBottom />
          </li>
          <li>
            <DocsPrevNext />
          </li>
        </ul>
      </Container>
      <aside v-if="!isClient || isPc">
        <DocsToc class="post__doc" />
      </aside>
    </div>
  </div>

  <AppFooter />
</template>

<style>
.post__doc {
  @apply py-10 px-4 w-full;
  @apply sticky top-120px right-0;
  @apply overflow-y-auto
}

.post__doc::before {
  @apply w-px h-[calc(100%-5rem)];
  @apply content-[''];
  @apply px-[0.5px] py-10;
  @apply absolute top-50% left-0;
  @apply -translate-y-1/2;
  @apply bg-dark bg-opacity-20;
  @apply dark:bg-white dark:bg-opacity-50;
}

.post__aside {
  @apply px-3;
  @apply top-[calc(var(--header-height)+2rem)];
  @apply h-[calc(100vh-var(--header-height)-4rem)];
  @apply sticky right-0;
  @apply overflow-y-auto;
}
</style>
