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

const src = computed(() => posterUrl(props.posterPath, 'w185'))
const href = computed(() => `/title/${props.mediaType}/${props.tmdbId}`)
const rating = computed(() => props.imdbRating || (props.tmdbRating != null ? String(props.tmdbRating) : null))
const ratingLabel = computed(() => props.imdbRating ? 'IMDb' : (props.tmdbRating != null ? 'TMDB' : null))
const genreLine = computed(() => (props.genres ?? []).slice(0, 2).join(' · '))
</script>

<template>
  <!--
    inline-block + fixed size so tiles wrap in a row even if the parent
    flex/grid wrapper fails to mount (unknown custom element, etc.).
  -->
  <article class="bw-tile group relative">
    <NuxtLink
      :to="href"
      class="bw-tile__link block overflow-hidden rounded-lg bg-panel ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:ring-ink/20"
    >
      <div class="bw-tile__media relative overflow-hidden bg-panel-2">
        <img
          v-if="src"
          :src="src"
          :alt="title"
          width="140"
          height="210"
          class="bw-tile__img absolute inset-0 object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        >
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center bg-panel-2 text-2xl font-display font-medium text-mist"
        >
          {{ title.slice(0, 1) }}
        </div>
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 pt-8">
          <p class="line-clamp-2 text-[11px] font-medium leading-snug text-white">{{ title }}</p>
          <p class="mt-0.5 text-[10px] text-white/70">
            <span>{{ mediaType === 'tv' ? 'Series' : 'Movie' }}</span>
            <span v-if="year"> · {{ year }}</span>
          </p>
          <p v-if="genreLine" class="mt-0.5 line-clamp-1 text-[10px] text-white/55">{{ genreLine }}</p>
        </div>
        <div
          v-if="order"
          class="absolute left-1.5 top-1.5 z-10 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-panel"
        >
          {{ order }}
        </div>
        <div
          v-if="rating"
          class="absolute top-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white"
          :class="order ? 'left-9' : 'left-1.5'"
        >
          <span class="text-white/70">{{ ratingLabel }}</span>
          <span>{{ rating }}</span>
        </div>
        <div
          v-if="userRating"
          class="absolute right-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white"
        >
          You {{ userRating }}
        </div>
      </div>
    </NuxtLink>
    <button
      v-if="!compact && inLibrary"
      type="button"
      class="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-panel text-sm font-semibold text-accent ring-1 ring-accent/40 shadow-sm"
      title="Already in your lists"
      disabled
    >
      ✓
    </button>
    <button
      v-else-if="!compact"
      type="button"
      class="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-base font-medium text-panel shadow-sm transition hover:scale-105"
      title="Add to list"
      @click.prevent="emit('add')"
    >
      +
    </button>
  </article>
</template>

<style>
/* Unlayered — beats Tailwind @layer utilities/components */
.bw-tile {
  display: inline-block !important;
  vertical-align: top !important;
  width: 140px !important;
  max-width: 140px !important;
  min-width: 140px !important;
  margin: 0 12px 12px 0 !important;
  box-sizing: border-box !important;
}
.bw-tile__link,
.bw-tile__media {
  width: 140px !important;
  max-width: 140px !important;
}
.bw-tile__media {
  height: 210px !important;
}
.bw-tile__img {
  width: 140px !important;
  height: 210px !important;
  object-fit: cover !important;
}
.bw-shelf {
  display: block !important;
  width: 100% !important;
  line-height: 0;
}
</style>
