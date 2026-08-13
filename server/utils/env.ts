function fromRuntime(key: string) {
  const config = useRuntimeConfig() as Record<string, unknown>
  const value = config[key]
  return typeof value === 'string' ? value : ''
}

export function envVar(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
  return ''
}

export function databaseUrl() {
  return fromRuntime('databaseUrl')
    || envVar('NUXT_DATABASE_URL', 'DATABASE_URL')
    || 'file:data/bingewatcher.db'
}

export function databaseAuthToken() {
  return fromRuntime('databaseAuthToken')
    || envVar('NUXT_DATABASE_AUTH_TOKEN', 'DATABASE_AUTH_TOKEN')
}

export function tmdbApiKey() {
  return fromRuntime('tmdbApiKey') || envVar('NUXT_TMDB_API_KEY', 'TMDB_API_KEY')
}

export function omdbApiKey() {
  return fromRuntime('omdbApiKey') || envVar('NUXT_OMDB_API_KEY', 'OMDB_API_KEY')
}

export function configuredInviteCode() {
  return fromRuntime('inviteCode') || envVar('NUXT_INVITE_CODE', 'INVITE_CODE')
}

export function sessionSecret() {
  return fromRuntime('sessionSecret') || envVar('NUXT_SESSION_SECRET', 'SESSION_SECRET')
}
