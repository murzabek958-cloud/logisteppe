from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, orders, carriers, routes, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LogiSteppe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(carriers.router, prefix="/carriers", tags=["carriers"])
app.include_router(routes.router, prefix="/routes", tags=["routes"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@app.get("/")
def read_root():
    return {"message": "LogiSteppe Mangystau Cargo Platform API"}
