export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing item id' })
  }

  const item = await findItemById(id)
  if (!item || item.user_id !== user.userId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  const body = await readBody<{
    userRating?: number | null
    notes?: string
    status?: string
  }>(event)

  if ('userRating' in body) {
    if (body.userRating == null || body.userRating === undefined || body.userRating === ('' as unknown)) {
      item.user_rating = ''
    }
    else {
      const n = Number(body.userRating)
      if (!Number.isFinite(n) || n < 1 || n > 10) {
        throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 10' })
      }
      item.user_rating = String(n)
    }
  }

  if (typeof body.notes === 'string') {
    item.notes = body.notes.trim()
  }

  if ('status' in body) {
    if (body.status === '' || body.status == null) {
      item.status = ''
    }
    else if (isWatchStatus(body.status)) {
      item.status = body.status
    }
    else {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    }
  }

  await updateItem(item)
  return { item: toLibraryItem(item) }
})
