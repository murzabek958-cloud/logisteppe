from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserLogin, Token
from backend.auth import get_password_hash, authenticate_user, create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.phone == user_data.phone)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    hashed_password = get_password_hash(user_data.password)

    db_user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        role=user_data.role
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.phone == user_data.phone)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email or phone already registered")
        else:
            raise HTTPException(status_code=500, detail="Registration failed due to server error")

    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role.value}

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}
    
