from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Order, Carrier, Route, UserRole, OrderStatus
from ..schemas import RouteResponse
from ..auth import get_current_active_user
from ..algorithms.backhaul_matcher import find_backhaul
from ..algorithms.ltl_grouping import group_orders
from ..algorithms.route_calculator import calculate_route

router = APIRouter()

@router.post("/match/{order_id}", response_model=dict)
def match_route(order_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.dispatcher:
        raise HTTPException(status_code=403, detail="Only dispatchers can match routes")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    backhaul_orders = find_backhaul(order.destination, order.created_at)
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.pending).all()
    grouped = group_orders(pending_orders, 10000.0)
    route_info = calculate_route(order.origin, order.destination, order.cargo_type, 30.0)
    return {
        "order_id": order_id,
        "origin": order.origin,
        "destination": order.destination,
        "backhaul_orders_found": len(backhaul_orders),
        "ltl_groups": len(grouped),
        **route_info
    }

@router.get("/", response_model=list[RouteResponse])
def get_routes(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role not in [UserRole.carrier, UserRole.dispatcher]:
        raise HTTPException(status_code=403, detail="Access denied")
    query = db.query(Route)
    if current_user.role == UserRole.carrier:
        carrier = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
        if carrier:
            query = query.filter(Route.carrier_id == carrier.id)
    return query.all()

@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route
