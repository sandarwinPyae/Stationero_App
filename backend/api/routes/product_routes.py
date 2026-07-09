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
    return query.order_by(models.Product.updated_date.desc()).all()


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
    upload_dir = "images"
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
        description = description,
        product_img_url=image.filename 
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

# Theingi Change
@router.get("/products/{product_id}")
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
    
    # 🌟 ဒီ Condition လေးကို စစ်ပါ (Description မရှိရင် Default စာသား ထည့်ပေးလိုက်ပါ)
    product_data = {
        "product_id": product.product_id,
        "product_name": product.product_name,
        "selling_price": int(product.selling_price),
        "display_price": f"{int(product.selling_price):,} MMK",
        "current_qty": product.current_qty,
        "product_img_url": product.product_img_url,
        "description": product.description if product.description else "No description provided."
    }
    
    return product_data
#Theingi Change
@router.put("/products/edit/{product_id}")
async def edit_product(
    product_id: int,
    product_name: str = Form(...),
    category_id: int = Form(...),
    unit_price: float = Form(...),
    selling_price: float = Form(...),
    current_qty: int = Form(...),
    new_qty: int = Form(0),
    description: str = Form(None),
    image: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    
    if image:
        upload_dir = "images"
        file_path = os.path.join(upload_dir, image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        product.product_img_url = image.filename

    product.product_name = product_name
    product.category_id = category_id
    product.unit_price = unit_price
    product.selling_price = selling_price
    product.current_qty = current_qty + new_qty
    product.description = description
    
    db.commit()
    return {"message": "Product updated successfully"}


@router.get("/stock-report") # <-- FIX: Changed path from "/stock-report" to "/products/stock-report"
def get_admin_full_stock_report(db: Session = Depends(get_db)):
    try:
        # FIX: Changed Product to models.Product
        products = db.query(models.Product).filter(models.Product.del_flag == 0).all()
        report_list = []
        for p in products:
            p_id = f"P{p.product_id:03d}" if p.product_id else "P001"
            p_name = p.product_name if p.product_name else "Unnamed Product"
            p_qty = p.current_qty if p.current_qty is not None else 0
            
            p_category = "General"
            if p.category_id:
                # FIX: Changed Category to models.Category
                category_row = db.query(models.Category).filter(models.Category.category_id == p.category_id).first()
                if category_row and category_row.category_name:
                    p_category = category_row.category_name

            report_list.append({
                "product_id": p_id,
                "product_name": p_name,
                "category": p_category,
                "qty": p_qty
            })
        return {"status": "Success", "inventory": report_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---- 2. FIXED LOW STOCK ENDPOINT ----
@router.get("/low-stock-report") # <-- FIX: Changed path to match frontend expectations
def get_admin_low_stock_report(db: Session = Depends(get_db)):
    try:
        # FIX: Changed Product to models.Product
        products = db.query(models.Product).filter(models.Product.current_qty <= 10).all()
        report_list = []
        for p in products:
            p_id = f"P{p.product_id:03d}" if p.product_id else "P001"
            p_name = p.product_name if p.product_name else "Unnamed Product"
            p_qty = p.current_qty if p.current_qty is not None else 0
            
            p_category = "General"
            if p.category_id:
                # FIX: Changed Category to models.Category
                category_row = db.query(models.Category).filter(models.Category.category_id == p.category_id).first()
                if category_row and category_row.category_name:
                    p_category = category_row.category_name

            report_list.append({
                "product_id": p_id,
                "product_name": p_name,
                "category": p_category,
                "qty": p_qty
            })
        return {"status": "Success", "inventory": report_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
