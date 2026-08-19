from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Order, UserRole, OrderStatus
from backend.schemas import OrderCreate, OrderUpdateStatus, OrderResponse
from backend.auth import get_current_active_user
from backend.algorithms.price_estimator import estimate_price
from backend.algorithms.route_calculator import calculate_route
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.shipper:
        raise HTTPException(status_code=403, detail="Only shippers can create orders")
    route_info = calculate_route(order_data.origin, order_data.destination, order_data.cargo_type, 30.0)
    distance_km = route_info.get("distance_km", 100)
    month = datetime.now().month
    price = estimate_price(distance_km, order_data.weight_kg, order_data.cargo_type, month)
    db_order = Order(
        shipper_id=current_user.id,
        origin=order_data.origin,
        destination=order_data.destination,
        cargo_type=order_data.cargo_type,
        weight_kg=order_data.weight_kg,
        priority=order_data.priority,
        price_estimate=price
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=list[OrderResponse])
def get_orders(
    status: OrderStatus = None,
    origin: str = None,
    destination: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if origin:
        query = query.filter(Order.origin == origin)
    if destination:
        query = query.filter(Order.destination == destination)
    return query.offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderUpdateStatus, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role not in [UserRole.carrier, UserRole.dispatcher]:
        raise HTTPException(status_code=403, detail="Access denied")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
