"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, TrendingUp, ShoppingBag, CalendarCheck, Wallet, Users } from "lucide-react"
import { AdminChart } from "@/components/admin-chart"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { formatVND } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOverview() {
  const [orders, setOrders] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  const totalRevenue = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0)
  const newOrders = orders.filter((o) => o.status === "AWAITING_DEPOSIT" || o.status === "PAID").length
  const active = orders.filter((o) => o.status === "SERVICE_ONGOING" || o.status === "PAID").length
  const recent = orders.slice(0, 5)
  const avgValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Tổng quan</p>
          <h1 className="mt-2 font-serif text-3xl">Chào buổi sáng, Admin</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Tình hình hoạt động của studio hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/users" className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:bg-cream-deep">
            <Users className="h-4 w-4" /> Quản lý người dùng
          </Link>
          <select className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
            <option>30 ngày gần nhất</option>
            <option>90 ngày gần nhất</option>
            <option>Năm nay</option>
          </select>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Tổng doanh thu" value={formatVND(totalRevenue)} loading={fetching} />
        <StatCard icon={ShoppingBag} label="Đơn mới" value={String(newOrders)} loading={fetching} />
        <StatCard icon={CalendarCheck} label="Đơn đang xử lý" value={String(active)} loading={fetching} />
        <StatCard icon={TrendingUp} label="Giá trị đơn trung bình" value={formatVND(avgValue)} loading={fetching} />
      </section>

      {/* Chart + recent */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Xu hướng đặt lịch</p>
              <h2 className="mt-1 font-serif text-xl">Doanh thu & đơn hàng</h2>
            </div>
            <Link href="/admin/orders" className="text-xs text-tan-deep hover:underline">
              Xem báo cáo
            </Link>
          </div>
          <AdminChart />
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Đơn gần đây</p>
              <h2 className="mt-1 font-serif text-xl">Hoạt động mới nhất</h2>
            </div>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs text-tan-deep hover:underline">
              Tất cả đơn <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
          <ul className="divide-y divide-border/60">
            {fetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </li>
              ))
            ) : recent.length === 0 ? (
              <li className="py-4 text-center text-sm text-charcoal-soft">Không có đơn hàng nào</li>
            ) : (
              recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.customer}</p>
                    <p className="truncate text-xs text-charcoal-soft">
                      {o.id} · {o.items?.[0]?.name}
                      {o.items?.length > 1 && ` +${o.items.length - 1}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm tabular-nums">{formatVND(o.total)}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, loading }: { icon: any, label: string, value: string, loading: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/30">
          <Icon className="h-4 w-4 text-tan-deep" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.18em] text-charcoal-soft">{label}</p>
      {loading ? <Skeleton className="mt-2 h-8 w-24" /> : <p className="mt-1 font-serif text-2xl">{value}</p>}
    </div>
  )
}
