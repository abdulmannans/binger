<script setup lang="ts">
import type { TitleCard } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Discover' })

type DiscoverTab = 'movie' | 'tv' | 'anime'

interface GenreOption {
  id: number
  name: string
}

const tabs: { id: DiscoverTab, label: string }[] = [
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Series' },
  { id: 'anime', label: 'Anime' },
]

const query = ref('')
const results = ref<TitleCard[]>([])
const catalog = ref<TitleCard[]>([])
const forYou = ref<TitleCard[]>([])
const genres = ref<GenreOption[]>([])
const genreId = ref<number | null>(null)
const libraryKeys = ref<Set<string>>(new Set())
const loading = ref(false)
const catalogLoading = ref(true)
const forYouLoading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const adding = ref<TitleCard | null>(null)
const tab = ref<DiscoverTab>('movie')
const page = ref(1)
const totalPages = ref(1)
let timer: ReturnType<typeof setTimeout> | null = null

function libraryKey(mediaType: string, tmdbId: number) {
  return `${mediaType}:${tmdbId}`
}

function isInLibrary(title: TitleCard) {
  return libraryKeys.value.has(libraryKey(title.mediaType, title.tmdbId))
}

async function loadLibraryKeys() {
  try {
    const data = await $fetch<{ keys: string[] }>('/api/library/keys')
    libraryKeys.value = new Set(data.keys)
  }
  catch {
    libraryKeys.value = new Set()
  }
}

async function loadGenres(nextTab: DiscoverTab) {
  if (nextTab === 'anime') {
    genres.value = []
    return
  }
  try {
    const data = await $fetch<{ genres: GenreOption[] }>('/api/genres', {
      query: { type: nextTab },
    })
    genres.value = data.genres
  }
  catch {
    genres.value = []
  }
}

async function loadForYou() {
  forYouLoading.value = true
  try {
    const data = await $fetch<{ results: TitleCard[] }>('/api/recommendations/for-you')
    forYou.value = data.results
  }
  catch {
    forYou.value = []
  }
  finally {
    forYouLoading.value = false
  }
}

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

await Promise.all([loadLibraryKeys(), loadGenres('movie'), loadForYou()])

async function loadCatalog(nextTab: DiscoverTab, nextPage = 1, append = false) {
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
      query: {
        tab: nextTab,
        page: nextPage,
        ...(genreId.value ? { genreId: genreId.value } : {}),
      },
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

async function setTab(next: DiscoverTab) {
  query.value = ''
  results.value = []
  tab.value = next
  page.value = 1
  genreId.value = null
  await loadGenres(next)
  await loadCatalog(next, 1)
}

function setGenre(id: number | null) {
  genreId.value = id
  page.value = 1
  loadCatalog(tab.value, 1)
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
const heading = computed(() => {
  if (showingSearch.value) return 'Results'
  if (genreId.value) {
    const name = genres.value.find(g => g.id === genreId.value)?.name
    if (name) return name
  }
  if (tab.value === 'anime') return 'Anime'
  if (tab.value === 'tv') return 'Trending series'
  return 'Trending movies'
})

function onAdded(title: TitleCard) {
  libraryKeys.value = new Set([...libraryKeys.value, libraryKey(title.mediaType, title.tmdbId)])
  adding.value = null
  loadForYou()
}
</script>

<template>
  <div>
    <section class="mb-10">
      <p class="text-xs uppercase tracking-[0.25em] text-gold">Library</p>
      <h1 class="font-display text-6xl sm:text-7xl">What are we watching?</h1>
      <p class="mt-2 max-w-xl text-mist">
        Browse movies, series, and anime — filter by genre, then save titles to your lists.
      </p>

      <div class="relative mt-8 max-w-2xl">
        <input
          v-model="query"
          type="search"
          placeholder="Search titles — The Bear, Heat, Dune…"
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

      <div v-if="genres.length && !showingSearch" class="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition"
          :class="genreId == null ? 'border-gold bg-gold/15 text-gold' : 'border-line text-mist hover:border-mist hover:text-paper'"
          @click="setGenre(null)"
        >
          All
        </button>
        <button
          v-for="genre in genres"
          :key="genre.id"
          type="button"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition"
          :class="genreId === genre.id ? 'border-gold bg-gold/15 text-gold' : 'border-line text-mist hover:border-mist hover:text-paper'"
          @click="setGenre(genre.id)"
        >
          {{ genre.name }}
        </button>
      </div>
      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    </section>

    <section v-if="!showingSearch" class="mb-12">
      <div class="mb-4 flex items-end justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-gold">Picks</p>
          <h2 class="font-display text-3xl">For you</h2>
        </div>
        <p class="text-sm text-mist">{{ forYou.length }} titles</p>
      </div>
      <div v-if="forYouLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="n in 6" :key="n" class="aspect-[2/3] animate-pulse rounded-xl bg-panel" />
      </div>
      <EmptyState
        v-else-if="!forYou.length"
        title="No recommendations yet"
        body="Add a few titles and mark them Want or Watched — we will pull similar picks from TMDB."
      />
      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <PosterCard
          v-for="title in forYou"
          :key="`fy-${title.mediaType}-${title.tmdbId}`"
          :tmdb-id="title.tmdbId"
          :media-type="title.mediaType"
          :title="title.title"
          :year="title.year"
          :poster-path="title.posterPath"
          :imdb-rating="title.imdbRating"
          :tmdb-rating="title.tmdbRating"
          :genres="title.genres"
          :in-library="isInLibrary(title)"
          @add="adding = title"
        />
      </div>
    </section>

    <section>
      <div class="mb-4 flex items-end justify-between">
        <h2 class="font-display text-3xl">{{ heading }}</h2>
        <p class="text-sm text-mist">{{ grid.length }} titles</p>
      </div>

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
          :genres="title.genres"
          :in-library="isInLibrary(title)"
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
    </section>

    <AddToListModal
      v-if="adding"
      :tmdb-id="adding.tmdbId"
      :media-type="adding.mediaType"
      :title="adding.title"
      @close="adding = null"
      @added="onAdded(adding!)"
    />
  </div>
</template>
