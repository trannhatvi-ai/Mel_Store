"use client"

import { useEffect, useMemo, useState } from "react"
import type { Product } from "@/lib/data"

type ApiProduct = Product & {
  price_per_day?: boolean
}

const FALLBACK_PRODUCT_IMAGE = "/placeholder.jpg"

const LOCAL_PRODUCT_IMAGES = new Set([
  "/placeholder.jpg",
  "/placeholder.svg",
  "/images/dress-1.jpg",
  "/images/dress-2.jpg",
  "/images/dress-3.jpg",
  "/images/dress-4.jpg",
  "/images/hero-bride.jpg",
  "/images/hero-couple.jpg",
  "/images/hero-dress.jpg",
  "/images/package-1.jpg",
  "/images/package-2.jpg",
  "/images/package-3.jpg",
])

function normalizeProductImage(src?: string | null): string {
  const value = src?.trim()
  if (!value) return FALLBACK_PRODUCT_IMAGE
  if (value.startsWith("data:image/")) return value
  if (/^https?:\/\//i.test(value)) return value
  if (LOCAL_PRODUCT_IMAGES.has(value)) return value
  return FALLBACK_PRODUCT_IMAGE
}

function normalizeProduct(p: ApiProduct): Product {
  const image = normalizeProductImage(p.image)
  const gallery = (p.gallery ?? []).map(normalizeProductImage)

  return {
    ...p,
    image,
    pricePerDay: Boolean(p.pricePerDay ?? p.price_per_day),
    gallery: gallery.length ? gallery : [image],
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
