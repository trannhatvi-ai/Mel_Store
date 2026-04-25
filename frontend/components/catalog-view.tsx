"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { type Category, formatVND, localizeProduct } from "@/lib/data"
import { useLang, useT, type DictKey } from "@/lib/i18n"
import { usePromotions } from "@/lib/promotions"
import { useProductsFromApi } from "@/lib/products-api"

const categories: ("All" | Category)[] = ["All", "Package", "Dress", "Suit"]

type SortKey = "featured" | "low" | "high"

export function CatalogView({ initialCategory }: { initialCategory?: string }) {
  const t = useT()
  const { lang } = useLang()
  const { hydrated } = usePromotions()
  const { products, loading } = useProductsFromApi()
  const [category, setCategory] = useState<"All" | Category>(
    (categories as string[]).includes(initialCategory || "") ? (initialCategory as "All" | Category) : "All",
  )
  const [maxPrice, setMaxPrice] = useState<number>(15_000_000)
  const [date, setDate] = useState<string>("")
  const [sort, setSort] = useState<SortKey>("featured")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = products.slice()
    if (category !== "All") list = list.filter((p) => p.category === category)
    list = list.filter((p) => p.price <= maxPrice)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.en.toLowerCase().includes(q) ||
          p.name.vi.toLowerCase().includes(q) ||
          p.description.en.toLowerCase().includes(q) ||
          p.description.vi.toLowerCase().includes(q),
      )
    }
    if (sort === "low") list.sort((a, b) => a.price - b.price)
    if (sort === "high") list.sort((a, b) => b.price - a.price)
    return list
  }, [category, maxPrice, query, sort, products])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="border-b border-border/60 pb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t("catalog.collection")}</p>
        <h1 className="mt-3 font-serif text-4xl text-balance md:text-5xl">{t("catalog.title")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal-soft md:text-base">
          {t("catalog.description")}
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("catalog.search")}</label>
            <div className="mt-3 flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3">
              <Search className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("catalog.searchPlaceholder")}
                className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-soft/70"
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("catalog.category")}</p>
            <div className="mt-3 flex flex-col gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  type="button"
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    category === c ? "bg-primary/30 text-foreground" : "text-charcoal-soft hover:bg-cream-deep"
                  }`}
                >
                  <span>{c === "All" ? t("catalog.allCollections") : t(`category.${c}` as DictKey)}</span>
                  <span className="text-xs text-charcoal-soft/70">
                    {c === "All" ? products.length : products.filter((p) => p.category === c).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("catalog.maxPrice")}</p>
            <input
              type="range"
              min={500_000}
              max={15_000_000}
              step={100_000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-4 w-full accent-[var(--peach)]"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-charcoal-soft">
              <span>500,000₫</span>
              <span className="font-medium text-foreground">{t("catalog.upTo", { price: formatVND(maxPrice) })}</span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("catalog.dateAvailability")}</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-charcoal-soft">{t("catalog.allBookable")}</p>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <p className="text-sm text-charcoal-soft">
              <span className="font-medium text-foreground">{filtered.length}</span> {t("catalog.pieces")}
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-[0.18em] text-charcoal-soft">{t("catalog.sort")}</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="featured">{t("catalog.sortFeatured")}</option>
                <option value="low">{t("catalog.sortLow")}</option>
                <option value="high">{t("catalog.sortHigh")}</option>
              </select>
            </div>
          </div>

          {!hydrated || loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCard.Skeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-20 text-center text-sm text-charcoal-soft">
              {t("catalog.empty")}
            </div>
          ) : (
            <div key={lang} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper available if needed
export { localizeProduct }
