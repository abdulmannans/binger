export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const items = await listItemsByUser(user.userId)
  const keys = [...new Set(items.map(item => `${item.media_type}:${item.tmdb_id}`))]
  return { keys }
})
