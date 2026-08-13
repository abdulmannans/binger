<script setup lang="ts">
import type { TitleCard } from '#shared/types'

definePageMeta({ middleware: 'auth' })

interface UniverseDetail {
  slug: string
  name: string
  tag: string
  description: string
  kind: 'universe' | 'collection'
  tmdbCollectionId: number | null
  source?: string
  posterPath: string | null
  count: number
  titles: TitleCard[]
}

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error: fetchError, pending } = await useFetch<{ universe: UniverseDetail }>(() => `/api/universes/${slug.value}`)
const universe = computed(() => data.value?.universe)

useHead({ title: () => universe.value?.name || 'Universe' })

const installing = ref(false)
const progress = ref('')
const error = ref('')
const adding = ref<TitleCard | null>(null)

async function install() {
  if (!universe.value) return
  installing.value = true
  error.value = ''
  progress.value = `Starting ${universe.value.name}…`
  let listId = ''
  let offset = 0
  const skipped: { title: string, year: number }[] = []

  try {
    while (true) {
      const chunk = await $fetch<{
        listId: string
        added: number
        skipped: { title: string, year: number }[]
        nextOffset: number
        total: number
        done: boolean
      }>(`/api/universes/${slug.value}/install`, {
        method: 'POST',
        body: { listId: listId || undefined, offset },
      })
      listId = chunk.listId
      skipped.push(...chunk.skipped)
      offset = chunk.nextOffset
      progress.value = `Matched ${Math.min(offset, chunk.total)} of ${chunk.total}…`
      if (chunk.done) break
    }

    if (skipped.length) {
      await navigateTo({
        path: `/lists/${listId}`,
        query: { missed: skipped.map(item => `${item.title} (${item.year})`).join(', ') },
      })
      return
    }
    await navigateTo(`/lists/${listId}`)
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    installing.value = false
    progress.value = ''
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/universes" class="text-sm text-mist hover:text-gold">← All universes</NuxtLink>

    <div v-if="pending && !universe" class="mt-8 space-y-4">
      <div class="h-12 w-2/3 animate-pulse rounded-xl bg-panel" />
      <div class="h-20 w-full animate-pulse rounded-xl bg-panel" />
    </div>

    <template v-else-if="universe">
      <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl">
          <p class="text-xs uppercase tracking-wider text-gold">{{ universe.tag }}</p>
          <h1 class="font-display text-6xl">{{ universe.name }}</h1>
          <p class="mt-2 text-mist">{{ universe.description }}</p>
          <p class="mt-3 text-sm text-mist">{{ universe.count }} title{{ universe.count === 1 ? '' : 's' }} · chronological order</p>
          <a
            v-if="universe.source"
            :href="universe.source"
            target="_blank"
            rel="noreferrer"
            class="mt-2 inline-block text-sm text-gold hover:underline"
          >
            Source
          </a>
        </div>
        <button
          type="button"
          class="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
          :disabled="installing || !universe.titles.length"
          @click="install"
        >
          {{ installing ? 'Installing…' : 'Add as a list' }}
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
      <p v-if="progress" class="mt-3 text-sm text-gold">{{ progress }}</p>

      <EmptyState
        v-if="!universe.titles.length"
        class="mt-10"
        title="No titles resolved"
        body="TMDB could not load this franchise right now. Try again in a moment."
      />

      <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <PosterCard
          v-for="(title, index) in universe.titles"
          :key="`${title.mediaType}-${title.tmdbId}`"
          :order="index + 1"
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
    </template>

    <EmptyState
      v-else-if="fetchError"
      title="Universe not found"
      body="It may have been removed, or the franchise id is invalid."
    >
      <NuxtLink to="/universes" class="text-gold hover:underline">Back to universes</NuxtLink>
    </EmptyState>

    <AddToListModal
      v-if="adding"
      :tmdb-id="adding.tmdbId"
      :media-type="adding.mediaType"
      :title="adding.title"
      @close="adding = null"
    />
  </div>
</template>
