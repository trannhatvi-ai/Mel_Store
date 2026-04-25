"use client"

import Link from "next/link"
import { Instagram, Mail, Phone, Facebook } from "lucide-react"
import { useT } from "@/lib/i18n"
import { useStudioProfile } from "@/lib/studio-profile"

export function SiteFooter() {
  const t = useT()
  const profile = useStudioProfile()
  return (
    <footer className="mt-24 border-t border-border/60 bg-cream-deep/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl text-foreground">{profile.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-charcoal-soft">{t("footer.tagline")}</p>
          <div className="mt-6 flex items-center gap-4">
            {profile.facebook_link && (
              <a
                href={profile.facebook_link}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal-soft transition-colors hover:border-primary hover:text-foreground"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )}
            {profile.instagram_link && (
              <a
                href={profile.instagram_link}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal-soft transition-colors hover:border-primary hover:text-foreground"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )}
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal-soft transition-colors hover:border-primary hover:text-foreground"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href="tel:+84901234567"
              aria-label="Phone"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal-soft transition-colors hover:border-primary hover:text-foreground"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-tan-deep">{t("footer.atelier")}</p>
          <ul className="mt-4 space-y-2 text-sm text-charcoal-soft">
            <li>
              <Link href="/catalog?category=Dress" className="hover:text-foreground">
                {t("footer.dresses")}
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=Suit" className="hover:text-foreground">
                {t("footer.suits")}
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=Package" className="hover:text-foreground">
                {t("footer.photography")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-tan-deep">{t("footer.studio")}</p>
          <ul className="mt-4 space-y-2 text-sm text-charcoal-soft">
            <li>{profile.address}</li>
            <li>{t("footer.hours")}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-charcoal-soft md:flex-row md:px-6">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.designed")}</p>
        </div>
      </div>
    </footer>
  )
}
