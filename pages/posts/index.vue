<script setup lang="ts">
import { useRoute } from 'vue-router'

import type { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types'

import isValidateDate from '~/utils/isValidaDate'
import group from '~/utils/group'
const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

const dateFormat = (date: string) => {
  const target = new Date(date)
  const ok = isValidateDate(new Date(date))
  return ok ? target.toLocaleDateString('en', options) : ''
}

const contentQuery = queryContent()

const getAllPublishedPosts = () => contentQuery.find().then((res) => {
  const posts = res.filter(item => !item.draft).filter(item => item._path && /^\/posts/.test(item._path))

  return posts as MarkdownParsedContent[]
})

const { data: articles } = useAsyncData(getAllPublishedPosts, {
  default: () => [],
  transform: (res) => {
    if (!res)
      return []

    const groupPost = group(res, current => new Date(current.date).getFullYear() || '')

    const entries = Object.entries(groupPost)

    return entries
      .map(([y, g]) => {
        return {
          year: y,
          list: g.map((i) => {
            return {
              ...i,
              date: dateFormat(i.date),
            }
          }),
        }
      })
  },
})

// const context = computed(() => {
//   let result = null
//   contentQuery.where({ _path: { $eq: route.path } }).find().then((res) => {
//     result = res?.[0]
//     console.log(result)

//     return res
//   })

//   return result
// })
</script>

<template>
  <div class="prose min-w-60vw lg:min-w-70vw">
    <h1 class="mb-15 lg:mb-30 text-left font-extrabold">
      Posts
    </h1>

    <section class="space-y-30">
      <div v-for="article in articles" :key="article.year" class="relative">
        <h2 class="absolute top--9.5 lg:top--16.5 left--5 m-0 text-8xl lg:text-9xl font-bold opacity-15">
          {{ article.year }}
        </h2>

        <ul class="not-prose space-y-4 lg:space-y-12 px-5">
          <li v-for="item in article.list" :key="item._path" class="group">
            <NuxtLink :to="item._path">
              <strong class="font-bold text-xl opacity-80 group-hover:opacity-90">{{ item.title }}</strong>
              <br>
              <div class="inline-block opacity-50 group-hover:opacity-80">
                <span class="flex justify-start items-center space-x-2 text-xs">
                  <time class="whitespace-nowrap min-w-70px"> {{ item.date }} </time>
                  <span>-</span>
                  <span class="whitespace-nowrap">12 min</span>
                  <span>-</span>
                  <span class="text-sm">{{ item.description }}</span>
                </span>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style>

</style>
