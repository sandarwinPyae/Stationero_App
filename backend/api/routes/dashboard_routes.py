from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, time, timedelta
from pydantic import BaseModel
from typing import List

from db.database import get_db
from db import models

router = APIRouter()


class DashboardCard(BaseModel):
    title: str
    value: str

class PieData(BaseModel):
    name: str
    value: int

class BarData(BaseModel):
    week: str
    sales: float

class LineData(BaseModel):
    value: float

class DashboardResponse(BaseModel):
    cards: List[DashboardCard]
    pieData: List[PieData]
    barData: List[BarData]
    lineData: List[LineData]
    performanceLineData: List[LineData]
    performance: float


@router.get("/dashboard" , response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    try:
        # 1. Total Sales
        total_sales = db.query(func.coalesce(func.sum(models.Payment.amount_paid), 0)).scalar()

        # 2. Products Sold
        products_sold = (
            db.query(func.coalesce(func.sum(models.SaleOrdersDetails.qty), 0))
            .join(models.SaleOrdersHeader, models.SaleOrdersDetails.sale_order_id == models.SaleOrdersHeader.sale_order_id)
            .filter(models.SaleOrdersHeader.status == "Confirmed")
            .scalar()
        )

        # 3. Top Selling Product
        top_product = (
            db.query(models.Product.product_name, func.sum(models.SaleOrdersDetails.qty).label("total_qty"))
            .join(models.SaleOrdersDetails, models.Product.product_id == models.SaleOrdersDetails.product_id)
            .join(models.SaleOrdersHeader, models.SaleOrdersDetails.sale_order_id == models.SaleOrdersHeader.sale_order_id)
            .filter(models.SaleOrdersHeader.status == "Confirmed")
            .group_by(models.Product.product_id, models.Product.product_name)
            .order_by(desc("total_qty"))
            .first()
        )
        top_product_name = top_product.product_name if top_product else "-"

        # for current sale calculation
        today = datetime.now()
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_month_sales = (
            db.query(func.coalesce(func.sum(models.Payment.amount_paid), 0))
            .filter(models.Payment.pay_date >= start_of_month)
            .scalar()
        )

        TARGET_SALES = 500000
        percentage = (current_month_sales / TARGET_SALES) * 100 if TARGET_SALES > 0 else 0
        final_percentage = min(round(percentage, 1), 100)

        DAILY_TARGET = TARGET_SALES / 30  
        
        performance_line_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            total = (
                db.query(func.coalesce(func.sum(models.Payment.amount_paid), 0))
                .filter(func.date(models.Payment.pay_date) == day.date())
                .scalar()
            )
            
            daily_perf = (float(total) / DAILY_TARGET) * 100 if DAILY_TARGET > 0 else 0
            performance_line_data.append({"value": round(daily_perf, 1)})
        
        # 4. Pie Chart Data
        pie_query = (
            db.query(models.Product.product_name.label("name"), func.sum(models.SaleOrdersDetails.qty).label("value"))
            .join(models.SaleOrdersDetails, models.Product.product_id == models.SaleOrdersDetails.product_id)
            .join(models.SaleOrdersHeader, models.SaleOrdersDetails.sale_order_id == models.SaleOrdersHeader.sale_order_id)
            .filter(models.SaleOrdersHeader.status == "Confirmed")
            .group_by(models.Product.product_name)
            .all()
        )
        pie_data = [{"name": item.name, "value": item.value} for item in pie_query]

        # 5. Bar Chart Data (Last 5 Weeks)
        bar_data = []

        for i in range(6, -1, -1):
            day = today - timedelta(days=i)

            start_of_day = datetime.combine(day.date(), time.min)
            end_of_day = datetime.combine(day.date(), time.max)

            total = (
                db.query(func.coalesce(func.sum(models.Payment.amount_paid), 0))
                .filter(models.Payment.pay_date >= start_of_day)
                .filter(models.Payment.pay_date <= end_of_day)
                .scalar()
            )

            bar_data.append({
                "week": day.strftime("%b %d"),
                "sales": float(total)
            })

        # 6. Line Chart Data (Last 7 Days)
        line_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            total = (
                db.query(func.coalesce(func.sum(models.Payment.amount_paid), 0))
                .filter(func.date(models.Payment.pay_date) == day.date())
                .scalar()
            )
            line_data.append({"value": float(total)})

        return {
            "cards": [
                {"title": "Total Sales", "value": f"{total_sales:,.0f} MMK"},
                {"title": "Products Sold", "value": str(products_sold)},
                {"title": "Top Selling Product", "value": top_product_name},
            ],
            "pieData": pie_data,
            "barData": bar_data,
            "lineData": line_data,
            "performanceLineData": performance_line_data,
            "performance": final_percentage
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))