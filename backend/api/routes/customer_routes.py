from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models

router = APIRouter()

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: str
    address: str


@router.get("/customers")
def read_customers(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Customer)
    if include_deleted:
        query = query.filter(models.Customer.del_flag == 1)
    else:
        query = query.filter(models.Customer.del_flag == 0)
    return query.order_by(models.Customer.customer_id.desc()).all()

@router.post("/customers")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(
        customer_name=customer.name,
        phone_number=customer.phone,
        customer_email=customer.email,
        address=customer.address,
        del_flag=0
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return {"message": "Customer created successfully", "id": db_customer.customer_id}

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer.del_flag = 1
    db.commit()
    return {"message": "Customer deleted successfully"}