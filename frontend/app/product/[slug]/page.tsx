"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { ProductDetail } from "@/components/product-detail"
import { ProductCard } from "@/components/product-card"
import { AiChatButton } from "@/components/ai-chat-button"
import { RelatedHeading } from "@/components/related-heading"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsFromApi } from "@/lib/products-api"

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ""
  const { products, loading } = useProductsFromApi()

  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug])
  const related = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  }, [products, product])

  return (
    <main className="min-h-screen bg-background">
      <SiteNav />

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <Skeleton className="aspect-[4/5] w-full rounded-md" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-56 w-full rounded-lg" />
            </div>
          </div>
        </section>
      ) : !product ? (
        <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
          <h1 className="font-serif text-3xl">Không tìm thấy sản phẩm</h1>
          <p className="mt-3 text-sm text-charcoal-soft">Sản phẩm có thể đã bị xóa hoặc chưa được đồng bộ.</p>
        </section>
      ) : (
        <>
          <ProductDetail product={product} />

          {related.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
              <RelatedHeading />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
      <AiChatButton />
    </main>
  )
}
