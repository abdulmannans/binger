import { findUniverse, universeSummaries } from '#shared/universes'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const summaries = universeSummaries()

  const curated = summaries.filter(item => item.kind === 'universe').map((item) => {
    const universe = findUniverse(item.slug)
    return {
      ...item,
      count: universe?.titles?.length ?? item.count,
    }
  })

  const featured = summaries.filter(item => item.kind === 'collection')
  const hydrated = await Promise.all(featured.map(async (item) => {
    if (!item.tmdbCollectionId) return item
    try {
      const collection = await getCollection(item.tmdbCollectionId)
      return {
        ...item,
        name: collection.name || item.name,
        description: collection.overview || item.description,
        posterPath: collection.posterPath,
        count: collection.parts.length,
      }
    }
    catch {
      return item
    }
  }))

  return { universes: [...curated, ...hydrated] }
})
