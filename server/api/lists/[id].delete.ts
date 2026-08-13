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

  await deleteList(list.id)
  return { ok: true }
})
