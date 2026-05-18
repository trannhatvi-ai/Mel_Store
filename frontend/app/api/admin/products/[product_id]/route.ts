import { conflict, json, notFound, routeParams, serverError } from "@/lib/server/http"
import { deleteProduct } from "@/lib/server/store"

export const runtime = "nodejs"

export async function DELETE(_request: Request, context: { params: { product_id: string } | Promise<{ product_id: string }> }) {
  try {
    const { product_id } = await routeParams(context)
    const deleted = await deleteProduct(product_id)
    if (!deleted) return notFound("Product not found")
    return json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("referenced")) return conflict(error.message)
    return serverError(error, "Failed to delete product")
  }
}
