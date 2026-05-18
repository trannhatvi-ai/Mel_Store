from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class LocalizedText(BaseModel):
    en: str
    vi: str


class ProductCardDTO(BaseModel):
    id: str
    slug: str
    name: LocalizedText | str
    category: str
    price: int
    pricePerDay: bool = False
    image: str
    available: bool
    discount: int = 0
    search_score: float | None = None


class BookingItemDTO(BaseModel):
    productId: str
    qty: int = Field(ge=1)
    price: int = Field(ge=0)
    days: int | None = Field(default=None, ge=1)


class CustomerInfoDTO(BaseModel):
    name: str
    email: str
    phone: str
    note: str | None = None
    eventDate: date


class BookingSummaryDTO(BaseModel):
    orderId: str
    items: list[BookingItemDTO]
    subtotal: int
    deposit: int
    remaining: int
    status: str
    eventDate: date
    paymentLinkOrQr: str


class DebugSearchResultDTO(BaseModel):
    source_type: Literal["product", "policy"]
    id: str
    semantic_rank: int | None = None
    keyword_rank: int | None = None
    search_score: float


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


class AISettingsDTO(BaseModel):
    chat_provider: str = "gemini"
    chat_model: str = "gemini-2.0-flash"
    embedding_provider: str = "gemini"
    embedding_model: str = "gemini-embedding-001"
    system_prompt: str | None = None


class ModelTestRequestDTO(BaseModel):
    prompt: str = "Please introduce yourself as the studio concierge in 2 short sentences."
    settings: AISettingsDTO = Field(default_factory=AISettingsDTO)


class ModelTestResponseDTO(BaseModel):
    provider: str
    model: str
    prompt: str
    answer: str


class ChatRequestDTO(BaseModel):
    session_id: str
    message: str
    locale: str = "vi"
    settings: AISettingsDTO = Field(default_factory=AISettingsDTO)
    context: dict[str, Any] = Field(default_factory=dict)


class ChatResponseDTO(BaseModel):
    session_id: str
    answer: str
    tool: str | None = None
    payload: dict[str, Any] | None = None
    debug: dict[str, Any] | None = None
    created_at: datetime
