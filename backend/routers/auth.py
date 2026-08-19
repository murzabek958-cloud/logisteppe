@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Email/phone тексеру
    existing_user = db.query(User).filter((User.email == user_data.email) | (User.phone == user_data.phone)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    # Пароль хештеу
    hashed_password = get_password_hash(user_data.password)

    # Пайдаланушы қосу
    db_user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        role=user_data.role
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)  # Транзакция аяқталғаннан кейін орындау
    except IntegrityError:
        db.rollback()
        existing_user = db.query(User).filter((User.email == user_data.email) | (User.phone == user_data.phone)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email or phone already registered")
        else:
            raise HTTPException(status_code=500, detail="Registration failed due to server error")

    # Токен құру
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role.value}
