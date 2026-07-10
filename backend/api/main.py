import os
import re
import math
import subprocess
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel,EmailStr
from sqlalchemy.orm import Session
import sys
from sqlalchemy import text
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
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
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
    SaleReturnHeader, SaleReturnDetails, Product, Promotion, Payment
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
    
    # ---- 1. PASSWORD STRENGTH FILTER SCHEME ----
    is_password_valid = "Y"
    password_error_message = "Success"
    
    if len(payload.password) < 8:
        is_password_valid = "N"
        password_error_message = "Password must be at least 8 characters long."
    elif not re.search(r"[A-Za-z]", payload.password):
        is_password_valid = "N"
        password_error_message = "Password must include both character and number."
    elif not re.search(r"\d", payload.password):
        is_password_valid = "N"
        password_error_message = "Password must include both character and number."

    try:
        # ---- 2. SAFE ENVIRONMENT SHIELD PLUGGED INTO COBOL BINARY MATRIX ----
        cobol_message = "Success"
        try:
            result = subprocess.run(
                [COBOL_EXE_PATH, "SIGNUP", "Y" if user_record else "N", is_password_valid, payload.name, "customer"], 
                capture_output=True, text=True, check=False
            )
            cobol_message = result.stdout.strip()
            
            # If COBOL returns an evaluation failure code, capture it natively
            if result.returncode != 0:
                raise HTTPException(status_code=400, detail=cobol_message)
        except OSError as os_err:
            print(f"Bypassing architecture binary execution conflict cleanly: {os_err}")
            if is_password_valid == "N":
                cobol_message = password_error_message
            elif user_record:
                cobol_message = "Email is already exist, please login"
            else:
                cobol_message = "Local Bypass Success"

        # ---- 3. STRICT PRE-COMMIT EXCEPTION GATE BLOCK ----
        # FIXED: Explicitly checks if COBOL threw the duplicate warning string or password error
        if is_password_valid == "N" or "already exist" in cobol_message:
            raise HTTPException(
                status_code=400, 
                detail="Email is already exist, please login" if "already exist" in cobol_message else password_error_message
            )
        
        if cobol_message != "Success" and cobol_message != "Local Bypass Success" and "Registered successfully" not in cobol_message:
            raise HTTPException(status_code=400, detail=cobol_message)
            
        # ---- 4. SECURE DATABASE ENTRY WRITE LIFECYCLE ----
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
        return {"message": "Registration successful!"}
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        
        # ---- FIXED: FALLBACK EXCEPTION SHIELD STRIPS OUT RAW SQLITE3 INTEGRITY TEXT DUMPS ----
        error_string = str(e)
        if "UNIQUE constraint failed" in error_string or "user_email" in error_string:
            raise HTTPException(status_code=400, detail="Email is already exist, please login")
            
        raise HTTPException(status_code=500, detail=f"Registration failure validation drop: {e}")

@app.post("/api/login")
def login_customer(payload: CustomerLoginRequest, db: Session = Depends(get_db)):
    # 1. Look up the credentials inside your SQLite database tables first
    user_record = db.query(User).filter(User.user_email == payload.email).first()
    
    # Compute precise verification states to prevent unhandled AttributeErrors
    is_registered = "Y" if user_record else "N"
    is_password_correct = "N"
    user_role = user_record.role if user_record else "customer"
    
    if user_record and user_record.user_password == payload.password:
        is_password_correct = "Y"

    try:
        # 2. ENVIRONMENT SHIELD: Interface cleanly with your compiled COBOL binary executable
        cobol_message = "Success"
        try:
            result = subprocess.run(
                [COBOL_EXE_PATH, "LOGIN", is_registered, is_password_correct, payload.email, user_role], 
                capture_output=True, text=True, check=False
            )
            cobol_message = result.stdout.strip()
            
            # Catch raw source code blocks or empty outputs to trigger local fallbacks
            if "IDENTIFICATION DIVISION" in cobol_message or not cobol_message:
                raise OSError("Invalid binary execution pipe layout detected.")
                
        except OSError as os_err:
            print(f"Bypassing COBOL binary execution conflict on your machine: {os_err}")
            # LOCAL MAPPING: Replicates your explicit COBOL logic branch structure perfectly
            if is_registered == "N":
                cobol_message = "You are not registered, please sign up!"
            elif is_password_correct == "N":
                cobol_message = "Incorrect password. Please try again."
            else:
                cobol_message = "Login successful!"

        # 3. ---- FIXED: RELIABLE EXCEPTION GATES PREVENT 500 INTERNAL SERVER CRASHES ----
        # Checks the evaluation string flags explicitly to handle failures gracefully
        if "Incorrect password" in cobol_message or is_password_correct == "N":
            raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")
            
        if "not registered" in cobol_message or is_registered == "N":
            raise HTTPException(status_code=400, detail="You are not registered, please sign up!")

        # 4. Generate stable user session data packages
        return {
            "message": "Login successful!",
            "role": user_role,
            "user": {"email": user_record.user_email, "role": user_role}
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login structural crash handler trace: {e}")
        raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")

@app.post("/api/order/confirm", status_code=status.HTTP_201_CREATED)
def confirm_customer_order(payload: CustomerOrderConfirm, db: Session = Depends(get_db)):
    print("====== API HIT: CONFIRM ORDER ======")
    print("Payload Data:", payload.dict())
    
    try:
        last_global_order = db.query(SaleOrdersHeader).order_by(SaleOrdersHeader.sale_order_id.desc()).first()
        next_global_num = (last_global_order.sale_order_id if last_global_order else 0) + 1
        generated_system_invoice = f"INV{next_global_num:05d}"
        
        print(f"Generated Invoice: {generated_system_invoice}")

        # SAFE ENVIRONMENT SHIELD FOR COBOL EXECUTION
        try:
            result = subprocess.run(
                [COBOL_EXE_PATH, "CONFIRM_ORDER", generated_system_invoice, str(payload.total_qty), str(int(payload.net_amount)), payload.customer_email], 
                capture_output=True, text=True, check=False
            )
        except OSError as os_err:
            print(f"Bypassing architecture binary execution conflict cleanly: {os_err}")
            
        # 1. GENERATE SALE ORDERS HEADER ROW
        new_order_header = SaleOrdersHeader(
            customer_id=payload.customer_email,
            invoice_number=generated_system_invoice,
            total_amount=payload.net_amount, 
            status="Pending",
            order_date=datetime.now(),
            payment_method=payload.payment_method
        )
        db.add(new_order_header)
        db.flush() # 👈 Forces database to assign sale_order_id instantly so we can pass it below!

        # 2. ---- FIXED: AUTOMATICALLY GENERATES DYNAMIC REALTIME PAYMENT LEDGER RECORD ROW ----
        new_payment_record = Payment(
            sale_order_id=new_order_header.sale_order_id, # 👈 Ties cleanly to her generated ForeignKey field ID
            sale_payment_method=payload.payment_method,   # e.g., 'Cash Down', 'KBZ Pay', 'Wave Pay'
            amount_paid=float(payload.net_amount),         # Inserts net total cash amount directly into table column
            pay_date=datetime.now()
        )
        db.add(new_payment_record)

        # 3. GENERATE SALE ORDERS DETAILS CHILD ROWS
        for item in payload.items:
            new_order_detail = SaleOrdersDetails(
                sale_order_id=new_order_header.sale_order_id, 
                product_id=item.product_id,
                qty=item.qty, 
                selling_price=item.selling_price, 
                sub_total=item.sub_total
            )
            db.add(new_order_detail)

        # Commit everything safely to app.db simultaneously
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

@app.post("/api/order/return-status", status_code=status.HTTP_201_CREATED)
def process_loose_product_return_status(
    customer_email: str = Form(...),
    product_name: str = Form(...),
    qty: int = Form(...),
    reason: str = Form(...),
    payment_method: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 1. Look up the product details from the inventory database using the product name text
    target_product = db.query(Product).filter(Product.product_name.like(f"%{product_name.strip()}%")).first()
    if not target_product:
        raise HTTPException(status_code=404, detail=f"Product name '{product_name}' not found in stock inventory.")

    # 2. Automatically verify if this customer has a past order containing this item
    past_order_detail = db.query(SaleOrdersDetails).join(
        SaleOrdersHeader, SaleOrdersDetails.sale_order_id == SaleOrdersHeader.sale_order_id
    ).filter(
        # ---- FIXED: UPDATED ATTR REF TO customer_id TO PREVENT ATTRIBUTEERROR CRASHES ----
        SaleOrdersHeader.customer_id == customer_email.strip(), 
        SaleOrdersDetails.product_id == target_product.product_id
    ).first()

    if not past_order_detail:
        raise HTTPException(
            status_code=400, 
            detail=f"No past purchase order record found for '{product_name}' under this account."
        )

    # Pull financial totals and parent order IDs from the database records automatically
    parent_order_id = past_order_detail.sale_order_id
    unit_price = float(past_order_detail.selling_price if past_order_detail.selling_price else 0.0)
    computed_subtotal = qty * unit_price

    try:
        # COBOL Environment Shield Subprocess
        try:
            parent_invoice_str = db.query(SaleOrdersHeader.invoice_number).filter(
                SaleOrdersHeader.sale_order_id == parent_order_id
            ).scalar() or f"INV{parent_order_id:05d}"
            
            subprocess.run(
                [COBOL_EXE_PATH, "RETURN_ORDER", parent_invoice_str, str(qty), "customer", customer_email], 
                capture_output=True, text=True, check=False
            )
        except OSError:
            print("Bypassing local win32 application execution block cleanly.")

        # Saves uploaded screenshot binary data to disk and gets filename string
        saved_img_name = None
        if file:
            upload_dir = "return_images"
            os.makedirs(upload_dir, exist_ok=True)
            saved_img_name = f"{int(datetime.now().timestamp())}_{file.filename}"
            with open(os.path.join(upload_dir, saved_img_name), "wb") as f_out:
                f_out.write(file.file.read())

        # 3. Insert header record matching your original exact model structure properties
        new_return_header = SaleReturnHeader(
            sale_order_id=parent_order_id,
            total_returned_amount=computed_subtotal,
            sale_return_payment_method=payment_method,
            return_reason=reason,
            return_img_url=saved_img_name 
        )
        db.add(new_return_header)
        db.flush()

        # 4. Insert corresponding detail child row entry record
        new_return_detail = SaleReturnDetails(
            sale_return_id=new_return_header.sale_return_id,
            product_id=int(target_product.product_id),
            qty=int(qty),
            selling_price=unit_price,
            sub_total=computed_subtotal
        )
        db.add(new_return_detail)

        db.commit()
        return {"status": "Success", "message": "Return logged completely separate from invoice id dependencies."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database separate return storage failure: {e}")

@app.get("/api/order/history-logs/{customer_email}")
def get_customer_history_logs(customer_email: str, db: Session = Depends(get_db)):
    try:
        # 1. Fetch this user's specific purchase orders sorted by primary key descending
        orders_query = db.query(SaleOrdersHeader).filter(
            SaleOrdersHeader.customer_id == customer_email.strip()
        ).order_by(SaleOrdersHeader.sale_order_id.desc()).all()
        
        orders_list = []
        total_orders = len(orders_query)
        
        # FORCES THE INVOICE STRINGS TO INDEX DYNAMICALLY FROM TOTAL COUNT DOWN TO 1
        for idx, o in enumerate(orders_query):
            display_num = total_orders - idx
            orders_list.append({
                "invoice_number": f"INV{display_num:05d}",
                "status": o.status if o.status else "Pending",
                "total_amount": float(o.total_amount) if o.total_amount else 0.0, 
                "payment_method": getattr(o, 'payment_method', 'Cash Down'), 
                "sale_person": getattr(o, 'sale_person', 'Pending Assign'), 
                "order_date": o.order_date.strftime("%Y-%m-%d %H:%M:%S") if o.order_date else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        user_order_ids = [o.sale_order_id for o in orders_query]
        returns_list = []
        
        if user_order_ids:
            # 2. ---- FIXED: RELIABLE RETURNS RETRIEVAL LINKED VIA CORRECT RELATIONAL KEYS ----
            returns_query = db.query(SaleReturnHeader).filter(
                SaleReturnHeader.sale_order_id.in_(user_order_ids)
            ).order_by(SaleReturnHeader.sale_return_id.desc()).all()
            
            total_returns = len(returns_query)
            for idx, r in enumerate(returns_query):
                display_rtn = total_returns - idx
                returns_list.append({
                    "invoice_number": f"RTN{display_rtn:05d}",
                    "status": "Returned",
                    "total_amount": float(r.total_returned_amount) if r.total_returned_amount else 0.0, 
                    "payment_method": r.sale_return_payment_method if r.sale_return_payment_method else "Cash Down",
                    "sale_person": getattr(r, 'sale_person', 'Pending Assign'), 
                    "order_date": r.sale_return_date.strftime("%Y-%m-%d %H:%M:%S") if getattr(r, 'sale_return_date', None) else datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
                })
                
        return {"orders": orders_list, "returns": returns_list}
        
    except Exception as e:
        print(f"History descending sorting error log trace: {e}")
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
        customer.customer_email = payload.email
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
    #Theingi Change
    query = db.query(Product).filter(
        Product.del_flag == 0,
         Product.current_qty > 0
        )
    if search:
       category = db.query(Category).filter(
        Category.category_name.ilike(f"%{search}%"),
        Category.del_flag == 0
    ).first()

       if category:
        query = query.filter(
            Product.category_id == category.category_id
        )
       else:
        query = query.filter(
            Product.product_name.ilike(f"%{search}%")
        )
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
    #Theingi Change
    if best_selling_records:
        product_ids = [record.product_id for record in best_selling_records]
        products = db.query(Product).filter(
            Product.product_id.in_(product_ids),
            Product.del_flag == 0,
    Product.current_qty > 0
            ).all()
    else:
        products = db.query(Product).filter(
            Product.del_flag == 0,
            Product.current_qty > 0).limit(3).all()
        
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
    #Theingi Change
    products = db.query(Product).filter(
        Product.del_flag == 0,
         Product.current_qty > 0
        ).order_by(Product.product_id.desc()).limit(3).all()
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
