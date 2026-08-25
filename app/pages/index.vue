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
    <section class="mb-12">
      <p class="text-sm text-mist">Discover</p>
      <h1 class="mt-1 font-display text-4xl font-medium tracking-tight sm:text-5xl">What are we watching?</h1>
      <p class="mt-3 max-w-xl text-mist">
        Browse movies, series, and anime — filter by genre, then save titles to your lists.
      </p>

      <div class="relative mt-8 max-w-xl">
        <input
          v-model="query"
          type="search"
          placeholder="Search titles — The Bear, Heat, Dune…"
          class="w-full rounded-lg border border-line bg-panel px-4 py-3 text-base outline-none ring-accent/25 placeholder:text-mist/60 focus:ring-2"
        >
        <p v-if="loading" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-mist">Searching…</p>
      </div>

      <div class="mt-6 flex flex-wrap gap-5 border-b border-line">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="-mb-px border-b-2 pb-2.5 text-sm transition"
          :class="tab === item.id ? 'border-ink font-medium text-ink' : 'border-transparent text-mist hover:text-ink'"
          @click="setTab(item.id)"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-if="genres.length && !showingSearch" class="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition"
          :class="genreId == null ? 'border-accent bg-accent/10 text-accent' : 'border-line text-mist hover:border-ink/25 hover:text-ink'"
          @click="setGenre(null)"
        >
          All
        </button>
        <button
          v-for="genre in genres"
          :key="genre.id"
          type="button"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition"
          :class="genreId === genre.id ? 'border-accent bg-accent/10 text-accent' : 'border-line text-mist hover:border-ink/25 hover:text-ink'"
          @click="setGenre(genre.id)"
        >
          {{ genre.name }}
        </button>
      </div>
      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    </section>

    <section v-if="!showingSearch" class="mb-14">
      <div class="mb-5 flex items-end justify-between">
        <div>
          <p class="text-sm text-mist">Picks</p>
          <h2 class="font-display text-2xl font-medium tracking-tight">For you</h2>
        </div>
        <p class="text-sm text-mist">{{ forYou.length }}</p>
      </div>
      <PosterGrid v-if="forYouLoading">
        <div
          v-for="n in 8"
          :key="n"
          class="animate-pulse rounded-lg bg-panel-2"
          style="width: 140px; height: 210px; flex: 0 0 140px"
        />
      </PosterGrid>
      <EmptyState
        v-else-if="!forYou.length"
        title="No recommendations yet"
        body="Add a few titles and mark them Want or Watched — we will pull similar picks from TMDB."
      />
      <PosterGrid v-else>
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
      </PosterGrid>
    </section>

    <section>
      <div class="mb-5 flex items-end justify-between">
        <h2 class="font-display text-2xl font-medium tracking-tight">{{ heading }}</h2>
        <p class="text-sm text-mist">{{ grid.length }}</p>
      </div>

      <PosterGrid v-if="catalogLoading && !showingSearch">
        <div
          v-for="n in 14"
          :key="n"
          class="animate-pulse rounded-lg bg-panel-2"
          style="width: 140px; height: 210px; flex: 0 0 140px"
        />
      </PosterGrid>

      <EmptyState
        v-else-if="showingSearch && !loading && !grid.length"
        title="No matches"
        body="Try another title, or switch between the movie name and the series name."
      />

      <PosterGrid v-else>
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
      </PosterGrid>

      <div v-if="!showingSearch && page < totalPages" class="mt-10 flex justify-center">
        <button
          type="button"
          class="rounded-lg border border-line px-5 py-2 text-sm text-mist transition hover:border-ink hover:text-ink"
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
