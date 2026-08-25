import type { MediaType, TitleCard } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const items = await listItemsByUser(user.userId)

  const libraryKeys = new Set(items.map(item => `${item.media_type}:${item.tmdb_id}`))

  const watched = items.filter(item => item.status === 'watched')
  const want = items.filter(item => item.status === 'want' || item.status === 'watching')
  const unsorted = items.filter(item => !item.status)
  const seeds = (watched.length ? watched : want.length ? want : unsorted).slice(0, 5)

  if (!seeds.length) {
    return { results: [] as TitleCard[] }
  }

  const pools = await Promise.all(seeds.map(async (seed) => {
    const mediaType = (seed.media_type === 'tv' ? 'tv' : 'movie') as MediaType
    return getRecommendations(mediaType, Number(seed.tmdb_id))
  }))

  const seen = new Set<string>()
  const results: TitleCard[] = []
  for (const pool of pools) {
    for (const card of pool) {
      const key = `${card.mediaType}:${card.tmdbId}`
      if (libraryKeys.has(key) || seen.has(key)) continue
      seen.add(key)
      results.push(card)
      if (results.length >= 24) {
        return { results }
      }
    }
  }

  return { results }
})
