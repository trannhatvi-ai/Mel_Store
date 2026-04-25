"use client"

import type React from "react"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, Search } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useLang } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setLang } = useLang()
  const { session, ready, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLang("vi")
  }, [setLang])

  useEffect(() => {
    if (!ready) return
    if (pathname === "/admin/login") return
    if (!session || session.role !== "admin") router.replace("/admin/login")
  }, [ready, router, session, pathname])

  if (!ready) return null
  
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!session || session.role !== "admin") return null

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-4 md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-background px-3">
              <Search className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
              <input
                type="search"
                placeholder="Tìm đơn hàng, sản phẩm, khách hàng..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-soft/70"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Thông báo"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal-soft hover:bg-cream-deep"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <Link href="/" className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 hover:bg-cream-deep">
              <Image src="/favicon.jpg" alt="Logo" width={28} height={28} className="rounded-full object-cover" />
              <div className="hidden text-right md:block">
                <p className="text-xs font-medium leading-tight">{session.name}</p>
                <p className="text-[10px] leading-tight text-charcoal-soft">{session.role === "admin" ? "Quản trị viên" : "Nhân sự studio"}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-border px-4 py-2 text-sm text-charcoal-soft hover:bg-cream-deep"
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  )
}
