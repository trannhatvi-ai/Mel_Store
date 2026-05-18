import { badRequest, json, notFound, readJson, routeParams, serverError } from "@/lib/server/http"
import { updateOrderStatus } from "@/lib/server/store"

export const runtime = "nodejs"

type Params = { order_id: string }

export async function PATCH(request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { order_id } = await routeParams(context)
    const payload = await readJson<{ status: string }>(request)
    if (!payload.status) return badRequest("Missing status")
    const order = await updateOrderStatus(order_id, payload.status)
    if (!order) return notFound("Order not found")
    return json(order)
  } catch (error) {
    return serverError(error, "Failed to update order status")
  }
}
