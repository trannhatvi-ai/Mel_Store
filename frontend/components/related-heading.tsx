"use client"

import { useT } from "@/lib/i18n"

export function RelatedHeading() {
  const t = useT()
  return (
    <div className="mb-10 flex items-end justify-between">
      <h2 className="font-serif text-3xl">{t("product.relatedTitle")}</h2>
    </div>
  )
}
