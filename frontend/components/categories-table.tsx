"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus, X, Check } from "lucide-react"

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!editForm || !editForm.id || !editForm.slug || !editForm.name.vi) return
    try {
      const isNew = isCreating
      const method = isNew ? "POST" : "PUT"
      const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${editForm.id}`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) throw new Error("Save failed")
      const saved = await res.json()
      if (isNew) {
        setCategories([...categories, saved])
      } else {
        setCategories(categories.map(c => c.id === saved.id ? saved : c))
      }
      setEditingId(null)
      setIsCreating(false)
    } catch (err) {
      alert("Lỗi khi lưu danh mục")
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Cannot delete")
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      alert("Không thể xóa danh mục đang được sử dụng")
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-serif text-lg">Danh mục</h2>
        <button
          onClick={() => {
            setIsCreating(true)
            setEditingId("new")
            setEditForm({ id: "", slug: "", name: { vi: "", en: "" } })
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-tan"
        >
          <Plus className="h-3.5 w-3.5" /> Thêm danh mục
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-deep/40 text-left text-xs uppercase tracking-[0.16em] text-charcoal-soft">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Tên (VI)</th>
              <th className="px-4 py-3 font-medium">Tên (EN)</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-charcoal-soft">Đang tải...</td></tr>
            ) : categories.length === 0 && !isCreating ? (
              <tr><td colSpan={5} className="p-4 text-center text-charcoal-soft">Chưa có danh mục nào.</td></tr>
            ) : null}
            
            {isCreating && editingId === "new" && editForm && (
              <tr className="border-b border-border/60 bg-cream-deep/20">
                <td className="px-4 py-2">
                  <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.id} onChange={e => setEditForm({...editForm, id: e.target.value.toUpperCase()})} placeholder="VD: DRESS" />
                </td>
                <td className="px-4 py-2">
                  <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value.toLowerCase()})} placeholder="VD: dress" />
                </td>
                <td className="px-4 py-2">
                  <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.name.vi} onChange={e => setEditForm({...editForm, name: {...editForm.name, vi: e.target.value}})} placeholder="VD: Váy cưới" />
                </td>
                <td className="px-4 py-2">
                  <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.name.en} onChange={e => setEditForm({...editForm, name: {...editForm.name, en: e.target.value}})} placeholder="VD: Wedding Dress" />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={handleSave} className="rounded p-1 text-emerald-600 hover:bg-cream-deep"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="rounded p-1 text-rust hover:bg-cream-deep"><X className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            )}

            {categories.map(c => {
              if (editingId === c.id && editForm) {
                return (
                  <tr key={c.id} className="border-b border-border/60 bg-cream-deep/20">
                    <td className="px-4 py-2 text-charcoal-soft">{c.id}</td>
                    <td className="px-4 py-2">
                      <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value.toLowerCase()})} />
                    </td>
                    <td className="px-4 py-2">
                      <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.name.vi} onChange={e => setEditForm({...editForm, name: {...editForm.name, vi: e.target.value}})} />
                    </td>
                    <td className="px-4 py-2">
                      <input className="w-full rounded border px-2 py-1 text-sm outline-none" value={editForm.name.en} onChange={e => setEditForm({...editForm, name: {...editForm.name, en: e.target.value}})} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleSave} className="rounded p-1 text-emerald-600 hover:bg-cream-deep"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingId(null)} className="rounded p-1 text-rust hover:bg-cream-deep"><X className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={c.id} className="border-b border-border/60 hover:bg-cream-deep/30">
                  <td className="px-4 py-3 font-medium">{c.id}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{c.slug}</td>
                  <td className="px-4 py-3">{c.name.vi}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{c.name.en}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingId(c.id); setEditForm(c); }} className="rounded p-1.5 text-charcoal-soft hover:bg-cream-deep hover:text-foreground">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded p-1.5 text-charcoal-soft hover:bg-cream-deep hover:text-rust">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
