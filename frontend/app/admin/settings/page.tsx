"use client"

import { useEffect, useState } from "react"
import { Check, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

type Profile = {
  name: string
  address: string
  email: string
  bank_name: string
  bank_account: string
  bank_beneficiary: string
}

type AISettings = {
  chat_provider: string
  chat_model: string
  embedding_provider: string
  embedding_model: string
  google_client_id: string | null
  google_client_secret: string | null
  database_url: string | null
  system_prompt: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resProfile, resAi] = await Promise.all([
        fetch(`${apiBaseUrl}/api/admin/studio-profile`),
        fetch(`${apiBaseUrl}/api/admin/settings`)
      ])
      if (!resProfile.ok || !resAi.ok) {
        throw new Error("Failed to load settings")
      }
      setProfile(await resProfile.json())
      setAiSettings(await resAi.json())
    } catch (err) {
      console.error(err)
      setError("Không thể tải cài đặt. Vui lòng kiểm tra backend và thử lại.")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile || !aiSettings) return
    
    setSaving(true)
    try {
      const [resProfile, resAi] = await Promise.all([
        fetch(`${apiBaseUrl}/api/admin/studio-profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }),
        fetch(`${apiBaseUrl}/api/admin/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aiSettings),
        })
      ])
      if (resProfile.ok && resAi.ok) {
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Cài đặt</p>
          <h1 className="mt-2 font-serif text-3xl">Hồ sơ studio</h1>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"
              >
                <Check className="h-3.5 w-3.5" />
                Lưu thành công
              </motion.div>
            )}
          </AnimatePresence>
          <button
            form="profile-form"
            disabled={saving || !profile}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i} className="rounded-lg border border-border bg-card p-6">
              <Skeleton className="h-6 w-32 mb-5" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : error ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-rust">{error}</p>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="mt-4 rounded-full border border-border px-4 py-2 text-sm hover:bg-cream-deep"
          >
            Thử lại
          </button>
        </section>
      ) : (
        <form id="profile-form" onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl text-primary">Thông tin studio</h2>
            <div className="mt-5 grid gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Tên studio</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.name ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                  }
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Địa chỉ</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.address ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, address: e.target.value } : prev))
                  }
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Email liên hệ</span>
                <input 
                  type="email"
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.email ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, email: e.target.value } : prev))
                  }
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl text-primary">Mạng xã hội</h2>
            <div className="mt-5 grid gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Link Facebook</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.facebook_link ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, facebook_link: e.target.value } : prev))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Link Instagram</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.instagram_link ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, instagram_link: e.target.value } : prev))
                  }
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl text-primary">Tài khoản thanh toán</h2>
            <div className="mt-5 grid gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Tên ngân hàng</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.bank_name ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, bank_name: e.target.value } : prev))
                  }
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Số tài khoản</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.bank_account ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, bank_account: e.target.value } : prev))
                  }
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-charcoal-soft font-medium">Tên người thụ hưởng</span>
                <input 
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={profile?.bank_beneficiary ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => (prev ? { ...prev, bank_beneficiary: e.target.value } : prev))
                  }
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="font-serif text-xl text-primary">Cấu hình hệ thống (System & AI)</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm lg:col-span-2">
                <span className="text-charcoal-soft font-medium">System Prompt (AI Chatbot)</span>
                <textarea 
                  rows={8}
                  className="rounded-lg border border-border bg-cream-deep/20 px-4 py-2.5 focus:border-primary focus:outline-none transition-colors" 
                  value={aiSettings?.system_prompt ?? ""}
                  onChange={(e) =>
                    setAiSettings((prev) => (prev ? { ...prev, system_prompt: e.target.value } : prev))
                  }
                />
              </label>
            </div>
          </section>
        </form>
      )}
    </div>
  )
}
