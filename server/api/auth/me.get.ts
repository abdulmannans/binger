export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session.data.userId) {
    return { user: null }
  }
  const user = await findUserById(session.data.userId)
  if (!user) {
    await clearUserSession(event)
    return { user: null }
  }
  return { user: toPublicUser(user) }
})
