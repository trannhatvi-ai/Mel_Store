"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useT, type DictKey } from "@/lib/i18n"

const slideMeta = [
  { src: "/images/hero-bride.jpg", alt: "Bride in vintage lace gown", k: "slide1" },
  { src: "/images/hero-couple.jpg", alt: "Couple in golden hour field", k: "slide2" },
  { src: "/images/hero-dress.jpg", alt: "Vintage wedding dress in light", k: "slide3" },
] as const

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const t = useT()

  useEffect(() => {
    const tm = setInterval(() => setIndex((i) => (i + 1) % slideMeta.length), 6000)
    return () => clearInterval(tm)
  }, [])

  const slide = slideMeta[index]
  const eyebrow = t(`hero.${slide.k}.eyebrow` as DictKey)
  const title = t(`hero.${slide.k}.title` as DictKey)
  const subtitle = t(`hero.${slide.k}.subtitle` as DictKey)

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src || "/placeholder.svg"}
            alt={slide.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 via-charcoal/30 to-charcoal/55" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 md:px-6 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.k}-${title}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-cream"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-peach-soft">{eyebrow}</p>
            <h1 className="mt-5 whitespace-pre-line font-serif text-4xl leading-[1.1] text-balance md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85 md:text-lg">{subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-tan"
              >
                {t("hero.bookNow")}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/catalog?category=Package"
                className="inline-flex items-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream/10"
              >
                {t("hero.explore")}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center gap-3">
          {slideMeta.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("hero.slideAria", { n: i + 1 })}
              onClick={() => setIndex(i)}
              className="group relative h-[2px] w-12 overflow-hidden bg-cream/30"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-cream transition-[width] duration-[6000ms] ease-linear ${
                  i === index ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
