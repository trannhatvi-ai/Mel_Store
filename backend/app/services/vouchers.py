from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Voucher


def verify_voucher(db: Session, code: str) -> dict:
    voucher = db.scalar(select(Voucher).where(Voucher.code == code))
    if not voucher:
        return {"valid": False, "code": code, "reason": "Voucher not found"}
    if not voucher.active:
        return {"valid": False, "code": code, "reason": "Voucher inactive"}
    if voucher.expires_at and voucher.expires_at < datetime.now(timezone.utc):
        return {"valid": False, "code": code, "reason": "Voucher expired"}
    return {"valid": True, "code": code, "discount_percent": voucher.discount_percent}
