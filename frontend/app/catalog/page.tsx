import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { CatalogView } from "@/components/catalog-view"
import { AiChatButton } from "@/components/ai-chat-button"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <CatalogView initialCategory={sp.category} />
      <SiteFooter />
      <AiChatButton />
    </main>
  )
}
