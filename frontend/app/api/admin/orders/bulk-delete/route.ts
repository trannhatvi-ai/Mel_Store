import { json, readJson, serverError } from "@/lib/server/http"
import { bulkDeleteOrders } from "@/lib/server/store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ ids?: string[] }>(request)
    const count = await bulkDeleteOrders(payload.ids ?? [])
    return json({ success: true, count })
  } catch (error) {
    return serverError(error, "Failed to delete orders")
  }
}
