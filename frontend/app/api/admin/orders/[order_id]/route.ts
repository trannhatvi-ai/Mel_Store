import { json, notFound, routeParams, serverError } from "@/lib/server/http"
import { deleteOrder } from "@/lib/server/store"

export const runtime = "nodejs"

type Params = { order_id: string }

export async function DELETE(_request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { order_id } = await routeParams(context)
    const deleted = await deleteOrder(order_id)
    if (!deleted) return notFound("Order not found")
    return json({ success: true })
  } catch (error) {
    return serverError(error, "Failed to delete order")
  }
}
