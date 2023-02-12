<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

import useGetAllPublishedPosts from '~/service/useGetAllPublishedPosts'

const breakpoints = useBreakpoints(breakpointsTailwind)

const isMobile = breakpoints.isSmaller('md')

const { data: articles } = await useGetAllPublishedPosts()
</script>

<template>
  <AppHeader />
  <Container>
    <main class="px-5 pt-5 pb-16 lg:px-8 lg:pt-5 lg:pb-20 flex flex-col items-center">
      <div class="prose min-w-70vw">
        <h1 class="mb-15 lg:mb-30 text-left font-extrabold">
          所有文章
        </h1>

        <section class="space-y-30">
          <div v-for="article in articles" :key="article.year" class="relative">
            <h2 class="absolute top--7.5 lg:top--16.5 left--4.5 lg:left--6.5 m-0 text-6xl lg:text-9xl font-bold opacity-15">
              {{ article.year }}
            </h2>

            <ul class="not-prose space-y-4 lg:space-y-12 lg:px-3">
              <li v-for="item in article.list" :key="item._path" class="group">
                <NuxtLink :to="item._path">
                  <strong class="font-bold text-xl opacity-80 group-hover:opacity-90">{{ item.title }}</strong>
                  <br>
                  <ClientOnly>
                    <div v-if="isMobile" class="inline-block opacity-50 group-hover:opacity-80 space-y-1">
                      <div class="flex justify-start items-center space-x-2 text-xs">
                        <time :datetime="item.date" class="whitespace-nowrap min-w-70px"> {{ item.date_format }} </time>
                        <span>-</span>
                        <span class="whitespace-nowrap">{{ item.durations }} min read</span>
                        <span>-</span>
                      </div>
                      <div class="text-sm">
                        {{ item.description }}
                      </div>
                    </div>
                    <div v-else class="inline-block opacity-50 group-hover:opacity-80">
                      <span class="flex justify-start items-center space-x-2 text-xs">
                        <time :datetime="item.date" class="whitespace-nowrap min-w-70px"> {{ item.date_format }} </time>
                        <span>-</span>
                        <span class="whitespace-nowrap">{{ item.durations }} min read</span>
                        <span>-</span>
                        <span class="text-sm">{{ item.description }}</span>
                      </span>
                    </div>
                  </ClientOnly>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  </Container>
  <AppFooter />
</template>
