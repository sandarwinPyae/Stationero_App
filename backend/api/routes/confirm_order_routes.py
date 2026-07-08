from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from db.database import get_db
from db import models

router = APIRouter()

# for sale order list
@router.get("/confirm-orders")
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(models.SaleOrdersHeader)\
               .options(joinedload(models.SaleOrdersHeader.customer))\
               .order_by(models.SaleOrdersHeader.sale_order_id.desc())\
               .all()
    return orders

# for sale order details
@router.get("/confirm-orders/details/{order_id}")
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.SaleOrdersHeader)
        .options(
            joinedload(models.SaleOrdersHeader.customer),
            joinedload(models.SaleOrdersHeader.payments),
            joinedload(models.SaleOrdersHeader.details).joinedload(models.SaleOrdersDetails.product)
        )
        .filter(models.SaleOrdersHeader.sale_order_id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order_details = []
    for detail in order.details:
        order_details.append({
            "sale_order_detail_id": detail.sale_order_detail_id,
            "product_id": detail.product_id,
            "product_name": detail.product.product_name if detail.product else "N/A",
            "qty": detail.qty,
            "selling_price": detail.selling_price,
            "sub_total": detail.sub_total,
        })

    return {
        "header": {
            "sale_order_id": order.sale_order_id,
            "invoice_number": order.invoice_number,
            "order_date": order.order_date,
            "status": order.status,
            "discount": order.discount,
            "total_amount": order.total_amount,
            "customer": {
                "customer_name": order.customer.customer_name if order.customer else "N/A",
                "customer_email": order.customer.customer_email if order.customer else "N/A",
                "customer_phone": order.customer.phone_number if order.customer else "N/A",
                "customer_address": order.customer.address if order.customer else "N/A",
            }
        },
        "details": order_details, 
        "payments": [
            {
                "payment_id": p.payment_id,
                "payment_method": p.sale_payment_method,
                "amount_paid": p.amount_paid,
                "pay_date": p.pay_date,
            }
            for p in order.payments
        ]
    }

# sale order status change (pending -> confirmed)
@router.put("/confirm-sale/{order_id}")
def confirm_sale(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.SaleOrdersHeader).filter(models.SaleOrdersHeader.sale_order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status == "Confirmed":
        raise HTTPException(status_code=400, detail="Order is already confirmed")

    try:
        order.status = "Confirmed"

        details = db.query(models.SaleOrdersDetails).filter(models.SaleOrdersDetails.sale_order_id == order_id).all()
        
        for detail in details:
            product = db.query(models.Product).filter(models.Product.product_id == detail.product_id).first()
            if product:
                if product.current_qty < detail.qty:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.product_name}")
                
                product.current_qty -= detail.qty
                db.add(product) 
        
        db.commit() 
        return {"message": "Order confirmed and stock updated successfully"}
    
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))