import type { OrderStatus } from "@/lib/data"

const styles: Record<OrderStatus, string> = {
  AWAITING_DEPOSIT: "bg-peach-soft/40 text-tan-deep border-peach/40",
  PAID: "bg-primary/30 text-tan-deep border-primary/40",
  SERVICE_ONGOING: "bg-tan/25 text-tan-deep border-tan/40",
  COMPLETED: "bg-cream-deep text-charcoal-soft border-border",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

const labels: Record<OrderStatus, string> = {
  AWAITING_DEPOSIT: "Chờ cọc",
  PAID: "Đã cọc",
  SERVICE_ONGOING: "Đang thực hiện",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  )
}
