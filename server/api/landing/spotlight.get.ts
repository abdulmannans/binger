const cachedSpotlight = defineCachedFunction(
  async () => getLandingSpotlight(12),
  {
    maxAge: 3600,
    swr: true,
    name: 'landing-spotlight',
    getKey: () => 'posters',
  },
)

export default defineEventHandler(async () => {
  const posters = await cachedSpotlight()
  return { posters }
})
