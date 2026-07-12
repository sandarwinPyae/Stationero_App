from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import String, cast, func
from db import models
from db.database import get_db


router = APIRouter()

@router.get("/sale-reports")
def get_sale_reports(db: Session = Depends(get_db)):
    results = db.query(
        models.SaleOrdersHeader.sale_order_id,
        models.SaleOrdersHeader.invoice_number,
        models.Customer.customer_name,
        models.SaleOrdersHeader.order_date,
        models.SaleOrdersHeader.status,
        models.SaleOrdersHeader.total_amount,
        models.SaleOrdersHeader.discount
    ).join(models.Customer, models.SaleOrdersHeader.customer_id == models.Customer.customer_id)\
     .all()

    output = []
    for row in results:
        details = db.query(models.SaleOrdersDetails, models.Product.product_name)\
                    .join(models.Product, models.SaleOrdersDetails.product_id == models.Product.product_id)\
                    .filter(models.SaleOrdersDetails.sale_order_id == row.sale_order_id).all()
        
        output.append({
            "sale_order_id": row.sale_order_id,
            "invoice_number": row.invoice_number,
            "customer_name": row.customer_name,
            "order_date": row.order_date,
            "status": row.status,
            "total_amount": row.total_amount,
            "discount" : row.discount,
            "details": [
                {
                    "product_name": d.product_name,
                    "qty": d.SaleOrdersDetails.qty,
                    "selling_price": d.SaleOrdersDetails.selling_price,
                    "sub_total": d.SaleOrdersDetails.sub_total
                } for d in details
            ]
        })
    return output

@router.get("/sale-return-reports")
def get_sale_return_reports(db: Session = Depends(get_db)):
    returns = db.query(
        models.SaleReturnHeader.sale_return_id,
        models.SaleReturnHeader.total_returned_amount,
        models.SaleReturnHeader.return_reason,
        models.SaleReturnHeader.sale_return_payment_method,
        models.SaleReturnHeader.return_img_url, # 
        cast(models.SaleReturnHeader.sale_return_date, String).label("sale_return_date"),
        models.SaleOrdersHeader.invoice_number
    ).join(models.SaleOrdersHeader, models.SaleReturnHeader.sale_order_id == models.SaleOrdersHeader.sale_order_id)\
     .all()

    output = []
    for ret in returns:
        details = db.query(models.SaleReturnDetails, models.Product.product_name)\
                    .join(models.Product, models.SaleReturnDetails.product_id == models.Product.product_id)\
                    .filter(models.SaleReturnDetails.sale_return_id == ret.sale_return_id).all()
        
        output.append({
            "sale_return_id": ret.sale_return_id,
            "invoice_number": ret.invoice_number,
            "total_returned_amount": ret.total_returned_amount,
            "sale_return_date": ret.sale_return_date, 
            "return_reason": ret.return_reason,
            "sale_return_payment_method": ret.sale_return_payment_method,
            "return_img_url": ret.return_img_url, 
            "details": [
                {
                    "product_name": d.product_name,
                    "qty": d.SaleReturnDetails.qty,
                    "selling_price": d.SaleReturnDetails.selling_price,
                    "sub_total": d.SaleReturnDetails.sub_total
                } for d in details
            ]
        })
    return output