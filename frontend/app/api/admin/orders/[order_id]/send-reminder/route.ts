import { backendJson } from "@/lib/server/ai"
import { json, notFound, routeParams, serverError } from "@/lib/server/http"
import { getOrder } from "@/lib/server/store"

export const runtime = "nodejs"

type Params = { order_id: string }

export async function POST(_request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { order_id } = await routeParams(context)
    const order = await getOrder(order_id)
    if (!order) return notFound("Order not found")

    await backendJson("/api/notify", {
      method: "POST",
      body: JSON.stringify({
        message: `[Admin Reminder] Order ${order.order_number} - ${order.customer} (${order.phone}) status: ${order.status}. Please follow up.`,
      }),
    })

    return json({ success: true })
  } catch (error) {
    return serverError(error, "Failed to send reminder")
  }
}
