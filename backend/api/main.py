from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel
from .routes import supplier_routes
from .routes import product_routes
from .routes import category_routes

from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.database import SessionLocal, engine, get_db 
from db import models 
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(supplier_routes.router)
app.include_router(product_routes.router)
app.include_router(category_routes.router)