import type { MediaType, SheetItem, TitleCard } from '#shared/types'

function shuffle<T>(items: T[]): T[] {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = list[i]!
    list[i] = list[j]!
    list[j] = a
  }
  return list
}

function pickSeeds(items: SheetItem[], count: number): SheetItem[] {
  const watched = items.filter(item => item.status === 'watched')
  const want = items.filter(item => item.status === 'want' || item.status === 'watching')
  const unsorted = items.filter(item => !item.status)
  const pool = watched.length ? watched : want.length ? want : unsorted
  if (!pool.length) return []
  return shuffle(pool).slice(0, Math.min(count, pool.length))
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const items = await listItemsByUser(user.userId)

  const libraryKeys = new Set(items.map(item => `${item.media_type}:${item.tmdb_id}`))
  const seeds = pickSeeds(items, 4)

  if (!seeds.length) {
    return { results: [] as TitleCard[] }
  }

  const page = 1 + Math.floor(Math.random() * 3)

  const pools = await Promise.all(seeds.map(async (seed) => {
    const mediaType = (seed.media_type === 'tv' ? 'tv' : 'movie') as MediaType
    const cards = await getRecommendations(mediaType, Number(seed.tmdb_id), page)
    return shuffle(cards)
  }))

  const seen = new Set<string>()
  const results: TitleCard[] = []
  for (const pool of shuffle(pools)) {
    for (const card of pool) {
      const key = `${card.mediaType}:${card.tmdbId}`
      if (libraryKeys.has(key) || seen.has(key)) continue
      seen.add(key)
      results.push(card)
    }
  }

  return { results: shuffle(results).slice(0, 24) }
})
