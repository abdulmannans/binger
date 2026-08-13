<script setup lang="ts">
import { posterUrl } from '#shared/utils/media'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Universes' })

interface UniverseSummary {
  slug: string
  name: string
  tag: string
  description: string
  source?: string
  kind: 'universe' | 'collection'
  tmdbCollectionId: number | null
  count: number | null
  posterPath: string | null
}

const query = ref('')
const results = ref<UniverseSummary[]>([])
const loading = ref(false)
const error = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const { data, error: fetchError, pending } = await useFetch<{ universes: UniverseSummary[] }>('/api/universes', {
  default: () => ({ universes: [] }),
})
const universes = computed(() => data.value?.universes ?? [])

watch(query, (value) => {
  if (timer) clearTimeout(timer)
  const q = value.trim()
  if (q.length < 2) {
    results.value = []
    loading.value = false
    return
  }
  loading.value = true
  timer = setTimeout(async () => {
    try {
      const data = await $fetch<{ results: UniverseSummary[] }>('/api/universes/search', { query: { q } })
      results.value = data.results
      error.value = ''
    }
    catch (e) {
      error.value = apiError(e)
    }
    finally {
      loading.value = false
    }
  }, 350)
})

const showingSearch = computed(() => query.value.trim().length >= 2)
const grid = computed(() => showingSearch.value ? results.value : universes.value)
</script>

<template>
  <div>
    <p class="text-xs uppercase tracking-[0.25em] text-gold">Catalog</p>
    <h1 class="font-display text-6xl">Universes & franchises</h1>
    <p class="mt-2 max-w-2xl text-mist">
      Curated shared universes with stable TMDB IDs, plus official TMDB film collections you can install as a numbered watch list.
    </p>

    <div class="relative mt-8 max-w-2xl">
      <input
        v-model="query"
        type="search"
        placeholder="Search franchises — John Wick, Toy Story…"
        class="w-full rounded-2xl border border-line bg-panel px-5 py-4 text-lg outline-none ring-gold/30 placeholder:text-mist/60 focus:ring-2"
      >
      <p v-if="loading" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-mist">Searching…</p>
    </div>
    <p v-if="error || fetchError" class="mt-3 text-sm text-flare">{{ error || apiError(fetchError) }}</p>

    <div v-if="pending && !grid.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-40 animate-pulse rounded-2xl bg-panel" />
    </div>

    <EmptyState
      v-else-if="showingSearch && !loading && !grid.length"
      class="mt-8"
      title="No franchises found"
      body="Try another name — TMDB collections cover most film series."
    />

    <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="item in grid"
        :key="item.slug"
        :to="`/universes/${item.slug}`"
        class="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-0.5 hover:border-gold/40"
      >
        <div class="flex gap-4 p-4">
          <div class="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-panel-2">
            <img
              v-if="item.posterPath"
              :src="posterUrl(item.posterPath, 'w185') ?? undefined"
              alt=""
              class="h-full w-full object-cover"
            >
          </div>
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-wider text-gold">{{ item.tag }}</p>
            <h2 class="mt-1 font-display text-2xl leading-none">{{ item.name }}</h2>
            <p class="mt-2 line-clamp-2 text-sm text-mist">{{ item.description }}</p>
            <p v-if="item.count" class="mt-3 text-xs uppercase tracking-wider text-mist">
              {{ item.count }} titles
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
