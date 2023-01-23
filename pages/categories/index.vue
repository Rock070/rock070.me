<script setup lang="ts">
import useGetAllPublishedCategoriesPosts from '~/service/useGetAllPublishedCategoriesPosts'
import useArray from '~/composables/useArray'

const { data: articles } = await useGetAllPublishedCategoriesPosts()

const tags = computed(() => articles.value?.map(a => a.category) ?? [])

const { values, toggle } = useArray(tags.value)

const displayTags = computed(() => (
  tags.value.map(t => ({
    label: t,
    active: values.value.includes(t),
  })).filter(t => !!t.label)
))

const displayArticles = computed(() => {
  return articles.value?.filter(article => values.value.includes(article.category))
})
</script>

<template>
  <div class="prose min-w-70vw">
    <h1 class="mb-5 text-left font-extrabold">
      Categories
    </h1>
    <ul class="not-prose inline-flex mb-24 space-x-4">
      <li v-for="t in displayTags" :key="t.label">
        <button type="button" @click="toggle(t.label)">
          <Badge class="badge" :class="{ 'badge--unactive': !t.active }">
            {{ t.label }}
          </Badge>
        </button>
      </li>
    </ul>

    <section class="space-y-24">
      <div v-for="article in displayArticles" :key="article.category">
        <h2 class="relative top--5.5 lg:top--5.5 left--4.5 lg:left--8 m-0 text-3xl lg:text-3xl font-bold">
          {{ article.category }}
        </h2>

        <ul class="not-prose space-y-4 lg:space-y-12 lg:px-3 border-l border-gray-400 dark:border-gray-300">
          <li v-for="item in article.list" :key="item._path" class="group">
            <NuxtLink :to="item._path">
              <strong class="font-bold text-xl opacity-80 group-hover:opacity-90">{{ item.title }}</strong>
              <br>
              <div class="inline-block opacity-50 group-hover:opacity-80">
                <span class="flex justify-start items-center space-x-2 text-xs">
                  <time :datetime="item.date" class="whitespace-nowrap min-w-70px"> {{ item.date_format }} </time>
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
.badge--unactive {
  @apply opacity-70 dark:opacity-100 hover:filter-none hover:opacity-100;
  filter: grayscale(100%);
}
</style>
