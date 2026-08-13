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

const DISCOVER_QUERY: Record<string, { path: string, params: Record<string, string> }> = {
  mcu: {
    path: '/discover/movie',
    params: {
      with_companies: '420',
      sort_by: 'primary_release_date.desc',
      'with_runtime.gte': '40',
      include_adult: 'false',
    },
  },
  dc: {
    path: '/discover/movie',
    params: {
      with_companies: '429|9993|128064',
      sort_by: 'primary_release_date.desc',
      'with_runtime.gte': '40',
      include_adult: 'false',
    },
  },
  animated: {
    path: '/discover/movie',
    params: {
      with_genres: '16',
      sort_by: 'popularity.desc',
      'with_runtime.gte': '40',
      include_adult: 'false',
    },
  },
  'dc-animated': {
    path: '/discover/movie',
    params: {
      with_companies: '429|9993',
      with_genres: '16',
      sort_by: 'primary_release_date.desc',
      'with_runtime.gte': '40',
      include_adult: 'false',
    },
  },
}

export async function discoverByFilter(slug: string, page = 1): Promise<{ results: TitleCard[], page: number, totalPages: number }> {
  const filter = DISCOVER_QUERY[slug]
  if (!filter) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown discover filter' })
  }

  const data = await tmdb<TmdbPaged<TmdbSearchResult> & { page?: number, total_pages?: number }>(filter.path, {
    ...filter.params,
    page: String(Math.max(1, page)),
    language: 'en-US',
  })

  const mediaType: MediaType = 'movie'
  const entries = (data.results ?? []).map(item => ({ item, mediaType }))
  return {
    results: await enrichCards(entries),
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 20),
  }
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export async function searchTitleByYear(title: string, year: number, mediaType: MediaType = 'movie'): Promise<TitleCard | null> {
  const path = mediaType === 'tv' ? '/search/tv' : '/search/movie'
  const params: Record<string, string> = {
    query: title,
    include_adult: 'false',
    language: 'en-US',
  }
  if (mediaType === 'tv') {
    params.first_air_date_year = String(year)
  }
  else {
    params.year = String(year)
    params.primary_release_year = String(year)
  }

  const data = await tmdb<TmdbPaged<TmdbSearchResult>>(path, params)

  let results = data.results ?? []
  if (!results.length) {
    const fallback = await tmdb<TmdbPaged<TmdbSearchResult>>(path, {
      query: title,
      include_adult: 'false',
      language: 'en-US',
    })
    results = fallback.results ?? []
  }

  return pickBestTitle(results, title, year, mediaType)
}

function pickBestTitle(results: TmdbSearchResult[], title: string, year: number, mediaType: MediaType): TitleCard | null {
  if (!results.length) return null
  const needle = normalizeTitle(title)
  const yearStr = String(year)

  const scored = results.map((item) => {
    const itemTitle = normalizeTitle(item.title || item.name || '')
    const itemYear = yearFromDate(item.release_date || item.first_air_date)
    let score = 0
    if (itemTitle === needle) score += 6
    else if (itemTitle.includes(needle) || needle.includes(itemTitle)) score += 3
    if (itemYear === yearStr) score += 8
    else if (itemYear && Math.abs(Number(itemYear) - year) <= 1) score += 3
    return { item, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  if (!best || best.score < 9) return null
  return toCard(best.item, mediaType)
}

export async function trendingTitles(): Promise<TitleCard[]> {
  const data = await tmdb<TmdbPaged<TmdbSearchResult>>('/trending/all/week', {
    language: 'en-US',
  })
  const filtered = (data.results ?? [])
    .map((item) => {
      const mediaType = mediaTypeOf(item.media_type)
      if (!mediaType) return null
      return { item, mediaType }
    })
    .filter((entry): entry is { item: TmdbSearchResult, mediaType: MediaType } => entry != null)
    .slice(0, 18)

  return enrichCards(filtered)
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

export function parseMediaType(value: unknown): MediaType {
  if (value === 'tv' || value === 'movie') return value
  throw createError({ statusCode: 400, statusMessage: 'mediaType must be movie or tv' })
}
