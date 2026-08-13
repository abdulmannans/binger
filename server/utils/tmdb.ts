import type { MediaType, TitleCard, TitleDetails } from '#shared/types'
import { yearFromDate } from '#shared/utils/media'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const OMDB_BASE = 'https://www.omdbapi.com/'

const imdbRatingCache = new Map<string, string | null>()
const imdbIdCache = new Map<string, string | null>()

function tmdbKey() {
  const key = tmdbApiKey()
  if (!key) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB_API_KEY is not set' })
  }
  return key
}

function omdbKey() {
  return omdbApiKey()
}

async function tmdb<T>(path: string, query: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', tmdbKey())
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url)
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'TMDB request failed' })
  }
  return res.json() as Promise<T>
}

interface TmdbSearchResult {
  id: number
  media_type?: string
  title?: string
  name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

interface TmdbPaged<T> {
  results: T[]
}

interface TmdbMovieDetail extends TmdbSearchResult {
  runtime?: number
  tagline?: string
  genres?: { name: string }[]
  imdb_id?: string
  external_ids?: { imdb_id?: string | null }
}

interface TmdbTvDetail extends TmdbSearchResult {
  episode_run_time?: number[]
  tagline?: string
  genres?: { name: string }[]
  number_of_seasons?: number
  external_ids?: { imdb_id?: string | null }
}

function mediaTypeOf(value?: string): MediaType | null {
  if (value === 'tv' || value === 'movie') return value
  return null
}

function toCard(item: TmdbSearchResult, mediaType: MediaType, imdb?: { id: string | null, rating: string | null }): TitleCard {
  return {
    tmdbId: item.id,
    mediaType,
    title: (item.title || item.name || 'Untitled').trim(),
    year: yearFromDate(item.release_date || item.first_air_date),
    posterPath: item.poster_path ?? null,
    overview: item.overview ?? '',
    tmdbRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    imdbRating: imdb?.rating ?? null,
    imdbId: imdb?.id ?? null,
  }
}

export async function searchTitles(query: string): Promise<TitleCard[]> {
  const data = await tmdb<TmdbPaged<TmdbSearchResult>>('/search/multi', {
    query,
    include_adult: 'false',
    language: 'en-US',
  })
  const filtered = (data.results ?? [])
    .map((item) => {
      const mediaType = mediaTypeOf(item.media_type)
      if (!mediaType) return null
      return { item, mediaType }
    })
    .filter((entry): entry is { item: TmdbSearchResult, mediaType: MediaType } => entry != null)
    .slice(0, 20)

  return enrichCards(filtered)
}

export type DiscoverTab = 'movie' | 'tv' | 'anime'

export async function discoverByTab(tab: DiscoverTab, page = 1): Promise<{ results: TitleCard[], page: number, totalPages: number }> {
  const safePage = String(Math.max(1, page))

  if (tab === 'anime') {
    const data = await tmdb<TmdbPaged<TmdbSearchResult> & { page?: number, total_pages?: number }>('/discover/tv', {
      with_genres: '16',
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
      include_adult: 'false',
      language: 'en-US',
      page: safePage,
    })
    const entries = (data.results ?? []).map(item => ({ item, mediaType: 'tv' as const }))
    return {
      results: await enrichCards(entries),
      page: data.page ?? page,
      totalPages: Math.min(data.total_pages ?? 1, 20),
    }
  }

  const path = tab === 'tv' ? '/trending/tv/week' : '/trending/movie/week'
  const data = await tmdb<TmdbPaged<TmdbSearchResult> & { page?: number, total_pages?: number }>(path, {
    language: 'en-US',
    page: safePage,
  })
  const mediaType: MediaType = tab
  const entries = (data.results ?? []).map(item => ({ item, mediaType }))
  return {
    results: await enrichCards(entries),
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 20),
  }
}

interface TmdbCollectionPart extends TmdbSearchResult {
  media_type?: string
}

interface TmdbCollection {
  id: number
  name: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  parts?: TmdbCollectionPart[]
}

interface TmdbCollectionResult {
  id: number
  name: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
}

export async function searchCollections(query: string) {
  const data = await tmdb<TmdbPaged<TmdbCollectionResult>>('/search/collection', {
    query,
    include_adult: 'false',
    language: 'en-US',
  })
  return (data.results ?? []).slice(0, 20).map(item => ({
    id: item.id,
    name: item.name,
    overview: item.overview ?? '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
  }))
}

export async function getCollection(id: number) {
  const data = await tmdb<TmdbCollection>(`/collection/${id}`, { language: 'en-US' })
  const parts = (data.parts ?? [])
    .slice()
    .sort((a, b) => String(a.release_date || '').localeCompare(String(b.release_date || '')))
  return {
    id: data.id,
    name: data.name,
    overview: data.overview ?? '',
    posterPath: data.poster_path ?? null,
    backdropPath: data.backdrop_path ?? null,
    parts: parts.map(part => toCard(part, 'movie')),
  }
}

export async function getTitleCard(mediaType: MediaType, tmdbId: number): Promise<TitleCard> {
  const data = await tmdb<TmdbSearchResult>(`/${mediaType}/${tmdbId}`, { language: 'en-US' })
  return toCard(data, mediaType)
}

export async function getTitleCards(entries: { tmdbId: number, mediaType: MediaType }[]): Promise<TitleCard[]> {
  const cards: TitleCard[] = []
  const batchSize = 12
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    const resolved = await Promise.all(batch.map(async (entry) => {
      try {
        return await getTitleCard(entry.mediaType, entry.tmdbId)
      }
      catch {
        return null
      }
    }))
    for (const card of resolved) {
      if (card) cards.push(card)
    }
  }
  return cards
}

export function parseMediaType(value: unknown): MediaType {
  if (value === 'tv' || value === 'movie') return value
  throw createError({ statusCode: 400, statusMessage: 'mediaType must be movie or tv' })
}

async function enrichCards(entries: { item: TmdbSearchResult, mediaType: MediaType }[]): Promise<TitleCard[]> {
  const slice = entries.slice(0, 12)
  const rest = entries.slice(12)
  const enriched = await Promise.all(slice.map(async ({ item, mediaType }) => {
    const imdb = await getImdbForTmdb(mediaType, item.id)
    return toCard(item, mediaType, imdb)
  }))
  const plain = rest.map(({ item, mediaType }) => toCard(item, mediaType))
  return [...enriched, ...plain]
}

export async function getTitleDetails(mediaType: MediaType, tmdbId: number): Promise<TitleDetails> {
  if (mediaType === 'movie') {
    const movie = await tmdb<TmdbMovieDetail>(`/movie/${tmdbId}`, {
      append_to_response: 'external_ids',
      language: 'en-US',
    })
    const imdbId = movie.external_ids?.imdb_id || movie.imdb_id || null
    if (imdbId) imdbIdCache.set(cacheKey(mediaType, tmdbId), imdbId)
    const rating = imdbId ? await getImdbRating(imdbId) : null
    return {
      ...toCard(movie, 'movie', { id: imdbId, rating }),
      backdropPath: movie.backdrop_path ?? null,
      runtime: movie.runtime ?? null,
      genres: (movie.genres ?? []).map(genre => genre.name),
      tagline: movie.tagline || null,
      seasons: null,
    }
  }

  const show = await tmdb<TmdbTvDetail>(`/tv/${tmdbId}`, {
    append_to_response: 'external_ids',
    language: 'en-US',
  })
  const imdbId = show.external_ids?.imdb_id || null
  if (imdbId) imdbIdCache.set(cacheKey(mediaType, tmdbId), imdbId)
  const rating = imdbId ? await getImdbRating(imdbId) : null
  return {
    ...toCard(show, 'tv', { id: imdbId, rating }),
    backdropPath: show.backdrop_path ?? null,
    runtime: show.episode_run_time?.[0] ?? null,
    genres: (show.genres ?? []).map(genre => genre.name),
    tagline: show.tagline || null,
    seasons: show.number_of_seasons ?? null,
  }
}

function cacheKey(mediaType: MediaType, tmdbId: number) {
  return `${mediaType}:${tmdbId}`
}

export async function getImdbForTmdb(mediaType: MediaType, tmdbId: number) {
  const key = cacheKey(mediaType, tmdbId)
  let imdbId = imdbIdCache.get(key) ?? null
  if (imdbId === undefined || imdbId === null && !imdbIdCache.has(key)) {
    try {
      const data = await tmdb<{ imdb_id?: string | null }>(`/${mediaType}/${tmdbId}/external_ids`)
      imdbId = data.imdb_id || null
      imdbIdCache.set(key, imdbId)
    }
    catch {
      imdbIdCache.set(key, null)
      imdbId = null
    }
  }
  const rating = imdbId ? await getImdbRating(imdbId) : null
  return { id: imdbId, rating }
}

export async function getImdbRating(imdbId: string): Promise<string | null> {
  if (imdbRatingCache.has(imdbId)) return imdbRatingCache.get(imdbId) ?? null
  const key = omdbKey()
  if (!key) {
    imdbRatingCache.set(imdbId, null)
    return null
  }
  try {
    const url = new URL(OMDB_BASE)
    url.searchParams.set('i', imdbId)
    url.searchParams.set('apikey', key)
    const res = await fetch(url)
    if (!res.ok) {
      imdbRatingCache.set(imdbId, null)
      return null
    }
    const data = await res.json() as { imdbRating?: string, Response?: string }
    const rating = data.Response === 'False' ? null : (data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null)
    imdbRatingCache.set(imdbId, rating)
    return rating
  }
  catch {
    imdbRatingCache.set(imdbId, null)
    return null
  }
}
