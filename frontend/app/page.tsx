"use client"

import Image from "next/image"
import Link from "next/link"
import { Camera, Heart, Sparkles, ShieldCheck } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { HeroSlider } from "@/components/hero-slider"
import { ProductCard } from "@/components/product-card"
import { SectionHeading } from "@/components/section-heading"
import { localizeProduct } from "@/lib/data"
import { useLang, useT } from "@/lib/i18n"
import { usePromotions } from "@/lib/promotions"
import { useProductsFromApi } from "@/lib/products-api"

export default function HomePage() {
  const t = useT()
  const { lang } = useLang()
  const { promotions, hydrated } = usePromotions()
  const { products, loading } = useProductsFromApi()

  const packages = products.filter((p) => p.category === "Package").slice(0, 3)

  // Discounted offers — derived live from the promotions store.
  const offers = products
    .filter((p) => (promotions[p.id]?.discount ?? 0) > 0)
    .sort((a, b) => (promotions[b.id]?.discount ?? 0) - (promotions[a.id]?.discount ?? 0))
    .slice(0, 4)

  // Trending excludes discounted ones to avoid duplication on the page.
  const trending = products
    .filter(
      (p) =>
        p.category !== "Package" &&
        promotions[p.id]?.trending &&
        !((promotions[p.id]?.discount ?? 0) > 0),
    )
    .slice(0, 4)

  // Fallback if promotions filter is too narrow (e.g. before hydration), keep four cards visible.
  const trendingDisplay =
    trending.length >= 4
      ? trending
      : products.filter((p) => p.category !== "Package").slice(0, 4)

  const values = [
    { icon: Camera, label: t("home.values.film") },
    { icon: Heart, label: t("home.values.curated") },
    { icon: Sparkles, label: t("home.values.handFinished") },
    { icon: ShieldCheck, label: t("home.values.deposit") },
  ]

  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <HeroSlider />

      {/* Marquee / values */}
      <section className="border-y border-border/60 bg-cream-deep/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-6">
          {values.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
                <Icon className="h-4 w-4 text-tan-deep" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-charcoal-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <SectionHeading
          eyebrow={t("home.packages.eyebrow")}
          title={t("home.packages.title")}
          description={t("home.packages.description")}
          href="/catalog?category=Package"
          cta={t("home.packages.cta")}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ProductCard.Skeleton key={`pkg-sk-${i}`} />)
            : packages.map((rawP, i) => {
            const p = localizeProduct(rawP, lang)
            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group relative overflow-hidden rounded-md border border-border/60"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-cream-deep">
                  <Image
                    src={p.image || "/placeholder.svg"}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-peach-soft">
                    {t("home.packages.label")} 0{i + 1}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight">{p.name}</h3>
                  <p className="mt-2 line-clamp-2 max-w-sm text-sm text-cream/80">{p.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Editorial split */}
      <section className="border-y border-border/60 bg-cream-deep/40">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md">
            <Image src="/images/hero-dress.jpg" alt="Vintage atelier" fill className="object-cover" sizes="50vw" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t("home.editorial.eyebrow")}</p>
            <h2 className="mt-4 whitespace-pre-line font-serif text-3xl leading-tight md:text-5xl">
              {t("home.editorial.title")}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-charcoal-soft">{t("home.editorial.description")}</p>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="font-serif text-3xl">120+</p>
                <p className="text-xs uppercase tracking-[0.18em] text-charcoal-soft">{t("home.editorial.couples")}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl">8</p>
                <p className="text-xs uppercase tracking-[0.18em] text-charcoal-soft">{t("home.editorial.years")}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl">60+</p>
                <p className="text-xs uppercase tracking-[0.18em] text-charcoal-soft">{t("home.editorial.heirloom")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special offers */}
      {offers.length > 0 && (
        <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-24">
          <div className="absolute inset-y-8 left-0 hidden w-1 rounded-full bg-rust md:block" aria-hidden="true" />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-rust">
                <span className="h-1.5 w-1.5 rounded-full bg-rust" />
                {t("home.offers.eyebrow")}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">{t("home.offers.title")}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-soft">
                {t("home.offers.description")}
              </p>
            </div>
            <Link
              href="/catalog?sale=1"
              className="inline-flex items-center gap-2 rounded-full border border-rust/40 px-5 py-2.5 text-sm text-rust transition-colors hover:bg-rust hover:text-cream"
            >
              {t("home.offers.cta")}
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {!hydrated || loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCard.Skeleton key={i} />
              ))
            ) : (
              offers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Trending rentals */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <SectionHeading
          eyebrow={t("home.trending.eyebrow")}
          title={t("home.trending.title")}
          description={t("home.trending.description")}
          href="/catalog?category=Dress"
          cta={t("home.trending.cta")}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {!hydrated || loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCard.Skeleton key={i} />
            ))
          ) : (
            trendingDisplay.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-lg border border-border bg-card px-6 py-14 text-center md:px-12 md:py-20">
          <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t("home.cta.eyebrow")}</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-balance md:text-5xl">
            {t("home.cta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal-soft md:text-base">
            {t("home.cta.description")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-tan"
            >
              {t("home.cta.browse")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
            >
              {t("home.cta.consultation")}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
