import { badRequest, json, readJson, serverError } from "@/lib/server/http"
import { createOrder, type CreateOrderPayload } from "@/lib/server/store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = await readJson<CreateOrderPayload>(request)
    if (!payload.customer || !payload.email || !payload.phone) return badRequest("Missing customer information")
    return json(await createOrder(payload))
  } catch (error) {
    return serverError(error, "Failed to create order")
  }
}
