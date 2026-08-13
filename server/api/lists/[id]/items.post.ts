import type { WatchStatus } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const listId = getRouterParam(event, 'id')
  if (!listId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing list id' })
  }

  const list = await findListById(listId)
  if (!list || list.user_id !== user.userId) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const body = await readBody<{
    tmdbId?: number
    mediaType?: string
    userRating?: number | null
    notes?: string
    status?: WatchStatus | ''
  }>(event)

  const tmdbId = Number(body.tmdbId)
  const mediaType = parseMediaType(body.mediaType)
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'tmdbId is required' })
  }

  const existing = await listItemsByList(listId)
  if (existing.some(item => item.tmdb_id === String(tmdbId) && item.media_type === mediaType)) {
    throw createError({ statusCode: 409, statusMessage: 'Already on this list' })
  }

  const title = await getTitleDetails(mediaType, tmdbId)
  let userRating = ''
  if (body.userRating != null && body.userRating !== undefined) {
    const n = Number(body.userRating)
    if (!Number.isFinite(n) || n < 1 || n > 10) {
      throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 10' })
    }
    userRating = String(n)
  }

  const status = body.status && isWatchStatus(body.status) ? body.status : 'want'
  const position = await nextItemPosition(listId)

  const item = await createItem({
    id: newId(),
    list_id: list.id,
    user_id: user.userId,
    tmdb_id: String(title.tmdbId),
    media_type: title.mediaType,
    title: title.title,
    poster_path: title.posterPath || '',
    year: title.year || '',
    imdb_id: title.imdbId || '',
    imdb_rating: title.imdbRating || '',
    user_rating: userRating,
    notes: body.notes?.trim() || '',
    status,
    added_at: new Date().toISOString(),
    position: String(position),
  })

  return { item: toLibraryItem(item) }
})
