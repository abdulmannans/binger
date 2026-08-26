<script setup lang="ts">
const { user } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-transparent text-ink">
    <header class="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <NuxtLink to="/" class="font-display text-xl font-semibold tracking-tight text-ink">
          BingeWatcher
        </NuxtLink>
        <div class="flex items-center gap-4 text-sm">
          <template v-if="user">
            <NuxtLink to="/discover" class="text-mist transition hover:text-ink">
              Open library
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-mist transition hover:text-ink">
              Sign in
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-lg bg-ink px-3.5 py-2 font-medium text-panel transition hover:bg-ink-2"
            >
              Get started
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>
    <slot />
  </div>
</template>
