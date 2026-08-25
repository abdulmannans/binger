<script setup lang="ts">
import type { LibraryItem, TitleCard, TitleDetails, WatchStatus } from '#shared/types'
import { backdropUrl, posterUrl } from '#shared/utils/media'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const type = computed(() => String(route.params.type))
const id = computed(() => String(route.params.id))

const { data, error: titleError } = await useFetch<{ title: TitleDetails }>(
  () => `/api/titles/${type.value}/${id.value}`,
)
const title = computed(() => data.value?.title)

const { data: library, refresh: refreshLibrary } = await useFetch<{ items: (LibraryItem & { listName: string })[] }>(
  '/api/library/title',
  { query: { tmdbId: id, mediaType: type } },
)

const { data: recs } = await useFetch<{ results: TitleCard[] }>(
  () => `/api/titles/${type.value}/${id.value}/recommendations`,
  { default: () => ({ results: [] }) },
)

const { data: keysData, refresh: refreshKeys } = await useFetch<{ keys: string[] }>('/api/library/keys', {
  default: () => ({ keys: [] }),
})

const memberships = computed(() => library.value?.items ?? [])
const recommendations = computed(() => recs.value?.results ?? [])
const libraryKeys = computed(() => new Set(keysData.value?.keys ?? []))
const adding = ref(false)
const addingRec = ref<TitleCard | null>(null)
const savingId = ref('')

useHead({ title: () => title.value?.title || 'Title' })

const backdrop = computed(() => backdropUrl(title.value?.backdropPath))

function isInLibrary(card: TitleCard) {
  return libraryKeys.value.has(`${card.mediaType}:${card.tmdbId}`)
}

async function patchItem(item: LibraryItem & { listName: string }, patch: { userRating?: number | null, notes?: string, status?: WatchStatus | '' }) {
  savingId.value = item.id
  try {
    await $fetch(`/api/items/${item.id}`, { method: 'PATCH', body: patch })
    await refreshLibrary()
  }
  catch (e) {
    alert(apiError(e))
  }
  finally {
    savingId.value = ''
  }
}

async function removeFromList(itemId: string) {
  await $fetch(`/api/items/${itemId}`, { method: 'DELETE' })
  await Promise.all([refreshLibrary(), refreshKeys()])
}

async function onAdded() {
  await Promise.all([refreshLibrary(), refreshKeys()])
  adding.value = false
  addingRec.value = null
}
</script>

<template>
  <div v-if="title">
    <div class="relative -mx-4 mb-10 overflow-hidden sm:-mx-6">
      <div class="absolute inset-0">
        <img v-if="backdrop" :src="backdrop" :alt="title.title" class="h-full w-full object-cover opacity-25">
        <div class="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/85 to-canvas/50" />
      </div>
      <div class="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
        <img
          v-if="posterUrl(title.posterPath)"
          :src="posterUrl(title.posterPath) ?? undefined"
          :alt="title.title"
          class="w-44 shrink-0 rounded-lg shadow-md ring-1 ring-line sm:w-52"
        >
        <div class="flex-1">
          <p class="text-sm text-mist">
            {{ title.mediaType === 'tv' ? 'Series' : 'Movie' }}
            <span v-if="title.year"> · {{ title.year }}</span>
          </p>
          <h1 class="mt-1 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{{ title.title }}</h1>
          <p v-if="title.tagline" class="mt-3 italic text-mist">{{ title.tagline }}</p>
          <div class="mt-5 flex flex-wrap gap-2 text-sm">
            <span class="rounded bg-accent px-2 py-1 font-medium text-white">
              IMDb {{ title.imdbRating || '—' }}
            </span>
            <span v-if="title.tmdbRating" class="rounded bg-panel ring-1 ring-line px-2 py-1">TMDB {{ title.tmdbRating }}</span>
            <span v-if="title.runtime" class="rounded bg-panel ring-1 ring-line px-2 py-1">{{ title.runtime }} min</span>
            <span v-if="title.seasons" class="rounded bg-panel ring-1 ring-line px-2 py-1">{{ title.seasons }} season{{ title.seasons === 1 ? '' : 's' }}</span>
          </div>
          <p class="mt-3 text-sm text-mist">{{ title.genres.join(' · ') }}</p>
          <p class="mt-5 max-w-2xl leading-relaxed text-ink/90">{{ title.overview }}</p>
          <button
            type="button"
            class="mt-6 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-panel"
            @click="adding = true"
          >
            Add to a list
          </button>
        </div>
      </div>
    </div>

    <section>
      <h2 class="font-display text-2xl font-medium tracking-tight">Your take</h2>
      <p v-if="!memberships.length" class="mt-2 text-sm text-mist">Add this title to a list to rate it, set a watch status, and leave notes.</p>

      <div v-else class="mt-5 grid gap-4 lg:grid-cols-2">
        <article
          v-for="item in memberships"
          :key="item.id"
          class="rounded-xl border border-line bg-panel p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-mist">On list</p>
              <NuxtLink :to="`/lists/${item.listId}`" class="text-lg font-medium hover:text-accent">{{ item.listName }}</NuxtLink>
            </div>
            <button type="button" class="text-xs text-flare hover:underline" @click="removeFromList(item.id)">Remove</button>
          </div>

          <p class="mt-4 text-xs text-mist">Your rating</p>
          <StarRating
            class="mt-2"
            :model-value="item.userRating"
            @update:model-value="(value) => patchItem(item, { userRating: value })"
          />

          <p class="mt-4 text-xs text-mist">Status</p>
          <StatusPills
            class="mt-2"
            :model-value="item.status"
            @update:model-value="(value) => patchItem(item, { status: value })"
          />

          <p class="mt-4 text-xs text-mist">Notes</p>
          <textarea
            :value="item.notes"
            rows="4"
            class="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none ring-accent/30 focus:ring-2"
            placeholder="What did you think? Where did you watch it?"
            @change="(e) => patchItem(item, { notes: (e.target as HTMLTextAreaElement).value })"
          />
          <p v-if="savingId === item.id" class="mt-2 text-xs text-mist">Saving…</p>
        </article>
      </div>
    </section>

    <section v-if="recommendations.length" class="mt-14">
      <div class="mb-5 flex items-end justify-between">
        <div>
          <p class="text-sm text-mist">Because you opened this</p>
          <h2 class="font-display text-2xl font-medium tracking-tight">More like this</h2>
        </div>
        <p class="text-sm text-mist">{{ recommendations.length }}</p>
      </div>
      <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        <PosterCard
          v-for="card in recommendations"
          :key="`${card.mediaType}-${card.tmdbId}`"
          :tmdb-id="card.tmdbId"
          :media-type="card.mediaType"
          :title="card.title"
          :year="card.year"
          :poster-path="card.posterPath"
          :imdb-rating="card.imdbRating"
          :tmdb-rating="card.tmdbRating"
          :genres="card.genres"
          :in-library="isInLibrary(card)"
          @add="addingRec = card"
        />
      </div>
    </section>

    <AddToListModal
      v-if="adding"
      :tmdb-id="title.tmdbId"
      :media-type="title.mediaType"
      :title="title.title"
      @close="adding = false"
      @added="onAdded"
    />
    <AddToListModal
      v-if="addingRec"
      :tmdb-id="addingRec.tmdbId"
      :media-type="addingRec.mediaType"
      :title="addingRec.title"
      @close="addingRec = null"
      @added="onAdded"
    />
  </div>
  <EmptyState v-else-if="titleError" title="Title not found" body="TMDB did not return this movie or series.">
    <NuxtLink to="/" class="text-accent hover:underline">Back to discover</NuxtLink>
  </EmptyState>
</template>
