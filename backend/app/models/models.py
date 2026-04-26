import enum
from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="category_ref")


class OrderStatus(str, enum.Enum):
    AWAITING_DEPOSIT = "AWAITING_DEPOSIT"
    PAID = "PAID"
    SERVICE_ONGOING = "SERVICE_ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UserRole(str, enum.Enum):
    GUEST = "GUEST"
    STUDIO = "STUDIO"
    ADMIN = "ADMIN"


class UserPermission(str, enum.Enum):
    VIEW = "VIEW"
    EDIT = "EDIT"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.GUEST, nullable=False)
    permission: Mapped[UserPermission] = mapped_column(Enum(UserPermission, name="user_permission"), default=UserPermission.VIEW, nullable=False)
    google_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    category: Mapped[str] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    category_ref: Mapped["Category"] = relationship(back_populates="products")
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_day: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    image: Mapped[str] = mapped_column(String, nullable=False)
    gallery: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    description: Mapped[dict] = mapped_column(JSON, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    trending: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    discount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dimension), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    order_number: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    customer: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    deposit: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status"), default=OrderStatus.AWAITING_DEPOSIT, nullable=False, index=True
    )
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_proof: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    days: Mapped[int | None] = mapped_column(Integer, nullable=True)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")


class Voucher(Base):
    __tablename__ = "vouchers"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class StorePolicy(Base):
    __tablename__ = "store_policies"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    policy_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    locale: Mapped[str] = mapped_column(String, nullable=False, default="vi", index=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dimension), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AISetting(Base):
    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    chat_provider: Mapped[str] = mapped_column(String, nullable=False, default="gemini")
    chat_model: Mapped[str] = mapped_column(String, nullable=False, default="gemini-2.0-flash")
    embedding_provider: Mapped[str] = mapped_column(String, nullable=False, default="gemini")
    embedding_model: Mapped[str] = mapped_column(String, nullable=False, default="gemini-embedding-001")
    google_client_id: Mapped[str | None] = mapped_column(String, nullable=True)
    google_client_secret: Mapped[str | None] = mapped_column(String, nullable=True)
    database_url: Mapped[str | None] = mapped_column(String, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class StudioProfile(Base):
    __tablename__ = "studio_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String, nullable=False, default="Feli Studio")
    address: Mapped[str] = mapped_column(String, nullable=False, default="23 Đồng Khởi, District 1, Saigon")
    email: Mapped[str] = mapped_column(String, nullable=False, default="hello@felistudio.vn")
    bank_name: Mapped[str] = mapped_column(String, nullable=False, default="Vietcombank")
    bank_account: Mapped[str] = mapped_column(String, nullable=False, default="0123 456 789")
    bank_beneficiary: Mapped[str] = mapped_column(String, nullable=False, default="FELI STUDIO")
    facebook_link: Mapped[str | None] = mapped_column(String, nullable=True)
    instagram_link: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
