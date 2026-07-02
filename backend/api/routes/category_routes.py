from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models

router = APIRouter()

@router.get("/categories")
def read_categories(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Category)
    if include_deleted:
        query = query.filter(models.Category.del_flag == 1)
    else:
        query = query.filter(models.Category.del_flag == 0)
    return query.order_by(models.Category.category_id.desc()).all()