<template>
  <ContentDoc v-slot="{ doc }" excerpt :head="false">
    <h1>{{ doc.title }}</h1>
    <article>
      <ContentRenderer :value="doc" />
    </article>
  </ContentDoc>
</template>
