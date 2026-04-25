import { OrdersTable } from "@/components/orders-table"

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Đơn hàng</p>
        <h1 className="mt-2 font-serif text-3xl">Đặt lịch & thuê đồ</h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          Lọc theo trạng thái, tìm theo khách hàng hoặc mã đơn, mở chi tiết từng booking ngay.
        </p>
      </header>
      <OrdersTable />
    </div>
  )
}
