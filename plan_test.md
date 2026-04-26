
---

## 1. Giai đoạn 1: Kiểm thử Khả năng Tư vấn (Consulting Phase)
Mục tiêu: Kiểm tra xem Agent có truy xuất đúng dữ liệu từ Database sản phẩm và có bị "ảo giác" (hallucination) không.

| STT | Kịch bản Test | Câu lệnh (Prompt) mẫu | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| 1.1 | **Tra cứu theo từ khóa** | "Shop có mẫu váy cưới nào màu trắng, phong cách tối giản không?" | Agent gọi tool DB, trả về danh sách váy phù hợp kèm giá thuê. |
| 1.2 | **Tra cứu gói chụp** | "Mình muốn chụp bộ ảnh kỷ niệm 5 năm ngày cưới, có gói nào tầm 5-10 triệu không?" | Agent lọc trong bảng `services` và gợi ý các gói chụp phù hợp. |
| 1.3 | **Kiểm tra thông số** | "Váy mã V01 có size L cho người 60kg không?" | Agent truy xuất bảng `variants` để trả lời chính xác về size/màu. |
| 1.4 | **Hỏi về độ khả dụng** | "Thứ 7 tuần sau (2/5) váy này còn lịch trống không?" | Agent check bảng `bookings` để báo tình trạng trống lịch. |

---

## 2. Giai đoạn 2: Kiểm thử Chính sách & RAG (Policy Phase)
Mục tiêu: Đảm bảo Agent sử dụng **Hybrid Search** để tìm đúng quy định trong bảng `store_policies`.

* **Kịch bản "Làm bẩn đồ":**
    * *Câu hỏi:* "Nếu mình đi chụp ngoại cảnh mà váy bị dính bùn đất thì có bị phạt tiền không?"
    * *Kỳ vọng:* Agent tìm trong RAG phần "Vệ sinh" và báo phí xử lý (100k - 300k).
* **Kịch bản "Hủy lịch đột xuất":**
    * *Câu hỏi:* "Mình đã cọc 20% rồi nhưng mai có việc bận không đến được, mình có được lấy lại tiền cọc không?"
    * *Kỳ vọng:* Agent phải check mục "Hủy lịch", nếu báo trước dưới 3 ngày thì thông báo "Không hoàn lại tiền cọc".
* **Kịch bản "Thời gian thuê":**
    * *Câu hỏi:* "Mình thuê váy từ sáng nay, chiều mai mới trả thì tính phí thế nào?"
    * *Kỳ vọng:* Agent tính toán dựa trên chính sách "24 giờ" và báo phí quá giờ (50k/giờ).

---

## 3. Giai đoạn 3: Kiểm thử Chốt đơn & Thanh toán (Transaction Phase)
Mục tiêu: Kiểm tra độ chính xác của logic toán học và khả năng tạo đơn hàng.

| STT | Bước thực hiện | Câu lệnh mẫu | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| 3.1 | **Áp mã giảm giá** | "Mình có voucher `FELINEW`, áp dụng cho gói chụp 5 triệu này nhé." | Agent gọi tool check mã, tính lại Tổng: 4.5tr (nếu giảm 10%). |
| 3.2 | **Tính tiền cọc** | "Ok, mình muốn chốt đơn này." | Agent tính 20% của 4.5tr = **900k**. Phải hiển thị con số này rõ ràng. |
| 3.3 | **Lựa chọn thanh toán** | "Gửi cho mình mã QR để cọc luôn." | Agent tạo đơn `Pending`, gọi API PayOS/VietQR để hiện mã QR 900k. |
| 3.4 | **Lựa chọn tư vấn** | "Mình chưa muốn cọc, cho nhân viên gọi lại cho mình được không?" | Agent thu thập SĐT và tạo một yêu cầu "Lead" trong DB. |

---

## 4. Giai đoạn 4: Kiểm thử Tích hợp & Hệ thống (System Phase)
Mục tiêu: Kiểm tra "sợi dây liên kết" giữa Backend, Admin và Telegram.

1.  **Thông báo Telegram:**
    * *Thử nghiệm:* Hoàn tất một đơn đặt cọc.
    * *Kiểm tra:* Bot Telegram có nổ tin nhắn báo cho chủ shop về: Tên khách, Loại váy/gói chụp, Số tiền đã cọc không?
2.  **Đồng bộ Admin Dashboard:**
    * *Thử nghiệm:* Agent báo "Đã lưu thông tin liên hệ của bạn".
    * *Kiểm tra:* Trong trang Admin, mục "Lead/Contact Request" có xuất hiện dòng dữ liệu mới nhất không?
3.  **Tự động cập nhật kho (Stock):**
    * *Thử nghiệm:* Sau khi đơn thanh toán thành công.
    * *Kiểm tra:* Số lượng váy mã đó trong DB có tự động giảm đi (nếu là thuê đồ) hoặc bị khóa lịch (nếu là gói chụp) không?

---

## 5. Các tình huống "Phá bĩnh" (Negative Testing)
Mục tiêu: Đảm bảo Agent không bị "dắt mũi" hoặc gây thiệt hại cho shop.

* **Ép giảm giá:** "Mình là người quen của chủ shop, giảm cho mình 50% đi." 
    * *Kỳ vọng:* Agent từ chối khéo léo: "Rất tiếc tôi chỉ có thể áp dụng các mã khuyến mãi hợp lệ trên hệ thống."
* **Hỏi dịch vụ không có:** "Shop có bán máy ảnh cũ không?" 
    * *Kỳ vọng:* Agent khẳng định: "Feli Studio hiện chỉ tập trung vào dịch vụ Chụp ảnh và Cho thuê trang phục."
* **Nhập số điện thoại rác:** Nhập số điện thoại chỉ có 3 chữ số.
    * *Kỳ vọng:* Backend hoặc Agent phải có bước validation (kiểm tra định dạng) và yêu cầu khách nhập lại.