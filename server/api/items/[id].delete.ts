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

  await deleteItem(item.id)
  return { ok: true }
})
