<template>
  <div>
    <AppHeader />
    <!-- <slot /> -->
    <main
      class="
        w-[80%] mx-auto
        flex flex-col items-center
        min-h-[calc(100vh-var(--header-height)-var(--footer-height))]
      "
    >
      <div class="shrink-0 w-full">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
