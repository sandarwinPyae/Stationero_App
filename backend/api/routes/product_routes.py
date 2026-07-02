from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db import models 
import shutil
import os


router = APIRouter()

class ProductCreate(BaseModel):
    category_id: int
    product_name: str
    unit_price: float
    selling_price: float
    current_qty: int
    product_img_url: str

@router.get("/products")
def read_suppliers(include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if include_deleted:
        query = query.filter(models.Product.del_flag == 1)
    else:
        query = query.filter(models.Product.del_flag == 0)
    return query.order_by(models.Product.product_id.desc()).all()


@router.post("/products/add")
async def add_product(
    product_name: str = Form(...),
    category_id: int = Form(...),
    unit_price: float = Form(...),
    selling_price: float = Form(...),
    current_qty: int = Form(...),
    description: str = Form(None),
    image: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, image.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    new_product = models.Product(
        product_name=product_name,
        category_id=category_id,
        unit_price=unit_price,
        selling_price=selling_price,
        current_qty=current_qty,
        product_description=description,
        product_img_url=file_path # Path ကိုသာ သိမ်းပါ
    )
    db.add(new_product)
    db.commit()
    return {"message": "Product added successfully!"}


# product delete
@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.del_flag = 1 
    db.commit()
    return {"message": "Product deleted successfully"}

# view product details
@router.get("/products/{product_id}")
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# update product infos
@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    return product


@router.put("/products/edit/{product_id}")
async def edit_product(
    product_id: int,
    product_name: str = Form(...),
    category_id: int = Form(...),
    unit_price: float = Form(...),
    selling_price: float = Form(...),
    current_qty: int = Form(...),
    description: str = Form(None),
    image: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    
    if image:
        upload_dir = "uploads"
        file_path = os.path.join(upload_dir, image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        product.product_img_url = file_path

    product.product_name = product_name
    product.category_id = category_id
    product.unit_price = unit_price
    product.selling_price = selling_price
    product.current_qty = current_qty
    product.product_description = description
    
    db.commit()
    return {"message": "Product updated successfully"}
