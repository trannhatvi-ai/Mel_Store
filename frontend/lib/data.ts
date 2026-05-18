import type { Lang } from "./i18n"

export type Category = "Dress" | "Suit" | "Package"

type LStr = { en: string; vi: string }
type LStrArr = { en: string[]; vi: string[] }

export type Product = {
  id: string
  slug: string
  name: LStr
  category: Category
  price: number // VND
  pricePerDay?: boolean
  image: string
  gallery: string[]
  description: LStr
  details: LStrArr
  available: boolean
  trending?: boolean
  /** Discount percent (0–90). 0 means no discount. */
  discount?: number
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "lumiere-lace-gown",
    name: { en: "Lumière Lace Gown", vi: "Đầm Cưới Ren Lumière" },
    category: "Dress",
    price: 1_200_000,
    pricePerDay: true,
    image: "/images/dress-1.jpg",
    gallery: ["/images/dress-1.jpg", "/images/hero-dress.jpg", "/images/hero-bride.jpg"],
    description: {
      en: "A heirloom-inspired lace gown with hand-stitched ivory embroidery and a soft chapel train. Cut for a relaxed, romantic silhouette.",
      vi: "Đầm ren lấy cảm hứng di sản với thêu tay màu ngà và đuôi nhà nguyện mềm mại. Form đầm thoải mái, lãng mạn.",
    },
    details: {
      en: ["Ivory French lace", "Pearl button back", "Bust 84-92cm · Waist 64-72cm", "Includes underslip & garment bag"],
      vi: ["Ren Pháp màu ngà", "Lưng cúc ngọc trai", "Vòng 1 84-92cm · Eo 64-72cm", "Kèm váy lót & túi đựng"],
    },
    available: true,
    trending: true,
    discount: 0,
  },
  {
    id: "p2",
    slug: "peche-silk-evening",
    name: { en: "Pêche Silk Evening", vi: "Đầm Lụa Pêche Buổi Tối" },
    category: "Dress",
    price: 950_000,
    pricePerDay: true,
    image: "/images/dress-2.jpg",
    gallery: ["/images/dress-2.jpg", "/images/hero-bride.jpg"],
    description: {
      en: "Blush peach silk slip with a fluid bias cut — perfect for engagement parties and intimate ceremonies.",
      vi: "Đầm lụa hồng đào cắt xéo mềm mại — hoàn hảo cho tiệc đính hôn và nghi lễ riêng tư.",
    },
    details: {
      en: ["Pure mulberry silk", "Adjustable straps", "Fits S–M", "Dry clean included"],
      vi: ["Lụa tơ tằm nguyên chất", "Dây vai điều chỉnh", "Vừa size S–M", "Bao gồm giặt khô"],
    },
    available: true,
    trending: true,
    discount: 15,
  },
  {
    id: "p3",
    slug: "monsieur-navy-suit",
    name: { en: "Monsieur Navy Three-Piece", vi: "Vest Navy Monsieur 3 Mảnh" },
    category: "Suit",
    price: 1_100_000,
    pricePerDay: true,
    image: "/images/dress-3.jpg",
    gallery: ["/images/dress-3.jpg"],
    description: {
      en: "A classic navy three-piece with peak lapels and tonal stitching. Tailored fit, finished with horn buttons.",
      vi: "Bộ vest navy 3 mảnh cổ điển với ve đỉnh và đường chỉ tông màu. Form vừa vặn, hoàn thiện cúc sừng.",
    },
    details: {
      en: ["Italian wool blend", "Peak lapels · Double vent", "Sizes 46–54 EU", "Pocket square included"],
      vi: ["Pha len Ý", "Ve đỉnh · Xẻ đôi", "Size 46–54 EU", "Kèm khăn cài túi"],
    },
    available: true,
    discount: 20,
  },
  {
    id: "p4",
    slug: "ao-dai-heritage",
    name: { en: "Áo Dài Heritage", vi: "Áo Dài Di Sản" },
    category: "Dress",
    price: 880_000,
    pricePerDay: true,
    image: "/images/dress-4.jpg",
    gallery: ["/images/dress-4.jpg"],
    description: {
      en: "A traditional Vietnamese áo dài in ivory silk with delicate floral embroidery — a timeless choice for ceremonies.",
      vi: "Áo dài truyền thống bằng lụa ngà với thêu hoa tinh tế — lựa chọn vượt thời gian cho nghi lễ.",
    },
    details: {
      en: ["Hand embroidery", "Pure silk", "Custom hemming available", "Includes silk trousers"],
      vi: ["Thêu thủ công", "Lụa nguyên chất", "Có thể chỉnh sửa lai", "Kèm quần lụa"],
    },
    available: true,
    trending: true,
  },
  {
    id: "pk1",
    slug: "golden-hour-package",
    name: { en: "Golden Hour — Pre-Wedding", vi: "Khoảnh Khắc Vàng — Chụp Trước Cưới" },
    category: "Package",
    price: 12_500_000,
    image: "/images/package-1.jpg",
    gallery: ["/images/package-1.jpg", "/images/hero-couple.jpg"],
    description: {
      en: "A 4-hour pre-wedding shoot at the location of your choice. Includes 2 outfit changes, 80 edited photos, and a printed album.",
      vi: "Buổi chụp trước cưới 4 giờ tại địa điểm bạn chọn. Bao gồm 2 lần thay trang phục, 80 ảnh đã chỉnh sửa và album in.",
    },
    details: {
      en: [
        "4 hours of shooting",
        "Lead photographer + assistant",
        "80 retouched high-res photos",
        "20-page linen album",
        "Online private gallery",
      ],
      vi: [
        "4 giờ chụp",
        "Nhiếp ảnh chính + trợ lý",
        "80 ảnh độ phân giải cao đã chỉnh sửa",
        "Album bìa vải lanh 20 trang",
        "Thư viện trực tuyến riêng tư",
      ],
    },
    available: true,
    trending: true,
  },
  {
    id: "pk2",
    slug: "intimate-engagement",
    name: { en: "Intimate Engagement", vi: "Đính Hôn Riêng Tư" },
    category: "Package",
    price: 6_800_000,
    image: "/images/package-2.jpg",
    gallery: ["/images/package-2.jpg"],
    description: {
      en: "A 90-minute storytelling session in a vintage café or city street. Perfect for proposals and engagements.",
      vi: "Buổi chụp kể chuyện 90 phút tại quán cà phê vintage hoặc đường phố. Hoàn hảo cho lễ cầu hôn và đính hôn.",
    },
    details: {
      en: ["90 minutes", "40 retouched photos", "Online gallery", "1 outfit change"],
      vi: ["90 phút", "40 ảnh đã chỉnh sửa", "Thư viện trực tuyến", "1 lần thay trang phục"],
    },
    available: true,
    discount: 10,
  },
  {
    id: "pk3",
    slug: "atelier-studio-portrait",
    name: { en: "Atelier Studio Portrait", vi: "Chân Dung Studio Atelier" },
    category: "Package",
    price: 4_500_000,
    image: "/images/package-3.jpg",
    gallery: ["/images/package-3.jpg"],
    description: {
      en: "Editorial-style studio portraits with vintage props and warm tungsten lighting. Includes hair & makeup.",
      vi: "Chân dung studio phong cách tạp chí với đạo cụ vintage và ánh sáng tungsten ấm. Bao gồm tóc & trang điểm.",
    },
    details: {
      en: ["2 hours studio", "Hair & makeup included", "30 retouched photos", "Choice of 3 backdrops"],
      vi: ["2 giờ studio", "Bao gồm tóc & trang điểm", "30 ảnh đã chỉnh sửa", "Chọn 3 phông nền"],
    },
    available: true,
  },
]

export type OrderStatus = "AWAITING_DEPOSIT" | "PAID" | "SERVICE_ONGOING" | "COMPLETED" | "CANCELLED"

export type Order = {
  id: string
  customer: string
  email: string
  phone: string
  items: { productId: string; qty: number; price: number; days?: number }[]
  total: number
  deposit: number
  status: OrderStatus
  createdAt: string
  eventDate: string
}

export const orders: Order[] = [
  {
    id: "ML-2412",
    customer: "Linh Nguyễn",
    email: "linh.n@email.com",
    phone: "+84 901 234 567",
    items: [{ productId: "pk1", qty: 1, price: 12_500_000 }],
    total: 12_500_000,
    deposit: 2_500_000,
    status: "PAID",
    createdAt: "2026-04-12",
    eventDate: "2026-05-18",
  },
  {
    id: "ML-2411",
    customer: "An Trần",
    email: "an.tran@email.com",
    phone: "+84 902 555 121",
    items: [{ productId: "p1", qty: 1, price: 1_200_000, days: 3 }],
    total: 3_600_000,
    deposit: 720_000,
    status: "AWAITING_DEPOSIT",
    createdAt: "2026-04-20",
    eventDate: "2026-05-04",
  },
  {
    id: "ML-2410",
    customer: "Mai Phạm",
    email: "mai.p@email.com",
    phone: "+84 903 880 044",
    items: [
      { productId: "p4", qty: 1, price: 880_000, days: 2 },
      { productId: "pk2", qty: 1, price: 6_800_000 },
    ],
    total: 8_560_000,
    deposit: 1_712_000,
    status: "SERVICE_ONGOING",
    createdAt: "2026-04-08",
    eventDate: "2026-04-26",
  },
  {
    id: "ML-2409",
    customer: "Khoa Lê",
    email: "khoa.le@email.com",
    phone: "+84 904 110 998",
    items: [{ productId: "p3", qty: 1, price: 1_100_000, days: 2 }],
    total: 2_200_000,
    deposit: 440_000,
    status: "COMPLETED",
    createdAt: "2026-03-28",
    eventDate: "2026-04-10",
  },
  {
    id: "ML-2408",
    customer: "Hà Đỗ",
    email: "ha.do@email.com",
    phone: "+84 905 223 778",
    items: [{ productId: "pk3", qty: 1, price: 4_500_000 }],
    total: 4_500_000,
    deposit: 900_000,
    status: "CANCELLED",
    createdAt: "2026-03-21",
    eventDate: "2026-04-02",
  },
]

export function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫"
}

export function getEffectivePrice(price: number, discount?: number) {
  const d = Math.max(0, Math.min(90, Math.round(discount ?? 0)))
  if (!d) return { price, original: price, discount: 0 }
  // Round to nearest 1,000 VND for clean display
  const effective = Math.round((price * (1 - d / 100)) / 1000) * 1000
  return { price: effective, original: price, discount: d }
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}

export function localizeProduct(p: Product, lang: Lang) {
  return {
    ...p,
    name: p.name[lang] ?? p.name.en,
    description: p.description[lang] ?? p.description.en,
    details: p.details[lang] ?? p.details.en,
  }
}
