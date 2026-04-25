"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { loginAdmin, loginGoogle, session } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")
      if (token) {
        const res = loginGoogle(token)
        if (!res.ok) {
          setError(res.message || "Đăng nhập Google thất bại")
        } else {
          window.history.replaceState({}, "", "/login")
        }
      }
    }
  }, [loginGoogle])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await loginAdmin(identifier, password)
    if (!res.ok) {
      setError(res.message || "Đăng nhập thất bại")
    }
    setLoading(false)
  }

  if (session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-2xl">Đăng nhập thành công!</h1>
          <p className="mb-4 text-charcoal-soft">Xin chào, {session.name}</p>
          <a href="/" className="text-primary hover:underline">Về trang chủ</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border p-8 shadow-sm">
        <h1 className="mb-6 text-center font-serif text-3xl">Đăng nhập</h1>
        <p className="mb-6 text-center text-sm text-charcoal-soft">
          Đăng nhập để quản lý đơn hàng và dịch vụ của bạn tại Feli Studio.
        </p>
        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="mb-6 space-y-4">
          <div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email hoặc Tên tài khoản"
              className="w-full rounded-md border border-border px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu (để trống nếu chưa cài)"
              className="w-full rounded-md border border-border px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-tan disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <span className="relative bg-background px-2 text-xs text-charcoal-soft">HOẶC</span>
        </div>

        <a
          href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/google/login`}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 font-medium hover:bg-cream-deep"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
          Tiếp tục với Google
        </a>
      </div>
    </div>
  )
}
