import { isDiscoverFilter } from '#shared/discoverFilters'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const filter = typeof query.filter === 'string' ? query.filter : ''
  const page = Math.max(1, Number(query.page) || 1)

  if (filter) {
    if (!isDiscoverFilter(filter)) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown discover filter' })
    }
    return await discoverByFilter(filter, page)
  }

  const results = await trendingTitles()
  return { results, page: 1, totalPages: 1 }
})
