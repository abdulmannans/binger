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
}>()

const emit = defineEmits<{
  add: []
}>()

const src = computed(() => posterUrl(props.posterPath, 'w500'))
const href = computed(() => `/title/${props.mediaType}/${props.tmdbId}`)
const rating = computed(() => props.imdbRating || (props.tmdbRating != null ? String(props.tmdbRating) : null))
const ratingLabel = computed(() => props.imdbRating ? 'IMDb' : (props.tmdbRating != null ? 'TMDB' : null))
</script>

<template>
  <article class="group relative">
    <NuxtLink :to="href" class="block overflow-hidden rounded-xl bg-panel ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:ring-gold/50">
      <div class="relative aspect-[2/3] bg-panel-2">
        <img
          v-if="src"
          :src="src"
          :alt="title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        >
        <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-panel-2 to-ink text-4xl font-display text-mist">
          {{ title.slice(0, 1) }}
        </div>
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12">
          <p class="line-clamp-2 text-sm font-medium leading-snug">{{ title }}</p>
          <p class="mt-1 text-xs text-mist">
            <span class="uppercase tracking-wide">{{ mediaType === 'tv' ? 'Series' : 'Movie' }}</span>
            <span v-if="year"> · {{ year }}</span>
          </p>
        </div>
        <div v-if="rating" class="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold">
          <span class="text-gold">{{ ratingLabel }}</span>
          <span>{{ rating }}</span>
        </div>
        <div v-if="userRating" class="absolute right-2 top-2 rounded-md bg-flare px-1.5 py-0.5 text-[11px] font-semibold">
          You {{ userRating }}
        </div>
      </div>
    </NuxtLink>
    <button
      v-if="!compact"
      type="button"
      class="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-lg font-bold text-ink shadow-lg transition hover:scale-105"
      title="Add to list"
      @click.prevent="emit('add')"
    >
      +
    </button>
  </article>
</template>
