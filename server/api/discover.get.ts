export default defineEventHandler(async (event) => {
  await requireUser(event)
  const results = await trendingTitles()
  return { results }
})
