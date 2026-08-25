<script setup lang="ts">
defineProps<{
  title: string
  body?: string
}>()
</script>

<template>
  <div class="border-y border-line px-2 py-14 text-center sm:px-6">
    <p class="font-display text-2xl font-medium tracking-tight text-ink">{{ title }}</p>
    <p v-if="body" class="mx-auto mt-2 max-w-md text-sm text-mist">{{ body }}</p>
    <div class="mt-6">
      <slot />
    </div>
  </div>
</template>
