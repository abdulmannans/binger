const cachedGenres = defineCachedFunction(
  async (type: 'movie' | 'tv') => {
    return listGenres(type)
  },
  {
    maxAge: 3600,
    swr: true,
    name: 'tmdb-genres',
    getKey: type => type,
  },
)

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const type = query.type === 'tv' ? 'tv' : 'movie'
  const genres = await cachedGenres(type)
  return { genres }
})
