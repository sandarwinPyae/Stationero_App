from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models

router = APIRouter()

@router.get("/products")
def read_suppliers(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if include_deleted:
        query = query.filter(models.Prduct.del_flag == 1)
    else:
        query = query.filter(models.Product.del_flag == 0)
    return query.order_by(models.Product.product_id.desc()).all()