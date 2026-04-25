"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Search, Sparkles, Tag, RotateCcw, TrendingUp, Percent } from "lucide-react"
import { motion } from "framer-motion"
import { products as seed, formatVND, getEffectivePrice, type Category } from "@/lib/data"
import { useLang, useT } from "@/lib/i18n"
import { usePromotions } from "@/lib/promotions"
import { useEffect } from "react"
import type { Product } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type FilterMode = "all" | "trending" | "discounted"

const QUICK_DISCOUNTS = [0, 5, 10, 15, 20, 30]

export function PromotionsTable() {
  const t = useT()
  const { lang } = useLang()
  const { promotions, setPromotion, resetAll, saving } = usePromotions()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All")

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/admin/products`)
        if (res.ok) setProducts(await res.json())
      } catch (err) {
        console.error("Failed to load products:", err)
      }
    })()
  }, [])

  const list = useMemo(() => {
    let l = products.slice()
    if (categoryFilter !== "All") l = l.filter((p) => p.category === categoryFilter)
    if (filter === "trending") l = l.filter((p) => promotions[p.id]?.trending)
    if (filter === "discounted") l = l.filter((p) => (promotions[p.id]?.discount ?? 0) > 0)
    if (query.trim()) {
      const q = query.toLowerCase()
      l = l.filter(
        (p) => p.name.en.toLowerCase().includes(q) || p.name.vi.toLowerCase().includes(q),
      )
    }
    return l
  }, [query, filter, categoryFilter, promotions, products])

  const stats = useMemo(() => {
    const trendingCount = products.filter((p) => promotions[p.id]?.trending).length
    const onSaleProducts = products.filter((p) => (promotions[p.id]?.discount ?? 0) > 0)
    const onSaleCount = onSaleProducts.length
    const avgDiscount =
      onSaleCount === 0
        ? 0
        : Math.round(
            onSaleProducts.reduce((sum, p) => sum + (promotions[p.id]?.discount ?? 0), 0) / onSaleCount,
          )
    return { trendingCount, onSaleCount, avgDiscount }
  }, [promotions, products])

  return (
    <>
      {/* Stats strip */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.6} />}
          label={t("promotions.statsTrending")}
          value={String(stats.trendingCount)}
          accent="tan"
        />
        <StatCard
          icon={<Tag className="h-4 w-4" strokeWidth={1.6} />}
          label={t("promotions.statsOnSale")}
          value={String(stats.onSaleCount)}
          accent="rust"
        />
        <StatCard
          icon={<Percent className="h-4 w-4" strokeWidth={1.6} />}
          label={t("promotions.statsAvgDiscount")}
          value={`${stats.avgDiscount}%`}
          accent="charcoal"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 md:max-w-xs">
          <Search className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("promotions.searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-soft/70"
          />
        </div>

        <div className="flex rounded-full border border-border bg-card p-1 text-xs">
          {(
            [
              ["all", t("promotions.filterAll")],
              ["trending", t("promotions.filterTrending")],
              ["discounted", t("promotions.filterDiscounted")],
            ] as [FilterMode, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-charcoal-soft hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as "All" | Category)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        >
          <option value="All">{t("promotions.filterAll")}</option>
          <option value="Dress">{t("category.Dress")}</option>
          <option value="Suit">{t("category.Suit")}</option>
          <option value="Package">{t("category.Package")}</option>
        </select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-charcoal-soft hover:bg-cream-deep"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} />
              {t("promotions.resetAll")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận đặt lại</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn đặt lại tất cả khuyến mãi về mặc định không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetAll()}>Đồng ý</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px]">
        {saving ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-1.5 text-tan-deep font-medium"
          >
            <RotateCcw className="h-3 w-3 animate-spin" strokeWidth={2} />
            Đang lưu thay đổi...
          </motion.div>
        ) : (
          <div className="flex items-center gap-1.5 text-charcoal-soft">
            <Sparkles className="h-3 w-3 text-tan-deep" strokeWidth={1.6} />
            {t("promotions.savedHint")}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream-deep/40 text-left text-xs uppercase tracking-[0.16em] text-charcoal-soft">
              <tr>
                <th className="px-4 py-3 font-medium">{t("promotions.colPiece")}</th>
                <th className="px-4 py-3 font-medium">{t("promotions.colTrending")}</th>
                <th className="px-4 py-3 font-medium">{t("promotions.colDiscount")}</th>
                <th className="px-4 py-3 font-medium">{t("promotions.colPricing")}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-10 shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-48" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-charcoal-soft">
                    {t("promotions.empty")}
                  </td>
                </tr>
              ) : (
                list.map((p) => {
                  const promo = promotions[p.id] ?? { trending: false, discount: 0 }
                  const { price, original, discount } = getEffectivePrice(p.price, promo.discount)
                  const localizedName = p.name[lang] ?? p.name.en
                  return (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-cream-deep/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                            <Image
                              src={p.image || "/placeholder.svg"}
                              alt={localizedName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{localizedName}</p>
                            <p className="text-xs text-charcoal-soft">
                              {t(`category.${p.category}` as const)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Trending toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={promo.trending}
                          onClick={() => setPromotion(p.id, { trending: !promo.trending })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            promo.trending ? "bg-primary" : "bg-cream-deep border border-border"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                              promo.trending ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Discount editor */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={90}
                                step={1}
                                value={promo.discount}
                                onChange={(e) => {
                                  const v = Number(e.target.value)
                                  setPromotion(p.id, { discount: Number.isFinite(v) ? v : 0 })
                                }}
                                className="h-9 w-20 rounded-md border border-border bg-background pl-2 pr-6 text-sm tabular-nums outline-none focus:border-primary"
                              />
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-charcoal-soft">
                                {t("promotions.percent")}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal-soft/70">
                              {t("promotions.quickPick")}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_DISCOUNTS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setPromotion(p.id, { discount: d })}
                                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                                  promo.discount === d
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border text-charcoal-soft hover:bg-cream-deep"
                                }`}
                              >
                                {d}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Effective price preview */}
                      <td className="px-4 py-3">
                        {discount > 0 ? (
                          <div className="flex flex-col leading-tight">
                            <span className="font-serif text-base text-rust tabular-nums">
                              {formatVND(price)}
                              {p.pricePerDay && (
                                <span className="ml-1 text-[10px] text-charcoal-soft">
                                  {t("inventory.perDayShort")}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-charcoal-soft line-through tabular-nums">
                              {formatVND(original)}
                            </span>
                            <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-rust/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-rust">
                              {t("card.savePercent", { n: discount })}
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif tabular-nums">
                            {formatVND(price)}
                            {p.pricePerDay && (
                              <span className="ml-1 text-[10px] text-charcoal-soft">
                                {t("inventory.perDayShort")}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: "tan" | "rust" | "charcoal"
}) {
  const accentClass =
    accent === "tan"
      ? "bg-primary/30 text-tan-deep"
      : accent === "rust"
        ? "bg-rust/15 text-rust"
        : "bg-cream-deep text-charcoal-soft"
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${accentClass}`}>{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-charcoal-soft">{label}</p>
        <p className="mt-0.5 font-serif text-2xl tabular-nums">{value}</p>
      </div>
    </div>
  )
}
