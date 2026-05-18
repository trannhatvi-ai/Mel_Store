"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles, Square } from "lucide-react"
import { useLang, useT } from "@/lib/i18n"

type Msg = { role: "user" | "ai"; text: string }
type ChatApiResponse = { answer: string }

export function AiChatButton() {
  const t = useT()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: t("ai.welcome") }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => "web-" + Math.random().toString(36).slice(2))

  useEffect(() => {
    setMessages((m) => {
      if (m.length === 1 && m[0].role === "ai") {
        return [{ role: "ai", text: t("ai.welcome") }]
      }
      return m
    })
  }, [t])

  const presets = useMemo(
    () => [
      { q: t("ai.preset1"), a: t("ai.reply1") },
      { q: t("ai.preset2"), a: t("ai.reply2") },
      { q: t("ai.preset3"), a: t("ai.reply3") },
    ],
    [t],
  )

  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null)

  async function send(text: string) {
    if (!text.trim() || loading) return
    const presetReply = presets.find((p) => p.q === text)?.a
    setMessages((m) => [...m, { role: "user", text }])
    setInput("")
    setLoading(true)

    const ctrl = new AbortController()
    setAbortCtrl(ctrl)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          locale: lang,
        }),
        signal: ctrl.signal,
      })
      if (!response.ok) throw new Error("Chat API failed")
      const data = (await response.json()) as ChatApiResponse
      setMessages((m) => [...m, { role: "ai", text: data.answer || presetReply || t("ai.fallback") }])
    } catch (err: any) {
      if (err.name === "AbortError") {
        setInput(text)
        setMessages((m) => {
          const newM = [...m]
          if (newM.length > 0 && newM[newM.length - 1].role === "user") {
            newM.pop()
          }
          return newM
        })
      } else {
        setMessages((m) => [...m, { role: "ai", text: presetReply || t("ai.fallback") }])
      }
    } finally {
      setLoading(false)
      setAbortCtrl(null)
    }
  }

  function handleStop() {
    if (abortCtrl) {
      abortCtrl.abort()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t("ai.chatLabel")}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-10px_rgba(168,122,82,0.55)] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.6} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-30 flex w-[min(92vw,360px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-cream-deep/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/30">
                  <Sparkles className="h-3.5 w-3.5 text-tan-deep" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-sm font-medium">{t("ai.title")}</p>
                  <p className="text-[11px] text-charcoal-soft">{t("ai.subtitle")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("ai.closeAria")}
                className="rounded-full p-1 text-charcoal-soft hover:bg-cream-deep"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "ai"
                      ? "self-start bg-cream-deep text-foreground"
                      : "self-end bg-primary/40 text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-lg bg-cream-deep px-4 py-3.5 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal-soft animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal-soft animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal-soft animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              )}
              {messages.length <= 1 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.q}
                      type="button"
                      onClick={() => send(p.q)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-charcoal-soft hover:border-primary hover:text-foreground"
                    >
                      {p.q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-border bg-cream/50 px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("ai.placeholder")}
                disabled={loading}
                className="h-9 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {loading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Square className="h-3 w-3 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label={t("ai.sendAria")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-tan transition-colors"
                >
                  <Send className="h-4 w-4" strokeWidth={1.6} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
