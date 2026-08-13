export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  if (q.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Search needs at least 2 characters' })
  }
  const results = await searchTitles(q)
  return { results }
})
