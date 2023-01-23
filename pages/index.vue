<template>
  <ContentDoc v-slot="{ doc }">
    <h1>{{ doc.title }}</h1>
    <article>
      <ContentRenderer :value="doc" />
    </article>
  </ContentDoc>
</template>
