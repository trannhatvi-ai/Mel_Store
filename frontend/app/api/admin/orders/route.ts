import { json, serverError } from "@/lib/server/http"
import { listOrders } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await listOrders())
  } catch (error) {
    return serverError(error, "Failed to load orders")
  }
}
