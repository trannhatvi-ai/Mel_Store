import { NextResponse } from "next/server"

import { getAiSettings, upsertGoogleUser } from "@/lib/server/store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  if (!code) return NextResponse.json({ detail: "Missing Google authorization code" }, { status: 400 })

  const settings = await getAiSettings()
  const clientId = settings.google_client_id || process.env.CLIENT_ID
  const clientSecret = settings.google_client_secret || process.env.CLIENT_SECRET
  if (!clientId || !clientSecret) return NextResponse.json({ detail: "Google OAuth is not configured" }, { status: 500 })

  const redirectUri = `${url.origin}/api/auth/google/callback`
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })
  if (!tokenRes.ok) return NextResponse.json({ detail: "Failed to get Google access token" }, { status: 400 })

  const tokenData = (await tokenRes.json()) as { access_token?: string }
  if (!tokenData.access_token) return NextResponse.json({ detail: "Google access token is missing" }, { status: 400 })

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!userRes.ok) return NextResponse.json({ detail: "Failed to load Google profile" }, { status: 400 })

  const googleUser = (await userRes.json()) as { id?: string; email?: string; name?: string; picture?: string }
  if (!googleUser.email) return NextResponse.json({ detail: "Google profile did not include an email" }, { status: 400 })

  const user = await upsertGoogleUser({
    email: googleUser.email,
    full_name: googleUser.name ?? googleUser.email.split("@")[0],
    google_id: googleUser.id ?? null,
  })

  const payload = Buffer.from(
    JSON.stringify({
      email: user.email,
      name: user.full_name,
      role: user.role,
      picture: googleUser.picture,
      sub: user.id,
    }),
  ).toString("base64url")

  return NextResponse.redirect(`${url.origin}/login?token=header.${payload}.signature`)
}
