<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useContent } from '#imports'
import useQueryPathGetPublishedPost from '~/service/useQueryPathGetPublishedPost'
import DocumentDrivenNotFound from '~/components/DocumentDrivenNotFound.vue'

const content = await useContent()

const { page } = content

const SEOMeta = computed(() => {
  return [
    {
      property: 'og:title',
      content: page?.value?.title,
    },
    {
      property: 'og:url',
      content: location.origin + page?.value?._path,
    },
    {
      property: 'og:image',
      content: `og:${location.origin}/${page?.value?.title}.png`,
    },

    {
      property: 'og:description',
      content: page?.value?.description,
    },
    {
      name: 'twitter:description',
      content: page?.value?.description,
    },
    {
      name: 'twitter:title',
      content: page?.value?.title,
    },
    {
      name: 'twitter:image:src',
      content: `og:${location.origin}/${page?.value?.title}.png`,
    },
  ]
})

useHead({
  meta: SEOMeta,
})

useContentHead(page)

const route = useRoute()

const { data: article } = useQueryPathGetPublishedPost(route.path)

const display = computed(() =>
  ({
    ...article.value,
    body: {
      ...article.value?.body,
      children: article.value?.body.children.filter(node => node.tag !== 'h1') ?? [],
    },
  }),
)
</script>

<template>
  <div v-if="article" class="inline-block mb-6 lg:mb-10">
    <h1 class="font-bold text-2xl lg:text-4xl text-center">
      {{ article?.title }}
    </h1>
    <span class="flex justify-center items-center space-x-2 text-sm opacity-60">
      <time :datetime="article.date" class="whitespace-nowrap min-w-70px"> {{ article?.date_format }} </time>
      <span>-</span>
      <span class="whitespace-nowrap">{{ article?.durations }} min read</span>
    </span>
    <article class="prose min-w-80vw lg:min-w-70vw break-all">
      <ContentRenderer :value="display" />
    </article>
  </div>
  <DocumentDrivenNotFound v-else />
</template>
