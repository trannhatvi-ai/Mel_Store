import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/i18n"
import { PromotionsProvider } from "@/lib/promotions"
import { AuthProvider } from "@/lib/auth"
import { FloatingChat } from "@/components/floating-chat"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Feli Studio — Vintage Wedding Photography & Dress Rental",
  description:
    "Capture timeless moments. Feli Studio offers vintage-inspired wedding photography packages and curated bridal & groom attire rentals.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground">
        <AuthProvider>
          <LanguageProvider>
            <PromotionsProvider>
              {children}
              <FloatingChat />
              <Toaster />
            </PromotionsProvider>
          </LanguageProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
