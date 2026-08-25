export type DiscoverTab = 'movie' | 'tv' | 'anime'

function parseTab(value: unknown): DiscoverTab | null {
  if (value === 'movie' || value === 'tv' || value === 'anime') return value
  return null
}

const cachedDiscover = defineCachedFunction(
  async (tab: DiscoverTab, page: number, genreId: number | null) => {
    return discoverByTab(tab, page, genreId)
  },
  {
    maxAge: 180,
    swr: true,
    name: 'tmdb-discover',
    getKey: (tab, page, genreId) => `${tab}:${page}:${genreId ?? 0}`,
  },
)

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const tab = parseTab(query.tab) ?? 'movie'
  const page = Math.max(1, Number(query.page) || 1)
  const genreRaw = Number(query.genreId)
  const genreId = Number.isFinite(genreRaw) && genreRaw > 0 ? genreRaw : null
  return await cachedDiscover(tab, page, genreId)
})
