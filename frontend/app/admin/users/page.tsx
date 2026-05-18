"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Pencil, Trash } from "lucide-react"
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

type User = {
  id?: string
  email: string
  username?: string
  password?: string
  full_name: string
  role: string
  permission: string
}

const emptyForm: User = {
  email: "",
  username: "",
  password: "",
  full_name: "",
  role: "GUEST",
  permission: "VIEW",
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<User>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setFetching(true)
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  function openCreateModal() {
    setEditingUser(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEditModal(u: User) {
    setEditingUser(u)
    setForm({
      id: u.id,
      email: u.email,
      username: u.username || "",
      password: "",
      full_name: u.full_name || "",
      role: u.role,
      permission: u.permission,
    })
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập email.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          email: form.email,
          username: form.username || undefined,
          password: form.password || undefined,
          full_name: form.full_name || null,
          role: form.role,
          permission: form.permission,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save")
      }

      toast({ title: "Thành công", description: "Đã lưu thông tin người dùng." })
      setOpen(false)
      await fetchUsers()
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể lưu người dùng.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget?.id) return
    setDeletingId(deleteTarget.id)
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete")
      }
      toast({ title: "Thành công", description: "Đã xóa người dùng." })
      setDeleteTarget(null)
      await fetchUsers()
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể xóa người dùng.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Quản lý người dùng</h1>
          <p className="text-sm text-charcoal-soft">Danh sách khách hàng và nhân viên studio</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-tan"
        >
          <Plus className="h-4 w-4" /> Thêm người dùng
        </button>
      </header>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-cream-deep/40 text-xs uppercase tracking-[0.16em] text-charcoal-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Tài khoản (Username)</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Quyền</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {fetching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-4 w-12" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-charcoal-soft">
                  Chưa có dữ liệu người dùng.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-cream-deep/30">
                  <td className="px-4 py-3 font-medium">{u.full_name || "Chưa cập nhật"}</td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {u.username} <br /> <span className="text-xs opacity-70">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cream-deep px-2 py-1 text-[10px] tracking-wider uppercase">
                      {u.role === "ADMIN" ? "Quản trị" : u.role === "STUDIO" ? "Nhân viên" : "Khách hàng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cream-deep px-2 py-1 text-[10px] tracking-wider uppercase">
                      {u.permission === "EDIT" ? "Chỉnh sửa" : "Chỉ xem"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => openEditModal(u)}
                      className="mr-2 text-primary hover:text-tan-deep"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(u)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="mt-1 font-serif text-2xl">
                    {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-charcoal-soft hover:bg-cream-deep"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-6 py-6">
                <div className="grid gap-5">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Họ và tên</span>
                    <input
                      value={form.full_name}
                      onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="input"
                      placeholder="Nguyễn Văn A"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Email</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Username (Tuỳ chọn)</span>
                    <input
                      value={form.username || ""}
                      onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                      className="input"
                      placeholder="Để trống tự lấy Email"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Mật khẩu {editingUser && "(Để trống nếu không đổi)"}</span>
                    <input
                      type="password"
                      value={form.password || ""}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input"
                      placeholder="Nhập mật khẩu"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Vai trò</span>
                    <select
                      value={form.role}
                      onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                      className="input"
                    >
                      <option value="GUEST">Khách hàng (GUEST)</option>
                      <option value="STUDIO">Nhân viên (STUDIO)</option>
                      <option value="ADMIN">Quản trị (ADMIN)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-charcoal-soft">Quyền hạn</span>
                    <select
                      value={form.permission}
                      onChange={(e) => setForm(f => ({ ...f, permission: e.target.value }))}
                      className="input"
                    >
                      <option value="VIEW">Chỉ xem (VIEW)</option>
                      <option value="EDIT">Chỉnh sửa (EDIT)</option>
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-cream-deep"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan disabled:opacity-50"
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng {deleteTarget?.full_name || deleteTarget?.email}? Hành động này không thể hoàn tác.
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
    </div>
  )
}
