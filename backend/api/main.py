from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .routes import supplier_routes
from .routes import product_routes
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.database import SessionLocal, engine, get_db 
from db import models 

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(supplier_routes.router)
app.include_router(product_routes.router)