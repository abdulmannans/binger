export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = getQuery(event)
  const tmdbId = String(query.tmdbId ?? '')
  const mediaType = String(query.mediaType ?? '')

  if (!tmdbId || (mediaType !== 'movie' && mediaType !== 'tv')) {
    throw createError({ statusCode: 400, statusMessage: 'tmdbId and mediaType are required' })
  }

  const [items, lists] = await Promise.all([
    listItemsByUser(user.userId),
    listListsByUser(user.userId),
  ])

  const matches = items
    .filter(item => item.tmdb_id === tmdbId && item.media_type === mediaType)
    .map((item) => {
      const list = lists.find(entry => entry.id === item.list_id)
      return {
        ...toLibraryItem(item),
        listName: list?.name ?? 'Untitled list',
      }
    })

  return { items: matches }
})
