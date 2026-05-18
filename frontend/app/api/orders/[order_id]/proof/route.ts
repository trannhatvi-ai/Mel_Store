import { badRequest, json, notFound, readJson, routeParams, serverError } from "@/lib/server/http"
import { uploadOrderProof } from "@/lib/server/store"

export const runtime = "nodejs"

type Params = { order_id: string }

export async function PATCH(request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { order_id } = await routeParams(context)
    const payload = await readJson<{ proof?: string }>(request)
    if (!payload.proof) return badRequest("Missing payment proof")
    const result = await uploadOrderProof(order_id, payload.proof)
    if (!result) return notFound("Order not found")
    return json(result)
  } catch (error) {
    return serverError(error, "Failed to upload payment proof")
  }
}
