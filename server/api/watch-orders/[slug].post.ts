import { findWatchOrder } from '#shared/watchOrders'

const CHUNK_SIZE = 8

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const slug = getRouterParam(event, 'slug')
  const order = slug ? findWatchOrder(slug) : null
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Watch order not found' })
  }

  const body = await readBody<{ listId?: string, offset?: number }>(event)
  const offset = Math.max(0, Number(body.offset) || 0)

  let list = body.listId ? await findListById(body.listId) : null
  if (body.listId && (!list || list.user_id !== user.userId)) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (!list) {
    list = await createList({
      id: newId(),
      user_id: user.userId,
      name: order.name,
      description: order.description,
      created_at: new Date().toISOString(),
    })
  }

  const existing = await listItemsByList(list.id)
  const seen = new Set(existing.map(item => `${item.media_type}:${item.tmdb_id}`))
  const chunk = order.titles.slice(offset, offset + CHUNK_SIZE)
  const skipped: { title: string, year: number }[] = []
  let added = 0

  const matches = await Promise.all(chunk.map(async (entry) => {
    const mediaType = entry.mediaType || 'movie'
    const card = await searchTitleByYear(entry.title, entry.year, mediaType)
    return { entry, mediaType, card }
  }))

  for (const [index, match] of matches.entries()) {
    const position = String(offset + index + 1)
    if (!match.card) {
      skipped.push({ title: match.entry.title, year: match.entry.year })
      continue
    }

    const key = `${match.card.mediaType}:${match.card.tmdbId}`
    if (seen.has(key)) continue
    seen.add(key)

    await createItem({
      id: newId(),
      list_id: list.id,
      user_id: user.userId,
      tmdb_id: String(match.card.tmdbId),
      media_type: match.card.mediaType,
      title: match.card.title,
      poster_path: match.card.posterPath || '',
      year: match.card.year || String(match.entry.year),
      imdb_id: match.card.imdbId || '',
      imdb_rating: match.card.imdbRating || '',
      user_rating: '',
      notes: '',
      status: 'want',
      added_at: new Date().toISOString(),
      position,
    })
    added += 1
  }

  const nextOffset = offset + chunk.length
  return {
    listId: list.id,
    listName: list.name,
    added,
    skipped,
    offset,
    nextOffset,
    total: order.titles.length,
    done: nextOffset >= order.titles.length,
  }
})
