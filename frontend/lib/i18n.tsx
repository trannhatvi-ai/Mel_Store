"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export type Lang = "en" | "vi"

const en = {
  // Nav
  "nav.catalog": "Catalog",
  "nav.photography": "Photography",
  "nav.dressesAndSuits": "Dresses & Suits",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.bookNow": "Book Now",
  "nav.search": "Search",
  "nav.menu": "Menu",

  // Footer
  "footer.tagline":
    "A vintage atelier for love stories — curated bridal attire and storytelling photography in the heart of Saigon.",
  "footer.atelier": "Atelier",
  "footer.studio": "Studio",
  "footer.dresses": "Dresses",
  "footer.suits": "Suits",
  "footer.photography": "Photography",
  "footer.address1": "23 Đồng Khởi, District 1",
  "footer.address2": "Saigon, Vietnam",
  "footer.hours": "Tue – Sun · 10:00 – 19:00",
  "footer.copyright": "© {year} Feli Studio. All rights reserved.",
  "footer.designed": "Designed with care in Saigon.",

  // Hero
  "hero.slide1.eyebrow": "Spring Collection 2026",
  "hero.slide1.title": "Where every love story\nbecomes an heirloom.",
  "hero.slide1.subtitle": "Vintage-inspired photography & curated bridal attire.",
  "hero.slide2.eyebrow": "Featured Package",
  "hero.slide2.title": "Golden Hour\nPre-Wedding Stories.",
  "hero.slide2.subtitle": "Four hours, two outfits, one timeless film-style album.",
  "hero.slide3.eyebrow": "The Atelier",
  "hero.slide3.title": "Heirloom gowns,\nlent for a day.",
  "hero.slide3.subtitle": "Hand-picked pieces from our private collection.",
  "hero.bookNow": "Book Now",
  "hero.explore": "Explore Packages",
  "hero.slideAria": "Go to slide {n}",

  // Home
  "home.values.film": "Film-style editing",
  "home.values.curated": "Curated by stylists",
  "home.values.handFinished": "Hand-finished pieces",
  "home.values.deposit": "Secure deposit booking",
  "home.packages.eyebrow": "The Atelier",
  "home.packages.title": "Featured photography packages",
  "home.packages.description":
    "Storytelling sessions designed around the rhythm of your day — from morning prep to golden hour vows.",
  "home.packages.cta": "All packages",
  "home.packages.label": "Package",
  "home.editorial.eyebrow": "A note from our atelier",
  "home.editorial.title": "Slow-made beauty,\nfor slow-lived moments.",
  "home.editorial.description":
    "Every gown in our collection is sourced or hand-restored — many vintage, all unforgettable. We believe the day you wear them should feel just as considered as the stitching that made them.",
  "home.editorial.couples": "Couples styled",
  "home.editorial.years": "Years in Saigon",
  "home.editorial.heirloom": "Heirloom pieces",
  "home.trending.eyebrow": "Trending now",
  "home.trending.title": "Rental dresses & suits",
  "home.trending.description": "A rotating selection of our most-loved pieces this season.",
  "home.trending.cta": "View catalog",
  "home.cta.eyebrow": "Begin your story",
  "home.cta.title": "Reserve your date with a 20% deposit.",
  "home.cta.description":
    "Secure your gown or photography package instantly with VietQR — and we'll handle every detail until the day you say yes.",
  "home.cta.browse": "Browse the collection",
  "home.cta.consultation": "Book a consultation",

  // Card
  "card.trending": "Trending",
  "card.perDay": "per day",
  "card.package": "package",

  // Catalog
  "catalog.collection": "Collection",
  "catalog.title": "The Catalog",
  "catalog.description":
    "Photography packages and curated rental attire — filter by category, price, and your event date.",
  "catalog.search": "Search",
  "catalog.searchPlaceholder": "Search the atelier...",
  "catalog.category": "Category",
  "catalog.allCollections": "All collections",
  "catalog.maxPrice": "Max price",
  "catalog.upTo": "Up to {price}",
  "catalog.dateAvailability": "Date availability",
  "catalog.allBookable": "All items currently bookable.",
  "catalog.pieces": "pieces",
  "catalog.sort": "Sort",
  "catalog.sortFeatured": "Featured",
  "catalog.sortLow": "Price · Low to High",
  "catalog.sortHigh": "Price · High to Low",
  "catalog.empty": "No pieces match these filters yet — try widening your search.",

  // Categories
  "category.Dress": "Dress",
  "category.Suit": "Suit",
  "category.Package": "Photography",

  // Product
  "product.home": "Home",
  "product.catalog": "Catalog",
  "product.tapEnlarge": "Tap to enlarge",
  "product.rentalRate": "Rental rate",
  "product.packagePrice": "Package price",
  "product.perDay": "/ day",
  "product.reserve": "Reserve",
  "product.pickup": "Pick-up",
  "product.return": "Return",
  "product.eventDate": "Event date",
  "product.quantity": "Quantity",
  "product.total": "Total",
  "product.totalDays": "Total ({days} day{plural})",
  "product.deposit": "Deposit (20%)",
  "product.remaining": "Remaining at event",
  "product.checkout": "Continue to checkout",
  "product.heldByVietQR": "Reservation held instantly with VietQR deposit",
  "product.relatedTitle": "You may also love",
  "product.save": "Save",
  "product.previous": "Previous",
  "product.next": "Next",
  "product.close": "Close",

  // Checkout
  "checkout.eyebrow": "Checkout",
  "checkout.title": "Reserve your moment",
  "checkout.step1": "Your details",
  "checkout.step2": "Review",
  "checkout.step3": "Payment",
  "checkout.detailsTitle": "Your details",
  "checkout.detailsDescription": "We'll use these to confirm your booking and prepare your fitting.",
  "checkout.fullName": "Full name",
  "checkout.phone": "Phone",
  "checkout.email": "Email",
  "checkout.notes": "Notes for the atelier (optional)",
  "checkout.notesPlaceholder": "Sizing notes, location preferences, etc.",
  "checkout.reviewTitle": "Review your booking",
  "checkout.reviewDescription": "Everything looking good? You can edit any step.",
  "checkout.customer": "Customer",
  "checkout.rentalDates": "Rental dates",
  "checkout.eventDate": "Event date",
  "checkout.notesLabel": "Notes",
  "checkout.payTitle": "Pay your 20% deposit",
  "checkout.payDescription": "Scan the VietQR with any Vietnamese banking app. Your booking is confirmed instantly.",
  "checkout.poweredBy": "Powered by VietQR · Updated in real time",
  "checkout.orderId": "Order ID",
  "checkout.beneficiary": "Beneficiary",
  "checkout.bank": "Bank",
  "checkout.amount": "Amount",
  "checkout.memo": "Memo",
  "checkout.completed": "I've completed payment",
  "checkout.contactStylist": "Contact our stylist instead",
  "checkout.back": "Back",
  "checkout.continue": "Continue",
  "checkout.yourBooking": "Your booking",
  "checkout.subtotal": "Subtotal",
  "checkout.depositLabel": "Deposit (20%)",
  "checkout.remainingAtEvent": "Remaining at event",
  "checkout.payToday": "Pay today",
  "checkout.qty": "qty",
  "checkout.daysSuffix": "{n} day{plural}",
  "checkout.copyAria": "Copy",
  "checkout.qrAlt": "VietQR for deposit {amount}",

  // Success
  "success.confirmed": "Confirmed",
  "success.title": "Your moment is reserved.",
  "success.body":
    "Thank you. We've received your deposit and your booking {order} is now in our atelier's diary. A stylist will be in touch within one business day to arrange your fitting.",
  "success.return": "Return home",
  "success.continue": "Continue browsing",

  // AI chat
  "ai.chatLabel": "Chat with AI concierge",
  "ai.title": "Lumi",
  "ai.subtitle": "Atelier concierge",
  "ai.welcome": "Hello — I'm Lumi, your atelier concierge. Ask me anything about our packages or dresses.",
  "ai.placeholder": "Ask about a piece or package...",
  "ai.preset1": "What's included in the Golden Hour package?",
  "ai.preset2": "Do you offer plus-size dresses?",
  "ai.preset3": "How does the deposit work?",
  "ai.reply1":
    "The Golden Hour Pre-Wedding package includes 4 hours of shooting, a lead photographer + assistant, 80 retouched photos, and a 20-page linen album. We can also add a same-day teaser reel.",
  "ai.reply2":
    "Yes — about a third of our gowns are sized US 12–22. Visit the atelier and our stylist will pre-pull pieces in your measurements.",
  "ai.reply3":
    "We hold your date with a 20% deposit via VietQR. The remaining balance is due 7 days before your event. Deposits are refundable up to 30 days prior.",
  "ai.fallback":
    "Thank you — our stylist will respond shortly. In the meantime, you can browse the catalog or book a consultation.",
  "ai.sendAria": "Send",
  "ai.closeAria": "Close chat",

  // Admin nav
  "admin.nav.overview": "Overview",
  "admin.nav.orders": "Orders",
  "admin.nav.inventory": "Inventory",
  "admin.nav.ai": "AI & Policies",
  "admin.nav.settings": "Settings",
  "admin.viewStorefront": "View storefront",
  "admin.searchAll": "Search orders, products, customers...",
  "admin.studioOwner": "Studio owner",
  "admin.adminBadge": "Admin",
  "admin.notifications": "Notifications",

  // Overview
  "overview.eyebrow": "Overview",
  "overview.greeting": "Good morning, Admin",
  "overview.subtitle": "Here's how the atelier is moving today.",
  "overview.last30": "Last 30 days",
  "overview.last90": "Last 90 days",
  "overview.thisYear": "This year",
  "overview.totalRevenue": "Total revenue",
  "overview.newOrders": "New orders",
  "overview.activeRentals": "Active rentals",
  "overview.aov": "Avg. order value",
  "overview.bookingTrends": "Booking trends",
  "overview.revenueAndBookings": "Revenue & bookings",
  "overview.viewReport": "View report",
  "overview.recentOrders": "Recent orders",
  "overview.latestActivity": "Latest activity",
  "overview.allOrders": "All orders",
  "overview.todayBadge": "{n} today",
  "overview.chartRevenue": "Revenue (M VND)",
  "overview.chartBookings": "Bookings",

  // Orders
  "orders.eyebrow": "Orders",
  "orders.title": "Bookings & rentals",
  "orders.subtitle": "Filter by status, search by customer or ID, and open any booking for full details.",
  "orders.searchPlaceholder": "Search by customer or order ID...",
  "orders.filterAll": "All",
  "orders.colOrder": "Order",
  "orders.colCustomer": "Customer",
  "orders.colItems": "Items",
  "orders.colDate": "Date",
  "orders.colTotal": "Total",
  "orders.colStatus": "Status",
  "orders.empty": "No orders match these filters.",
  "orders.bookingTitle": "Booking",
  "orders.customer": "Customer",
  "orders.items": "Items",
  "orders.qty": "Qty {n}",
  "orders.daysSuffix": "{n} days",
  "orders.eventDate": "Event date",
  "orders.created": "Created",
  "orders.status": "Status",
  "orders.totalLabel": "Total",
  "orders.depositLabel": "Deposit",
  "orders.remaining": "Remaining",
  "orders.markPaid": "Mark as paid",
  "orders.sendReminder": "Send reminder",
  "orders.viewAria": "View {id}",

  // Inventory
  "inventory.eyebrow": "Inventory",
  "inventory.title": "Atelier collection",
  "inventory.subtitle": "Manage every dress, suit, and photography package across the studio.",
  "inventory.searchPlaceholder": "Search inventory...",
  "inventory.filterAll": "All",
  "inventory.addPiece": "Add piece",
  "inventory.colPiece": "Piece",
  "inventory.colCategory": "Category",
  "inventory.colPrice": "Price",
  "inventory.colAvailability": "Availability",
  "inventory.skuPrefix": "SKU",
  "inventory.perDayShort": "/day",
  "inventory.available": "Available",
  "inventory.booked": "Booked",
  "inventory.edit": "Edit",
  "inventory.modal.eyebrow": "New piece",
  "inventory.modal.title": "Add to inventory",
  "inventory.modal.pieceName": "Piece name",
  "inventory.modal.pieceNamePlaceholder": "e.g. Feli Lace Gown",
  "inventory.modal.category": "Category",
  "inventory.modal.priceVnd": "Price (VND)",
  "inventory.modal.pricePlaceholder": "1,200,000",
  "inventory.modal.description": "Description",
  "inventory.modal.photos": "Photos",
  "inventory.modal.dropFiles": "Drop files or click to upload",
  "inventory.modal.cancel": "Cancel",
  "inventory.modal.save": "Save piece",

  // Admin AI
  "ai_admin.eyebrow": "AI & Policies",
  "ai_admin.title": "Concierge knowledge base",
  "ai_admin.subtitle":
    "The text below is fed to Lumi, your storefront AI concierge, every time a customer asks a question. Keep it conversational and current.",
  "ai_admin.policiesTitle": "Studio policies",
  "ai_admin.policiesDefault": `• Deposits are 20% of the total, paid via VietQR at booking.
• Remaining balance is due 7 days before the event date.
• Rentals include a 24-hour grace return window. Late returns are charged at 25% of the daily rate.
• Damage assessments are done within 48 hours of return; minor wear is included.
• All photography packages include an online private gallery for 12 months.`,
  "ai_admin.policiesHint": "Markdown is supported. Bullet points work best.",
  "ai_admin.personaTitle": "Concierge persona",
  "ai_admin.personaName": "Concierge name",
  "ai_admin.tone": "Tone",
  "ai_admin.toneWarm": "Warm & elegant",
  "ai_admin.toneCrisp": "Crisp & professional",
  "ai_admin.tonePlayful": "Playful",
  "ai_admin.welcomeMessage": "Welcome message",
  "ai_admin.faqTitle": "Frequently asked answers",
  "ai_admin.faqDefault": `Q: How do I reserve a date?
A: Choose your piece or package, pick the dates, and pay the 20% deposit via VietQR.

Q: Can I try gowns before booking?
A: Yes — we welcome 60-minute fittings Tue–Sun. Book a consultation under Contact.`,
  "ai_admin.discard": "Discard",
  "ai_admin.save": "Save knowledge base",
  "ai_admin.previewLabel": "Live preview",
  "ai_admin.previewTitle": "How Lumi sounds",
  "ai_admin.previewQ": "What's your refund policy?",
  "ai_admin.previewA":
    "Deposits are refundable up to 30 days before your event. Within 30 days, we're happy to reschedule free of charge.",
  "ai_admin.note":
    "Lumi automatically draws from your policies, current inventory, and availability. Save this page to update the concierge instantly.",

  // Settings
  "settings.eyebrow": "Settings",
  "settings.title": "Studio profile",
  "settings.studioDetails": "Studio details",
  "settings.studioName": "Studio name",
  "settings.address": "Address",
  "settings.contactEmail": "Contact email",
  "settings.paymentAccount": "Payment account",
  "settings.bank": "Bank",
  "settings.accountNumber": "Account number",
  "settings.beneficiary": "Beneficiary",

  // Status
  "status.Awaiting Deposit": "Awaiting Deposit",
  "status.Paid": "Paid",
  "status.Service Ongoing": "Service Ongoing",
  "status.Completed": "Completed",
  "status.Cancelled": "Cancelled",

  // Language toggle
  "lang.toggleAria": "Switch language",
  "lang.english": "English",
  "lang.vietnamese": "Tiếng Việt",
  "lang.short.en": "EN",
  "lang.short.vi": "VI",

  // Home — Special Offers
  "home.offers.eyebrow": "Special Offers",
  "home.offers.title": "Discounted this week",
  "home.offers.description": "A handful of curated pieces and packages on offer — limited dates, classic style.",
  "home.offers.cta": "All offers",
  "home.offers.empty": "No offers running right now — check back soon.",

  // Card
  "card.savePercent": "Save {n}%",
  "card.now": "Now",
  "card.was": "Was",

  // Admin promotions
  "admin.nav.promotions": "Promotions",
  "promotions.eyebrow": "Promotions",
  "promotions.title": "Trending & discounts",
  "promotions.subtitle":
    "Toggle which pieces appear in trending feeds and apply percentage discounts. Changes go live on the storefront immediately.",
  "promotions.searchPlaceholder": "Search pieces...",
  "promotions.filterAll": "All",
  "promotions.filterTrending": "Trending only",
  "promotions.filterDiscounted": "On sale only",
  "promotions.colPiece": "Piece",
  "promotions.colTrending": "Trending",
  "promotions.colDiscount": "Discount",
  "promotions.colPricing": "Effective price",
  "promotions.discountPlaceholder": "0",
  "promotions.percent": "%",
  "promotions.empty": "No pieces match these filters.",
  "promotions.resetAll": "Reset to defaults",
  "promotions.resetConfirm": "Reset all promotions to their original values?",
  "promotions.savedHint": "Changes save automatically.",
  "promotions.statsTrending": "Trending",
  "promotions.statsOnSale": "On sale",
  "promotions.statsAvgDiscount": "Avg. discount",
  "promotions.quickPick": "Quick set",
} as const

const vi: Record<keyof typeof en, string> = {
  // Nav
  "nav.catalog": "Bộ Sưu Tập",
  "nav.photography": "Chụp Ảnh",
  "nav.dressesAndSuits": "Đầm & Vest",
  "nav.about": "Giới Thiệu",
  "nav.contact": "Liên Hệ",
  "nav.bookNow": "Đặt Ngay",
  "nav.search": "Tìm kiếm",
  "nav.menu": "Menu",

  // Footer
  "footer.tagline":
    "Atelier vintage cho những câu chuyện tình yêu — trang phục cưới được tuyển chọn và nhiếp ảnh kể chuyện ngay giữa lòng Sài Gòn.",
  "footer.atelier": "Atelier",
  "footer.studio": "Studio",
  "footer.dresses": "Đầm",
  "footer.suits": "Vest",
  "footer.photography": "Chụp Ảnh",
  "footer.address1": "23 Đồng Khởi, Quận 1",
  "footer.address2": "Sài Gòn, Việt Nam",
  "footer.hours": "Thứ 3 – Chủ Nhật · 10:00 – 19:00",
  "footer.copyright": "© {year} Feli Studio. Đã đăng ký bản quyền.",
  "footer.designed": "Được thiết kế tỉ mỉ tại Sài Gòn.",

  // Hero
  "hero.slide1.eyebrow": "Bộ Sưu Tập Xuân 2026",
  "hero.slide1.title": "Mỗi câu chuyện tình yêu\nlà một di sản.",
  "hero.slide1.subtitle": "Nhiếp ảnh phong cách vintage & trang phục cưới được tuyển chọn.",
  "hero.slide2.eyebrow": "Gói Nổi Bật",
  "hero.slide2.title": "Khoảnh Khắc Vàng\nChụp Trước Cưới.",
  "hero.slide2.subtitle": "Bốn giờ chụp, hai bộ trang phục, một album phong cách phim vượt thời gian.",
  "hero.slide3.eyebrow": "Atelier",
  "hero.slide3.title": "Đầm cưới di sản,\ndành riêng cho ngày của bạn.",
  "hero.slide3.subtitle": "Những thiết kế được tuyển chọn từ bộ sưu tập riêng của chúng tôi.",
  "hero.bookNow": "Đặt Ngay",
  "hero.explore": "Khám Phá Các Gói",
  "hero.slideAria": "Đến slide {n}",

  // Home
  "home.values.film": "Hậu kỳ phong cách phim",
  "home.values.curated": "Stylist tuyển chọn",
  "home.values.handFinished": "Hoàn thiện thủ công",
  "home.values.deposit": "Đặt cọc an toàn",
  "home.packages.eyebrow": "Atelier",
  "home.packages.title": "Các gói chụp ảnh nổi bật",
  "home.packages.description":
    "Những buổi chụp kể chuyện được thiết kế theo nhịp ngày của bạn — từ buổi sáng chuẩn bị đến lời thề trong ánh hoàng hôn.",
  "home.packages.cta": "Tất cả gói",
  "home.packages.label": "Gói",
  "home.editorial.eyebrow": "Lời nhắn từ atelier",
  "home.editorial.title": "Vẻ đẹp chậm rãi,\ncho những khoảnh khắc thong dong.",
  "home.editorial.description":
    "Mỗi chiếc đầm trong bộ sưu tập đều được tìm kiếm hoặc phục chế thủ công — nhiều thiết kế cổ điển, tất cả đều đáng nhớ. Chúng tôi tin rằng ngày bạn diện chúng cần được trân trọng như chính từng đường kim mũi chỉ làm nên chiếc đầm.",
  "home.editorial.couples": "Cặp đôi đã phục vụ",
  "home.editorial.years": "Năm tại Sài Gòn",
  "home.editorial.heirloom": "Thiết kế di sản",
  "home.trending.eyebrow": "Đang thịnh hành",
  "home.trending.title": "Đầm & vest cho thuê",
  "home.trending.description": "Tuyển chọn luân phiên những thiết kế được yêu thích nhất mùa này.",
  "home.trending.cta": "Xem bộ sưu tập",
  "home.cta.eyebrow": "Bắt đầu câu chuyện",
  "home.cta.title": "Giữ ngày của bạn với 20% tiền cọc.",
  "home.cta.description":
    "Đặt cọc đầm hoặc gói chụp ảnh ngay lập tức qua VietQR — chúng tôi sẽ chăm chút từng chi tiết đến ngày bạn nói \"đồng ý\".",
  "home.cta.browse": "Khám phá bộ sưu tập",
  "home.cta.consultation": "Đặt lịch tư vấn",

  // Card
  "card.trending": "Thịnh hành",
  "card.perDay": "mỗi ngày",
  "card.package": "trọn gói",

  // Catalog
  "catalog.collection": "Bộ Sưu Tập",
  "catalog.title": "Danh Mục",
  "catalog.description":
    "Các gói chụp ảnh và trang phục cho thuê được tuyển chọn — lọc theo danh mục, giá và ngày sự kiện của bạn.",
  "catalog.search": "Tìm kiếm",
  "catalog.searchPlaceholder": "Tìm trong atelier...",
  "catalog.category": "Danh mục",
  "catalog.allCollections": "Tất cả bộ sưu tập",
  "catalog.maxPrice": "Giá tối đa",
  "catalog.upTo": "Tối đa {price}",
  "catalog.dateAvailability": "Ngày khả dụng",
  "catalog.allBookable": "Tất cả đều có thể đặt ngay.",
  "catalog.pieces": "thiết kế",
  "catalog.sort": "Sắp xếp",
  "catalog.sortFeatured": "Nổi bật",
  "catalog.sortLow": "Giá · Thấp đến Cao",
  "catalog.sortHigh": "Giá · Cao đến Thấp",
  "catalog.empty": "Không có thiết kế nào phù hợp — hãy thử mở rộng tìm kiếm của bạn.",

  // Categories
  "category.Dress": "Đầm",
  "category.Suit": "Vest",
  "category.Package": "Chụp Ảnh",

  // Product
  "product.home": "Trang Chủ",
  "product.catalog": "Bộ Sưu Tập",
  "product.tapEnlarge": "Chạm để phóng to",
  "product.rentalRate": "Giá thuê",
  "product.packagePrice": "Giá gói",
  "product.perDay": "/ ngày",
  "product.reserve": "Đặt giữ",
  "product.pickup": "Nhận hàng",
  "product.return": "Trả hàng",
  "product.eventDate": "Ngày sự kiện",
  "product.quantity": "Số lượng",
  "product.total": "Tổng cộng",
  "product.totalDays": "Tổng cộng ({days} ngày)",
  "product.deposit": "Đặt cọc (20%)",
  "product.remaining": "Còn lại tại sự kiện",
  "product.checkout": "Tiếp tục thanh toán",
  "product.heldByVietQR": "Giữ chỗ ngay lập tức với cọc VietQR",
  "product.relatedTitle": "Bạn có thể cũng thích",
  "product.save": "Lưu",
  "product.previous": "Trước",
  "product.next": "Sau",
  "product.close": "Đóng",

  // Checkout
  "checkout.eyebrow": "Thanh Toán",
  "checkout.title": "Giữ khoảnh khắc của bạn",
  "checkout.step1": "Thông tin",
  "checkout.step2": "Xem lại",
  "checkout.step3": "Thanh toán",
  "checkout.detailsTitle": "Thông tin của bạn",
  "checkout.detailsDescription": "Chúng tôi dùng thông tin này để xác nhận đặt chỗ và chuẩn bị buổi thử đồ.",
  "checkout.fullName": "Họ và tên",
  "checkout.phone": "Số điện thoại",
  "checkout.email": "Email",
  "checkout.notes": "Ghi chú cho atelier (không bắt buộc)",
  "checkout.notesPlaceholder": "Số đo, địa điểm ưu tiên, v.v.",
  "checkout.reviewTitle": "Xem lại đặt chỗ",
  "checkout.reviewDescription": "Mọi thứ đã đúng chưa? Bạn có thể chỉnh sửa từng bước.",
  "checkout.customer": "Khách hàng",
  "checkout.rentalDates": "Ngày thuê",
  "checkout.eventDate": "Ngày sự kiện",
  "checkout.notesLabel": "Ghi chú",
  "checkout.payTitle": "Thanh toán cọc 20%",
  "checkout.payDescription":
    "Quét VietQR bằng bất kỳ ứng dụng ngân hàng Việt Nam nào. Đặt chỗ của bạn được xác nhận ngay lập tức.",
  "checkout.poweredBy": "Cung cấp bởi VietQR · Cập nhật theo thời gian thực",
  "checkout.orderId": "Mã đơn",
  "checkout.beneficiary": "Người thụ hưởng",
  "checkout.bank": "Ngân hàng",
  "checkout.amount": "Số tiền",
  "checkout.memo": "Nội dung",
  "checkout.completed": "Tôi đã hoàn tất thanh toán",
  "checkout.contactStylist": "Liên hệ stylist của chúng tôi",
  "checkout.back": "Quay lại",
  "checkout.continue": "Tiếp tục",
  "checkout.yourBooking": "Đơn của bạn",
  "checkout.subtotal": "Tạm tính",
  "checkout.depositLabel": "Đặt cọc (20%)",
  "checkout.remainingAtEvent": "Còn lại tại sự kiện",
  "checkout.payToday": "Thanh toán hôm nay",
  "checkout.qty": "SL",
  "checkout.daysSuffix": "{n} ngày",
  "checkout.copyAria": "Sao chép",
  "checkout.qrAlt": "VietQR cho cọc {amount}",

  // Success
  "success.confirmed": "Đã xác nhận",
  "success.title": "Khoảnh khắc của bạn đã được giữ chỗ.",
  "success.body":
    "Cảm ơn bạn. Chúng tôi đã nhận được tiền cọc và đơn hàng {order} đã được ghi vào sổ atelier. Stylist sẽ liên hệ trong vòng một ngày làm việc để sắp xếp buổi thử đồ.",
  "success.return": "Về trang chủ",
  "success.continue": "Tiếp tục xem",

  // AI chat
  "ai.chatLabel": "Trò chuyện với trợ lý AI",
  "ai.title": "Lumi",
  "ai.subtitle": "Trợ lý atelier",
  "ai.welcome": "Xin chào — tôi là Lumi, trợ lý atelier của bạn. Hãy hỏi tôi bất cứ điều gì về các gói chụp hoặc đầm.",
  "ai.placeholder": "Hỏi về một thiết kế hoặc gói...",
  "ai.preset1": "Gói Khoảnh Khắc Vàng bao gồm gì?",
  "ai.preset2": "Bạn có đầm size lớn không?",
  "ai.preset3": "Đặt cọc hoạt động ra sao?",
  "ai.reply1":
    "Gói Khoảnh Khắc Vàng Trước Cưới bao gồm 4 giờ chụp, một nhiếp ảnh chính + trợ lý, 80 ảnh đã chỉnh sửa và album bìa vải lanh 20 trang. Có thể bổ sung clip teaser trong ngày.",
  "ai.reply2":
    "Có — khoảng một phần ba bộ sưu tập có size US 12–22. Hãy ghé atelier và stylist sẽ chuẩn bị các thiết kế phù hợp với số đo của bạn.",
  "ai.reply3":
    "Chúng t��i giữ ngày của bạn với 20% tiền cọc qua VietQR. Số dư còn lại thanh toán 7 ngày trước sự kiện. Tiền cọc được hoàn lại nếu hủy trước 30 ngày.",
  "ai.fallback":
    "Cảm ơn bạn — stylist của chúng tôi sẽ phản hồi sớm. Trong lúc chờ, bạn có thể xem bộ sưu tập hoặc đặt lịch tư vấn.",
  "ai.sendAria": "Gửi",
  "ai.closeAria": "Đóng trò chuyện",

  // Admin nav
  "admin.nav.overview": "Tổng quan",
  "admin.nav.orders": "Đơn hàng",
  "admin.nav.inventory": "Kho",
  "admin.nav.ai": "AI & Chính sách",
  "admin.nav.settings": "Cài đặt",
  "admin.viewStorefront": "Xem cửa hàng",
  "admin.searchAll": "Tìm đơn, sản phẩm, khách hàng...",
  "admin.studioOwner": "Chủ studio",
  "admin.adminBadge": "Quản trị",
  "admin.notifications": "Thông báo",

  // Overview
  "overview.eyebrow": "Tổng quan",
  "overview.greeting": "Chào buổi sáng, Admin",
  "overview.subtitle": "Hôm nay atelier hoạt động thế nào.",
  "overview.last30": "30 ngày qua",
  "overview.last90": "90 ngày qua",
  "overview.thisYear": "Năm nay",
  "overview.totalRevenue": "Tổng doanh thu",
  "overview.newOrders": "Đơn mới",
  "overview.activeRentals": "Đang cho thuê",
  "overview.aov": "Giá trị đơn TB",
  "overview.bookingTrends": "Xu hướng đặt chỗ",
  "overview.revenueAndBookings": "Doanh thu & đặt chỗ",
  "overview.viewReport": "Xem báo cáo",
  "overview.recentOrders": "Đơn gần đây",
  "overview.latestActivity": "Hoạt động mới nhất",
  "overview.allOrders": "Tất cả đơn",
  "overview.todayBadge": "{n} hôm nay",
  "overview.chartRevenue": "Doanh thu (triệu VND)",
  "overview.chartBookings": "Đặt chỗ",

  // Orders
  "orders.eyebrow": "Đơn hàng",
  "orders.title": "Đặt chỗ & cho thuê",
  "orders.subtitle": "Lọc theo trạng thái, tìm theo khách hàng hoặc mã đơn, mở bất kỳ đơn nào để xem chi tiết.",
  "orders.searchPlaceholder": "Tìm theo khách hàng hoặc mã đơn...",
  "orders.filterAll": "Tất cả",
  "orders.colOrder": "Đơn",
  "orders.colCustomer": "Khách hàng",
  "orders.colItems": "Sản phẩm",
  "orders.colDate": "Ngày",
  "orders.colTotal": "Tổng",
  "orders.colStatus": "Trạng thái",
  "orders.empty": "Không có đơn nào phù hợp với bộ lọc này.",
  "orders.bookingTitle": "Đặt chỗ",
  "orders.customer": "Khách hàng",
  "orders.items": "Sản phẩm",
  "orders.qty": "SL {n}",
  "orders.daysSuffix": "{n} ngày",
  "orders.eventDate": "Ngày sự kiện",
  "orders.created": "Tạo lúc",
  "orders.status": "Trạng thái",
  "orders.totalLabel": "Tổng",
  "orders.depositLabel": "Cọc",
  "orders.remaining": "Còn lại",
  "orders.markPaid": "Đánh dấu đã trả",
  "orders.sendReminder": "Gửi nhắc nhở",
  "orders.viewAria": "Xem {id}",

  // Inventory
  "inventory.eyebrow": "Kho",
  "inventory.title": "Bộ sưu tập atelier",
  "inventory.subtitle": "Quản lý mọi đầm, vest và gói chụp ảnh trong studio.",
  "inventory.searchPlaceholder": "Tìm trong kho...",
  "inventory.filterAll": "Tất cả",
  "inventory.addPiece": "Thêm thiết kế",
  "inventory.colPiece": "Thiết kế",
  "inventory.colCategory": "Danh mục",
  "inventory.colPrice": "Giá",
  "inventory.colAvailability": "Tình trạng",
  "inventory.skuPrefix": "Mã",
  "inventory.perDayShort": "/ngày",
  "inventory.available": "Sẵn sàng",
  "inventory.booked": "Đã đặt",
  "inventory.edit": "Sửa",
  "inventory.modal.eyebrow": "Thiết kế mới",
  "inventory.modal.title": "Thêm vào kho",
  "inventory.modal.pieceName": "Tên thiết kế",
  "inventory.modal.pieceNamePlaceholder": "VD: Đầm Cưới Ren Feli",
  "inventory.modal.category": "Danh mục",
  "inventory.modal.priceVnd": "Giá (VND)",
  "inventory.modal.pricePlaceholder": "1.200.000",
  "inventory.modal.description": "Mô tả",
  "inventory.modal.photos": "Ảnh",
  "inventory.modal.dropFiles": "Thả tệp hoặc bấm để tải lên",
  "inventory.modal.cancel": "Hủy",
  "inventory.modal.save": "Lưu thiết kế",

  // Admin AI
  "ai_admin.eyebrow": "AI & Chính sách",
  "ai_admin.title": "Cơ sở tri thức trợ lý",
  "ai_admin.subtitle":
    "Văn bản dưới đây được cung cấp cho Lumi, trợ lý AI của cửa hàng, mỗi khi khách hàng đặt câu hỏi. Hãy giữ giọng tự nhiên và cập nhật.",
  "ai_admin.policiesTitle": "Chính sách studio",
  "ai_admin.policiesDefault": `• Tiền cọc là 20% tổng giá trị, thanh toán qua VietQR khi đặt.
• Số dư còn lại đến hạn 7 ngày trước ngày sự kiện.
• Đơn thuê có 24 giờ ân hạn trả; trả trễ tính 25% giá thuê mỗi ngày.
• Đánh giá hư hỏng trong vòng 48 giờ sau khi trả; hao mòn nhẹ được miễn phí.
• Tất cả các gói chụp ảnh bao gồm thư viện trực tuyến riêng tư trong 12 tháng.`,
  "ai_admin.policiesHint": "Hỗ trợ Markdown. Gạch đầu dòng hoạt động tốt nhất.",
  "ai_admin.personaTitle": "Tính cách trợ lý",
  "ai_admin.personaName": "Tên trợ lý",
  "ai_admin.tone": "Giọng điệu",
  "ai_admin.toneWarm": "Ấm áp & thanh lịch",
  "ai_admin.toneCrisp": "Súc tích & chuyên nghiệp",
  "ai_admin.tonePlayful": "Vui tươi",
  "ai_admin.welcomeMessage": "Lời chào",
  "ai_admin.faqTitle": "Câu hỏi thường gặp",
  "ai_admin.faqDefault": `Hỏi: Làm thế nào để giữ ngày?
Đáp: Chọn thiết kế hoặc gói, chọn ngày, và thanh toán cọc 20% qua VietQR.

Hỏi: Tôi có thể thử đầm trước khi đặt không?
Đáp: Có — chúng tôi mở buổi thử 60 phút từ Thứ 3 đến Chủ Nhật. Đặt lịch tư vấn ở mục Liên hệ.`,
  "ai_admin.discard": "Hủy bỏ",
  "ai_admin.save": "Lưu cơ sở tri thức",
  "ai_admin.previewLabel": "Xem trước trực tiếp",
  "ai_admin.previewTitle": "Lumi nghe như thế nào",
  "ai_admin.previewQ": "Chính sách hoàn tiền của bạn là gì?",
  "ai_admin.previewA":
    "Tiền cọc được hoàn lại nếu hủy trước sự kiện 30 ngày. Trong 30 ngày, chúng tôi sẵn lòng dời lịch miễn phí.",
  "ai_admin.note":
    "Lumi tự động lấy thông tin từ chính sách, kho hàng hiện tại và lịch khả dụng. Lưu trang này để cập nhật trợ lý ngay lập tức.",

  // Settings
  "settings.eyebrow": "Cài đặt",
  "settings.title": "Hồ sơ studio",
  "settings.studioDetails": "Thông tin studio",
  "settings.studioName": "Tên studio",
  "settings.address": "Địa chỉ",
  "settings.contactEmail": "Email liên hệ",
  "settings.paymentAccount": "Tài khoản thanh toán",
  "settings.bank": "Ngân hàng",
  "settings.accountNumber": "Số tài khoản",
  "settings.beneficiary": "Người thụ hưởng",

  // Status
  "status.Awaiting Deposit": "Chờ đặt cọc",
  "status.Paid": "Đã thanh toán",
  "status.Service Ongoing": "Đang phục vụ",
  "status.Completed": "Hoàn thành",
  "status.Cancelled": "Đã hủy",

  // Language
  "lang.toggleAria": "Chuyển ngôn ngữ",
  "lang.english": "English",
  "lang.vietnamese": "Tiếng Việt",
  "lang.short.en": "EN",
  "lang.short.vi": "VI",

  // Home — Special Offers
  "home.offers.eyebrow": "Ưu Đãi Đặc Biệt",
  "home.offers.title": "Giảm giá tuần này",
  "home.offers.description":
    "Một số thiết kế và gói được tuyển chọn đang giảm giá — số lượng có hạn, phong cách vượt thời gian.",
  "home.offers.cta": "Xem tất cả ưu đãi",
  "home.offers.empty": "Hiện chưa có ưu đãi nào — vui lòng quay lại sau.",

  // Card
  "card.savePercent": "Tiết kiệm {n}%",
  "card.now": "Còn",
  "card.was": "Gốc",

  // Admin promotions
  "admin.nav.promotions": "Khuyến Mãi",
  "promotions.eyebrow": "Khuyến mãi",
  "promotions.title": "Thịnh hành & giảm giá",
  "promotions.subtitle":
    "Bật/tắt thiết kế thịnh hành và áp dụng giảm giá phần trăm. Thay đổi cập nhật ngay trên cửa hàng.",
  "promotions.searchPlaceholder": "Tìm thiết kế...",
  "promotions.filterAll": "Tất cả",
  "promotions.filterTrending": "Chỉ thịnh hành",
  "promotions.filterDiscounted": "Chỉ đang giảm giá",
  "promotions.colPiece": "Thiết kế",
  "promotions.colTrending": "Thịnh hành",
  "promotions.colDiscount": "Giảm giá",
  "promotions.colPricing": "Giá hiệu lực",
  "promotions.discountPlaceholder": "0",
  "promotions.percent": "%",
  "promotions.empty": "Không có thiết kế nào phù hợp.",
  "promotions.resetAll": "Đặt lại mặc định",
  "promotions.resetConfirm": "Đặt lại tất cả khuyến mãi về giá trị ban đầu?",
  "promotions.savedHint": "Tự động lưu thay đổi.",
  "promotions.statsTrending": "Thịnh hành",
  "promotions.statsOnSale": "Đang giảm",
  "promotions.statsAvgDiscount": "Giảm TB",
  "promotions.quickPick": "Chọn nhanh",
}

const dict = { en, vi } as const
export type DictKey = keyof typeof en

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: DictKey, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null
    if (saved === "vi" || saved === "en") {
      setLangState(saved)
      document.documentElement.lang = saved
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", l)
      document.documentElement.lang = l
    }
  }, [])

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      const table = dict[lang] as Record<string, string>
      let str = table[key] ?? (dict.en as Record<string, string>)[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    },
    [lang],
  )

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within LanguageProvider")
  return ctx
}

export function useT() {
  return useLang().t
}

// Localization helpers for product fields
export function loc<T>(field: { en: T; vi: T } | T, lang: Lang): T {
  if (field && typeof field === "object" && "en" in (field as Record<string, unknown>)) {
    const f = field as { en: T; vi: T }
    return (f[lang] ?? f.en) as T
  }
  return field as T
}
