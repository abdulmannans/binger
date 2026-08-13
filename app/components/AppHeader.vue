<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()

const links = [
  { to: '/', label: 'Discover' },
  { to: '/lists', label: 'Lists' },
  { to: '/universes', label: 'Universes' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/80 bg-ink/80 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <NuxtLink to="/" class="flex items-baseline gap-2">
        <span class="font-display text-3xl leading-none text-gold">BingeWatcher</span>
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-3 py-1.5 text-mist transition hover:bg-panel hover:text-paper"
          :class="route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)) ? 'bg-panel text-paper' : ''"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3 text-sm">
        <span class="hidden text-mist sm:inline">{{ user?.displayName }}</span>
        <button
          type="button"
          class="rounded-full border border-line px-3 py-1.5 text-mist transition hover:border-gold hover:text-gold"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
