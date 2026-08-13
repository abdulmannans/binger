<script setup lang="ts">
defineProps<{
  title: string
  body?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-16 text-center">
    <p class="font-display text-4xl text-gold/80">{{ title }}</p>
    <p v-if="body" class="mx-auto mt-2 max-w-md text-sm text-mist">{{ body }}</p>
    <div class="mt-6">
      <slot />
    </div>
  </div>
</template>
