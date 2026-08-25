<script setup lang="ts">
const model = defineModel<number | null>({ default: null })

const stars = Array.from({ length: 10 }, (_, i) => i + 1)

function pick(value: number) {
  model.value = model.value === value ? null : value
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <button
      v-for="n in stars"
      :key="n"
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition"
      :class="model != null && n <= model ? 'bg-accent text-white' : 'bg-panel-2 text-mist hover:bg-line hover:text-ink'"
      :title="`${n} / 10`"
      @click="pick(n)"
    >
      {{ n }}
    </button>
    <button
      v-if="model != null"
      type="button"
      class="ml-1 text-xs text-mist underline-offset-2 hover:text-ink hover:underline"
      @click="model = null"
    >
      Clear
    </button>
  </div>
</template>
