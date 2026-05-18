import { json, readJson } from "@/lib/server/http"
import { loginUser } from "@/lib/server/store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const payload = await readJson<{ identifier?: string; password?: string }>(request)
  const user = await loginUser(payload.identifier ?? "", payload.password ?? "")
  if (!user) return json({ detail: "Tai khoan hoac mat khau khong dung." }, { status: 401 })
  return json(user)
}
