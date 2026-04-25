"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { products } from "./data"

export type Promotion = {
  trending: boolean
  discount: number
}

type PromotionsMap = Record<string, Promotion>

type PromotionsContextValue = {
  promotions: PromotionsMap
  setPromotion: (id: string, patch: Partial<Promotion>) => Promise<void>
  resetAll: () => void
  hydrated: boolean
  saving: boolean
}

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

const PromotionsContext = createContext<PromotionsContextValue>({
  promotions: {},
  setPromotion: async () => {},
  resetAll: () => {},
  hydrated: false,
  saving: false,
})

export function PromotionsProvider({ children }: { children: React.ReactNode }) {
  const [promotions, setPromotions] = useState<PromotionsMap>({})
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/admin/products`)
        if (res.ok) {
          const data = await res.json()
          const m: PromotionsMap = {}
          for (const p of data) {
            m[p.id] = { trending: p.trending, discount: p.discount }
          }
          setPromotions(m)
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err)
      } finally {
        setHydrated(true)
      }
    })()
  }, [])

  const setPromotion = useCallback(async (id: string, patch: Partial<Promotion>) => {
    setPromotions((prev) => {
      const current = prev[id] ?? { trending: false, discount: 0 }
      return {
        ...prev,
        [id]: {
          trending: patch.trending ?? current.trending,
          discount: typeof patch.discount === "number" ? patch.discount : current.discount,
        },
      }
    })

    setSaving(true)
    try {
      await fetch(`${apiBaseUrl}/api/admin/products/${id}/promo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
    } catch (err) {
      console.error("Failed to save promotion:", err)
    } finally {
      // Small delay to make the "Saving" indicator visible and feel "real"
      setTimeout(() => setSaving(false), 800)
    }
  }, [])

  const resetAll = useCallback(() => {
    // In a real app, this would be a bulk API call. 
    // For now, we'll just reset local state and you can save individually or add a bulk endpoint.
    setPromotions({})
  }, [])

  const value = useMemo(
    () => ({ promotions, setPromotion, resetAll, hydrated, saving }),
    [promotions, setPromotion, resetAll, hydrated, saving],
  )

  return <PromotionsContext.Provider value={value}>{children}</PromotionsContext.Provider>
}

export function usePromotions() {
  return useContext(PromotionsContext)
}

export function useProductPromotion(id: string): Promotion {
  const { promotions } = usePromotions()
  return promotions[id] ?? { trending: false, discount: 0 }
}
