import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  cta = "View all",
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  cta?: string
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{eyebrow}</p>}
        <h2 className="mt-3 font-serif text-3xl leading-tight text-balance md:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-charcoal-soft md:text-base">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm text-tan-deep underline-offset-4 hover:underline"
        >
          {cta}
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  )
}
