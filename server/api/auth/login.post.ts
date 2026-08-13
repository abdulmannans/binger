import { compare } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body.email?.trim().toLowerCase() || ''
  const password = body.password || ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const ok = await compare(password, user.password_hash)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  })

  return { user: toPublicUser(user) }
})
