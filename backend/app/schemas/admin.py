from pydantic import BaseModel


class ModelOption(BaseModel):
    id: str
    label: str


class ProviderOption(BaseModel):
    id: str
    label: str
    models: list[ModelOption]


class ModelCatalogResponse(BaseModel):
    chat_providers: list[ProviderOption]
    embedding_providers: list[ProviderOption]


class CategoryDTO(BaseModel):
    id: str
    slug: str
    name: dict

class AISettingsDTO(BaseModel):
    chat_provider: str
    chat_model: str
    embedding_provider: str
    embedding_model: str
    google_client_id: str | None = None
    google_client_secret: str | None = None
    database_url: str | None = None
    system_prompt: str | None = None


class PolicyUpdateDTO(BaseModel):
    content: str
    title: str | None = None
    locale: str = "vi"
    policy_type: str = "studio"


class PolicyResponseDTO(BaseModel):
    id: str
    title: str | None
    content: str
    locale: str
    policy_type: str


class ModelTestRequestDTO(BaseModel):
    prompt: str = "Please introduce yourself as the store concierge in 2 short sentences."


class ModelTestResponseDTO(BaseModel):
    provider: str
    model: str
    prompt: str
    answer: str


class ProductDTO(BaseModel):
    id: str | None = None
    slug: str
    name: dict
    category: str
    price: int
    price_per_day: bool = False
    image: str
    gallery: list[str] = []
    description: dict
    details: dict
    available: bool = True
    trending: bool = False
    discount: int = 0


class PromoUpdateDTO(BaseModel):
    trending: bool | None = None
    discount: int | None = None


class StudioProfileDTO(BaseModel):
    name: str
    address: str
    email: str
    bank_name: str
    bank_account: str
    bank_beneficiary: str
    facebook_link: str | None = None
    instagram_link: str | None = None


class OrderItemDTO(BaseModel):
    product_id: str
    name: str | None = None
    qty: int
    price: int
    days: int | None = None


class OrderDTO(BaseModel):
    id: str
    order_number: str
    customer: str
    email: str
    phone: str
    total: int
    deposit: int
    status: str
    event_date: str
    payment_proof: str | None = None
    items: list[OrderItemDTO]


class OrderStatusUpdateDTO(BaseModel):
    status: str


from app.models.models import UserRole, UserPermission

class UserDTO(BaseModel):
    id: str | None = None
    email: str
    username: str | None = None
    password: str | None = None
    full_name: str | None = None
    role: UserRole
    permission: UserPermission


class LoginRequestDTO(BaseModel):
    identifier: str
    password: str

class BulkDeleteRequestDTO(BaseModel):
    ids: list[str]
