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

  const body = await readBody<{ name?: string, description?: string }>(event)
  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) throw createError({ statusCode: 400, statusMessage: 'List name is required' })
    list.name = name
  }
  if (typeof body.description === 'string') {
    list.description = body.description.trim()
  }

  await updateList(list)
  const items = await listItemsByList(list.id)

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
