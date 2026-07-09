import os
import math
import subprocess
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel,EmailStr
from sqlalchemy.orm import Session
import sys

from typing import List, Optional
from fastapi import UploadFile, File, Form
from datetime import datetime
from sqlalchemy import func, desc, or_


# Route imports
from .routes import supplier_routes
from .routes import product_routes
from .routes import category_routes
from .routes import purchase_routes
from .routes import confirm_order_routes
from .routes import sale_report_routes
from .routes import dashboard_routes
from .routes import customer_routes

# Initialize database metadata and upload directories



# Unified FastAPI App Initialization
app = FastAPI(title="Stationero Backend API", version="1.0.0")

# Static assets mounting

# Unified CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include Routers
app.include_router(dashboard_routes.router)
app.include_router(customer_routes.router)
app.include_router(supplier_routes.router)
app.include_router(product_routes.router)
app.include_router(category_routes.router)
app.include_router(purchase_routes.router)
app.include_router(confirm_order_routes.router)
app.include_router(sale_report_routes.router)




# =====================================================================
# 🌟 PATH CONFIGURATION (Folder Structure အမှန်အတိုင်း အတိအကျ ချိန်ညှိထားခြင်း)
# =====================================================================
# 1. လက်ရှိ main.py ရှိသောနေရာ (STATIONERO_APP/backend/api)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Backend Folder (STATIONERO_APP/backend)
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

# 3. Project Root Folder (STATIONERO_APP)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# backend.db ကို Import လုပ်နိုင်ရန် Project Root ကို sys.path သို့ ထည့်ခြင်း
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# --- 1. DATABASE & MODELS IMPORTS ---
from backend.db import models, database, schemas
from backend.db.database import get_db
from backend.db.models import (
    Customer, User, SaleOrdersHeader, SaleOrdersDetails, 
    SaleReturnHeader, SaleReturnDetails, Product, Promotion
)

models.Base.metadata.create_all(bind=database.engine)



# 🌟 PRODUCT IMAGES PATH (STATIONERO_APP/backend/images သို့ ချိတ်ဆက်ခြင်း)
IMAGE_DIR = os.path.join(BACKEND_DIR, "images")
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)
app.mount("/images", StaticFiles(directory="images"), name="images")

# 🌟 RETURN IMAGES PATH (Return ပုံများအတွက် သီးသန့် Folder အသစ် ဆောက်ခြင်း) 🌟
RETURN_IMAGE_DIR = os.path.join(BACKEND_DIR, "return_images")
if not os.path.exists(RETURN_IMAGE_DIR):
    os.makedirs(RETURN_IMAGE_DIR)
app.mount("/return-images", StaticFiles(directory=RETURN_IMAGE_DIR), name="return_images")

# --- 3. COBOL CONFIGURATION ---
# 🌟 COBOL PATH (STATIONERO_APP/backend/cobol/customer_engine.exe သို့ ချိတ်ဆက်ခြင်း)
COBOL_EXE_PATH = os.path.join(BACKEND_DIR, "cobol", "customer_engine")


# =====================================================================
# --- 4. PYDANTIC VALIDATION MODELS ---
# =====================================================================
class CustomerSignUpRequest(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    address: str
    password: str

class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ReturnDetailItemPayload(BaseModel):
    product_id: int
    qty: int
    selling_price: float
    sub_total: float

class CustomerReturnEntryRequest(BaseModel):
    invoice_id: str 
    customer_email: str
    reason: str
    payment_method: str
    items: List[ReturnDetailItemPayload]

class OrderDetailItem(BaseModel):
    product_id: int
    qty: int
    selling_price: float
    sub_total: float

class CustomerOrderConfirm(BaseModel):
    net_amount: float
    total_qty: int
    customer_email: str
    payment_method: str
    items: List[OrderDetailItem]

class QuickReturnStatusRequest(BaseModel):
    customer_email: str
    product_name: str
    qty: int
    reason: str
    payment_method: str    

class ProfileUpdateRequest(BaseModel):
    email: EmailStr
    name: str
    phone_number: str
    address: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str    


# =====================================================================
# --- 5. CUSTOMER AUTHENTICATION & ORDERS ROUTER (သူငယ်ချင်း၏ Code) ---
# =====================================================================

@app.get("/")
def read_root():
    return {"message": "Database and Unified Services are ready!"}

@app.post("/api/signup", status_code=status.HTTP_201_CREATED)
def signup_customer(payload: CustomerSignUpRequest, db: Session = Depends(get_db)):
    user_record = db.query(User).filter(User.user_email == payload.email).first()
    try:
        result = subprocess.run(
            [COBOL_EXE_PATH, "SIGNUP", "Y" if user_record else "N", "N", payload.name, "customer"], 
            capture_output=True, text=True, check=False
        )
        cobol_message = result.stdout.strip()
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=cobol_message)
            
        new_user = User(user_email=payload.email, user_password=payload.password, role="customer")
        db.add(new_user)
        db.flush() 

        new_customer = Customer(
            customer_name=payload.name, customer_email=payload.email,
            phone_number=payload.phone_number, address=payload.address,
            customer_password=payload.password, del_flag=0
        )
        db.add(new_customer)
        db.commit()
        return {"message": cobol_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failure: {e}")

@app.post("/api/login")
def login_customer(payload: CustomerLoginRequest, db: Session = Depends(get_db)):
    user_account = db.query(User).filter(User.user_email == payload.email).first()
    match_flag, role_attribute, user_name, user_phone, user_address = "N", "customer", "User", "-", "-"

    if user_account:
        role_attribute = user_account.role 
        if user_account.user_password == payload.password:
            match_flag = "Y"
        customer_profile = db.query(Customer).filter(Customer.customer_email == payload.email).first()
        if customer_profile:
            user_name = customer_profile.customer_name
            user_phone = getattr(customer_profile, "phone_number", "-")
            user_address = getattr(customer_profile, "address", "-")

    try:
        result = subprocess.run(
            [COBOL_EXE_PATH, "LOGIN", "Y" if user_account else "N", match_flag, user_name, role_attribute], 
            capture_output=True, text=True, check=False
        )
        cobol_message = result.stdout.strip()
        if result.returncode == 0:
            return {
                "message": "Login successful!", "role": "customer", "customer_name": user_name,
                "profile": {"name": user_name, "email": payload.email, "phone": user_phone, "address": user_address}
            }
        else:
            return {"message": cobol_message, "role": role_attribute, "customer_name": user_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failure: {e}")
#Theingi Change
@app.post("/api/order/confirm", status_code=status.HTTP_201_CREATED)
def confirm_customer_order(payload: CustomerOrderConfirm, db: Session = Depends(get_db)):
    print("====== API HIT: CONFIRM ORDER ======")
    print("Payload Data:", payload.dict())
    
    try:
        last_global_order = db.query(SaleOrdersHeader).order_by(SaleOrdersHeader.sale_order_id.desc()).first()
        next_global_num = (last_global_order.sale_order_id if last_global_order else 0) + 1
        generated_system_invoice = f"INV{next_global_num:05d}"
        
        print(f"Generated Invoice: {generated_system_invoice}")

        # COBOL Engine ကို လှမ်းခေါ်တဲ့ အပိုင်း
        result = subprocess.run(
            [COBOL_EXE_PATH, "CONFIRM_ORDER", generated_system_invoice, str(payload.total_qty), str(int(payload.net_amount)), payload.customer_email], 
            capture_output=True, text=True, check=False
        )
        print("COBOL Output:", result.stdout)
        print("COBOL Error (If Any):", result.stderr)

        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stdout.strip())
            
        new_order_header = SaleOrdersHeader(
            customer_email=payload.customer_email, invoice_number=generated_system_invoice,
            total_amount=payload.net_amount, status="Pending",
            order_date=datetime.now(),
            payment_method=payload.payment_method
        )
        db.add(new_order_header)
        db.flush() 

        for item in payload.items:
            new_order_detail = SaleOrdersDetails(
                sale_order_id=new_order_header.sale_order_id, product_id=item.product_id,
                qty=item.qty, selling_price=item.selling_price, sub_total=item.sub_total
            )
            db.add(new_order_detail)

        db.commit() 
        print("====== DATABASE SAVE SUCCESS ======")
        return {"message": "Success", "invoice_number": generated_system_invoice}
        
    except Exception as e:
        db.rollback()
        print("====== ERROR OCCURRED ======")
        import traceback
        traceback.print_exc()  # Error အစအဆုံးကို Terminal မှာ ပြပေးမယ်
        raise HTTPException(status_code=500, detail=f"Database relational insert breakdown: {e}")

@app.get("/api/order/next-invoice/{customer_email}")
def generate_next_invoice_id(customer_email: str, db: Session = Depends(get_db)):
    try:
        last_order = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.customer_email == customer_email).order_by(SaleOrdersHeader.sale_order_id.desc()).first()
        next_number = 1
        if last_order and last_order.invoice_number:
            try:
                numeric_part = int(last_order.invoice_number.replace("INV", ""))
                next_number = numeric_part + 1
            except ValueError:
                next_number = 1
        return {"invoice_id": f"INV{next_number:05d}"}
    except Exception:
        return {"invoice_id": "INV00001"}

@app.post("/api/order/return-entry", status_code=status.HTTP_201_CREATED)
def record_customer_order_return(payload: CustomerReturnEntryRequest, db: Session = Depends(get_db)):
    original_order = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.invoice_number == payload.invoice_id).first()
    if not original_order:
        raise HTTPException(status_code=404, detail=f"Invoice reference code {payload.invoice_id} not found.")

    computed_total_returned = sum(item.sub_total for item in payload.items)
    computed_total_qty = sum(item.qty for item in payload.items)

    try:
        result = subprocess.run(
            [COBOL_EXE_PATH, "RETURN_ORDER", payload.invoice_id, str(computed_total_qty), "customer", payload.customer_email], 
            capture_output=True, text=True, check=False
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stdout.strip())

        new_return_header = SaleReturnHeader(
            sale_order_id=original_order.sale_order_id, total_returned_amount=computed_total_returned,
            sale_return_payment_method=payload.payment_method, return_reason=payload.reason
        )
        db.add(new_return_header)
        db.flush() 

        for item in payload.items:
            new_return_detail = SaleReturnDetails(
                sale_return_id=new_return_header.sale_return_id, product_id=item.product_id,
                qty=item.qty, selling_price=item.selling_price, sub_total=item.sub_total
            )
            db.add(new_return_detail)

        db.commit() 
        return {"status": "Success", "message": "Return logged completely separate from purchase order values."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database separate return storage failure: {e}")

@app.get("/api/order/history-logs/{customer_email}")
def get_customer_history_logs(customer_email: str, db: Session = Depends(get_db)):
    try:
        orders_query = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.customer_email == customer_email).order_by(SaleOrdersHeader.sale_order_id.asc()).all()
        orders_list = []
        for index, o in enumerate(orders_query, start=1):
            orders_list.append({
                "invoice_number": f"INV{index:05d}", "status": o.status if o.status else "Pending",
                "total_amount": o.total_amount, 
                "payment_method": getattr(o, 'payment_method', 'Cash Down'), # 🌟 Dynamic
                "sale_person": getattr(o, 'sale_person', 'Pending Assign'), # 🌟 Dynamic (Hsu Myat အစား)
                "order_date": o.order_date.strftime("%Y-%m-%d %H:%M:%S") if o.order_date else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        user_order_ids = [o.sale_order_id for o in orders_query]
        returns_list = []
        if user_order_ids:
            returns_query = db.query(SaleReturnHeader).filter(SaleReturnHeader.sale_order_id.in_(user_order_ids)).order_by(SaleReturnHeader.sale_return_id.desc()).all()
            for index, r in enumerate(returns_query, start=1):
                returns_list.append({
                    "invoice_number": f"RTN{index:05d}", "status": "Returned",
                    "total_amount": r.total_returned_amount if r.total_returned_amount else 0.0, # 🌟 3300.0 အစား 0.0
                    "payment_method": r.sale_return_payment_method if r.sale_return_payment_method else "Cash Down",
                    "sale_person": getattr(r, 'sale_person', 'Pending Assign'), # 🌟 Dynamic
                    "order_date": r.sale_return_date.strftime("%Y-%m-%d %H:%M:%S") if getattr(r, 'sale_return_date', None) else datetime.now().strftime("%Y-%m-%d %H:%M:%S") # 🌟 Dynamic အချိန်အစစ်
                })
        return {"orders": orders_list, "returns": returns_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database full history logs pipeline error: {e}")
# 🌟 Profile Page အတွက် Data ပြန်ဆွဲထုတ်ပေးမည့် API အသစ် 🌟
@app.get("/api/customer/profile/{email}")
def get_customer_profile(email: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_email == email).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record not found.")
        
    return {
        "name": customer.customer_name,
        "email": customer.customer_email,
        "phone": customer.phone_number,
        "address": customer.address
    }

@app.post("/api/customer/profile/update")
def update_customer_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_email == payload.email).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record matching this email not found.")
    try:
        customer.customer_name = payload.name
        customer.phone_number = payload.phone_number
        customer.address = payload.address
        db.commit()
        return {"status": "Success", "message": "Profile updated successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update customer row: {e}")

@app.post("/api/customer/forgot-password")
def forgot_password_reset(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user_account = db.query(User).filter(User.user_email == payload.email).first()
    customer_profile = db.query(Customer).filter(Customer.customer_email == payload.email).first()
    if not user_account and not customer_profile:
        raise HTTPException(status_code=404, detail="Email address not found in system registers.")
    try:
        if user_account: user_account.user_password = payload.new_password
        if customer_profile: customer_profile.customer_password = payload.new_password
        db.commit()
        return {"status": "Success", "message": "Password reset completed successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed resetting secure passwords: {e}")    


# =====================================================================
# --- 6. PRODUCT & INVENTORY CONTROLLER (မင်း၏ Code) ---
# =====================================================================

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = None, 
    sort: Optional[str] = "none", 
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.del_flag == 0)
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))
    
    if sort == "low-to-high":
        query = query.order_by(Product.selling_price.asc())
    elif sort == "high-to-low":
        query = query.order_by(Product.selling_price.desc())
    
    products = query.all()
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

@app.get("/api/products/best-selling", response_model=List[schemas.ProductResponse])
def get_best_selling(db: Session = Depends(get_db)):
    best_selling_records = db.query(
        SaleOrdersDetails.product_id,
        func.sum(SaleOrdersDetails.qty).label('total_qty')
    ).group_by(SaleOrdersDetails.product_id).order_by(desc('total_qty')).limit(3).all()
    
    if best_selling_records:
        product_ids = [record.product_id for record in best_selling_records]
        products = db.query(Product).filter(Product.product_id.in_(product_ids)).all()
    else:
        products = db.query(Product).filter(Product.del_flag == 0).limit(3).all()
        
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

@app.put("/api/products/{product_id}/price")
def update_price(product_id: int, req: schemas.ProductPriceUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
    
    product.selling_price = req.new_price
    db.commit()
    return {
        "message": "စျေးနှုန်း အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။", 
        "new_price": f"{req.new_price:,} MMK"
    }

@app.post("/api/purchase")
def buy_product(req: schemas.PurchaseRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
    if product.current_qty < req.buy_qty:
        raise HTTPException(status_code=400, detail="Stock မလောက်ပါ။")
    
    product.current_qty -= req.buy_qty
    db.commit()
    return {"message": "အောင်မြင်စွာ ဝယ်ယူပြီးပါပြီ။", "remaining_qty": product.current_qty}

@app.get("/api/admin/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    low_stock_items = db.query(Product).filter(
        Product.del_flag == 0,
        Product.current_qty < 10
    ).all()
    return {"low_stock_count": len(low_stock_items), "items": low_stock_items}

@app.get("/api/products/new-arrivals", response_model=List[schemas.ProductResponse])
def get_new_arrivals(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.del_flag == 0).order_by(Product.product_id.desc()).limit(3).all()
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
def get_promotions(db: Session = Depends(get_db)):
    promos = db.query(Promotion).all()
    return promos
#Theingi Change
@app.get("/api/products/{product_id}", response_model=schemas.ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id, Product.del_flag == 0).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product မတွေ့ပါ။")
        
    price_int = int(product.selling_price)
    return {
        "product_id": product.product_id,
        "product_name": product.product_name,
        "selling_price": price_int,
        "display_price": f"{price_int:,} MMK",
        "current_qty": product.current_qty,
        "product_img_url": product.product_img_url,
        "description": product.description
       
    }
# 🌟 Returns.jsx မှ လှမ်းပို့လိုက်သော Data များကို လက်ခံမည့် API 🌟
@app.post("/api/order/return-status")
async def simple_return_status(
    customer_email: str = Form(...),
    product_name: str = Form(...),
    qty: int = Form(...),
    reason: str = Form(...),
    payment_method: str = Form(...),
    file: Optional[UploadFile] = File(None), # 🌟 ပြင်ဆင်ချက်: အနောက်တွင် ကော်မာ ( , ) ထည့်ပေးလိုက်ပါပြီ
    db: Session = Depends(get_db)
):
    try:
        # ၁။ ရိုက်ထည့်လိုက်သော Product Name ဖြင့် product_id နှင့် စျေးနှုန်းကို ရှာဖွေခြင်း
        product = db.query(Product).filter(Product.product_name.ilike(f"%{product_name}%"), Product.del_flag == 0).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product name not found in inventory.")

        # ၂။ Customer ၏ နောက်ဆုံး Order Header ကို ရှာဖွေခြင်း
        last_order = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.customer_email == customer_email).order_by(SaleOrdersHeader.sale_order_id.desc()).first()
        if not last_order:
            raise HTTPException(status_code=404, detail="No order history found for this customer.")

        # ၃။ ပုံပါလာပါက သီးသန့်ဆောက်ထားသော backend/return_images ဖိုင်တွဲထဲသို့ သွားသိမ်းခြင်း
        file_name = None
        file_name = None
        if file and file.filename: 
            safe_filename = file.filename.replace(" ", "_")
            file_name = f"return_{customer_email}_{safe_filename}"
            file_path = os.path.join(RETURN_IMAGE_DIR, file_name)
            
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())

        # ၄။ Return Header ကို Database ထဲ သိမ်းခြင်း (ပုံ၏ File Name ပါတွဲသိမ်းမည်)
        computed_subtotal = qty * product.selling_price
        new_return_header = SaleReturnHeader(
            sale_order_id=last_order.sale_order_id,
            total_returned_amount=computed_subtotal,
            sale_return_payment_method=payment_method,
            return_reason=reason,
            return_img_url=file_name # 🌟 ပုံအမည်ကို DB တွင် သိမ်းဆည်းခြင်း
        )
        db.add(new_return_header)
        db.flush()

        # ၅။ Return Details ထဲသို့ Data သွင်းခြင်း
        new_return_detail = SaleReturnDetails(
            sale_return_id=new_return_header.sale_return_id,
            product_id=product.product_id,
            qty=qty,
            selling_price=product.selling_price,
            sub_total=computed_subtotal
        )
        db.add(new_return_detail)
        db.commit()

        return {"status": "Success", "message": "Return request logged completely for admin review."}
    except Exception as e:
        db.rollback()
        # 🌟 Error အသေးစိတ်ကို Terminal တွင် ပိုမိုရှင်းလင်းစွာ ပြပေးလိမ့်မည်
        import traceback
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=str(e))
