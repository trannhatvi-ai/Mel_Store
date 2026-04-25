"use client"

import { Globe } from "lucide-react"
import { useLang } from "@/lib/i18n"

type Variant = "light" | "dark"

export function LanguageToggle({
  variant = "dark",
  className = "",
}: {
  variant?: Variant
  className?: string
}) {
  const { lang, setLang, t } = useLang()

  const base =
    variant === "dark"
      ? "border-border/70 bg-card text-charcoal-soft hover:border-primary"
      : "border-cream/40 bg-cream/10 text-cream hover:bg-cream/20"

  const activeStyle =
    variant === "dark"
      ? "bg-primary text-primary-foreground"
      : "bg-cream text-charcoal"

  const inactiveStyle = variant === "dark" ? "text-charcoal-soft" : "text-cream/80"

  return (
    <div
      role="group"
      aria-label={t("lang.toggleAria")}
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${base} ${className}`}
    >
      <Globe
        className={`ml-1.5 h-3.5 w-3.5 ${variant === "dark" ? "text-tan-deep" : "text-cream/80"}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label={t("lang.english")}
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-[0.16em] transition-colors ${
          lang === "en" ? activeStyle : inactiveStyle
        }`}
      >
        {t("lang.short.en")}
      </button>
      <button
        type="button"
        onClick={() => setLang("vi")}
        aria-pressed={lang === "vi"}
        aria-label={t("lang.vietnamese")}
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-[0.16em] transition-colors ${
          lang === "vi" ? activeStyle : inactiveStyle
        }`}
      >
        {t("lang.short.vi")}
      </button>
    </div>
  )
}
