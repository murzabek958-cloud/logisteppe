from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from ..database import get_db
from ..models import User, Order, Carrier, Route, UserRole, OrderStatus, RouteStatus
from ..schemas import RouteResponse
from ..auth import get_current_active_user
from ..algorithms.backhaul_matcher import find_backhaul
from ..algorithms.ltl_grouping import group_orders
from ..algorithms.route_calculator import calculate_route

router = APIRouter()

@router.post("/match/{order_id}", response_model=dict)
def match_route(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.dispatcher:
        raise HTTPException(status_code=403, detail="Only dispatchers can match routes")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail="Order is not in pending status")

    available_carriers = db.query(Carrier).filter(
        and_(
            Carrier.is_available == True,
            Carrier.truck_capacity_kg >= order.weight_kg
        )
    ).all()

    route_info = calculate_route(order.origin, order.destination, order.cargo_type, 30.0)

    if not available_carriers:
        return {
            "matched": False,
            "reason": "Бос тасымалдаушы жоқ",
            "order_id": order_id,
            "origin": order.origin,
            "destination": order.destination,
            "weight_kg": order.weight_kg,
            **route_info
        }

    selected_carrier = available_carriers[0]

    backhaul_orders = find_backhaul(order.destination, datetime.utcnow(), db)

    pending_same_route = db.query(Order).filter(
        and_(
            Order.status == OrderStatus.pending,
            Order.origin == order.origin,
            Order.destination == order.destination
        )
    ).all()
    grouped_orders = group_orders(pending_same_route, selected_carrier.truck_capacity_kg)

    route = Route(
        carrier_id=selected_carrier.id,
        order_ids=[order.id],
        origin=order.origin,
        destination=order.destination,
        waypoints=[],
        distance_km=route_info.get("distance_km", 0),
        estimated_hours=route_info.get("estimated_hours", 0),
        fuel_cost_tenge=route_info.get("fuel_cost_tenge", route_info.get("distance_km", 0) * 200),
        status=RouteStatus.planned
    )

    db.add(route)
    db.flush()

    order.status = OrderStatus.matched
    selected_carrier.is_available = False

    db.commit()
    db.refresh(route)

    return {
        "matched": True,
        "route_id": route.id,
        "carrier_id": selected_carrier.id,
        "order_id": order.id,
        "origin": order.origin,
        "destination": order.destination,
        "distance_km": route.distance_km,
        "estimated_hours": route.estimated_hours,
        "fuel_cost_tenge": route.fuel_cost_tenge,
        "backhaul_orders_found": len(backhaul_orders),
        "ltl_groups": len(grouped_orders),
        "warnings": route_info.get("warnings", [])
    }


@router.patch("/{route_id}/status", response_model=RouteResponse)
def update_route_status(
    route_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.carrier, UserRole.dispatcher]:
        raise HTTPException(status_code=403, detail="Only carriers or dispatchers can update route status")

    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    if current_user.role == UserRole.carrier:
        carrier = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
        if not carrier or route.carrier_id != carrier.id:
            raise HTTPException(status_code=403, detail="Access denied")

    try:
        new_status = RouteStatus(payload["status"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or missing status")

    route.status = new_status

    if new_status == RouteStatus.completed:
        for oid in (route.order_ids or []):
            o = db.query(Order).filter(Order.id == oid).first()
            if o:
                o.status = OrderStatus.delivered

        carrier = db.query(Carrier).filter(Carrier.id == route.carrier_id).first()
        if carrier:
            carrier.is_available = True

    db.commit()
    db.refresh(route)
    return route


@router.get("/", response_model=list[RouteResponse])
def get_routes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.carrier, UserRole.dispatcher]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Route)
    if current_user.role == UserRole.carrier:
        carrier = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
        if carrier:
            query = query.filter(Route.carrier_id == carrier.id)

    return query.all()


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    if current_user.role == UserRole.carrier:
        carrier = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
        if not carrier or route.carrier_id != carrier.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return route
        
