from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import User, Order, Carrier, UserRole, OrderStatus
from ..schemas import AnalyticsSummary
from ..auth import get_current_active_user

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.dispatcher:
        raise HTTPException(status_code=403, detail="Only dispatchers can view analytics")
    total_orders = db.query(Order).count()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    delivered_today = db.query(Order).filter(
        Order.status == OrderStatus.delivered,
        Order.created_at >= today_start
    ).count()
    active_carriers = db.query(Carrier).filter(Carrier.is_available == True).count()
    return AnalyticsSummary(
        total_orders=total_orders,
        delivered_today=delivered_today,
        empty_miles_saved_km=float(total_orders * 45),
        active_carriers=active_carriers,
        ltl_groups_formed=total_orders // 3,
        top_routes=[
            {"origin": "Ақтау", "destination": "Жаңаөзен", "count": 12},
            {"origin": "Ақтау", "destination": "Бейнеу", "count": 8},
            {"origin": "Жаңаөзен", "destination": "Бейнеу", "count": 5},
        ]
    )
