"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { loginAdmin } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await loginAdmin(username, password)
    if (!res.ok) {
      setError(res.message || "Đăng nhập thất bại")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg border border-border bg-background p-8 shadow-lg">
        <h1 className="mb-6 text-center font-serif text-3xl">Admin Studio</h1>
        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Tài khoản</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <button type="submit" className="w-full rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-tan">
          Đăng nhập
        </button>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">Quay về trang chủ</Link>
        </div>
      </form>
    </div>
  )
}
