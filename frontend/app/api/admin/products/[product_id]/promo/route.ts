import { json, notFound, readJson, routeParams, serverError } from "@/lib/server/http"
import { updateProductPromo } from "@/lib/server/store"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  context: { params: { product_id: string } | Promise<{ product_id: string }> },
) {
  try {
    const { product_id } = await routeParams(context)
    const payload = await readJson<{ trending?: boolean; discount?: number }>(request)
    const product = await updateProductPromo(product_id, payload)
    if (!product) return notFound("Product not found")
    return json(product)
  } catch (error) {
    return serverError(error, "Failed to update promotion")
  }
}
