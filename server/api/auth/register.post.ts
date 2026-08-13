import { hash } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email?: string
    password?: string
    displayName?: string
    inviteCode?: string
  }>(event)

  const email = body.email?.trim().toLowerCase() || ''
  const password = body.password || ''
  const displayName = body.displayName?.trim() || ''
  const inviteCode = body.inviteCode?.trim() || ''

  const expectedInvite = configuredInviteCode()
  if (!expectedInvite || inviteCode !== expectedInvite) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid invite code' })
  }
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid email' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }
  if (displayName.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Display name must be at least 2 characters' })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'An account with that email already exists' })
  }

  const user = {
    id: newId(),
    email,
    password_hash: await hash(password, 12),
    display_name: displayName,
    created_at: new Date().toISOString(),
  }
  await createUser(user)
  await setUserSession(event, {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  })

  return { user: toPublicUser(user) }
})
