<script setup lang="ts">
import type { WatchStatus } from '#shared/types'

const model = defineModel<WatchStatus | ''>({ default: '' })

const options: { value: WatchStatus, label: string }[] = [
  { value: 'want', label: 'Want to watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-full border px-3 py-1.5 text-sm transition"
      :class="model === option.value
        ? 'border-accent bg-accent/10 text-accent'
        : 'border-line text-mist hover:border-ink/30 hover:text-ink'"
      @click="model = model === option.value ? '' : option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
