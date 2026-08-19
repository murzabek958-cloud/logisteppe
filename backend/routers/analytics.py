from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from backend.database import get_db
from backend.models import User, Order, Carrier, Route, UserRole, OrderStatus, RouteStatus
from backend.schemas import AnalyticsSummary
from backend.auth import get_current_active_user

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.dispatcher:
        raise HTTPException(status_code=403, detail="Only dispatchers can view analytics")

    total_orders = db.query(Order).count()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    delivered_today = db.query(Order).filter(
        Order.status == OrderStatus.delivered,
        Order.created_at >= today_start
    ).count()

    active_carriers = db.query(Carrier).filter(Carrier.is_available == True).count()

    completed_routes = db.query(Route).filter(Route.status == RouteStatus.completed).all()
    empty_miles_saved = round(sum(r.distance_km for r in completed_routes) * 0.30, 1)

    ltl_groups = db.query(Route).filter(
        Route.status != RouteStatus.planned
    ).count()

    top_routes_raw = (
        db.query(Order.origin, Order.destination, func.count(Order.id).label("count"))
        .group_by(Order.origin, Order.destination)
        .order_by(desc("count"))
        .limit(5)
        .all()
    )
    top_routes = [
        {"origin": r.origin, "destination": r.destination, "count": r.count}
        for r in top_routes_raw
    ]

    return AnalyticsSummary(
        total_orders=total_orders,
        delivered_today=delivered_today,
        empty_miles_saved_km=empty_miles_saved,
        active_carriers=active_carriers,
        ltl_groups_formed=ltl_groups,
        top_routes=top_routes,
    )
    
