import { json, readJson, serverError } from "@/lib/server/http"
import { getAiSettings, upsertAiSettings, type AISettingsPayload } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await getAiSettings())
  } catch (error) {
    return serverError(error, "Failed to load AI settings")
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await readJson<AISettingsPayload>(request)
    return json(await upsertAiSettings(payload))
  } catch (error) {
    return serverError(error, "Failed to save AI settings")
  }
}
