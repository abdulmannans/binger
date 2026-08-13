<script setup lang="ts">
import type { TitleCard } from '#shared/types'
import { DISCOVER_FILTERS, type DiscoverFilterSlug } from '#shared/discoverFilters'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Discover' })

const query = ref('')
const results = ref<TitleCard[]>([])
const catalog = ref<TitleCard[]>([])
const loading = ref(false)
const catalogLoading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const adding = ref<TitleCard | null>(null)
const filter = ref<DiscoverFilterSlug | ''>('')
const page = ref(1)
const totalPages = ref(1)
let timer: ReturnType<typeof setTimeout> | null = null

const { data: discover, error: discoverError } = await useFetch<{ results: TitleCard[], page?: number, totalPages?: number }>('/api/discover', {
  default: () => ({ results: [] }),
})
catalog.value = discover.value?.results ?? []
totalPages.value = discover.value?.totalPages ?? 1
catalogLoading.value = false
if (discoverError.value && !error.value) {
  error.value = apiError(discoverError.value)
}

async function loadCatalog(nextFilter: DiscoverFilterSlug | '', nextPage = 1, append = false) {
  if (!append) {
    catalogLoading.value = true
    catalog.value = []
  }
  else {
    loadingMore.value = true
  }
  error.value = ''
  try {
    const data = await $fetch<{ results: TitleCard[], page?: number, totalPages?: number }>('/api/discover', {
      query: nextFilter ? { filter: nextFilter, page: nextPage } : { page: nextPage },
    })
    catalog.value = append ? [...catalog.value, ...data.results] : data.results
    page.value = data.page ?? nextPage
    totalPages.value = data.totalPages ?? 1
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    catalogLoading.value = false
    loadingMore.value = false
  }
}

function setFilter(slug: DiscoverFilterSlug | '') {
  query.value = ''
  results.value = []
  filter.value = slug
  page.value = 1
  loadCatalog(slug, 1)
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
const grid = computed(() => showingSearch.value ? results.value : catalog.value)
const activeFilter = computed(() => DISCOVER_FILTERS.find(item => item.slug === filter.value) ?? null)
const heading = computed(() => {
  if (showingSearch.value) return 'Results'
  if (activeFilter.value) return activeFilter.value.label
  return 'Trending this week'
})
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

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="!filter && !showingSearch ? 'border-gold bg-gold text-ink' : 'border-line text-mist hover:border-gold/50 hover:text-paper'"
          @click="setFilter('')"
        >
          Trending
        </button>
        <button
          v-for="chip in DISCOVER_FILTERS"
          :key="chip.slug"
          type="button"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="filter === chip.slug && !showingSearch ? 'border-gold bg-gold text-ink' : 'border-line text-mist hover:border-gold/50 hover:text-paper'"
          :title="chip.hint"
          @click="setFilter(chip.slug)"
        >
          {{ chip.label }}
        </button>
        <NuxtLink to="/watch-orders" class="rounded-full border border-line px-3 py-1.5 text-sm text-gold hover:border-gold/50">
          Watch orders →
        </NuxtLink>
      </div>
      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    </section>

    <section>
      <div class="mb-4 flex items-end justify-between">
        <h2 class="font-display text-3xl">{{ heading }}</h2>
        <p class="text-sm text-mist">{{ grid.length }} titles</p>
      </div>
      <p v-if="activeFilter && !showingSearch" class="mb-4 text-sm text-mist">
        Browse {{ activeFilter.hint.toLowerCase() }}. For a numbered chronological list, install a
        <NuxtLink to="/watch-orders" class="text-gold hover:underline">watch order</NuxtLink>.
      </p>

      <div v-if="catalogLoading && !showingSearch" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

      <div v-if="!showingSearch && page < totalPages" class="mt-8 flex justify-center">
        <button
          type="button"
          class="rounded-full border border-line px-5 py-2 text-sm text-mist hover:border-gold hover:text-gold"
          :disabled="loadingMore"
          @click="loadCatalog(filter, page + 1, true)"
        >
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
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
