import { badRequest, json, readJson, serverError } from "@/lib/server/http"
import { listProducts, upsertProduct, type ProductPayload } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await listProducts())
  } catch (error) {
    return serverError(error, "Failed to load products")
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readJson<ProductPayload>(request)
    if (!payload.slug || !payload.name || !payload.category) return badRequest("Missing product fields")
    return json(await upsertProduct(payload))
  } catch (error) {
    return serverError(error, "Failed to save product")
  }
}
