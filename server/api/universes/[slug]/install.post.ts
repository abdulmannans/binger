import { findUniverse } from '#shared/universes'
import type { MediaType } from '#shared/types'

const CHUNK_SIZE = 8

interface InstallTitle {
  tmdbId: number
  mediaType: MediaType
  title: string
  year: number
}

async function resolveTitles(slug: string): Promise<{ name: string, description: string, titles: InstallTitle[] }> {
  const collectionMatch = /^collection-(\d+)$/.exec(slug)
  if (collectionMatch) {
    const collection = await getCollection(Number(collectionMatch[1]))
    return {
      name: collection.name,
      description: collection.overview || 'TMDB film collection',
      titles: collection.parts.map(part => ({
        tmdbId: part.tmdbId,
        mediaType: part.mediaType,
        title: part.title,
        year: Number(part.year) || 0,
      })),
    }
  }

  const universe = findUniverse(slug)
  if (!universe?.titles?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Universe not found' })
  }
  return {
    name: universe.name,
    description: universe.description,
    titles: universe.titles,
  }
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing universe slug' })
  }

  const order = await resolveTitles(slug)
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

  const cards = await Promise.all(chunk.map(async (entry) => {
    try {
      const card = await getTitleCard(entry.mediaType, entry.tmdbId)
      return { entry, card }
    }
    catch {
      return { entry, card: null }
    }
  }))

  for (const [index, match] of cards.entries()) {
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
      year: match.card.year || String(match.entry.year || ''),
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
