"use client"

import { useEffect, useMemo, useState } from "react"
import type { Product } from "@/lib/data"

type ApiProduct = Product & {
  price_per_day?: boolean
}

function normalizeProduct(p: ApiProduct): Product {
  return {
    ...p,
    pricePerDay: Boolean(p.pricePerDay ?? p.price_per_day),
    gallery: p.gallery?.length ? p.gallery : [p.image || "/placeholder.svg"],
  }
}

export function useProductsFromApi() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/admin/products`)
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`)
        const data = (await res.json()) as ApiProduct[]
        if (active) setProducts(data.map(normalizeProduct))
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [apiBaseUrl])

  const bySlug = useMemo(() => {
    const m = new Map<string, Product>()
    for (const p of products) m.set(p.slug, p)
    return m
  }, [products])

  return {
    products,
    loading,
    error,
    getBySlug: (slug: string) => bySlug.get(slug),
  }
}
