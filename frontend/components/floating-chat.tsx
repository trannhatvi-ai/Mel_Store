"use client"

import { usePathname } from "next/navigation"
import { AiChatButton } from "./ai-chat-button"

export function FloatingChat() {
  const pathname = usePathname() ?? "/"
  // Hide chat in admin (different audience) and during checkout (avoid distraction).
  if (pathname.startsWith("/admin")) return null
  return <AiChatButton />
}
