import { json, readJson, serverError } from "@/lib/server/http"
import { getPrimaryPolicy, upsertPrimaryPolicy } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await getPrimaryPolicy())
  } catch (error) {
    return serverError(error, "Failed to load policy")
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await readJson<{ content: string; title?: string | null; locale?: string; policy_type?: string }>(
      request,
    )
    return json(await upsertPrimaryPolicy(payload))
  } catch (error) {
    return serverError(error, "Failed to save policy")
  }
}
