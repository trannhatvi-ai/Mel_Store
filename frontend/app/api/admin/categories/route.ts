import { badRequest, json, readJson, serverError } from "@/lib/server/http"
import { createCategory, listCategories } from "@/lib/server/store"

export const runtime = "nodejs"

type CategoryPayload = { id: string; slug: string; name: Record<string, string> }

export async function GET() {
  try {
    return json(await listCategories())
  } catch (error) {
    return serverError(error, "Failed to load categories")
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readJson<CategoryPayload>(request)
    if (!payload.id || !payload.slug || !payload.name) return badRequest("Missing category fields")
    return json(await createCategory(payload))
  } catch (error) {
    return serverError(error, "Failed to save category")
  }
}
