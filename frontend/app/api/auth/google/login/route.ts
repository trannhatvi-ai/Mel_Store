import { NextResponse } from "next/server"

import { getAiSettings } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const settings = await getAiSettings()
  const clientId = settings.google_client_id || process.env.CLIENT_ID
  if (!clientId) return NextResponse.json({ detail: "Google Client ID is not configured" }, { status: 500 })

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: redirectUri,
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
