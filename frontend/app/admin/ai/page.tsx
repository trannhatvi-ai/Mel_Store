/* eslint-disable @next/next/no-async-client-component */
"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Sparkles, FileText, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type ModelOption = { id: string; label: string }
type ProviderOption = { id: string; label: string; models: ModelOption[] }
type CatalogResponse = { chat_providers: ProviderOption[]; embedding_providers: ProviderOption[] }
type SettingsResponse = {
  chat_provider: string
  chat_model: string
  embedding_provider: string
  embedding_model: string
}
type PolicyResponse = { id: string; title: string | null; content: string; locale: string; policy_type: string } | null
type ModelTestResponse = { provider: string; model: string; prompt: string; answer: string }

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export default function AIPage() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [settings, setSettings] = useState<SettingsResponse>({
    chat_provider: "gemini",
    chat_model: "gemini-2.0-flash",
    embedding_provider: "gemini",
    embedding_model: "gemini-embedding-001",
  })
  const [policy, setPolicy] = useState("")
  const [saving, setSaving] = useState(false)
  const [testingModel, setTestingModel] = useState(false)
  const [testPrompt, setTestPrompt] = useState("Please introduce yourself as the store concierge in 2 short sentences.")
  const [testResult, setTestResult] = useState<ModelTestResponse | null>(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const [catRes, setRes, polRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/admin/model-catalog`),
          fetch(`${apiBaseUrl}/api/admin/settings`),
          fetch(`${apiBaseUrl}/api/admin/policy`),
        ])
        if (catRes.ok) setCatalog((await catRes.json()) as CatalogResponse)
        if (setRes.ok) setSettings((await setRes.json()) as SettingsResponse)
        if (polRes.ok) {
          const pol = (await polRes.json()) as PolicyResponse
          if (pol?.content) setPolicy(pol.content)
        }
      } catch {
        setStatus("Không thể tải cấu hình AI quản trị.")
      }
    })()
  }, [])

  const activeChatModels = useMemo(() => {
    return catalog?.chat_providers.find((p) => p.id === settings.chat_provider)?.models ?? []
  }, [catalog, settings.chat_provider])

  const activeEmbeddingModels = useMemo(() => {
    return catalog?.embedding_providers.find((p) => p.id === settings.embedding_provider)?.models ?? []
  }, [catalog, settings.embedding_provider])

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) setStatus("Đã cập nhật cấu hình mô hình.")
    } catch {
      setStatus("Lưu cấu hình thất bại.")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePolicy = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: policy }),
      })
      if (res.ok) setStatus("Đã cập nhật chính sách studio.")
    } catch {
      setStatus("Lưu chính sách thất bại.")
    } finally {
      setSaving(false)
    }
  }

  const handleTestModel = async () => {
    setTestingModel(true)
    setTestResult(null)
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/test-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt }),
      })
      if (res.ok) setTestResult((await res.json()) as ModelTestResponse)
    } catch {
      setStatus("Kiểm tra mô hình thất bại.")
    } finally {
      setTestingModel(false)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-tan-deep">Trí tuệ</p>
        <h1 className="mt-2 font-serif text-3xl">AI Tư vấn bán hàng</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column — Model config & Test */}
        <div className="space-y-8">
          {!catalog ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-xl text-primary">
                <Sparkles className="h-5 w-5" />
                Cấu hình mô hình
              </h2>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-soft">Nhà cung cấp Chat</label>
                    <select
                      value={settings.chat_provider}
                      onChange={(e) => setSettings({ ...settings, chat_provider: e.target.value, chat_model: "" })}
                      className="w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-2.5 focus:border-primary focus:outline-none"
                    >
                      {catalog.chat_providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-soft">Mô hình Chat</label>
                    <select
                      value={settings.chat_model}
                      onChange={(e) => setSettings({ ...settings, chat_model: e.target.value })}
                      className="w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-2.5 focus:border-primary focus:outline-none"
                    >
                      <option value="">Chọn mô hình</option>
                      {activeChatModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-soft">Nhà cung cấp Embedding</label>
                    <select
                      value={settings.embedding_provider}
                      onChange={(e) => setSettings({ ...settings, embedding_provider: e.target.value, embedding_model: "" })}
                      className="w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-2.5 focus:border-primary focus:outline-none"
                    >
                      {catalog.embedding_providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-soft">Mô hình Embedding</label>
                    <select
                      value={settings.embedding_model}
                      onChange={(e) => setSettings({ ...settings, embedding_model: e.target.value })}
                      className="w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-2.5 focus:border-primary focus:outline-none"
                    >
                      <option value="">Chọn mô hình</option>
                      {activeEmbeddingModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan">
                    {saving ? "Đang lưu..." : "Lưu tham số"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-primary">
              <MessageCircle className="h-5 w-5" />
              Kiểm tra AI Agent
            </h2>
            <div className="space-y-4">
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleTestModel}
                  disabled={testingModel}
                  className="rounded-full border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                >
                  {testingModel ? "Đang chạy kiểm tra..." : "Chạy kiểm tra"}
                </button>
              </div>
              {testResult && (
                <div className="mt-4 rounded-lg bg-cream-deep/50 p-4 text-sm leading-relaxed text-charcoal">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-tan-deep">Phản hồi từ {testResult.model}</p>
                  {testResult.answer}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column — Knowledge base */}
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-primary">
              <FileText className="h-5 w-5" />
              Chính sách studio
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-charcoal-soft">
              Nội dung này là nguồn tri thức chính cho AI Agent để trả lời khách hàng về giá, đổi trả và dịch vụ.
            </p>
            {!catalog ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <form onSubmit={handleSavePolicy} className="flex flex-col h-[calc(100%-120px)]">
                <textarea
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  className="flex-1 w-full rounded-lg border border-border bg-cream-deep/30 px-4 py-4 text-sm font-mono leading-relaxed focus:border-primary focus:outline-none min-h-[300px]"
                  placeholder="Nhập chính sách cửa hàng tại đây..."
                />
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPolicy("")}
                    className="text-xs text-charcoal-soft hover:text-rust underline underline-offset-4"
                  >
                    Xóa toàn bộ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-tan"
                  >
                    {saving ? "Đang lưu..." : "Lưu chính sách"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
      {status && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-charcoal px-6 py-2 text-sm text-cream shadow-xl">{status}</div>}
    </div>
  )
}
