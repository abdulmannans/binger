import { watchOrderSummaries } from '#shared/watchOrders'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  return { orders: watchOrderSummaries() }
})
