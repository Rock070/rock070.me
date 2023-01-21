<script setup lang="ts">
import useGetAllPublishedPosts from '~/service/useGetAllPublishedPosts'

const { data: articles } = useGetAllPublishedPosts()

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
                  <span class="whitespace-nowrap">{{ item.durations }} min read</span>
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
