import { backendJson } from "@/lib/server/ai"
import { json, serverError } from "@/lib/server/http"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await backendJson("/api/model-catalog"))
  } catch (error) {
    return serverError(error, "Failed to load model catalog")
  }
}
