"use client"

import { PromotionsTable } from "@/components/promotions-table"
import { useT } from "@/lib/i18n"

export default function AdminPromotionsPage() {
  const t = useT()
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t("promotions.eyebrow")}</p>
        <h1 className="mt-2 font-serif text-3xl">{t("promotions.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal-soft">{t("promotions.subtitle")}</p>
      </div>
      <PromotionsTable />
    </div>
  )
}
