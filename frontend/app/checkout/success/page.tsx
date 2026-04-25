import Link from "next/link"
import { Check } from "lucide-react"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const sp = await searchParams
  const order = sp.order || "ML-2400"

  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <section className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/30">
          <Check className="h-6 w-6 text-tan-deep" strokeWidth={1.6} />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.28em] text-tan-deep">Confirmed</p>
        <h1 className="mt-3 font-serif text-4xl text-balance md:text-5xl">Your moment is reserved.</h1>
        <p className="mt-4 leading-relaxed text-charcoal-soft">
          Thank you. We&apos;ve received your deposit and your booking <span className="font-medium text-foreground">{order}</span> is now in our atelier&apos;s diary. A stylist will be in touch within one business day to arrange your fitting.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-tan"
          >
            Return home
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-cream-deep"
          >
            Continue browsing
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
