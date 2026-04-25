from langchain_core.documents import Document
from langchain_postgres import PGVector
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import StorePolicy
from app.services.embeddings import get_gemini_embedding_client


def get_policy_pgvector_store() -> PGVector:
    return PGVector(
        embeddings=get_gemini_embedding_client("gemini-embedding-001"),
        connection=settings.database_url,
        collection_name="store_policies",
        use_jsonb=True,
    )


def sync_policy_documents(db: Session) -> int:
    policies = db.scalars(select(StorePolicy)).all()
    if not policies:
        return 0
    docs = [
        Document(
            page_content=policy.content,
            metadata={"id": policy.id, "policy_type": policy.policy_type, "locale": policy.locale},
        )
        for policy in policies
    ]
    ids = [policy.id for policy in policies]
    store = get_policy_pgvector_store()
    store.delete(ids=ids)
    store.add_documents(docs, ids=ids)
    return len(ids)
