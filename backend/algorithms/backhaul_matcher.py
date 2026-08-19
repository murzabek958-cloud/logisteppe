from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from backend.models import Order, OrderStatus


def find_backhaul(
    carrier_destination: str,
    carrier_return_time: datetime,
    db: Session,
) -> List[dict]:
    """
    Тасымалдаушы жеткізіп болған соң кері бағытта (carrier_destination → кез-келген)
    pending тапсырыстарды іздейді — бос қайтпас үшін.
    """
    orders = (
        db.query(Order)
        .filter(
            Order.status == OrderStatus.pending,
            Order.origin == carrier_destination,
        )
        .all()
    )

    return [
        {
            "id": o.id,
            "origin": o.origin,
            "destination": o.destination,
            "weight_kg": o.weight_kg,
            "cargo_type": o.cargo_type.value if hasattr(o.cargo_type, "value") else str(o.cargo_type),
            "priority": o.priority.value if hasattr(o.priority, "value") else str(o.priority),
        }
        for o in orders
    ]
    
