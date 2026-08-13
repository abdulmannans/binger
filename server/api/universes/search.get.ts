export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  if (q.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Search needs at least 2 characters' })
  }
  const results = await searchCollections(q)
  return {
    results: results.map(item => ({
      slug: `collection-${item.id}`,
      name: item.name,
      tag: 'Franchise',
      description: item.overview || 'TMDB film collection',
      kind: 'collection' as const,
      tmdbCollectionId: item.id,
      count: null,
      posterPath: item.posterPath,
      source: undefined,
    })),
  }
})
