# Feli Studio - Hệ Sinh Thái Dịch Vụ Cưới & Nhiếp Ảnh Tích Hợp AI

Chào mừng đến với **Feli Studio** - một nền tảng tiên phong kết hợp giữa nghệ thuật nhiếp ảnh và sức mạnh của Trí Tuệ Nhân Tạo (AI). Feli Studio mang đến trải nghiệm toàn diện cho các khách hàng muốn tìm kiếm các sản phẩm Váy Cưới, Vest Nam và Gói Chụp Ảnh với sự hỗ trợ của tư vấn viên AI túc trực 24/7.

## Giới Thiệu Chung

Feli Studio cung cấp một quy trình mua sắm và đặt lịch nhanh chóng, mượt mà và cá nhân hóa. Các dịch vụ chính bao gồm:
- **Váy Cưới (Wedding Dress):** Các thiết kế sang trọng, thanh lịch cho ngày trọng đại.
- **Vest Nam (Suit):** Các mẫu suit tinh tế, chuẩn form dáng.
- **Gói Chụp Ảnh (Photography Package):** Dịch vụ chụp ảnh chuyên nghiệp cho các sự kiện, ngày cưới.

Mọi sản phẩm và dịch vụ đều có chi tiết bảng giá, thông tin khuyến mãi, và có thể được tích hợp trực tiếp qua luồng giỏ hàng. Khách hàng có thể dễ dàng đặt cọc, đính kèm biên lai chuyển khoản (Payment Proof) và theo dõi tiến trình trực tiếp.

## Trợ Lý AI Tư Vấn (Sales Concierge)

Điểm nhấn của nền tảng Feli Studio là **AI Chatbot đa ngôn ngữ** được nhúng trực tiếp, hoạt động với các chức năng tối tân:

1. **Hiểu Ngữ Cảnh & Ngôn Ngữ Tự Nhiên**
   - Hỗ trợ đa ngôn ngữ (Tiếng Việt và Tiếng Anh).
   - Tự động duy trì trạng thái ngữ cảnh từ lịch sử chat, giúp cuộc hội thoại diễn ra tự nhiên như với một tư vấn viên thực thụ.

2. **Truy Xuất Dữ Liệu Thông Minh (RAG)**
   - Chatbot sử dụng công nghệ tìm kiếm vector (Vector Search) để tra cứu chính xác danh mục, giá cả sản phẩm, gói dịch vụ dựa trên yêu cầu của khách hàng.
   - Các chính sách cửa hàng (như quy định hủy, hoàn tiền, quy trình đặt cọc) cũng được AI giải thích rõ ràng qua dữ liệu RAG.

3. **Chốt Đơn Thông Minh (Booking/Sales Execution)**
   - Không chỉ tư vấn, AI còn hỗ trợ gợi ý chốt đơn khi nhận diện rõ ràng **ý định mua hàng (booking intent)** của người dùng thông qua mô hình phân tích ngữ nghĩa (Semantic Router).
   - AI hướng dẫn quy trình đặt cọc, các thông tin khách hàng cần cung cấp, giúp tăng tỷ lệ chuyển đổi.

4. **Trải Nghiệm Tương Tác Vượt Trội**
   - **Giao diện thân thiện:** Chatbot được thiết kế với hiệu ứng "đang suy nghĩ" sinh động (bouncing dots) không gây nhàm chán khi chờ AI phản hồi.
   - **Chống Spam/Double Submit:** Khóa ô nhập liệu khi AI đang sinh câu trả lời.
   - **Kiểm Soát Sinh Chữ (Abort Controller):** Khách hàng có quyền nhấn "Dừng" (Stop) câu trả lời của AI giữa chừng nếu họ đã có đủ thông tin, hoặc muốn đổi ý và cung cấp thông tin mới ngay lập tức.
   - **Gợi Ý Thông Minh:** Hệ thống cung cấp các prompt mẫu cho khách hàng ngay khi bắt đầu trò chuyện để gợi mở nhu cầu.

## Công Nghệ Sử Dụng

Nền tảng được xây dựng dựa trên các công nghệ tiên tiến nhất nhằm đảm bảo hiệu năng, tính ổn định và bảo mật:
- **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion mang đến giao diện UX/UI đẳng cấp.
- **Backend:** FastAPI (Python), tích hợp LangChain/LangGraph cho luồng suy luận của AI.
- **Database:** PostgreSQL kèm PgVector cho lưu trữ dữ liệu dạng Vector, tối ưu truy vấn AI RAG.
- **Mô Hình AI:** Hỗ trợ linh hoạt các mô hình ngôn ngữ lớn (Gemini, Claude, GPT) theo cấu hình hệ thống.

---
*Feli Studio - Nâng Tầm Trải Nghiệm Khách Hàng.*
