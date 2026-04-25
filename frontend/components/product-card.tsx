"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/data"
import { formatVND, getEffectivePrice, localizeProduct } from "@/lib/data"
import { useLang, useT, type DictKey } from "@/lib/i18n"
import { useProductPromotion } from "@/lib/promotions"
import { Skeleton } from "./ui/skeleton"

export function ProductCard({ product }: { product: Product }) {
  const { lang } = useLang()
  const t = useT()
  const promo = useProductPromotion(product.id)
  const p = localizeProduct(product, lang)
  const { price, original, discount } = getEffectivePrice(p.price, promo.discount)
  const isTrending = promo.trending

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block overflow-hidden rounded-md border border-border/60 bg-card transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(168,122,82,0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
        <Image
          src={p.image || "/placeholder.svg"}
          alt={p.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
        {isTrending && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-tan-deep">
            {t("card.trending")}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rust px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-tan-deep">
            {t(`category.${p.category}` as DictKey)}
          </p>
          <h3 className="mt-1 font-serif text-lg leading-snug text-foreground">{p.name}</h3>
        </div>
        <div className="text-right">
          {discount > 0 ? (
            <div className="flex flex-col items-end leading-tight">
              <p className="font-serif text-base text-rust">{formatVND(price)}</p>
              <p className="text-[11px] text-charcoal-soft line-through">{formatVND(original)}</p>
            </div>
          ) : (
            <p className="font-serif text-base text-foreground">{formatVND(price)}</p>
          )}
          <p className="text-[11px] text-charcoal-soft">{p.pricePerDay ? t("card.perDay") : t("card.package")}</p>
        </div>
      </div>
    </Link>
  )
}

ProductCard.Skeleton = function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-card">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
    </div>
  )
}
