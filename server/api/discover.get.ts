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
  return await discoverByTab(tab, page)
})
