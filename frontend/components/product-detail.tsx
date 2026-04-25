"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShieldCheck, X } from "lucide-react"
import { type Product, formatVND, localizeProduct, getEffectivePrice } from "@/lib/data"
import { useLang, useT, type DictKey } from "@/lib/i18n"
import { useProductPromotion, usePromotions } from "@/lib/promotions"
import { Skeleton } from "./ui/skeleton"

function diffDays(start: string, end: string) {
  if (!start || !end) return 0
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
}

export function ProductDetail({ product }: { product: Product }) {
  const t = useT()
  const { lang } = useLang()
  const p = localizeProduct(product, lang)

  const [lightbox, setLightbox] = useState<number | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [qty, setQty] = useState(1)

  const { hydrated } = usePromotions()
  const promo = useProductPromotion(product.id)
  const { price, discount } = getEffectivePrice(product.price, promo.discount)
  const isTrending = promo.trending

  const isRental = p.pricePerDay
  const days = isRental ? diffDays(start, end) : 1
  const subtotal = price * (isRental ? days : 1) * qty
  const deposit = Math.round(subtotal * 0.2)
  const remaining = subtotal - deposit

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams({
      product: p.slug,
      qty: String(qty),
      ...(isRental ? { start, end } : {}),
    })
    return `/checkout?${params.toString()}`
  }, [p.slug, qty, isRental, start, end])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <nav className="mb-8 flex items-center gap-2 text-xs text-charcoal-soft">
        <Link href="/" className="hover:text-foreground">
          {t("product.home")}
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-foreground">
          {t("product.catalog")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div>
          <button
            type="button"
            onClick={() => setLightbox(activeImage)}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-cream-deep"
          >
            <Image
              src={p.gallery[activeImage] || "/placeholder.svg"}
              alt={p.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-tan-deep">
              {t("product.tapEnlarge")}
            </span>
          </button>

          {p.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {p.gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square overflow-hidden rounded-md border ${
                    activeImage === i ? "border-primary" : "border-border/60"
                  }`}
                >
                  <Image src={src || "/placeholder.svg"} alt="" fill className="object-cover" sizes="20vw" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + booking */}
        <div className="lg:pl-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t(`category.${p.category}` as DictKey)}</p>
            {!hydrated ? (
              <Skeleton className="h-5 w-24 rounded-full" />
            ) : (
              <div className="flex gap-2">
                {isTrending && (
                  <span className="rounded-full bg-cream-deep px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-tan-deep font-medium">
                    {t("card.trending")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-rust px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white font-medium">
                    -{discount}%
                  </span>
                )}
              </div>
            )}
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{p.name}</h1>
          <p className="mt-5 leading-relaxed text-charcoal-soft">{p.description}</p>

          <ul className="mt-6 grid gap-2 text-sm text-charcoal-soft">
            {p.details.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-3 bg-tan" />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-end justify-between border-y border-border py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-charcoal-soft">
                {isRental ? t("product.rentalRate") : t("product.packagePrice")}
              </p>
              <p className="mt-1 font-serif text-3xl">
                {!hydrated ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    {formatVND(price)}
                    {discount > 0 && <span className="ml-2 text-sm text-charcoal-soft line-through">{formatVND(product.price)}</span>}
                    {isRental && <span className="ml-1 text-base text-charcoal-soft">{t("product.perDay")}</span>}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              aria-label={t("product.save")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-charcoal-soft hover:border-primary hover:text-foreground"
            >
              <Heart className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Booking widget */}
          <div className="mt-8 rounded-lg border border-border bg-card p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("product.reserve")}</p>

            {isRental ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-charcoal-soft">{t("product.pickup")}</span>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3">
                    <Calendar className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
                    <input
                      type="date"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-charcoal-soft">{t("product.return")}</span>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3">
                    <Calendar className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
                    <input
                      type="date"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </label>
              </div>
            ) : (
              <label className="mt-4 flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft">{t("product.eventDate")}</span>
                <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3">
                  <Calendar className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </label>
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-charcoal-soft">{t("product.quantity")}</span>
              <div className="flex items-center gap-3 rounded-full border border-border px-1 py-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-cream-deep"
                  aria-label="−"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-5 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-cream-deep"
                  aria-label="+"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-soft">
                  {isRental && days > 0
                    ? t("product.totalDays", { days, plural: days > 1 && lang === "en" ? "s" : "" })
                    : t("product.total")}
                </span>
                <span className="font-medium">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-soft">{t("product.deposit")}</span>
                <span className="font-medium text-tan-deep">{formatVND(deposit)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>{t("product.remaining")}</span>
                <span>{formatVND(remaining)}</span>
              </div>
            </div>

            <Link
              href={checkoutHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-tan"
            >
              {t("product.checkout")}
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-charcoal-soft">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t("product.heldByVietQR")}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/85 p-6"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
              onClick={() => setLightbox(null)}
              aria-label={t("product.close")}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((i) => (i! - 1 + p.gallery.length) % p.gallery.length)
              }}
              aria-label={t("product.previous")}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="absolute right-6 bottom-6 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 md:bottom-auto md:right-20 md:top-1/2"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((i) => (i! + 1) % p.gallery.length)
              }}
              aria-label={t("product.next")}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={p.gallery[lightbox] || "/placeholder.svg"}
                alt={p.name}
                fill
                className="rounded-md object-contain"
                sizes="80vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
