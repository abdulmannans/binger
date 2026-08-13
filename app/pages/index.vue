<script setup lang="ts">
import type { TitleCard } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Discover' })

const query = ref('')
const results = ref<TitleCard[]>([])
const trending = ref<TitleCard[]>([])
const loading = ref(false)
const trendingLoading = ref(true)
const error = ref('')
const adding = ref<TitleCard | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

const { data: discover, error: discoverError } = await useFetch<{ results: TitleCard[] }>('/api/discover', {
  default: () => ({ results: [] }),
})
trending.value = discover.value?.results ?? []
trendingLoading.value = false
if (discoverError.value && !error.value) {
  error.value = apiError(discoverError.value)
}

watch(query, (value) => {
  if (timer) clearTimeout(timer)
  const q = value.trim()
  if (q.length < 2) {
    results.value = []
    error.value = ''
    loading.value = false
    return
  }
  loading.value = true
  timer = setTimeout(async () => {
    try {
      const data = await $fetch<{ results: TitleCard[] }>('/api/search', { query: { q } })
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
const grid = computed(() => showingSearch.value ? results.value : trending.value)
</script>

<template>
  <div>
    <section class="mb-10">
      <p class="text-xs uppercase tracking-[0.25em] text-gold">Library</p>
      <h1 class="font-display text-6xl sm:text-7xl">What are we watching?</h1>
      <p class="mt-2 max-w-xl text-mist">Search movies and series, pin them to a list, rate them, and leave notes. IMDb scores ride along with every poster.</p>

      <div class="relative mt-8 max-w-2xl">
        <input
          v-model="query"
          type="search"
          placeholder="Search titles — The Bear, Heat, Dune…"
          class="w-full rounded-2xl border border-line bg-panel px-5 py-4 text-lg outline-none ring-gold/30 placeholder:text-mist/60 focus:ring-2"
        >
        <p v-if="loading" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-mist">Searching…</p>
      </div>
      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    </section>

    <section>
      <div class="mb-4 flex items-end justify-between">
        <h2 class="font-display text-3xl">
          {{ showingSearch ? 'Results' : 'Trending this week' }}
        </h2>
        <p class="text-sm text-mist">{{ grid.length }} titles</p>
      </div>

      <div v-if="trendingLoading && !showingSearch" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="n in 12" :key="n" class="aspect-[2/3] animate-pulse rounded-xl bg-panel" />
      </div>

      <EmptyState
        v-else-if="showingSearch && !loading && !grid.length"
        title="No matches"
        body="Try another title, or switch between the movie name and the series name."
      />

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <PosterCard
          v-for="title in grid"
          :key="`${title.mediaType}-${title.tmdbId}`"
          :tmdb-id="title.tmdbId"
          :media-type="title.mediaType"
          :title="title.title"
          :year="title.year"
          :poster-path="title.posterPath"
          :imdb-rating="title.imdbRating"
          :tmdb-rating="title.tmdbRating"
          @add="adding = title"
        />
      </div>
    </section>

    <AddToListModal
      v-if="adding"
      :tmdb-id="adding.tmdbId"
      :media-type="adding.mediaType"
      :title="adding.title"
      @close="adding = null"
    />
  </div>
</template>
