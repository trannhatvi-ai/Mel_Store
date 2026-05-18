import { backendJson } from "@/lib/server/ai"
import { json, readJson, serverError } from "@/lib/server/http"
import { getAiSettings } from "@/lib/server/store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = await readJson<{ prompt?: string }>(request)
    const settings = await getAiSettings()
    return json(
      await backendJson("/api/test-model", {
        method: "POST",
        body: JSON.stringify({ prompt: payload.prompt, settings }),
      }),
    )
  } catch (error) {
    return serverError(error, "Failed to test model")
  }
}
