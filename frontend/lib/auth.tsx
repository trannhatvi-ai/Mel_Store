"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export type AuthRole = "customer" | "guest" | "studio" | "admin"

export type AuthSession = {
  role: AuthRole
  name: string
  email: string
  provider: "google" | "password"
  picture?: string
}

type AuthContextValue = {
  session: AuthSession | null
  ready: boolean
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
  loginGoogle: (credential: string) => { ok: boolean; message?: string }
  logout: () => void
}

const STORAGE_KEY = "mel-store-auth-session"
const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const decoded = new TextDecoder("utf-8").decode(bytes)
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    return null
  }
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setSession(readSession())
    setReady(true)
  }, [])

  const persist = useCallback((value: AuthSession | null) => {
    setSession(value)
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      else localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const loginAdmin = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: username, password })
        })
        if (!res.ok) {
           const err = await res.json()
           return { ok: false, message: err?.detail || "Đăng nhập thất bại." }
        }
        const data = await res.json()
        const isStaffOrAdmin = data.role === "ADMIN" || data.role === "STUDIO"
        persist({
          role: data.role.toLowerCase() as AuthRole,
          name: data.full_name || data.username || "User",
          email: data.email,
          provider: "password",
        })
        router.push(isStaffOrAdmin ? "/admin" : "/catalog")
        return { ok: true }
      } catch (e) {
        return { ok: false, message: "Lỗi kết nối tới máy chủ." }
      }
    },
    [persist, router],
  )

  const loginGoogle = useCallback(
    (credential: string) => {
      const claims = decodeJwt(credential)
      if (!claims) {
        return { ok: false, message: "Không đọc được dữ liệu đăng nhập Google." }
      }
      const email = String(claims.email ?? "")
      const name = String(claims.name ?? claims.given_name ?? email.split("@")[0] ?? "Google User")
      const picture = typeof claims.picture === "string" ? claims.picture : undefined
      const role = typeof claims.role === "string" ? claims.role.toLowerCase() as AuthRole : "guest"
      persist({ role, name, email, provider: "google", picture })
      const isStaffOrAdmin = role === "admin" || role === "studio"
      router.push(isStaffOrAdmin ? "/admin" : "/catalog")
      return { ok: true }
    },
    [persist, router],
  )

  const logout = useCallback(() => {
    persist(null)
    router.push("/")
  }, [persist, router])

  const value = useMemo(
    () => ({ session, ready, loginAdmin, loginGoogle, logout }),
    [session, ready, loginAdmin, loginGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
