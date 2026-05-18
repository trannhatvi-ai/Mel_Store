import { json, readJson, serverError } from "@/lib/server/http"
import { getStudioProfile, updateStudioProfile, type StudioProfilePayload } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await getStudioProfile())
  } catch (error) {
    return serverError(error, "Failed to load studio profile")
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await readJson<StudioProfilePayload>(request)
    return json(await updateStudioProfile(payload))
  } catch (error) {
    return serverError(error, "Failed to save studio profile")
  }
}
