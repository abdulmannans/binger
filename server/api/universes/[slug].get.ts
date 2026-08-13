import { findUniverse } from '#shared/universes'
import type { TitleCard } from '#shared/types'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing universe slug' })
  }

  const collectionMatch = /^collection-(\d+)$/.exec(slug)
  if (collectionMatch) {
    const collectionId = Number(collectionMatch[1])
    const collection = await getCollection(collectionId)
    return {
      universe: {
        slug,
        name: collection.name,
        tag: 'Franchise',
        description: collection.overview || 'TMDB film collection',
        kind: 'collection' as const,
        tmdbCollectionId: collection.id,
        source: `https://www.themoviedb.org/collection/${collection.id}`,
        posterPath: collection.posterPath,
        count: collection.parts.length,
        titles: collection.parts,
      },
    }
  }

  const universe = findUniverse(slug)
  if (!universe || universe.kind !== 'universe' || !universe.titles?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Universe not found' })
  }

  // Prefer live TMDB cards (posters); fall back to vendored metadata if a title fails.
  const live = await getTitleCards(universe.titles.map(entry => ({
    tmdbId: entry.tmdbId,
    mediaType: entry.mediaType,
  })))
  const byId = new Map(live.map(card => [`${card.mediaType}:${card.tmdbId}`, card]))
  const titles: TitleCard[] = universe.titles.map((entry) => {
    const key = `${entry.mediaType}:${entry.tmdbId}`
    return byId.get(key) ?? {
      tmdbId: entry.tmdbId,
      mediaType: entry.mediaType,
      title: entry.title,
      year: String(entry.year),
      posterPath: null,
      overview: '',
      tmdbRating: null,
      imdbRating: null,
      imdbId: null,
    }
  })

  return {
    universe: {
      slug: universe.slug,
      name: universe.name,
      tag: universe.tag,
      description: universe.description,
      kind: universe.kind,
      tmdbCollectionId: null,
      source: universe.source,
      posterPath: titles.find(item => item.posterPath)?.posterPath ?? null,
      count: titles.length,
      titles,
    },
  }
})
