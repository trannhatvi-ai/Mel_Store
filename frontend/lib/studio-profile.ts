"use client"

import { useEffect, useState } from "react"

export type StudioProfile = {
  name: string
  address: string
  email: string
  bank_name: string
  bank_account: string
  bank_beneficiary: string
  facebook_link?: string | null
  instagram_link?: string | null
}

const defaultProfile: StudioProfile = {
  name: "Feli Studio",
  address: "23 Dong Khoi, District 1, Saigon",
  email: "hello@felistudio.vn",
  bank_name: "Vietcombank",
  bank_account: "0123 456 789",
  bank_beneficiary: "FELI STUDIO",
}

export function useStudioProfile() {
  const [profile, setProfile] = useState<StudioProfile>(defaultProfile)

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const res = await fetch("/api/admin/studio-profile")
        if (!res.ok) return
        const data = await res.json()
        if (active) setProfile(data)
      } catch {
        // Keep fallback profile when the API is unavailable.
      }
    })()

    return () => {
      active = false
    }
  }, [])

  return profile
}
