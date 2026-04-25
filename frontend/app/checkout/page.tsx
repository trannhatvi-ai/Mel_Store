"use client"

import { useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { CheckoutFlow } from "@/components/checkout-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsFromApi } from "@/lib/products-api"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const { products, loading } = useProductsFromApi()

  const slug = searchParams.get("product") ?? ""
  const qty = Math.max(1, Number(searchParams.get("qty") || "1") || 1)
  const start = searchParams.get("start") ?? ""
  const end = searchParams.get("end") ?? ""

  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug])

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-[520px] w-full rounded-lg" />
          <Skeleton className="h-[420px] w-full rounded-lg" />
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-serif text-3xl">Không tìm thấy sản phẩm</h1>
        <p className="mt-3 text-sm text-charcoal-soft">Vui lòng quay lại trang chi tiết sản phẩm và thử lại.</p>
      </section>
    )
  }

  return <CheckoutFlow product={product} initialQty={qty} initialStart={start} initialEnd={end} />
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <Suspense fallback={
        <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <Skeleton className="h-8 w-64" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <Skeleton className="h-[520px] w-full rounded-lg" />
            <Skeleton className="h-[420px] w-full rounded-lg" />
          </div>
        </section>
      }>
        <CheckoutContent />
      </Suspense>
      <SiteFooter />
    </main>
  )
}
