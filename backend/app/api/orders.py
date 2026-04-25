from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.models import Order, OrderStatus, OrderItem
import uuid
import datetime

router = APIRouter(prefix="/api/orders", tags=["orders"])

class OrderItemPayload(BaseModel):
    product_id: str
    qty: int
    price: int
    days: int | None = None

class CreateOrderPayload(BaseModel):
    customer: str
    email: str
    phone: str
    total: int
    deposit: int
    event_date: str
    notes: str | None = None
    items: list[OrderItemPayload]

@router.post("")
def create_order(payload: CreateOrderPayload, db: Session = Depends(get_db)):
    # Generate unique ML-xxxx order number
    count = db.query(Order).count()
    order_number = f"ML-{2400 + count}"
    
    o = Order(
        id=str(uuid.uuid4()),
        order_number=order_number,
        customer=payload.customer,
        email=payload.email,
        phone=payload.phone,
        total=payload.total,
        deposit=payload.deposit,
        event_date=datetime.date.fromisoformat(payload.event_date.split("T")[0]),
        notes=payload.notes,
        status=OrderStatus.AWAITING_DEPOSIT
    )
    db.add(o)
    for item in payload.items:
        db.add(OrderItem(
            id=str(uuid.uuid4()),
            order_id=o.id,
            product_id=item.product_id,
            qty=item.qty,
            price=item.price,
            days=item.days
        ))
    db.commit()
    return {"id": o.id, "order_number": o.order_number}

class ProofPayload(BaseModel):
    proof: str

@router.patch("/{order_id}/proof")
def upload_proof(order_id: str, payload: ProofPayload, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(404, "Order not found")
    o.payment_proof = payload.proof
    o.status = OrderStatus.PAID
    db.commit()
    return {"success": True, "status": o.status.value}
