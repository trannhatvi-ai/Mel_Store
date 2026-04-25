import { InventoryTable } from "@/components/inventory-table"
import { CategoriesTable } from "@/components/categories-table"

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Kho hàng & Danh mục</p>
        <h1 className="mt-2 font-serif text-3xl">Bộ sưu tập studio</h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          Quản lý toàn bộ váy cưới, vest và gói chụp ảnh của studio.
        </p>
      </header>
      <CategoriesTable />
      <div className="mt-12">
        <h2 className="mb-4 font-serif text-2xl">Sản phẩm</h2>
        <InventoryTable />
      </div>
    </div>
  )
}
