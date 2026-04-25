import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="mb-8 font-serif text-4xl">Giới thiệu về Feli Studio</h1>
        <div className="prose prose-neutral max-w-none text-charcoal-soft">
          <p>Feli Studio ra đời với mong muốn lưu giữ những khoảnh khắc đẹp nhất của bạn thông qua lăng kính nhiếp ảnh nghệ thuật và những bộ trang phục cổ điển, tinh tế.</p>
          <p>Chúng tôi cung cấp các gói chụp ảnh cưới, ảnh kỷ niệm, cùng với dịch vụ cho thuê váy cưới, veston phong cách vintage cao cấp.</p>
          <p>Mỗi khung hình, mỗi thiết kế đều được chúng tôi chăm chút tỉ mỉ, giúp bạn tỏa sáng rực rỡ nhất trong ngày trọng đại.</p>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
