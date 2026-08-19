from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, ARRAY, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    shipper = "shipper"
    carrier = "carrier"
    dispatcher = "dispatcher"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    matched = "matched"
    in_transit = "in_transit"
    delivered = "delivered"

class CargoType(str, enum.Enum):
    food = "food"
    construction = "construction"
    general = "general"
    perishable = "perishable"

class Priority(str, enum.Enum):
    urgent = "urgent"
    normal = "normal"
    low = "low"

class RouteStatus(str, enum.Enum):
    planned = "planned"
    active = "active"
    completed = "completed"

class RoadQuality(str, enum.Enum):
    asphalt = "asphalt"
    partial = "partial"
    dirt = "dirt"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    shipper_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    cargo_type = Column(SQLEnum(CargoType), nullable=False)
    weight_kg = Column(Float, nullable=False)
    priority = Column(SQLEnum(Priority), nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.pending)
    price_estimate = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    shipper = relationship("User")

class Carrier(Base):
    __tablename__ = "carriers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    truck_capacity_kg = Column(Float, nullable=False)
    current_location_name = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    user = relationship("User")

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    carrier_id = Column(Integer, ForeignKey("carriers.id"), nullable=False)
    order_ids = Column(ARRAY(Integer))
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    waypoints = Column(JSON)
    distance_km = Column(Float, nullable=False)
    estimated_hours = Column(Float, nullable=False)
    fuel_cost_tenge = Column(Float, nullable=False)
    status = Column(SQLEnum(RouteStatus), default=RouteStatus.planned)
    created_at = Column(DateTime, default=datetime.utcnow)
    carrier = relationship("Carrier")

class Settlement(Base):
    __tablename__ = "settlements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    road_quality = Column(SQLEnum(RoadQuality), nullable=False)
    distance_from_aktau_km = Column(Float, nullable=False)
    
