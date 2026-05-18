import { conflict, json, notFound, readJson, routeParams, serverError } from "@/lib/server/http"
import { deleteCategory, updateCategory } from "@/lib/server/store"

export const runtime = "nodejs"

type CategoryPayload = { slug: string; name: Record<string, string> }
type Params = { category_id: string }

export async function PUT(request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { category_id } = await routeParams(context)
    const payload = await readJson<CategoryPayload>(request)
    const category = await updateCategory(category_id, payload)
    if (!category) return notFound("Category not found")
    return json(category)
  } catch (error) {
    return serverError(error, "Failed to save category")
  }
}

export async function DELETE(_request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { category_id } = await routeParams(context)
    const deleted = await deleteCategory(category_id)
    if (!deleted) return notFound("Category not found")
    return json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("category")) return conflict(error.message)
    return serverError(error, "Failed to delete category")
  }
}
