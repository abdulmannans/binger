export default defineEventHandler(async (event) => {
  await requireUser(event)
  const type = parseMediaType(getRouterParam(event, 'type'))
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid title id' })
  }
  const results = await getRecommendations(type, id)
  return { results }
})
