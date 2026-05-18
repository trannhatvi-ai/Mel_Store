"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, Copy, MessageSquare } from "lucide-react"
import { type Product, formatVND, localizeProduct } from "@/lib/data"
import { useLang, useT, type DictKey } from "@/lib/i18n"
import { useStudioProfile } from "@/lib/studio-profile"

type Step = 0 | 1 | 2

function diffDays(start: string, end: string) {
  if (!start || !end) return 1
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 1
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
}

export function CheckoutFlow({
  product,
  initialQty,
  initialStart,
  initialEnd,
}: {
  product: Product
  initialQty: number
  initialStart: string
  initialEnd: string
}) {
  const t = useT()
  const { lang } = useLang()
  const p = localizeProduct(product, lang)
  const profile = useStudioProfile()

  const [step, setStep] = useState<Step>(0)
  const [info, setInfo] = useState({ name: "", email: "", phone: "", note: "" })
  const [copied, setCopied] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<{ id: string; order_number: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [fileBase64, setFileBase64] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  const isRental = !!p.pricePerDay
  const days = isRental ? diffDays(initialStart, initialEnd) : 1
  const subtotal = p.price * (isRental ? days : 1) * initialQty
  const deposit = Math.round(subtotal * 0.2)
  const remaining = subtotal - deposit

  const stepLabels = [t("checkout.step1"), t("checkout.step2"), t("checkout.step3")]

  const orderId = createdOrder?.order_number || "ML-XXXX"

  // VietQR — Vietcombank BIN 970436, demo account
  const qrUrl = useMemo(() => {
    const params = new URLSearchParams({
      amount: String(deposit),
      addInfo: `${orderId} ${profile.name} deposit`,
      accountName: profile.bank_beneficiary,
    })
    return `https://img.vietqr.io/image/970436-${profile.bank_account.replace(/\s+/g, "")}-compact2.png?${params.toString()}`
  }, [deposit, orderId, profile.bank_account, profile.bank_beneficiary, profile.name])

  const canNextFromInfo = info.name.trim() && /\S+@\S+\.\S+/.test(info.email) && info.phone.trim().length >= 8

  async function handleNext() {
    if (step === 1 && !createdOrder) {
      setCreating(true)
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: info.name,
            email: info.email,
            phone: info.phone,
            total: subtotal,
            deposit: deposit,
            event_date: initialStart || new Date().toISOString(),
            notes: info.note,
            items: [{
              product_id: p.id,
              qty: initialQty,
              price: p.price,
              days: isRental ? days : undefined
            }]
          })
        })
        if (!res.ok) throw new Error("Order creation failed")
        const data = await res.json()
        setCreatedOrder(data)
        setStep(2)
      } catch (err) {
        alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.")
      } finally {
        setCreating(false)
      }
    } else {
      setStep((s) => Math.min(2, s + 1) as Step)
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const r = new FileReader()
      r.onload = () => setFileBase64(r.result as string)
      r.readAsDataURL(file)
    }
  }

  async function finishPayment() {
    if (!fileBase64 || !createdOrder) return
    setUploading(true)
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/proof`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: fileBase64 })
      })
      if (!res.ok) throw new Error("Upload failed")
      window.location.href = `/checkout/success?order=${orderId}`
    } catch (err) {
      alert("Có lỗi khi lưu ảnh chứng từ. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      {/* Steps */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-tan-deep">{t("checkout.eyebrow")}</p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl">{t("checkout.title")}</h1>

        <div className="mt-8 flex items-center gap-3">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-foreground"
                      : "border-border text-charcoal-soft"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
              </div>
              <span className={`hidden text-sm md:inline ${i === step ? "text-foreground" : "text-charcoal-soft"}`}>
                {label}
              </span>
              {i < stepLabels.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border bg-card p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl">{t("checkout.detailsTitle")}</h2>
                <p className="mt-1 text-sm text-charcoal-soft">{t("checkout.detailsDescription")}</p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <Field label={t("checkout.fullName")}>
                    <input
                      value={info.name}
                      onChange={(e) => setInfo({ ...info, name: e.target.value })}
                      className="input"
                      placeholder="Linh Nguyễn"
                    />
                  </Field>
                  <Field label={t("checkout.phone")}>
                    <input
                      value={info.phone}
                      onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                      className="input"
                      placeholder="+84 901 234 567"
                    />
                  </Field>
                  <Field label={t("checkout.email")} className="md:col-span-2">
                    <input
                      type="email"
                      value={info.email}
                      onChange={(e) => setInfo({ ...info, email: e.target.value })}
                      className="input"
                      placeholder="you@email.com"
                    />
                  </Field>
                  <Field label={t("checkout.notes")} className="md:col-span-2">
                    <textarea
                      value={info.note}
                      onChange={(e) => setInfo({ ...info, note: e.target.value })}
                      rows={3}
                      className="input resize-none"
                      placeholder={t("checkout.notesPlaceholder")}
                    />
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border bg-card p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl">{t("checkout.reviewTitle")}</h2>
                <p className="mt-1 text-sm text-charcoal-soft">{t("checkout.reviewDescription")}</p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <ReviewBlock label={t("checkout.customer")}>
                    <p className="text-sm">{info.name || "—"}</p>
                    <p className="text-xs text-charcoal-soft">{info.email}</p>
                    <p className="text-xs text-charcoal-soft">{info.phone}</p>
                  </ReviewBlock>
                  <ReviewBlock label={isRental ? t("checkout.rentalDates") : t("checkout.eventDate")}>
                    {isRental ? (
                      <p className="text-sm">
                        {initialStart || "—"} <span className="text-charcoal-soft">→</span> {initialEnd || "—"}
                      </p>
                    ) : (
                      <p className="text-sm">{initialStart || "TBD"}</p>
                    )}
                    <p className="text-xs text-charcoal-soft">
                      {t("product.quantity")}: {initialQty}
                    </p>
                  </ReviewBlock>
                  {info.note && (
                    <ReviewBlock label={t("checkout.notesLabel")} className="md:col-span-2">
                      <p className="text-sm leading-relaxed">{info.note}</p>
                    </ReviewBlock>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border bg-card p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl">{t("checkout.payTitle")}</h2>
                <p className="mt-1 text-sm text-charcoal-soft">{t("checkout.payDescription")}</p>

                <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">
                  <div className="rounded-lg border border-border bg-cream-deep/40 p-4">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                      <Image
                        src={qrUrl || "/placeholder.svg"}
                        alt={t("checkout.qrAlt", { amount: formatVND(deposit) })}
                        fill
                        unoptimized
                        sizes="260px"
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="mt-3 text-center text-[11px] text-charcoal-soft">{t("checkout.poweredBy")}</p>
                  </div>

                  <div className="space-y-4 text-sm">
                    <Row
                      label={t("checkout.orderId")}
                      value={orderId}
                      copy
                      onCopy={() => copyText(orderId, setCopied)}
                      copied={copied}
                      copyLabel={t("checkout.copyAria")}
                    />
                    <Row label={t("checkout.beneficiary")} value={profile.bank_beneficiary} />
                    <Row label={t("checkout.bank")} value={`${profile.bank_name} · ${profile.bank_account}`} />
                    <Row label={t("checkout.amount")} value={formatVND(deposit)} />
                    <Row label={t("checkout.memo")} value={`${orderId} ${profile.name} deposit`} />

                    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-charcoal-soft">Tải lên biên lai chuyển khoản (bắt buộc)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFile}
                          className="block w-full text-sm text-charcoal-soft file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {fileBase64 && (
                          <div className="mt-2 h-24 w-16 relative overflow-hidden rounded border border-border">
                            <Image src={fileBase64} alt="Proof preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={finishPayment}
                        disabled={!fileBase64 || uploading}
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-tan disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? "Đang xử lý..." : "Hoàn thành cọc"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-cream-deep"
                      >
                        <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                        {t("checkout.contactStylist")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => (Math.max(0, s - 1) as Step))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-sm text-charcoal-soft disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              {t("checkout.back")}
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 0 && !canNextFromInfo) || creating}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-tan disabled:cursor-not-allowed disabled:bg-primary/40"
              >
                {creating ? "Đang xử lý..." : t("checkout.continue")}
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("checkout.yourBooking")}</p>
            <div className="mt-5 flex gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                <Image src={p.image || "/placeholder.svg"} alt={p.name} fill sizes="80px" className="object-cover" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-charcoal-soft">
                  {t(`category.${p.category}` as DictKey)}
                </p>
                <p className="mt-1 font-serif text-lg leading-tight">{p.name}</p>
                <p className="mt-1 text-xs text-charcoal-soft">
                  {isRental
                    ? `${t("checkout.daysSuffix", { n: days, plural: days > 1 && lang === "en" ? "s" : "" })} · ${t(
                        "checkout.qty",
                      )} ${initialQty}`
                    : `${t("card.package")} · ${t("checkout.qty")} ${initialQty}`}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-soft">{t("checkout.subtotal")}</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-soft">{t("checkout.depositLabel")}</span>
                <span className="font-medium text-tan-deep">{formatVND(deposit)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>{t("checkout.remainingAtEvent")}</span>
                <span>{formatVND(remaining)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3">
                <span className="font-medium">{t("checkout.payToday")}</span>
                <span className="font-serif text-lg">{formatVND(deposit)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-charcoal-soft">{label}</span>
      {children}
    </label>
  )
}

function ReviewBlock({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-md border border-border bg-cream-deep/40 p-4 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-tan-deep">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  copy,
  onCopy,
  copied,
  copyLabel,
}: {
  label: string
  value: string
  copy?: boolean
  onCopy?: () => void
  copied?: boolean
  copyLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
      <span className="text-charcoal-soft">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        {value}
        {copy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label={copyLabel}
            className="rounded-full p-1 text-charcoal-soft hover:bg-cream-deep"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
        )}
      </span>
    </div>
  )
}

function copyText(text: string, set: (v: boolean) => void) {
  if (typeof navigator === "undefined") return
  navigator.clipboard?.writeText(text).then(() => {
    set(true)
    setTimeout(() => set(false), 1400)
  })
}
