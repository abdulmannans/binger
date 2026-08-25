<script setup lang="ts">
/**
 * Fixed-width poster shelf. Do not use CSS grid auto-fill alone —
 * some builds were letting children stretch to full content width.
 */
</script>

<template>
  <div
    class="poster-grid"
    style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start"
  >
    <slot />
  </div>
</template>
