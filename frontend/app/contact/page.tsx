import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="mb-8 font-serif text-4xl">Liên hệ</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-2xl">Thông tin liên hệ</h2>
            <p className="mb-2 text-charcoal-soft"><strong>Địa chỉ:</strong> 23 Đồng Khởi, District 1, Saigon</p>
            <p className="mb-2 text-charcoal-soft"><strong>Email:</strong> hello@felistudio.vn</p>
            <p className="mb-2 text-charcoal-soft"><strong>Điện thoại:</strong> 0123 456 789</p>
          </div>
          <form className="space-y-4 rounded-lg border border-border p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium">Họ tên</label>
              <input type="text" className="w-full rounded-md border border-border px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" className="w-full rounded-md border border-border px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Lời nhắn</label>
              <textarea rows={4} className="w-full rounded-md border border-border px-3 py-2 outline-none focus:border-primary"></textarea>
            </div>
            <button type="button" className="w-full rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-tan">
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
