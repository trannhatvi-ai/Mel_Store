import sys, os, uuid
from datetime import date
from sqlalchemy import text
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.models import Product, Category, StorePolicy, StudioProfile
from app.services.embeddings import embed_query

def seed():
    db = SessionLocal()
    try:
        # 1. Profile Studio
        p = db.query(StudioProfile).first() or StudioProfile(id=1)
        p.name, p.email = "Mel Studio", "hello@melstore.vn"
        p.bank_name, p.bank_account, p.bank_beneficiary = "Vietcombank", "0123 456 789", "MEL STORE"
        db.add(p)

        # 2. Categories
        cats = [
            {"id": "DRESS", "slug": "vay-cuoi", "name": {"vi": "Váy cưới", "en": "Wedding Dress"}},
            {"id": "PACKAGE", "slug": "goi-chup", "name": {"vi": "Gói chụp ảnh", "en": "Packages"}}
        ]
        for c in cats:
            db.merge(Category(**c))
        db.commit()
        
        # 3. Products & Packages
        products = [
            {
                "id": "p1", "slug": "lumiere-gown", "category": "DRESS", "price": 1200000, "price_per_day": True,
                "name": {"vi": "Đầm Cưới Lumière", "en": "Lumière Gown"},
                "image": "/images/mel-dress.png",
                "gallery": ["/images/mel-dress.png"],
                "description": {"vi": "Ren Pháp thêu tay cao cấp, phong cách vintage.", "en": "Premium hand-stitched lace, vintage style."},
                "details": {"vi": ["Size S/M", "Đuôi dài 1m", "Chất liệu ren Pháp"], "en": ["Size S/M", "1m train", "French lace"]}
            },
            {
                "id": "pk1", "slug": "golden-hour", "category": "PACKAGE", "price": 12500000, "price_per_day": False,
                "name": {"vi": "Gói Golden Hour", "en": "Golden Hour Package"},
                "image": "/images/mel-couple.png",
                "gallery": ["/images/mel-couple.png"],
                "description": {"vi": "Buổi chụp ngoại cảnh 4 giờ tại địa điểm tự chọn.", "en": "4-hour outdoor shoot at a location of your choice."},
                "details": {"vi": ["80 ảnh chỉnh sửa", "Bao gồm 2 váy + 1 vest", "Make-up chuyên nghiệp"], "en": ["80 retouched photos", "2 dresses + 1 suit included"]}
            }
        ]
        for p_data in products:
            txt = f"{p_data['name']['vi']} {p_data['description']['vi']} {' '.join(p_data['details']['vi'])}"
            p_data["embedding"] = embed_query(txt)
            db.merge(Product(**p_data))

        # 4. Policies (RAG)
        policies = [
            {
                "id": "pol1", "policy_type": "warranty", "title": "Phí vệ sinh trang phục", "locale": "vi",
                "content": "Nếu váy cưới hoặc vest bị dính bùn đất hoặc vết bẩn thông thường trong quá trình chụp, studio sẽ thu phí vệ sinh từ 100.000đ - 300.000đ tùy mức độ."
            },
            {
                "id": "pol2", "policy_type": "payment", "title": "Chính sách đặt cọc", "locale": "vi",
                "content": "Khách hàng cần đặt cọc trước 20% giá trị gói chụp để đảm bảo giữ lịch. Có thể dời lịch 1 lần miễn phí trước 7 ngày."
            }
        ]
        for pol in policies:
            pol["embedding"] = embed_query(pol["content"])
            db.merge(StorePolicy(**pol))

        db.commit()
        print("✅ Đã nạp dữ liệu Mel Studio thành công!")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally: db.close()

if __name__ == "__main__": seed()
