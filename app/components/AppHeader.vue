<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()

const links = [
  { to: '/discover', label: 'Discover' },
  { to: '/lists', label: 'Lists' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md transition">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
      <NuxtLink to="/discover" class="font-display text-xl font-semibold tracking-tight text-ink">
        BingeWatcher
      </NuxtLink>

      <nav class="flex items-center gap-6 text-sm">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="border-b-2 border-transparent pb-0.5 text-mist transition hover:text-ink"
          :class="route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)) ? 'border-ink font-medium text-ink' : ''"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3 text-sm">
        <span class="hidden text-mist sm:inline">{{ user?.displayName }}</span>
        <button
          type="button"
          class="text-mist transition hover:text-ink"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
