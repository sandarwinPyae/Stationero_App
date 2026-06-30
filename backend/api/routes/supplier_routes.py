from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models

router = APIRouter()

# Data Models
class SupplierCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class SupplierUpdate(BaseModel):
    supplier_name: str
    supplier_email: str
    supplier_phone_no: str
    supplier_address: str

# Endpoints
@router.get("/suppliers")
def read_suppliers(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Supplier)
    if include_deleted:
        query = query.filter(models.Supplier.del_flag == 1)
    else:
        query = query.filter(models.Supplier.del_flag == 0)
    return query.order_by(models.Supplier.supplier_id.desc()).all()

@router.post("/suppliers")
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(
        supplier_name=supplier.name, 
        supplier_email=supplier.email, 
        supplier_phone_no=supplier.phone, 
        supplier_address=supplier.address
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return {"message": "Success", "id": db_supplier.supplier_id}

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier.del_flag = 1 
    db.commit()
    return {"message": "Supplier deleted successfully"}

# GET Single Supplier & Update (URL path ကို /suppliers/ နဲ့ စအောင်ပြင်ထားပါ)
@router.get("/suppliers/{supplier_id}")
def get_single_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.put("/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.supplier_id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db_supplier.supplier_name = supplier.supplier_name
    db_supplier.supplier_email = supplier.supplier_email
    db_supplier.supplier_phone_no = supplier.supplier_phone_no
    db_supplier.supplier_address = supplier.supplier_address
    
    db.commit()
    db.refresh(db_supplier)
    return {"message": "Supplier updated successfully", "supplier": db_supplier}