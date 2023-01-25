<template>
  <ContentDoc v-slot="{ doc }">
    <div class="text-center mb-10">
      <img :width="345 * 0.5" :height="331 * 0.5" src="~/public/favicon.png" alt="Rock070 Avatar" class="mb-2">
      <h1>{{ doc.title }}</h1>
    </div>
    <article>
      <ContentRenderer :value="doc" />
    </article>
  </ContentDoc>
</template>
