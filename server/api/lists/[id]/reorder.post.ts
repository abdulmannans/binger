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

  const body = await readBody<{ ids?: string[] }>(event)
  const ids = Array.isArray(body.ids) ? body.ids.filter(id => typeof id === 'string') : []
  if (!ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'ids are required' })
  }

  const items = await listItemsByList(listId)
  const owned = new Set(items.map(item => item.id))
  if (ids.some(id => !owned.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'All ids must belong to this list' })
  }

  await reorderListItems(listId, ids)
  const updated = await listItemsByList(listId)
  return { items: updated.map(toLibraryItem) }
})
