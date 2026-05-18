import { conflict, json, notFound, routeParams, serverError } from "@/lib/server/http"
import { deleteUser } from "@/lib/server/store"

export const runtime = "nodejs"

type Params = { user_id: string }

export async function DELETE(_request: Request, context: { params: Params | Promise<Params> }) {
  try {
    const { user_id } = await routeParams(context)
    const deleted = await deleteUser(user_id)
    if (!deleted) return notFound("User not found")
    return json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes("in use")) return conflict(error.message)
    return serverError(error, "Failed to delete user")
  }
}
