"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n"
import { LanguageToggle } from "@/components/language-toggle"
import { useStudioProfile } from "@/lib/studio-profile"
import { useAuth } from "@/lib/auth"

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const t = useT()
  const profile = useStudioProfile()
  const { session, logout } = useAuth()

  const links = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/catalog?category=Package", label: t("nav.photography") },
    { href: "/catalog?category=Dress", label: t("nav.dressesAndSuits") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.jpg" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-serif text-xl tracking-wide text-foreground">{profile.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-charcoal-soft transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden md:inline-flex" />
          <button
            type="button"
            aria-label={t("nav.search")}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-charcoal-soft transition-colors hover:bg-cream-deep md:inline-flex"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <Link
            href="/catalog"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-tan md:inline-flex"
          >
            {t("nav.bookNow")}
          </Link>
          {session ? (
            <div className="hidden md:flex items-center gap-4 border-l border-border pl-4">
              <span className="text-sm font-medium text-foreground">{session.name}</span>
              {(session.role === "admin" || session.role === "studio") && (
                <Link
                  href="/admin"
                  className="rounded-full bg-charcoal px-4 py-1.5 text-sm font-medium text-cream hover:bg-charcoal-soft"
                >
                  Quản trị
                </Link>
              )}
              <button
                onClick={logout}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep md:inline-flex"
            >
              Đăng nhập
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground md:hidden"
            aria-label={t("nav.menu")}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background md:hidden",
          open ? "max-h-96" : "max-h-0",
          "transition-[max-height] duration-300",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-charcoal-soft hover:bg-cream-deep hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 px-3">
            <div className="flex items-center justify-between">
              <LanguageToggle />
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {t("nav.bookNow")}
              </Link>
            </div>
            {session ? (
              <div className="flex flex-col gap-2 mt-2 rounded-md bg-cream-deep/40 px-3 py-3">
                <span className="text-sm font-medium">{session.name}</span>
                <div className="flex items-center justify-between">
                  {(session.role === "admin" || session.role === "studio") && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-md bg-charcoal px-3 py-1.5 text-xs font-medium text-cream hover:bg-charcoal-soft"
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-cream-deep"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 block w-full text-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-cream-deep"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
