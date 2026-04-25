"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Upload, X, ChevronDown, Pencil, Trash } from "lucide-react"
import { formatVND, type Category, type Product } from "@/lib/data"
import { useLang, useT } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SortKey = "name" | "price" | "category"

type InventoryProduct = Product & {
  price_per_day?: boolean
}

type ProductFormState = {
  id?: string
  slug: string
  name: string
  category: Category
  price: string
  description: string
  available: boolean
  pricePerDay: boolean
  image: string
}

const emptyForm: ProductFormState = {
  slug: "",
  name: "",
  category: "Dress",
  price: "",
  description: "",
  available: true,
  pricePerDay: false,
  image: "",
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function InventoryTable() {
  const t = useT()
  const { lang } = useLang()
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"All" | Category>("All")
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "name", desc: false })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryProduct | null>(null)
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  const fetchProducts = async () => {
    setFetching(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/products`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      } else {
        console.error("Backend error:", res.status)
      }
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    void fetchProducts()
  }, [])

  const list = useMemo(() => {
    let l = products.slice()
    if (filter !== "All") l = l.filter((p) => p.category === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      l = l.filter((p) => p.name.en.toLowerCase().includes(q) || p.name.vi.toLowerCase().includes(q))
    }
    l.sort((a, b) => {
      let r = 0
      if (sort.key === "price") r = a.price - b.price
      else if (sort.key === "category") r = a.category.localeCompare(b.category)
      else r = a.name.en.localeCompare(b.name.en)
      return sort.desc ? -r : r
    })
    return l
  }, [query, filter, sort, products])

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: false }))
  }

  function openCreateModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEditModal(product: InventoryProduct) {
    const description = (product.description?.[lang] ?? product.description?.en ?? "") as string
    setEditingProduct(product)
    setForm({
      id: product.id,
      slug: product.slug,
      name: (product.name?.[lang] ?? product.name?.en ?? "") as string,
      category: product.category,
      price: String(product.price),
      description,
      available: product.available,
      pricePerDay: Boolean(product.pricePerDay ?? product.price_per_day),
      image: product.image ?? "",
    })
    setOpen(true)
  }

  async function handleFileSelect(file: File) {
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
    setForm((prev) => ({ ...prev, image: dataUrl }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      toast({
        title: "Missing product name",
        description: "Please enter a product name before saving.",
        variant: "destructive",
      })
      return
    }

    const parsedPrice = Number(form.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Price must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      id: form.id,
      slug: form.slug || toSlug(name),
      name: { en: name, vi: name },
      category: form.category,
      price: Math.round(parsedPrice),
      price_per_day: form.pricePerDay,
      image: form.image || "/images/placeholder.jpg",
      gallery: form.image ? [form.image] : ["/images/placeholder.jpg"],
      description: { en: form.description, vi: form.description },
      details: editingProduct?.details ?? { en: [], vi: [] },
      available: form.available,
      trending: editingProduct?.trending ?? false,
      discount: editingProduct?.discount ?? 0,
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let message = "Failed to save product"
        try {
          const body = await res.json()
          if (body?.detail) message = body.detail
        } catch {
          // Ignore non-JSON response.
        }
        toast({
          title: "Save failed",
          description: message,
          variant: "destructive",
        })
        return
      }

      setOpen(false)
      setEditingProduct(null)
      setForm(emptyForm)
      await fetchProducts()
      toast({
        title: editingProduct ? "Product updated" : "Product created",
        description: editingProduct
          ? "Inventory item has been updated successfully."
          : "New inventory item has been added successfully.",
      })
    } catch (err) {
      console.error("Save failed:", err)
      toast({
        title: "Connection error",
        description: "Cannot connect to backend. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget.id)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/products/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        let message = "Delete failed"
        try {
          const payload = await res.json()
          if (payload?.detail) message = payload.detail
        } catch {
          // Ignore non-JSON error payload.
        }
        toast({
          title: "Delete failed",
          description: message,
          variant: "destructive",
        })
        return
      }
      await fetchProducts()
      toast({
        title: "Product deleted",
        description: "Inventory item has been deleted.",
      })
      setDeleteTarget(null)
    } catch (err) {
      console.error("Delete failed:", err)
      toast({
        title: "Connection error",
        description: "Cannot connect to backend. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 md:max-w-xs">
          <Search className="h-4 w-4 text-charcoal-soft" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inventory.searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-soft/70"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | Category)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        >
          <option value="All">{t("inventory.filterAll")}</option>
          <option value="Dress">{t("category.Dress")}</option>
          <option value="Suit">{t("category.Suit")}</option>
          <option value="Package">{t("category.Package")}</option>
        </select>
        <button
          type="button"
          onClick={openCreateModal}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan"
        >
          <Plus className="h-4 w-4" strokeWidth={1.6} />
          {t("inventory.addPiece")}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream-deep/40 text-left text-xs uppercase tracking-[0.16em] text-charcoal-soft">
              <tr>
                <th className="px-4 py-3 font-medium">{t("inventory.colPiece")}</th>
                <th
                  className="cursor-pointer px-4 py-3 font-medium"
                  onClick={() => toggleSort("category")}
                >
                  <span className="inline-flex items-center gap-1">
                    {t("inventory.colCategory")}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        sort.key === "category" && sort.desc ? "rotate-180" : ""
                      }`}
                      strokeWidth={1.5}
                    />
                  </span>
                </th>
                <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("price")}>
                  <span className="inline-flex items-center gap-1">
                    {t("inventory.colPrice")}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${sort.key === "price" && sort.desc ? "rotate-180" : ""}`}
                      strokeWidth={1.5}
                    />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">{t("inventory.colAvailability")}</th>
                <th className="px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-10 shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-4 w-12" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-charcoal-soft">
                    Không tìm thấy sản phẩm.
                  </td>
                </tr>
              ) : (
                list.map((p) => {
                  const localizedName = p.name[lang] ?? p.name.en
                  return (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-cream-deep/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                            <Image src={p.image || "/placeholder.svg"} alt={localizedName} fill sizes="40px" className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{localizedName}</p>
                            <p className="text-xs text-charcoal-soft">{t("inventory.skuPrefix")} · {p.id.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal-soft">{t(`category.${p.category}` as const)}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatVND(p.price)}
                        {Boolean(p.pricePerDay ?? p.price_per_day) && (
                          <span className="text-xs text-charcoal-soft"> {t("inventory.perDayShort")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                            p.available
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {p.available ? t("inventory.available") : t("inventory.booked")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="mr-2 text-primary hover:text-tan-deep"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => setDeleteTarget(p)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-background"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">{t("inventory.modal.eyebrow")}</p>
                  <h2 className="mt-1 font-serif text-2xl">
                    {editingProduct ? "Sửa sản phẩm" : t("inventory.modal.title")}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setOpen(false)
                    setEditingProduct(null)
                  }}
                  className="rounded-full p-1 text-charcoal-soft hover:bg-cream-deep"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-6 py-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                    <span className="text-charcoal-soft">{t("inventory.modal.pieceName")}</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="input"
                      placeholder={t("inventory.modal.pieceNamePlaceholder")}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">{t("inventory.modal.category")}</span>
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as Category }))}
                      className="input"
                    >
                      <option value="Dress">{t("category.Dress")}</option>
                      <option value="Suit">{t("category.Suit")}</option>
                      <option value="Package">{t("category.Package")}</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">{t("inventory.modal.priceVnd")}</span>
                    <input
                      name="price"
                      type="number"
                      min={1}
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      required
                      className="input"
                      placeholder={t("inventory.modal.pricePlaceholder")}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                    <span className="text-charcoal-soft">{t("inventory.modal.description")}</span>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="input resize-none"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.pricePerDay}
                      onChange={(e) => setForm((prev) => ({ ...prev, pricePerDay: e.target.checked }))}
                    />
                    <span className="text-charcoal-soft">{t("inventory.perDayShort")}</span>
                  </label>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm text-charcoal-soft">{t("inventory.modal.photos")}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          await handleFileSelect(file)
                        } catch (err) {
                          console.error("Image selection failed:", err)
                          toast({
                            title: "Cannot read image",
                            description: "Please choose a different image file.",
                            variant: "destructive",
                          })
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-cream-deep/40 text-sm text-charcoal-soft hover:border-primary"
                    >
                      <Upload className="h-5 w-5" strokeWidth={1.5} />
                      {form.image ? "Đổi ảnh" : t("inventory.modal.dropFiles")}
                    </button>
                    {form.image ? (
                      <div className="relative h-36 w-28 overflow-hidden rounded-md border border-border bg-cream-deep">
                        <Image src={form.image} alt="Preview" fill unoptimized sizes="112px" className="object-cover" />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setEditingProduct(null)
                    }}
                    className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-cream-deep"
                  >
                    {t("inventory.modal.cancel")}
                  </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : editingProduct ? "Cập nhật" : t("inventory.modal.save")}
                </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Hành động này sẽ xóa vĩnh viễn ${deleteTarget.name?.[lang] ?? deleteTarget.name?.en ?? "sản phẩm này"}.`
                : "Hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(deletingId)}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
              className="bg-rust text-white hover:bg-rust/90"
            >
              {deletingId ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
