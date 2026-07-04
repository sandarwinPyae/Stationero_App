from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

from db import models, database, schemas

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="images"), name="images")

@app.get("/")
def read_root():
    return {"message": "Database is ready!"}

from sqlalchemy import or_

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = None, 
    sort: Optional[str] = "none", 
    db: Session = Depends(database.get_db)
):
    # ၁။ ပစ္စည်းအားလုံးကို အရင်ယူမယ်
    query = db.query(models.Product).filter(models.Product.del_flag == 0)
    
    # ၂။ Search ပါလာရင် နာမည်နဲ့ စစ်ထုတ်မယ် (Filtering)
    if search:
        # product_name ထဲမှာ search စာသားပါရင် ထုတ်ပေးမယ်
        query = query.filter(models.Product.product_name.ilike(f"%{search}%"))
    
    # ၃။ Price Sort လုပ်မယ်
    if sort == "low-to-high":
        query = query.order_by(models.Product.selling_price.asc())
    elif sort == "high-to-low":
        query = query.order_by(models.Product.selling_price.desc())
    
    products = query.all()
    
    # ၄။ Data Format ပြန်လုပ်မယ်
    result = []
    for p in products:
        price_int = int(p.selling_price)
        result.append({
            "product_id": p.product_id,
            "product_name": p.product_name,
            "selling_price": price_int,
            "display_price": f"{price_int:,} MMK",
            "current_qty": p.current_qty,
            "product_img_url": p.product_img_url
        })
    return result

# 🌟 ၂။ အရောင်းရဆုံး Best Selling (၃) မျိုးကို ထုတ်ပြမည့် API 🌟
@app.get("/api/products/best-selling", response_model=List[schemas.ProductResponse])
def get_best_selling(db: Session = Depends(database.get_db)):
    # တကယ့် အရောင်းမှတ်တမ်း (SaleOrdersDetails) ထဲကနေ အရေအတွက် အများဆုံး ရောင်းရတာကို ရှာပါမည်
    best_selling_records = db.query(
        models.SaleOrdersDetails.product_id,
        func.sum(models.SaleOrdersDetails.qty).label('total_qty')
    ).group_by(models.SaleOrdersDetails.product_id).order_by(desc('total_qty')).limit(3).all()
    
    if best_selling_records:
        product_ids = [record.product_id for record in best_selling_records]
        products = db.query(models.Product).filter(models.Product.product_id.in_(product_ids)).all()
    else:
        # အရောင်းမှတ်တမ်း မရှိသေးပါက ယာယီအားဖြင့် ရှေ့ဆုံးမှ Product (၃) ခုကို ပြပါမည်
        products = db.query(models.Product).filter(models.Product.del_flag == 0).limit(3).all()
        
    result = []
    for p in products:
        price_int = int(p.selling_price)
        result.append({
            "product_id": p.product_id,
            "product_name": p.product_name,
            "selling_price": price_int,
            "display_price": f"{price_int:,} MMK",
            "current_qty": p.current_qty,
            "product_img_url": p.product_img_url
        })
    return result

# 🌟 ၃။ Admin မှ Product စျေးနှုန်း အသစ်ပြောင်းရန် API 🌟
@app.put("/api/products/{product_id}/price")
def update_price(product_id: int, req: schemas.ProductPriceUpdate, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
    
    product.selling_price = req.new_price
    db.commit()
    
    return {
        "message": "စျေးနှုန်း အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။", 
        "new_price": f"{req.new_price:,} MMK"
    }

# Customer ဝယ်ယူသောအခါ Stock အလိုအလျောက် လျှော့မည့် API
@app.post("/api/purchase")
def buy_product(req: schemas.PurchaseRequest, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
    if product.current_qty < req.buy_qty:
        raise HTTPException(status_code=400, detail="Stock မလောက်ပါ။")
    
    product.current_qty -= req.buy_qty
    db.commit()
    return {"message": "အောင်မြင်စွာ ဝယ်ယူပြီးပါပြီ။", "remaining_qty": product.current_qty}

# Admin အတွက် Stock နည်းနေသော ပစ္စည်းများကို ပြမည့် API
@app.get("/api/admin/low-stock")
def get_low_stock(db: Session = Depends(database.get_db)):
    low_stock_items = db.query(models.Product).filter(
        models.Product.del_flag == 0,
        models.Product.current_qty < 10
    ).all()
    return {"low_stock_count": len(low_stock_items), "items": low_stock_items}

# 🌟 New Arrivals (နောက်ဆုံးသွင်းထားသော ပစ္စည်း ၃ ခု) ကို ထုတ်ပြမည့် API 🌟
@app.get("/api/products/new-arrivals", response_model=List[schemas.ProductResponse])
def get_new_arrivals(db: Session = Depends(database.get_db)):
    products = db.query(models.Product).filter(models.Product.del_flag == 0).order_by(models.Product.product_id.desc()).limit(3).all()
    
    result = []
    for p in products:
        price_int = int(p.selling_price)
        result.append({
            "product_id": p.product_id,
            "product_name": p.product_name,
            "selling_price": price_int,
            "display_price": f"{price_int:,} MMK",
            "current_qty": p.current_qty,
            "product_img_url": p.product_img_url
        })
    return result

@app.get("/api/promotions")
def get_promotions(db: Session = Depends(database.get_db)):
    promos = db.query(models.Promotion).all()
    return promos