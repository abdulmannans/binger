export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing list id' })
  }

  const list = await findListById(id)
  if (!list || list.user_id !== user.userId) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const items = await listItemsByList(list.id)
  items.sort((a, b) => b.added_at.localeCompare(a.added_at))

  return {
    list: {
      id: list.id,
      name: list.name,
      description: list.description,
      createdAt: list.created_at,
      items: items.map(toLibraryItem),
    },
  }
})
