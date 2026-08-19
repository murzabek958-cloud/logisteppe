from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Carrier, UserRole
from backend.schemas import CarrierRegister, CarrierUpdateLocation, CarrierResponse
from backend.auth import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=CarrierResponse)
def register_carrier(carrier_data: CarrierRegister, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.carrier:
        raise HTTPException(status_code=403, detail="Only carriers can register")
    existing = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Carrier profile already exists")
    db_carrier = Carrier(
        user_id=current_user.id,
        truck_capacity_kg=carrier_data.truck_capacity_kg,
        current_location_name=carrier_data.current_location_name
    )
    db.add(db_carrier)
    db.commit()
    db.refresh(db_carrier)
    return db_carrier

@router.get("/available", response_model=list[CarrierResponse])
def get_available_carriers(db: Session = Depends(get_db)):
    return db.query(Carrier).filter(Carrier.is_available == True).all()

@router.patch("/location", response_model=CarrierResponse)
def update_location(location_data: CarrierUpdateLocation, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.carrier:
        raise HTTPException(status_code=403, detail="Only carriers can update location")
    carrier = db.query(Carrier).filter(Carrier.user_id == current_user.id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Carrier not found")
    carrier.current_location_name = location_data.current_location_name
    db.commit()
    db.refresh(carrier)
    return carrier
    
