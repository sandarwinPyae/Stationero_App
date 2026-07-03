from datetime import datetime
import os
import traceback
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db import models
import subprocess
import uuid

router = APIRouter()


@router.get("/purchase-orders")
def read_purchase_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(models.PurchaseOrdersHeader)
        .options(joinedload(models.PurchaseOrdersHeader.supplier)) 
        .order_by(models.PurchaseOrdersHeader.purchase_order_id.desc())
        .all()
    )
    if not orders:
        return []
        
    return orders


def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.del_flag == 0).all()

@router.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).filter(models.Supplier.del_flag == 0).all()

class OrderItemCreate(BaseModel):
    product_id: int
    qty: int
    unit_price: float
    selling_price: float

class PurchaseOrderCreateRequest(BaseModel):
    supplier_id: int
    payment_method: Optional[str] = "Cash"
    items: List[OrderItemCreate]

@router.post("/purchase-orders")
def create_purchase_order(
    po_request: PurchaseOrderCreateRequest, 
    db: Session = Depends(get_db)
):
    try:
        cobol_input_lines = [str(len(po_request.items))]
        for item in po_request.items:
            cobol_input_lines.append(str(item.qty))
            cobol_input_lines.append(str(item.unit_price))
        
        cobol_input_text = "\n".join(cobol_input_lines) + "\n"

        # base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # cobol_exe_path = os.path.join(base_dir, "bin", "CALCPO.exe")
        base_dir = Path(__file__).resolve().parent.parent.parent 
        cobol_exe_path = base_dir / "bin" / "CALCPO.exe"


        
        # calculated_total = float(process.stdout.strip())
        if not cobol_exe_path.exists():
            print(f"Error: COBOL executable not found at {cobol_exe_path}")
            calculated_total = sum(item.qty * item.unit_price for item in po_request.items)
        else:
            process = subprocess.run(
                [str(cobol_exe_path)],
                input=cobol_input_text,
                text=True,
                capture_output=True,
                check=True
            )
            calculated_total = float(process.stdout.strip())

    except Exception as e:
        print("COBOL Execution Error / Not Found. Using fallback calculation.", e)
        calculated_total = sum(item.qty * item.unit_price for item in po_request.items)

    try:
        date_str = datetime.now().strftime("%Y%m%d")
        unique_id = str(uuid.uuid4().int)[:4]
        po_number = f"PO-{date_str}-{unique_id}"

        new_header = models.PurchaseOrdersHeader(
            supplier_id=po_request.supplier_id,
            po_number=po_number,
            total_amount=calculated_total,  
            payment_method=po_request.payment_method,
            purchase_order_status="Pending",
            purchase_order_date=datetime.now()
        )
        db.add(new_header)
        db.flush()  

        for item in po_request.items:
            new_detail = models.PurchaseOrdersDetails(
                purchase_order_id=new_header.purchase_order_id,
                product_id=item.product_id,
                qty=item.qty,
                unit_price=item.unit_price,
                sub_total=item.qty * item.unit_price
            )
            db.add(new_detail)

        db.commit()
        db.refresh(new_header)

        return {
            "status": "success",
            "message": "Purchase Order created successfully with pending status",
        }

    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# for purchase order view details
@router.get("/purchase-orders/{id}")
def get_purchase_order_details(id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.PurchaseOrdersHeader)
        .options(
            joinedload(models.PurchaseOrdersHeader.supplier),
            joinedload(models.PurchaseOrdersHeader.details).joinedload(models.PurchaseOrdersDetails.product)
        )
        .filter(models.PurchaseOrdersHeader.purchase_order_id == id)
        .first()
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    return {
        "po_number": order.po_number,
        "purchase_order_date": order.purchase_order_date, # Date ထည့်ပေးလိုက်ပါပြီ
        "purchase_order_status": order.purchase_order_status,
        "total_amount": order.total_amount,
        "supplier": {
            "supplier_name": order.supplier.supplier_name if order.supplier else None,
            "supplier_email": order.supplier.supplier_email if order.supplier else None,      
            "supplier_phone_no": order.supplier.supplier_phone_no if order.supplier else None  
        },
        "items": [
            {
                "product_name": detail.product.product_name if detail.product else "Unknown",
                "product_id": detail.product.product_id,
                "quantity": detail.qty,
                "unit_price": detail.unit_price,
                "selling_price": detail.product.selling_price 
            }
            for detail in order.details
        ]
    }

@router.put("/purchase-orders/{id}/confirm")
def confirm_purchase_order(id: int, update_data: dict, db: Session = Depends(get_db)):
    order = db.query(models.PurchaseOrdersHeader).filter(models.PurchaseOrdersHeader.purchase_order_id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.purchase_order_status == "Confirmed":
         raise HTTPException(status_code=400, detail="Order is already confirmed")

    order.purchase_order_status = "Confirmed"
    
    items = update_data.get("items", [])
    for item in items:
        p_id = item.get('product_id')
        detail = db.query(models.PurchaseOrdersDetails).filter(
            models.PurchaseOrdersDetails.purchase_order_id == id,
            models.PurchaseOrdersDetails.product_id == p_id
        ).first()
        
        if detail:
            detail.qty = item.get('quantity', detail.qty)
            detail.unit_price = item.get('unit_price', detail.unit_price)
            
            # ၂။ Product table ကို update လုပ်ခြင်း
            product = db.query(models.Product).filter(models.Product.product_id == p_id).first()
            if product:
                # Stock (Quantity) ပေါင်းထည့်ခြင်း
                product.current_qty = (product.current_qty or 0) + item.get('quantity', 0)
                
                # Product table ထဲမှ Price များကို Update လုပ်ခြင်း
                # သင့် Product model ထဲမှာ column နာမည်တွေက purchase_price / selling_price ဟုတ်မဟုတ် စစ်ပေးပါ
                product.selling_price = item.get('selling_price', product.selling_price)
                
                product.unit_price = item.get('unit_price', product.unit_price)
                
    db.commit()
    return {"message": "Order confirmed, Stock and Product Prices updated successfully"}