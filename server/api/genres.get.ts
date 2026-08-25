export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const type = query.type === 'tv' ? 'tv' : 'movie'
  const genres = await listGenres(type)
  return { genres }
})
