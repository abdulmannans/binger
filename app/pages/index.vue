<script setup lang="ts">
import type { TitleCard } from '#shared/types'
import { posterUrl } from '#shared/utils/media'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Discover' })

type DiscoverTab = 'movie' | 'tv' | 'anime' | 'universes'

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

const tabs: { id: DiscoverTab, label: string }[] = [
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Series' },
  { id: 'anime', label: 'Anime' },
  { id: 'universes', label: 'Universes' },
]

const query = ref('')
const results = ref<TitleCard[]>([])
const catalog = ref<TitleCard[]>([])
const universes = ref<UniverseSummary[]>([])
const universeResults = ref<UniverseSummary[]>([])
const loading = ref(false)
const catalogLoading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const adding = ref<TitleCard | null>(null)
const tab = ref<DiscoverTab>('movie')
const page = ref(1)
const totalPages = ref(1)
let timer: ReturnType<typeof setTimeout> | null = null

const { data: discover, error: discoverError } = await useFetch<{ results: TitleCard[], page?: number, totalPages?: number }>('/api/discover', {
  query: { tab: 'movie' },
  default: () => ({ results: [] }),
})
catalog.value = discover.value?.results ?? []
totalPages.value = discover.value?.totalPages ?? 1
catalogLoading.value = false
if (discoverError.value && !error.value) {
  error.value = apiError(discoverError.value)
}

async function loadCatalog(nextTab: DiscoverTab, nextPage = 1, append = false) {
  if (nextTab === 'universes') {
    catalogLoading.value = !append
    error.value = ''
    try {
      const data = await $fetch<{ universes: UniverseSummary[] }>('/api/universes')
      universes.value = data.universes
    }
    catch (e) {
      error.value = apiError(e)
    }
    finally {
      catalogLoading.value = false
    }
    return
  }

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
      query: { tab: nextTab, page: nextPage },
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

function setTab(next: DiscoverTab) {
  query.value = ''
  results.value = []
  universeResults.value = []
  tab.value = next
  page.value = 1
  loadCatalog(next, 1)
}

watch(query, (value) => {
  if (timer) clearTimeout(timer)
  const q = value.trim()
  if (q.length < 2) {
    results.value = []
    universeResults.value = []
    error.value = ''
    loading.value = false
    return
  }
  loading.value = true
  timer = setTimeout(async () => {
    try {
      if (tab.value === 'universes') {
        const data = await $fetch<{ results: UniverseSummary[] }>('/api/universes/search', { query: { q } })
        universeResults.value = data.results
      }
      else {
        const data = await $fetch<{ results: TitleCard[] }>('/api/search', { query: { q } })
        results.value = data.results
      }
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
const universeGrid = computed(() => showingSearch.value ? universeResults.value : universes.value)
const heading = computed(() => {
  if (tab.value === 'universes') return showingSearch.value ? 'Franchise search' : 'Universes & franchises'
  if (showingSearch.value) return 'Results'
  if (tab.value === 'anime') return 'Anime'
  if (tab.value === 'tv') return 'Trending series'
  return 'Trending movies'
})
</script>

<template>
  <div>
    <section class="mb-10">
      <p class="text-xs uppercase tracking-[0.25em] text-gold">Library</p>
      <h1 class="font-display text-6xl sm:text-7xl">What are we watching?</h1>
      <p class="mt-2 max-w-xl text-mist">
        Browse movies, series, and anime — or open a curated universe and install it as a numbered list.
      </p>

      <div class="relative mt-8 max-w-2xl">
        <input
          v-model="query"
          type="search"
          :placeholder="tab === 'universes' ? 'Search franchises — John Wick, Toy Story…' : 'Search titles — The Bear, Heat, Dune…'"
          class="w-full rounded-2xl border border-line bg-panel px-5 py-4 text-lg outline-none ring-gold/30 placeholder:text-mist/60 focus:ring-2"
        >
        <p v-if="loading" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-mist">Searching…</p>
      </div>

      <div class="mt-5 flex flex-wrap gap-1 border-b border-line pb-px">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="-mb-px border-b-2 px-4 py-2 text-sm font-medium transition"
          :class="tab === item.id ? 'border-gold text-gold' : 'border-transparent text-mist hover:text-paper'"
          @click="setTab(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    </section>

    <section>
      <div class="mb-4 flex items-end justify-between">
        <h2 class="font-display text-3xl">{{ heading }}</h2>
        <p class="text-sm text-mist">
          {{ tab === 'universes' ? `${universeGrid.length} franchises` : `${grid.length} titles` }}
        </p>
      </div>

      <template v-if="tab === 'universes'">
        <div v-if="catalogLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 6" :key="n" class="h-40 animate-pulse rounded-2xl bg-panel" />
        </div>
        <EmptyState
          v-else-if="showingSearch && !loading && !universeGrid.length"
          title="No franchises found"
          body="Try another name — TMDB collections cover most film series."
        />
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="item in universeGrid"
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
                <h3 class="mt-1 font-display text-2xl leading-none">{{ item.name }}</h3>
                <p class="mt-2 line-clamp-2 text-sm text-mist">{{ item.description }}</p>
                <p v-if="item.count" class="mt-3 text-xs uppercase tracking-wider text-mist">
                  {{ item.count }} titles
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>

      <template v-else>
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
            @click="loadCatalog(tab, page + 1, true)"
          >
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </template>
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
