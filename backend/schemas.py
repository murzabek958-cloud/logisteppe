from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    shipper = "shipper"
    carrier = "carrier"
    dispatcher = "dispatcher"

class OrderStatus(str, Enum):
    pending = "pending"
    matched = "matched"
    in_transit = "in_transit"
    delivered = "delivered"

class CargoType(str, Enum):
    food = "food"
    construction = "construction"
    general = "general"
    perishable = "perishable"

class Priority(str, Enum):
    urgent = "urgent"
    normal = "normal"
    low = "low"

class RouteStatus(str, Enum):
    planned = "planned"
    active = "active"
    completed = "completed"

class RoadQuality(str, Enum):
    asphalt = "asphalt"
    partial = "partial"
    dirt = "dirt"

class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: Optional[str] = None

class OrderCreate(BaseModel):
    origin: str
    destination: str
    cargo_type: CargoType
    weight_kg: float
    priority: Priority

class OrderUpdateStatus(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: int
    shipper_id: int
    origin: str
    destination: str
    cargo_type: CargoType
    weight_kg: float
    priority: Priority
    status: OrderStatus
    price_estimate: Optional[float]
    created_at: datetime
    class Config:
        from_attributes = True

class CarrierRegister(BaseModel):
    truck_capacity_kg: float
    current_location_name: str

class CarrierUpdateLocation(BaseModel):
    current_location_name: str

class CarrierResponse(BaseModel):
    id: int
    user_id: int
    truck_capacity_kg: float
    current_location_name: str
    is_available: bool
    rating: float
    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    id: int
    carrier_id: int
    order_ids: List[int]
    origin: str
    destination: str
    waypoints: Optional[list]
    distance_km: float
    estimated_hours: float
    fuel_cost_tenge: float
    status: RouteStatus
    created_at: datetime
    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_orders: int
    delivered_today: int
    empty_miles_saved_km: float
    active_carriers: int
    ltl_groups_formed: int
    top_routes: List[dict]

class SettlementResponse(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    road_quality: RoadQuality
    distance_from_aktau_km: float
    class Config:
        from_attributes = True
