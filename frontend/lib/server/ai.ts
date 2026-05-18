import { getAiContext, getAiSettings } from "./store"

export function backendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
}

export async function backendJson(path: string, init?: RequestInit) {
  const res = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(body || `Backend request failed (${res.status})`)
  }
  return await res.json()
}

export async function buildAiRequest(message: string, sessionId: string, locale: string) {
  const [settings, context] = await Promise.all([getAiSettings(), getAiContext()])
  return {
    session_id: sessionId,
    message,
    locale,
    settings,
    context,
  }
}
