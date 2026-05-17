import type { OrderStatus } from "@/lib/data"

const styles: Record<OrderStatus, string> = {
  "Awaiting Deposit": "bg-peach-soft/40 text-tan-deep border-peach/40",
  Paid: "bg-primary/30 text-tan-deep border-primary/40",
  "Service Ongoing": "bg-tan/25 text-tan-deep border-tan/40",
  Completed: "bg-cream-deep text-charcoal-soft border-border",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
