from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.dto import ChatRequestDTO, ChatResponseDTO, ModelCatalogResponse, ModelTestRequestDTO, ModelTestResponseDTO
from app.services.agent_runtime import invoke_agent
from app.services.chat_models import test_admin_configured_model
from app.services.model_catalog import get_model_catalog
from app.services.telegram import notify_human_support
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponseDTO)
async def chat(req: ChatRequestDTO) -> ChatResponseDTO:
    result = await invoke_agent(
        session_id=req.session_id,
        message=req.message,
        locale=req.locale,
        settings=req.settings.model_dump(),
        context=req.context,
    )
    return ChatResponseDTO(
        session_id=req.session_id,
        answer=result["answer"],
        tool=result.get("tool"),
        payload=result.get("payload"),
        debug=result.get("debug"),
        created_at=datetime.now(tz=timezone.utc),
    )


@router.get("/model-catalog", response_model=ModelCatalogResponse)
async def model_catalog() -> ModelCatalogResponse:
    chat_providers, embedding_providers = await get_model_catalog()
    return ModelCatalogResponse(chat_providers=chat_providers, embedding_providers=embedding_providers)


@router.post("/test-model", response_model=ModelTestResponseDTO)
async def test_model(req: ModelTestRequestDTO) -> ModelTestResponseDTO:
    result = await test_admin_configured_model(req.settings.model_dump(), req.prompt)
    return ModelTestResponseDTO(**result)


class NotifyRequest(BaseModel):
    message: str


@router.post("/notify")
async def notify(req: NotifyRequest) -> dict[str, bool]:
    await notify_human_support(req.message)
    return {"success": True}
