import { backendJson, buildAiRequest } from "@/lib/server/ai"
import { badRequest, json, readJson, serverError } from "@/lib/server/http"

export const runtime = "nodejs"

type ChatPayload = {
  session_id?: string
  message?: string
  locale?: string
}

export async function POST(request: Request) {
  try {
    const payload = await readJson<ChatPayload>(request)
    if (!payload.message) return badRequest("Missing chat message")
    const body = await buildAiRequest(payload.message, payload.session_id ?? "web", payload.locale ?? "vi")
    return json(
      await backendJson("/api/chat", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    )
  } catch (error) {
    return serverError(error, "Chat backend failed")
  }
}
