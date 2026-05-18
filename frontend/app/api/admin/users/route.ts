import { badRequest, json, readJson, serverError } from "@/lib/server/http"
import { listUsers, upsertUser, type UserPayload } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET() {
  try {
    return json(await listUsers())
  } catch (error) {
    return serverError(error, "Failed to load users")
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readJson<UserPayload>(request)
    if (!payload.email) return badRequest("Missing email")
    return json(await upsertUser(payload))
  } catch (error) {
    return serverError(error, "Failed to save user")
  }
}
