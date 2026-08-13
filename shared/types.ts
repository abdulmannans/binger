export type MediaType = 'movie' | 'tv'
export type WatchStatus = 'want' | 'watching' | 'watched'

export interface PublicUser {
  id: string
  email: string
  displayName: string
}

export interface SheetUser {
  id: string
  email: string
  password_hash: string
  display_name: string
  created_at: string
}

export interface SheetList {
  id: string
  user_id: string
  name: string
  description: string
  created_at: string
}

export interface SheetItem {
  id: string
  list_id: string
  user_id: string
  tmdb_id: string
  media_type: MediaType
  title: string
  poster_path: string
  year: string
  imdb_id: string
  imdb_rating: string
  user_rating: string
  notes: string
  status: WatchStatus | ''
  added_at: string
}

export interface TitleCard {
  tmdbId: number
  mediaType: MediaType
  title: string
  year: string | null
  posterPath: string | null
  overview: string
  tmdbRating: number | null
  imdbRating: string | null
  imdbId: string | null
}

export interface TitleDetails extends TitleCard {
  backdropPath: string | null
  runtime: number | null
  genres: string[]
  tagline: string | null
  seasons: number | null
}

export interface ListSummary {
  id: string
  name: string
  description: string
  createdAt: string
  itemCount: number
  posters: string[]
}

export interface ListDetail {
  id: string
  name: string
  description: string
  createdAt: string
  items: LibraryItem[]
}

export interface LibraryItem {
  id: string
  listId: string
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  year: string | null
  imdbId: string | null
  imdbRating: string | null
  userRating: number | null
  notes: string
  status: WatchStatus | ''
  addedAt: string
}
