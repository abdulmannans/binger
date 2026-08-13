export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ name?: string, description?: string }>(event)
  const name = body.name?.trim() || ''
  const description = body.description?.trim() || ''

  if (name.length < 1) {
    throw createError({ statusCode: 400, statusMessage: 'List name is required' })
  }

  const list = await createList({
    id: newId(),
    user_id: user.userId,
    name,
    description,
    created_at: new Date().toISOString(),
  })

  return {
    list: {
      id: list.id,
      name: list.name,
      description: list.description,
      createdAt: list.created_at,
      itemCount: 0,
      posters: [],
    },
  }
})
