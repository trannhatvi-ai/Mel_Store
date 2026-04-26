"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, Eye, X, Phone, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type Order, type OrderStatus, formatVND } from "@/lib/data"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

const statusFilters: ("All" | OrderStatus)[] = [
  "All",
  "AWAITING_DEPOSIT",
  "PAID",
  "SERVICE_ONGOING",
  "COMPLETED",
  "CANCELLED",
]

const statusLabel: Record<"All" | OrderStatus, string> = {
  All: "Tất cả",
  AWAITING_DEPOSIT: "Chờ cọc",
  PAID: "Đã cọc",
  SERVICE_ONGOING: "Đang thực hiện",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
}

export function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState<"All" | OrderStatus>("All")
  const [query, setQuery] = useState("")
  const [sortDesc, setSortDesc] = useState(true)
  const [active, setActive] = useState<any | null>(null)
  const [fetching, setFetching] = useState(true)
  const [submittingAction, setSubmittingAction] = useState<"paid" | "reminder" | null>(null)

  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    setFetching(true)
    fetch(`${apiBaseUrl}/api/admin/orders`)
      .then(res => res.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  async function handleStatusChange(newStatus: string) {
    if (!active || active.status === newStatus) return
    setSubmittingAction("status")
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/orders/${active.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.detail || "Cập nhật trạng thái thất bại")
      }
      const updated = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setActive(updated)
      toast({ title: "Đã cập nhật", description: `Đơn ${updated.id} đã chuyển sang ${statusLabel[updated.status as OrderStatus]}.` })
    } catch (err) {
      toast({
        title: "Không thể cập nhật",
        description: err instanceof Error ? err.message : "Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmittingAction(null)
    }
  }

  async function handleSendReminder() {
    if (!active) return
    setSubmittingAction("reminder")
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/orders/${active.id}/send-reminder`, {
        method: "POST",
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.detail || "Gửi nhắc nhở thất bại")
      }
      toast({
        title: "Đã gửi nhắc nhở",
        description: `Đã gửi yêu cầu nhắc đơn ${active.id} cho bộ phận hỗ trợ.`,
      })
    } catch (err) {
      toast({
        title: "Không thể gửi nhắc nhở",
        description: err instanceof Error ? err.message : "Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmittingAction(null)
    }
  }

  const list = useMemo(() => {
    let l = orders.slice()
    if (filter !== "All") l = l.filter((o) => o.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      l = l.filter((o) => o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
    }
    l.sort((a, b) => (sortDesc ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)))
    return l
  }, [filter, query, sortDesc, orders])

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 md:max-w-xs">
          <Search className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo khách hàng hoặc mã đơn..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-soft/70"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-charcoal-soft hover:bg-cream-deep"
              }`}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream-deep/40 text-left text-xs uppercase tracking-[0.16em] text-charcoal-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Đơn hàng</th>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th
                  className="cursor-pointer select-none px-4 py-3 font-medium"
                  onClick={() => setSortDesc((s) => !s)}
                >
                  <span className="inline-flex items-center gap-1">
                    Ngày
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${sortDesc ? "" : "rotate-180"}`}
                      strokeWidth={1.5}
                    />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Tổng tiền</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-charcoal-soft">
                    Không có đơn phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                list.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-cream-deep/30">
                    <td className="px-4 py-4 font-medium">{o.id}</td>
                    <td className="px-4 py-4">
                      <p>{o.customer}</p>
                      <p className="text-xs text-charcoal-soft">{o.email}</p>
                    </td>
                    <td className="px-4 py-4 text-charcoal-soft">
                      {o.items[0]?.name || "N/A"}
                      {o.items.length > 1 && <span className="text-tan-deep"> +{o.items.length - 1}</span>}
                    </td>
                    <td className="px-4 py-4 text-charcoal-soft">{o.event_date}</td>
                    <td className="px-4 py-4 tabular-nums">{formatVND(o.total)}</td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setActive(o)}
                        aria-label={`Xem ${o.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-charcoal-soft hover:bg-cream-deep"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chi tiet don */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-background"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Đơn hàng</p>
                  <h2 className="font-serif text-xl">{active.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Dong"
                  className="rounded-full p-1 text-charcoal-soft hover:bg-cream-deep"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 space-y-6 px-6 py-6">
                <section>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tan-deep">Khách hàng</p>
                  <p className="mt-2 font-serif text-lg">{active.customer}</p>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-charcoal-soft">
                    <a href={`mailto:${active.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                      {active.email}
                    </a>
                    <a href={`tel:${active.phone}`} className="inline-flex items-center gap-2 hover:text-foreground">
                      <Phone className="h-4 w-4" strokeWidth={1.5} />
                      {active.phone}
                    </a>
                  </div>
                </section>

                <section>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tan-deep">Sản phẩm</p>
                  <ul className="mt-3 space-y-3">
                    {active.items.map((it: any, idx: number) => (
                      <li
                        key={it.product_id || idx}
                        className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{it.name}</p>
                          <p className="text-xs text-charcoal-soft">
                            SL {it.qty}
                            {it.days ? ` · ${it.days} ngày` : ""}
                          </p>
                        </div>
                        <p className="text-sm tabular-nums">{formatVND(it.price * (it.days || 1) * it.qty)}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border border-border bg-card p-4 text-sm">
                  <Row label="Ngày diễn ra" value={active.event_date} />
                  <Row label="Mã đơn" value={active.order_number} />
                  <Row label="Trạng thái" value={<OrderStatusBadge status={active.status} />} />
                  {active.payment_proof && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-tan-deep">Biên lai chuyển khoản</p>
                      <div className="relative h-48 w-32 overflow-hidden rounded border border-border">
                        <img src={active.payment_proof} alt="Payment Proof" className="object-cover h-full w-full" />
                      </div>
                    </div>
                  )}
                  <div className="my-3 border-t border-border" />
                  <Row label="Tổng" value={formatVND(active.total)} />
                  <Row label="Cọc" value={formatVND(active.deposit)} highlight />
                  <Row label="Còn lại" value={formatVND(active.total - active.deposit)} />
                </section>

                <div className="flex flex-col gap-2 pb-4">
                  <div className="flex flex-col gap-1.5 mb-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-charcoal-soft">Chỉnh sửa trạng thái</label>
                    <select
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                      value={active.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={submittingAction === "status"}
                    >
                      <option value="AWAITING_DEPOSIT">Chờ cọc</option>
                      <option value="PAID">Đã cọc</option>
                      <option value="SERVICE_ONGOING">Đang thực hiện</option>
                      <option value="COMPLETED">Hoàn tất</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <button
                    onClick={() => void handleSendReminder()}
                    disabled={submittingAction !== null}
                    className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-cream-deep disabled:opacity-50"
                  >
                    {submittingAction === "reminder" ? "Đang gửi..." : "Gửi nhắc nhở"}
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-charcoal-soft">{label}</span>
      <span className={highlight ? "font-medium text-tan-deep" : "font-medium"}>{value}</span>
    </div>
  )
}
