import type { H3Event } from 'h3'
import type { PublicUser } from '#shared/types'

export interface SessionUser {
  userId: string
  email: string
  displayName: string
}

function sessionPassword() {
  const secret = sessionSecret()
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SESSION_SECRET must be set and at least 32 characters',
    })
  }
  return secret
}

export async function getAuthSession(event: H3Event) {
  return useSession<SessionUser>(event, {
    name: 'bw-session',
    password: sessionPassword(),
    cookie: {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    },
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const session = await getAuthSession(event)
  if (!session.data.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to continue' })
  }
  return session.data as SessionUser
}

export async function setUserSession(event: H3Event, user: SessionUser) {
  const session = await getAuthSession(event)
  await session.update(user)
}

export async function clearUserSession(event: H3Event) {
  const session = await getAuthSession(event)
  await session.clear()
}

export function toPublicUser(user: { id: string, email: string, display_name: string }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
