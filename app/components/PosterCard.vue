<script setup lang="ts">
import type { MediaType } from '#shared/types'
import { posterUrl } from '#shared/utils/media'

const props = defineProps<{
  tmdbId: number
  mediaType: MediaType
  title: string
  year?: string | null
  posterPath?: string | null
  imdbRating?: string | null
  tmdbRating?: number | null
  userRating?: number | null
  status?: string
  compact?: boolean
  order?: number
  genres?: string[]
  inLibrary?: boolean
}>()

const emit = defineEmits<{
  add: []
}>()

const src = computed(() => posterUrl(props.posterPath, 'w500'))
const href = computed(() => `/title/${props.mediaType}/${props.tmdbId}`)
const rating = computed(() => props.imdbRating || (props.tmdbRating != null ? String(props.tmdbRating) : null))
const ratingLabel = computed(() => props.imdbRating ? 'IMDb' : (props.tmdbRating != null ? 'TMDB' : null))
const genreLine = computed(() => (props.genres ?? []).slice(0, 2).join(' · '))
</script>

<template>
  <article class="group relative">
    <NuxtLink
      :to="href"
      class="block overflow-hidden rounded-lg bg-panel ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:ring-ink/20"
    >
      <div class="relative aspect-[2/3] bg-panel-2">
        <img
          v-if="src"
          :src="src"
          :alt="title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        >
        <div v-else class="flex h-full w-full items-center justify-center bg-panel-2 text-3xl font-display font-medium text-mist">
          {{ title.slice(0, 1) }}
        </div>
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-3 pt-10">
          <p class="line-clamp-2 text-sm font-medium leading-snug text-white">{{ title }}</p>
          <p class="mt-1 text-xs text-white/70">
            <span class="tracking-wide">{{ mediaType === 'tv' ? 'Series' : 'Movie' }}</span>
            <span v-if="year"> · {{ year }}</span>
          </p>
          <p v-if="genreLine" class="mt-0.5 line-clamp-1 text-[11px] text-white/55">{{ genreLine }}</p>
        </div>
        <div
          v-if="order"
          class="absolute left-2 top-2 z-10 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-panel"
        >
          {{ order }}
        </div>
        <div
          v-if="rating"
          class="absolute top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white"
          :class="order ? 'left-12' : 'left-2'"
        >
          <span class="text-white/70">{{ ratingLabel }}</span>
          <span>{{ rating }}</span>
        </div>
        <div
          v-if="userRating"
          class="absolute right-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white"
        >
          You {{ userRating }}
        </div>
      </div>
    </NuxtLink>
    <button
      v-if="!compact && inLibrary"
      type="button"
      class="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-panel text-base font-semibold text-accent ring-1 ring-accent/40 shadow-sm"
      title="Already in your lists"
      disabled
    >
      ✓
    </button>
    <button
      v-else-if="!compact"
      type="button"
      class="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-lg font-medium text-panel shadow-sm transition hover:scale-105"
      title="Add to list"
      @click.prevent="emit('add')"
    >
      +
    </button>
  </article>
</template>
