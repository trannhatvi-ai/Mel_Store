from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Category, Order, User
from app.schemas.admin import (
    AISettingsDTO,
    BulkDeleteRequestDTO,
    CategoryDTO,
    LoginRequestDTO,
    ModelCatalogResponse,
    ModelTestRequestDTO,
    ModelTestResponseDTO,
    OrderDTO,
    OrderItemDTO,
    OrderStatusUpdateDTO,
    PolicyResponseDTO,
    PolicyUpdateDTO,
    ProductDTO,
    PromoUpdateDTO,
    StudioProfileDTO,
    UserDTO,
)
from app.services.admin_service import (
    bulk_delete_orders,
    delete_order,
    delete_product,
    delete_user,
    get_all_orders,
    get_all_products,
    get_all_users,
    get_or_create_ai_settings,
    get_password_hash,
    get_primary_policy,
    get_studio_profile,
    update_ai_settings,
    update_order_status,
    update_product_promo,
    update_studio_profile,
    upsert_primary_policy,
    upsert_product,
    upsert_user,
)
from app.services.chat_models import test_admin_configured_model
from app.services.model_catalog import get_model_catalog
from app.services.telegram import notify_human_support

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/categories", response_model=list[CategoryDTO])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryDTO]:
    categories = db.query(Category).all()
    return [CategoryDTO(id=c.id, slug=c.slug, name=c.name) for c in categories]

@router.post("/categories", response_model=CategoryDTO)
def create_category(payload: CategoryDTO, db: Session = Depends(get_db)) -> CategoryDTO:
    c = Category(id=payload.id, slug=payload.slug, name=payload.name)
    db.add(c)
    db.commit()
    return payload

@router.put("/categories/{category_id}", response_model=CategoryDTO)
def update_category(category_id: str, payload: CategoryDTO, db: Session = Depends(get_db)) -> CategoryDTO:
    c = db.get(Category, category_id)
    if not c:
        raise HTTPException(404, "Category not found")
    c.slug = payload.slug
    c.name = payload.name
    db.commit()
    return payload

@router.delete("/categories/{category_id}")
def remove_category(category_id: str, db: Session = Depends(get_db)):
    c = db.get(Category, category_id)
    if not c:
        raise HTTPException(404, "Category not found")
    try:
        db.delete(c)
        db.commit()
        return {"success": True}
    except Exception:
        raise HTTPException(409, "Cannot delete category in use")


@router.get("/products", response_model=list[ProductDTO])
def list_products(db: Session = Depends(get_db)) -> list[ProductDTO]:
    products = get_all_products(db)
    return [
        ProductDTO(
            id=p.id,
            slug=p.slug,
            name=p.name,
            category=p.category.title() if p.category else None,
            price=p.price,
            price_per_day=p.price_per_day,
            image=p.image,
            gallery=p.gallery,
            description=p.description,
            details=p.details,
            available=p.available,
            trending=p.trending,
            discount=p.discount,
        )
        for p in products
    ]


@router.post("/products", response_model=ProductDTO)
def create_product(payload: ProductDTO, db: Session = Depends(get_db)) -> ProductDTO:
    p = upsert_product(db, payload)
    return ProductDTO(
        id=p.id,
        slug=p.slug,
        name=p.name,
        category=p.category.title() if p.category else None,
        price=p.price,
        price_per_day=p.price_per_day,
        image=p.image,
        gallery=p.gallery,
        description=p.description,
        details=p.details,
        available=p.available,
        trending=p.trending,
        discount=p.discount,
    )


@router.delete("/products/{product_id}")
def remove_product(product_id: str, db: Session = Depends(get_db)):
    success, reason = delete_product(db, product_id)
    if success:
        return {"success": True}
    if reason == "not_found":
        raise HTTPException(status_code=404, detail="Product not found")
    if reason == "in_use":
        raise HTTPException(
            status_code=409,
            detail="Cannot delete product that is referenced by existing orders",
        )
    raise HTTPException(status_code=500, detail="Failed to delete product")


@router.patch("/products/{product_id}/promo", response_model=ProductDTO)
def update_promo(product_id: str, payload: PromoUpdateDTO, db: Session = Depends(get_db)) -> ProductDTO:
    p = update_product_promo(db, product_id, payload)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDTO(
        id=p.id,
        slug=p.slug,
        name=p.name,
        category=p.category.title() if p.category else None,
        price=p.price,
        price_per_day=p.price_per_day,
        image=p.image,
        gallery=p.gallery,
        description=p.description,
        details=p.details,
        available=p.available,
        trending=p.trending,
        discount=p.discount,
    )




@router.get("/model-catalog", response_model=ModelCatalogResponse)
async def model_catalog() -> ModelCatalogResponse:
    chat_providers, embedding_providers = await get_model_catalog()
    return ModelCatalogResponse(chat_providers=chat_providers, embedding_providers=embedding_providers)


@router.get("/settings", response_model=AISettingsDTO)
def get_settings(db: Session = Depends(get_db)) -> AISettingsDTO:
    setting = get_or_create_ai_settings(db)
    return AISettingsDTO(
        chat_provider=setting.chat_provider,
        chat_model=setting.chat_model,
        embedding_provider=setting.embedding_provider,
        embedding_model=setting.embedding_model,
        google_client_id=setting.google_client_id,
        google_client_secret=setting.google_client_secret,
        database_url=setting.database_url,
        system_prompt=setting.system_prompt,
    )


@router.put("/settings", response_model=AISettingsDTO)
def put_settings(payload: AISettingsDTO, db: Session = Depends(get_db)) -> AISettingsDTO:
    setting = update_ai_settings(db, payload)
    return AISettingsDTO(
        chat_provider=setting.chat_provider,
        chat_model=setting.chat_model,
        embedding_provider=setting.embedding_provider,
        embedding_model=setting.embedding_model,
        google_client_id=setting.google_client_id,
        google_client_secret=setting.google_client_secret,
        database_url=setting.database_url,
        system_prompt=setting.system_prompt,
    )


@router.get("/policy", response_model=PolicyResponseDTO | None)
def get_policy(db: Session = Depends(get_db)) -> PolicyResponseDTO | None:
    policy = get_primary_policy(db)
    if not policy:
        return None
    return PolicyResponseDTO(
        id=policy.id,
        title=policy.title,
        content=policy.content,
        locale=policy.locale,
        policy_type=policy.policy_type,
    )


@router.put("/policy", response_model=PolicyResponseDTO)
def put_policy(payload: PolicyUpdateDTO, db: Session = Depends(get_db)) -> PolicyResponseDTO:
    policy = upsert_primary_policy(db, payload)
    return PolicyResponseDTO(
        id=policy.id,
        title=policy.title,
        content=policy.content,
        locale=policy.locale,
        policy_type=policy.policy_type,
    )


@router.post("/test-model", response_model=ModelTestResponseDTO)
async def test_model(payload: ModelTestRequestDTO, db: Session = Depends(get_db)) -> ModelTestResponseDTO:
    result = await test_admin_configured_model(db, payload.prompt)
    return ModelTestResponseDTO(**result)


@router.get("/studio-profile", response_model=StudioProfileDTO)
def studio_profile(db: Session = Depends(get_db)) -> StudioProfileDTO:
    p = get_studio_profile(db)
    return StudioProfileDTO(
        name=p.name,
        address=p.address,
        email=p.email,
        bank_name=p.bank_name,
        bank_account=p.bank_account,
        bank_beneficiary=p.bank_beneficiary,
        facebook_link=p.facebook_link,
        instagram_link=p.instagram_link,
    )


@router.put("/studio-profile", response_model=StudioProfileDTO)
def put_studio_profile(payload: StudioProfileDTO, db: Session = Depends(get_db)) -> StudioProfileDTO:
    p = update_studio_profile(db, payload)
    return StudioProfileDTO(
        name=p.name,
        address=p.address,
        email=p.email,
        bank_name=p.bank_name,
        bank_account=p.bank_account,
        bank_beneficiary=p.bank_beneficiary,
        facebook_link=p.facebook_link,
        instagram_link=p.instagram_link,
    )


@router.get("/orders", response_model=list[OrderDTO])
def list_orders(db: Session = Depends(get_db)) -> list[OrderDTO]:
    orders = get_all_orders(db)
    return [
        OrderDTO(
            id=o.id,
            order_number=o.order_number,
            customer=o.customer,
            email=o.email,
            phone=o.phone,
            total=o.total,
            deposit=o.deposit,
            status=o.status.value.replace("_", " ").title(),
            event_date=o.event_date.isoformat(),
            items=[
                OrderItemDTO(
                    product_id=i.product_id,
                    name=i.product.name.get("vi") if i.product else "Unknown",
                    qty=i.qty,
                    price=i.price,
                    days=i.days,
                )
                for i in o.items
            ],
        )
        for o in orders
    ]


@router.patch("/orders/{order_id}/status", response_model=OrderDTO)
def patch_order_status(
    order_id: str, payload: OrderStatusUpdateDTO, db: Session = Depends(get_db)
) -> OrderDTO:
    try:
        o = update_order_status(db, order_id, payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unsupported order status")
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderDTO(
        id=o.id,
        order_number=o.order_number,
        customer=o.customer,
        email=o.email,
        phone=o.phone,
        total=o.total,
        deposit=o.deposit,
        status=o.status.value.replace("_", " ").title(),
        event_date=o.event_date.isoformat(),
        items=[
            OrderItemDTO(
                product_id=i.product_id,
                name=i.product.name.get("vi") if i.product else "Unknown",
                qty=i.qty,
                price=i.price,
                days=i.days,
            )
            for i in o.items
        ],
    )


@router.post("/orders/{order_id}/send-reminder")
async def send_order_reminder(order_id: str, db: Session = Depends(get_db)):
    o = db.get(Order, order_id)
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    message = (
        f"[Admin Reminder] Order {o.order_number} - {o.customer} ({o.phone}) "
        f"status: {o.status.value}. Please follow up."
    )
    await notify_human_support(message)

@router.delete("/orders/{order_id}")
def remove_order(order_id: str, db: Session = Depends(get_db)):
    success, reason = delete_order(db, order_id)
    if success:
        return {"success": True}
    if reason == "not_found":
        raise HTTPException(status_code=404, detail="Order not found")
    raise HTTPException(status_code=500, detail="Failed to delete order")


@router.post("/orders/bulk-delete")
def remove_orders_bulk(payload: BulkDeleteRequestDTO, db: Session = Depends(get_db)):
    count = bulk_delete_orders(db, payload.ids)
    return {"success": True, "count": count}


@router.post("/login")
def login(payload: LoginRequestDTO, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(or_(User.email == payload.identifier, User.username == payload.identifier))
    )
    if not user:
        raise HTTPException(status_code=401, detail="Tài khoản không tồn tại.")
    if user.hashed_password:
        if user.hashed_password != get_password_hash(payload.password):
            raise HTTPException(status_code=401, detail="Sai mật khẩu.")
    elif payload.password != "":
        raise HTTPException(status_code=401, detail="Sai mật khẩu.")
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role.value
    }


@router.get("/users", response_model=list[UserDTO])
def list_users(db: Session = Depends(get_db)):
    users = get_all_users(db)
    return [
        UserDTO(
            id=u.id,
            email=u.email,
            username=u.username,
            full_name=u.full_name,
            role=u.role.value,
            permission=u.permission.value
        ) for u in users
    ]


@router.post("/users", response_model=UserDTO)
def create_user(payload: UserDTO, db: Session = Depends(get_db)):
    u = upsert_user(db, payload)
    return UserDTO(
        id=u.id,
        email=u.email,
        username=u.username,
        full_name=u.full_name,
        role=u.role.value,
        permission=u.permission.value,
    )


@router.delete("/users/{user_id}")
def remove_user(user_id: str, db: Session = Depends(get_db)):
    success, reason = delete_user(db, user_id)
    if success:
        return {"success": True}
    if reason == "not_found":
        raise HTTPException(status_code=404, detail="User not found")
    raise HTTPException(status_code=409, detail="User is in use")

