"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Package, Sparkles, Settings, ArrowUpRight, Tag, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudioProfile } from "@/lib/studio-profile"

const links = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Kho hàng & Danh mục", icon: Package },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/ai", label: "AI & Chính sách", icon: Sparkles },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const profile = useStudioProfile()
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-6">
          <span className="font-serif text-lg">{profile.name}</span>
          <span className="rounded-full bg-primary/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-tan-deep">
            Quản trị
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/30 text-foreground"
                    : "text-charcoal-soft hover:bg-cream-deep hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/60 p-4">
          <Link
            href="/"
            className="flex items-center justify-between rounded-md border border-border bg-cream-deep/40 px-3 py-2 text-sm text-charcoal-soft hover:bg-cream-deep"
          >
            Xem trang bán hàng
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
