const TMDB_IMAGE = 'https://image.tmdb.org/t/p'

export function posterUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE}/${size}${path}`
}

export function backdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${TMDB_IMAGE}/${size}${path}`
}

export function yearFromDate(date?: string | null) {
  if (!date) return null
  const year = date.slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
}

export const STATUS_LABELS: Record<string, string> = {
  want: 'Want to watch',
  watching: 'Watching',
  watched: 'Watched',
}
