<script setup lang="ts">
import type { LibraryItem, TitleDetails, WatchStatus } from '#shared/types'
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

const memberships = computed(() => library.value?.items ?? [])
const adding = ref(false)
const savingId = ref('')

useHead({ title: () => title.value?.title || 'Title' })

const backdrop = computed(() => backdropUrl(title.value?.backdropPath))

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
  await refreshLibrary()
}

</script>

<template>
  <div v-if="title">
    <div class="relative -mx-4 mb-8 overflow-hidden sm:-mx-6">
      <div class="absolute inset-0">
        <img v-if="backdrop" :src="backdrop" :alt="title.title" class="h-full w-full object-cover opacity-35">
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
      </div>
      <div class="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
        <img
          v-if="posterUrl(title.posterPath)"
          :src="posterUrl(title.posterPath) ?? undefined"
          :alt="title.title"
          class="w-48 shrink-0 rounded-xl shadow-2xl ring-1 ring-white/10 sm:w-56"
        >
        <div class="flex-1">
          <p class="text-xs uppercase tracking-[0.25em] text-gold">
            {{ title.mediaType === 'tv' ? 'Series' : 'Movie' }}
            <span v-if="title.year"> · {{ title.year }}</span>
          </p>
          <h1 class="mt-1 font-display text-6xl leading-none sm:text-7xl">{{ title.title }}</h1>
          <p v-if="title.tagline" class="mt-3 italic text-mist">{{ title.tagline }}</p>
          <div class="mt-5 flex flex-wrap gap-3 text-sm">
            <span class="rounded-md bg-gold px-2 py-1 font-semibold text-ink">
              IMDb {{ title.imdbRating || '—' }}
            </span>
            <span v-if="title.tmdbRating" class="rounded-md bg-panel px-2 py-1">TMDB {{ title.tmdbRating }}</span>
            <span v-if="title.runtime" class="rounded-md bg-panel px-2 py-1">{{ title.runtime }} min</span>
            <span v-if="title.seasons" class="rounded-md bg-panel px-2 py-1">{{ title.seasons }} season{{ title.seasons === 1 ? '' : 's' }}</span>
          </div>
          <p class="mt-3 text-sm text-mist">{{ title.genres.join(' · ') }}</p>
          <p class="mt-5 max-w-2xl leading-relaxed text-paper/90">{{ title.overview }}</p>
          <button
            type="button"
            class="mt-6 rounded-full bg-gold px-5 py-2 font-semibold text-ink"
            @click="adding = true"
          >
            Add to a list
          </button>
        </div>
      </div>
    </div>

    <section>
      <h2 class="font-display text-3xl">Your take</h2>
      <p v-if="!memberships.length" class="mt-2 text-sm text-mist">Add this title to a list to rate it, set a watch status, and leave notes.</p>

      <div v-else class="mt-4 grid gap-4 lg:grid-cols-2">
        <article
          v-for="item in memberships"
          :key="item.id"
          class="rounded-2xl border border-line bg-panel p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wider text-gold">On list</p>
              <NuxtLink :to="`/lists/${item.listId}`" class="text-lg font-semibold hover:text-gold">{{ item.listName }}</NuxtLink>
            </div>
            <button type="button" class="text-xs text-flare hover:underline" @click="removeFromList(item.id)">Remove</button>
          </div>

          <p class="mt-4 text-xs uppercase tracking-wider text-mist">Your rating</p>
          <StarRating
            class="mt-2"
            :model-value="item.userRating"
            @update:model-value="(value) => patchItem(item, { userRating: value })"
          />

          <p class="mt-4 text-xs uppercase tracking-wider text-mist">Status</p>
          <StatusPills
            class="mt-2"
            :model-value="item.status"
            @update:model-value="(value) => patchItem(item, { status: value })"
          />

          <p class="mt-4 text-xs uppercase tracking-wider text-mist">Notes</p>
          <textarea
            :value="item.notes"
            rows="4"
            class="mt-2 w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm outline-none ring-gold/40 focus:ring-2"
            placeholder="What did you think? Where did you watch it?"
            @change="(e) => patchItem(item, { notes: (e.target as HTMLTextAreaElement).value })"
          />
          <p v-if="savingId === item.id" class="mt-2 text-xs text-mist">Saving…</p>
        </article>
      </div>
    </section>

    <AddToListModal
      v-if="adding"
      :tmdb-id="title.tmdbId"
      :media-type="title.mediaType"
      :title="title.title"
      @close="adding = false"
      @added="() => refreshLibrary()"
    />
  </div>
  <EmptyState v-else-if="titleError" title="Title not found" body="TMDB did not return this movie or series.">
    <NuxtLink to="/" class="text-gold hover:underline">Back to discover</NuxtLink>
  </EmptyState>
</template>
