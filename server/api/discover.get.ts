export type DiscoverTab = 'movie' | 'tv' | 'anime'

function parseTab(value: unknown): DiscoverTab | null {
  if (value === 'movie' || value === 'tv' || value === 'anime') return value
  return null
}

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const tab = parseTab(query.tab) ?? 'movie'
  const page = Math.max(1, Number(query.page) || 1)
  const genreRaw = Number(query.genreId)
  const genreId = Number.isFinite(genreRaw) && genreRaw > 0 ? genreRaw : null
  return await discoverByTab(tab, page, genreId)
})
