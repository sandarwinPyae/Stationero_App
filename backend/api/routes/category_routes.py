from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models

router = APIRouter()

class CategoryCreate(BaseModel):
    category_name: str

class CategoryUpdate(BaseModel):
    category_name: str

# 2. Endpoints 
@router.get("/categories")
def read_category(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Category)
    if include_deleted:
        query = query.filter(models.Category.del_flag == 1)
    else:
        query = query.filter(models.Category.del_flag == 0)
    return query.order_by(models.Category.updated_date.desc()).all()

# category create
@router.post("/categories/add")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    new_category = models.Category(category_name=category.category_name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {"message": "Category created successfully", "category": new_category}


@router.get("/categories/{id}")
def get_single_category(id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.category_id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/categories/{id}")
def update_category(id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = db.query(models.Category).filter(models.Category.category_id == id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_cat.category_name = category.category_name
    
    db.commit()
    db.refresh(db_cat)
    
    return {"message": "Category updated successfully", "category": db_cat}


# category delete
@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.del_flag = 1 
    db.commit()
    return {"message": "Category deleted successfully"}