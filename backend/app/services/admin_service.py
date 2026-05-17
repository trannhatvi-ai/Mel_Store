import hashlib
import uuid

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.models import AISetting, Order, OrderStatus, Product, StorePolicy, StudioProfile, User
from app.schemas.admin import (
    AISettingsDTO,
    PolicyUpdateDTO,
    ProductDTO,
    PromoUpdateDTO,
    StudioProfileDTO,
    UserDTO,
)
from app.services.embeddings import embed_query


def get_or_create_ai_settings(db: Session) -> AISetting:
    setting = db.get(AISetting, 1)
    if not setting:
        setting = AISetting(id=1)
        db.add(setting)

    dirty = False
    import os
    if setting.google_client_id is None and os.getenv("CLIENT_ID"):
        setting.google_client_id = os.getenv("CLIENT_ID")
        dirty = True
    if setting.google_client_secret is None and os.getenv("CLIENT_SECRET"):
        setting.google_client_secret = os.getenv("CLIENT_SECRET")
        dirty = True
    if setting.database_url is None and os.getenv("DATABASE_URL"):
        setting.database_url = os.getenv("DATABASE_URL")
        dirty = True
    try:
        from app.services.system_prompt import sanitize_system_prompt_for_storage

        sanitized_prompt = sanitize_system_prompt_for_storage(setting.system_prompt)
        if setting.system_prompt != sanitized_prompt:
            setting.system_prompt = sanitized_prompt
            dirty = True
    except ImportError:
        pass

    if setting.system_prompt is None:
        try:
            from app.services.system_prompt import BASE_SYSTEM_PROMPT
            setting.system_prompt = BASE_SYSTEM_PROMPT
            dirty = True
        except ImportError:
            pass

    if dirty or not setting.id:
        try:
            db.commit()
            db.refresh(setting)
        except IntegrityError:
            db.rollback()

    return setting


def update_ai_settings(db: Session, payload: AISettingsDTO) -> AISetting:
    setting = get_or_create_ai_settings(db)
    setting.chat_provider = payload.chat_provider
    setting.chat_model = payload.chat_model
    setting.embedding_provider = payload.embedding_provider
    setting.embedding_model = payload.embedding_model
    setting.google_client_id = payload.google_client_id
    setting.google_client_secret = payload.google_client_secret
    setting.database_url = payload.database_url
    from app.services.system_prompt import sanitize_system_prompt_for_storage

    setting.system_prompt = sanitize_system_prompt_for_storage(payload.system_prompt)
    db.commit()
    db.refresh(setting)
    return setting


def get_primary_policy(db: Session) -> StorePolicy | None:
    return db.scalar(
        select(StorePolicy)
        .where(StorePolicy.policy_type == "studio")
        .order_by(StorePolicy.updated_at.desc())
        .limit(1)
    )


def upsert_primary_policy(db: Session, payload: PolicyUpdateDTO) -> StorePolicy:
    from langchain_text_splitters import MarkdownHeaderTextSplitter
    
    setting = get_or_create_ai_settings(db)
    
    # 1. Save/Update the MASTER record (Full text for display)
    master_policy = db.scalar(
        select(StorePolicy).where(
            StorePolicy.policy_type == payload.policy_type,
            StorePolicy.locale == payload.locale
        ).limit(1)
    )
    
    if not master_policy:
        master_policy = StorePolicy(
            id=str(uuid.uuid4()),
            policy_type=payload.policy_type,
            locale=payload.locale,
            title=payload.title,
            content=payload.content,
        )
        db.add(master_policy)
    else:
        master_policy.title = payload.title
        master_policy.content = payload.content
        master_policy.updated_at = func.now()

    # 2. Handle CHUNKING for RAG
    # Clear old chunks first
    chunk_type = f"{payload.policy_type}_chunk"
    db.query(StorePolicy).filter(
        StorePolicy.policy_type == chunk_type,
        StorePolicy.locale == payload.locale,
    ).delete()
    
    headers_to_split_on = [
        ("#", "H1"),
        ("##", "H2"),
        ("###", "H3"),
        ("####", "H4"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    md_header_splits = markdown_splitter.split_text(payload.content)
    
    for split in md_header_splits:
        header_context = " > ".join(v for k, v in split.metadata.items())
        chunk_content = f"{header_context}\n\n{split.page_content}" if header_context else split.page_content
        
        chunk = StorePolicy(
            id=str(uuid.uuid4()),
            policy_type=chunk_type,
            locale=payload.locale,
            title=payload.title,
            content=chunk_content,
        )
        chunk.embedding = embed_query(
            chunk_content,
            provider=setting.embedding_provider,
            model=setting.embedding_model,
        )
        db.add(chunk)
    
    db.commit()
    db.refresh(master_policy)
    return master_policy


def get_all_products(db: Session) -> list[Product]:
    return db.scalars(select(Product).order_by(Product.created_at.desc())).all()


def upsert_product(db: Session, payload: ProductDTO) -> Product:
    product_id = payload.id or str(uuid.uuid4())
    product = db.get(Product, product_id)

    if not product:
        product = Product(id=product_id)
        db.add(product)

    product.slug = payload.slug
    product.name = payload.name
    normalized_category = payload.category.strip().upper()
    product.category = normalized_category
    product.price = payload.price
    product.price_per_day = payload.price_per_day
    product.image = payload.image
    product.gallery = payload.gallery
    product.description = payload.description
    product.details = payload.details
    product.available = payload.available
    product.trending = payload.trending
    product.discount = payload.discount

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str) -> tuple[bool, str]:
    product = db.get(Product, product_id)
    if not product:
        return False, "not_found"
    try:
        db.delete(product)
        db.commit()
        return True, "deleted"
    except IntegrityError:
        db.rollback()
        return False, "in_use"


def update_product_promo(db: Session, product_id: str, payload: PromoUpdateDTO) -> Product | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    if payload.trending is not None:
        product.trending = payload.trending
    if payload.discount is not None:
        product.discount = payload.discount
    db.commit()
    db.refresh(product)
    return product


def get_studio_profile(db: Session) -> StudioProfile:
    profile = db.get(StudioProfile, 1)
    if not profile:
        profile = StudioProfile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_studio_profile(db: Session, payload: StudioProfileDTO) -> StudioProfile:
    profile = get_studio_profile(db)
    profile.name = payload.name
    profile.address = payload.address
    profile.email = payload.email
    profile.bank_name = payload.bank_name
    profile.bank_account = payload.bank_account
    profile.bank_beneficiary = payload.bank_beneficiary
    profile.facebook_link = payload.facebook_link
    profile.instagram_link = payload.instagram_link
    db.commit()
    db.refresh(profile)
    return profile


def get_all_orders(db: Session) -> list[Order]:
    return db.scalars(select(Order).order_by(Order.created_at.desc())).all()


def update_order_status(db: Session, order_id: str, status: str) -> Order | None:
    order = db.get(Order, order_id)
    if not order:
        return None

    normalized = status.strip().upper().replace(" ", "_")
    order.status = OrderStatus(normalized)
    db.commit()
    db.refresh(order)
    return order


def get_all_users(db: Session) -> list[User]:
    return db.scalars(select(User).order_by(User.created_at.desc())).all()


def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def upsert_user(db: Session, payload: UserDTO) -> User:
    user_id = payload.id or str(uuid.uuid4())
    user = db.get(User, user_id)
    
    username = payload.username or payload.email

    if not user:
        user = User(id=user_id, email=payload.email, username=username)
        db.add(user)

    user.email = payload.email
    user.username = username
    user.full_name = payload.full_name
    user.role = payload.role
    user.permission = payload.permission
    
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> tuple[bool, str]:
    user = db.get(User, user_id)
    if not user:
        return False, "not_found"
    try:
        db.delete(user)
        db.commit()
        return True, "deleted"
    except IntegrityError:
        db.rollback()
        return False, "in_use"


def delete_order(db: Session, order_id: str) -> tuple[bool, str]:
    order = db.get(Order, order_id)
    if not order:
        return False, "not_found"
    try:
        db.delete(order)
        db.commit()
        return True, "deleted"
    except IntegrityError:
        db.rollback()
        return False, "in_use"

def bulk_delete_orders(db: Session, order_ids: list[str]) -> int:
    orders = db.query(Order).filter(Order.id.in_(order_ids)).all()
    count = 0
    for o in orders:
        db.delete(o)
        count += 1
    db.commit()
    return count
