import os
import math
import subprocess
from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Database connections and model imports
from db.database import SessionLocal, engine, get_db 
from db import models 

# Route imports
from .routes import supplier_routes
from .routes import product_routes
from .routes import category_routes
from .routes import purchase_routes
from .routes import confirm_order_routes
from .routes import sale_report_routes
from .routes import dashboard_routes
from .routes import customer_routes

# Initialize database metadata and upload directories
models.Base.metadata.create_all(bind=engine)

if not os.path.exists("images"):
    os.makedirs("images")

# Unified FastAPI App Initialization
app = FastAPI(title="Stationero Backend API", version="1.0.0")

# Static assets mounting
app.mount("/images", StaticFiles(directory="images"), name="images")

# Unified CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include Routers
app.include_router(dashboard_routes.router)
app.include_router(customer_routes.router)
app.include_router(supplier_routes.router)
app.include_router(product_routes.router)
app.include_router(category_routes.router)
app.include_router(purchase_routes.router)
app.include_router(confirm_order_routes.router)
app.include_router(sale_report_routes.router)
