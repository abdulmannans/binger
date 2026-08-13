export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const [lists, items] = await Promise.all([
    listListsByUser(user.userId),
    listItemsByUser(user.userId),
  ])

  const summaries = lists
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((list) => {
      const listItems = items
        .filter(item => item.list_id === list.id)
        .slice()
        .sort((a, b) => Number(a.position) - Number(b.position) || a.added_at.localeCompare(b.added_at))
      return {
        id: list.id,
        name: list.name,
        description: list.description,
        createdAt: list.created_at,
        itemCount: listItems.length,
        posters: listItems
          .map(item => item.poster_path)
          .filter(Boolean)
          .slice(0, 4),
      }
    })

  return { lists: summaries }
})
