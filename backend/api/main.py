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

# Initialize database metadata and upload directories
models.Base.metadata.create_all(bind=engine)

if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Unified FastAPI App Initialization
app = FastAPI(title="Stationero Backend API", version="1.0.0")

# Static assets mounting
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Unified CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active Live Database State Layer (Fallback Mock Data)
DB_CUSTOMERS = [
    {"id": "SLD00001", "name": "Hsu Myat", "address": "Insein, Yangon", "email": "hsu@gmail.com", "phone": "09876543211"},
    {"id": "SLD00002", "name": "Meeni", "address": "Insein, Yangon", "email": "meeni@gamil.com", "phone": "09876543211"},
    {"id": "SLD00003", "name": "Win War", "address": "Insein, Yangon", "email": "winwar@gmail.com", "phone": "09876543211"},
    {"id": "SLD00004", "name": "Kaung", "address": "Insein, Yangon", "email": "kaung@gmail.com", "phone": "09876543211"},
    {"id": "SLD00005", "name": "Pyae", "address": "Insein, Yangon", "email": "pyae5@gmail.com", "phone": "09876543211"},
]

# Base Routes
@app.get("/")
def read_root():
    return {"message": "Database and Stationero API are ready!"}


@app.get("/api/v1/dashboard/metrics")
def get_dashboard_metrics():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    cobol_executable = os.path.abspath(os.path.join(current_dir, "..", "cobol", "dashboard.exe"))
    try:
        result = subprocess.run([cobol_executable], capture_output=True, text=True, check=True)
        lines = result.stdout.strip().split("\n")
        data_map = {line.split(":", 1)[0].strip().upper(): line.split(":", 1)[1].strip() for line in lines if ":" in line}
        return {
            "total_sales": int(data_map.get("TOTAL_SALES", 2100000)),
            "total_products": int(data_map.get("TOTAL_PRODUCTS", 2000000)),
            "top_product": data_map.get("TOP_PRODUCT", "Notebook"),
            "current_sales_pct": int(data_map.get("CURRENT_PERCENT", 86))
        }
    except Exception:
        return {"total_sales": 2100000, "total_products": 2000000, "top_product": "Notebook", "current_sales_pct": 86}


@app.get("/api/v1/customers")
def get_customers(
    search: str = Query(None), 
    page: int = Query(1, ge=1), 
    limit: int = Query(5, ge=1)
):
    filtered = DB_CUSTOMERS
    if search:
        q = search.lower()
        filtered = [c for c in DB_CUSTOMERS if q in c["name"].lower() or q in c["id"].lower() or q in c["email"].lower()]
    
    total_records = len(filtered)
    total_pages = math.ceil(total_records / limit) or 1
    
    start_offset = (page - 1) * limit
    end_offset = start_offset + limit
    paginated_items = filtered[start_offset:end_offset]
    
    return {
        "items": paginated_items,
        "total_records": total_records,
        "total_pages": total_pages,
        "current_page": page,
        "limit": limit,
    }

@app.delete("/api/v1/customers/{customer_id}")
def delete_customer(customer_id: str):
    global DB_CUSTOMERS
    initial_length = len(DB_CUSTOMERS)
    DB_CUSTOMERS = [c for c in DB_CUSTOMERS if c["id"] != customer_id]
    if len(DB_CUSTOMERS) == initial_length:
        raise HTTPException(status_code=404, detail="Customer record missing")
    return {"success": True, "deleted_id": customer_id}


# Include Routers
app.include_router(supplier_routes.router)
app.include_router(product_routes.router)
app.include_router(category_routes.router)
app.include_router(purchase_routes.router)
app.include_router(confirm_order_routes.router)
app.include_router(sale_report_routes.router)