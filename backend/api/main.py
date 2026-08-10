import os
import re
import random
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
    Customer, User, SaleOrdersHeader, SaleOrdersDetails, Category, 
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

COBOL_EXE_PATH = "./cobol/customer_engine.exe" 

# =====================================================================
# --- 4. PYDANTIC VALIDATION MODELS ---
# =====================================================================
class CustomerSignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    address: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

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
# --- 5. CUSTOMER AUTHENTICATION & ORDERS ROUTER 
# =====================================================================

@app.get("/")
def read_root():
    return {"message": "Database and Unified Services are ready!"}

import re
import subprocess
from fastapi import status, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import EmailStr, BaseModel
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

conf = ConnectionConfig(
    MAIL_USERNAME = "sandarwpyae275@gmail.com",  # သင့် App Email
    MAIL_PASSWORD = "zjce dhin auag xeur",    # Gmail App Password
    MAIL_FROM = "sandarwpyae275@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True
)

otp_storage = {}

# @app.post("/api/signup", status_code=status.HTTP_201_CREATED)
# def signup_customer(payload: CustomerSignUpRequest, db: Session = Depends(get_db)):
#     print("====== COBOL ENGINE: SIGNUP MIXED-PASSWORD PIPELINE ENGAGED ======")
    
#     # 1. Database registration validation check
#     user_record = db.query(User).filter(User.user_email == payload.email.strip()).first()
#     is_registered = "Y" if user_record else "N"
    
#     # 2. Compute explicit validation flag parameters
#     is_password_length_valid = "Y" if len(payload.password) >= 8 else "N"
    
#     # Check if the string contains at least one letter [A-Za-z] AND at least one digit \d
#     has_letters = bool(re.search(r"[A-Za-z]", payload.password))
#     has_digits = bool(re.search(r"\d", payload.password))
#     is_password_mixed_valid = "Y" if (has_letters and has_digits) else "N"

#     try:
#         # 3. Execute compiled binary passing parameters sequentially matching ACCEPT blocks
#         # Args passed: "SIGNUP", is_registered, is_length_valid, is_mixed_valid, customer_name, role
#         result = subprocess.run(
#             [COBOL_EXE_PATH, "SIGNUP", is_registered, is_password_length_valid, is_password_mixed_valid, payload.name, "customer"], 
#             capture_output=True, text=True, check=False
#         )
        
#         cobol_output = result.stdout.strip()
#         cobol_exit_code = result.returncode

#         # 4. Handle specific custom validation return codes passed from your COBOL execution
#         if cobol_exit_code == 5 or "at least 8 characters" in cobol_output:
#             raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
            
#         # 🌟 FIXED: Tracks exit code 6 or your new safe COBOL string to throw your exact required frontend error!
#         if cobol_exit_code == 6 or "mix chars and numbers" in cobol_output or "both character and number" in cobol_output:
#             raise HTTPException(status_code=400, detail="Password must include both character and number.")
            
#         if cobol_exit_code == 1 or "already exist" in cobol_output:
#             raise HTTPException(status_code=400, detail="Email is already exist, please login")

#         if "Registered successfully" not in cobol_output and cobol_exit_code != 0:
#             raise HTTPException(status_code=400, detail=f"COBOL validation rejection error: {cobol_output}")

#         # 5. Commit to database if COBOL clears it
#         new_user = User(user_email=payload.email, user_password=payload.password, role="customer")
#         db.add(new_user)
#         db.flush() 

#         new_customer = Customer(
#             customer_name=payload.name, customer_email=payload.email,
#             phone_number=payload.phone_number, address=payload.address,
#             customer_password=payload.password, del_flag=0
#         )
#         db.add(new_customer)
#         db.commit()
        
#         return {"message": "Registration successful!"}
        
#     except HTTPException as he:
#         db.rollback()
#         raise he
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Registration execution flow dropped: {e}")

import re
import random
from fastapi import HTTPException, status, Depends
from pydantic import BaseModel
# သင့်ရဲ့ မူရင်း imports များ (User, Customer, Session, get_db, MessageSchema, FastMail, conf, otp_storage, COBOL_EXE_PATH) ကို ဆက်ထားပေးပါ

# ==========================================================================
# 1. Signup Request - OTP မထုတ်ပေးမီ Password ကြံ့ခိုင်မှုအား တင်းကြပ်စွာ စစ်ဆေးခြင်း
# ==========================================================================
@app.post("/api/signup", status_code=status.HTTP_200_OK)
async def request_signup_otp(payload: CustomerSignUpRequest, db: Session = Depends(get_db)):
    print("====== SIGNUP PIPELINE: PASSWORDS COMPLEXITY CHECK ENGAGED ======")
    
    # 🔴 ကနဦးအဆင့် - Email အဟောင်း DB ထဲမှာ ရှိပြီးသားလား အရင်စစ်ပါ
    user_record = db.query(User).filter(User.user_email == payload.email.strip()).first()
    if user_record:
        raise HTTPException(status_code=400, detail="Email is already exist, please login")

    # 🌟 ဥပဒေအသစ် - ခေတ်မီ Website စည်းကမ်းချက် ၄ ခုစလုံးအား Regex ဖြင့် တင်းကြပ်စွာ စစ်ဆေးခြင်း
    is_length_valid = len(payload.password) >= 8
    has_uppercase = bool(re.search(r"[A-Z]", payload.password))
    has_lowercase = bool(re.search(r"[a-z]", payload.password))
    has_digits = bool(re.search(r"\d", payload.password))
    has_special_char = bool(re.search(r"[!@#$%^&*(),.?\":{}|<>_]", payload.password))

    # စည်းကမ်းချက်တစ်ခုခု ပျက်ကွက်ပါက OTP လုံးဝ မထုတ်ပေးဘဲ ချက်ချင်း ငြင်းပယ်ရန် Gate
    if not (is_length_valid and has_uppercase and has_lowercase and has_digits and has_special_char):
        raise HTTPException(
            status_code=400, 
            detail="Password requirement validation failed. Must include uppercase, lowercase, numbers, and special characters."
        )

    # စည်းကမ်းချက်အားလုံး အောင်မြင်မှသာ 6-digit OTP ထုတ်ယူခြင်း
    otp_code = str(random.randint(100000, 999999))
    
    # payload နှင့် OTP ကို ယာယီ memory ထဲသိမ်းထားမည်
    otp_storage[payload.email] = {
        "otp": otp_code,
        "payload": payload
    }

    # Email စာပို့ရန် Message ပြင်ဆင်ခြင်း
    message = MessageSchema(
        subject="Stationero Account Activation",
        recipients=[payload.email],
        body=f"Hello {payload.name},\n\nYour OTP verification code is: {otp_code}\n\nPlease use this code to complete your signup.",
        subtype=MessageType.plain
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to send OTP email: {str(e)}")

    return {"message": "OTP verification code has been sent to your email."}


# ==========================================================================
# 2. OTP စစ်ဆေးခြင်း၊ COBOL စစ်ခြင်းနှင့် DB ထဲသိမ်းခြင်း (မူရင်းအတိုင်း သန့်ရှင်းစွာ ထားရှိပါသည်)
# ==========================================================================
@app.post("/api/verify-otp", status_code=status.HTTP_201_CREATED)
def verify_otp_and_register(otp_payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    
    # ယာယီ Memory ထဲတွင် Email ရှိမရှိနှင့် OTP မှန်မမှန် စစ်ဆေးခြင်း
    stored_data = otp_storage.get(otp_payload.email)

    if not stored_data:
        raise HTTPException(status_code=400, detail="OTP requested record not found or expired.")

    if stored_data["otp"] != otp_payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please try again.")

    # OTP မှန်ကန်ပါက မူလ SignUp Payload ကို ပြ成ထုတ်ယူမည်
    payload: CustomerSignUpRequest = stored_data["payload"]

    print("====== COBOL ENGINE: SIGNUP MIXED-PASSWORD PIPELINE ENGAGED ======")
    
    # 1. Database registration validation check
    user_record = db.query(User).filter(User.user_email == payload.email.strip()).first()
    is_registered = "Y" if user_record else "N"
    
    # 2. Compute explicit validation flag parameters for COBOL Engine
    is_password_length_valid = "Y" if len(payload.password) >= 8 else "N"
    
    # 🌟 COBOL အဟောင်းနှင့် ကိုက်ညီစေရန် စာလုံးကြီး/သေး နှင့် ဂဏန်းများ ပါဝင်မှုကို စစ်ဆေးခြင်း
    has_letters = bool(re.search(r"[A-Za-z]", payload.password))
    has_digits = bool(re.search(r"\d", payload.password))
    is_password_mixed_valid = "Y" if (has_letters and has_digits) else "N"

    try:
        # 3. Execute COBOL validation binary rules sequentially
        result = subprocess.run(
            [COBOL_EXE_PATH, "SIGNUP", is_registered, is_password_length_valid, is_password_mixed_valid, payload.name, "customer"], 
            capture_output=True, text=True, check=False
        )
        
        cobol_output = result.stdout.strip()
        cobol_exit_code = result.returncode

        # 4. Handle custom validation return codes passed from your COBOL execution
        if cobol_exit_code == 5 or "at least 8 characters" in cobol_output:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
            
        if cobol_exit_code == 6 or "mix chars and numbers" in cobol_output or "both character and number" in cobol_output:
            raise HTTPException(status_code=400, detail="Password must include both character and number.")
            
        if cobol_exit_code == 1 or "already exist" in cobol_output:
            raise HTTPException(status_code=400, detail="Email is already exist, please login")

        if "Registered successfully" not in cobol_output and cobol_exit_code != 0:
            raise HTTPException(status_code=400, detail=f"COBOL validation rejection error: {cobol_output}")

        # 5. Commit to database after COBOL approval checks are passed successfully
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
        
        # အောင်မြင်ပါက temporary storage မှ သန့်ရှင်းစွာ ဖျက်ထုတ်ပါ
        del otp_storage[payload.email]

        return {"message": "Registration successful!"}
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration execution flow dropped: {e}")



@app.post("/api/login")
def login_customer(payload: CustomerLoginRequest, db: Session = Depends(get_db)):
    print("====== COBOL ENGINE: LOGIN PIPELINE ENGAGED ======")
    
    # 1. Fetch user data records cleanly
    user_record = db.query(User).filter(User.user_email == payload.email.strip()).first()
    
    # 2. Compute parameters to pass into COBOL argument slots in exact order
    is_registered = "Y" if user_record else "N"
    is_password_correct = "Y" if (user_record and user_record.user_password == payload.password) else "N"
    user_role = user_record.role if user_record else "customer"

    try:
        # 3. Execute compiled binary passing parameters sequentially matching ACCEPT blocks
        # Args passed: "LOGIN", is_registered, is_password_correct, email, role
        result = subprocess.run(
            [COBOL_EXE_PATH, "LOGIN", is_registered, is_password_correct, payload.email.strip(), user_role], 
            capture_output=True, text=True, check=False
        )
        
        cobol_output = result.stdout.strip()
        cobol_exit_code = result.returncode

        # 4. Handle structural COBOL system exit tracking codes safely
        if cobol_exit_code == 2 or "not registered" in cobol_output.lower():
            raise HTTPException(status_code=400, detail="You are not registered, please sign up!")
            
        if cobol_exit_code == 1 or "incorrect password" in cobol_output.lower():
            raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")

        # 🌟 FIXED TYPO HERE: Properly evaluation constraints for standard exit states
        if "login successful" not in cobol_output.lower():
            raise HTTPException(status_code=400, detail=f"Authentication pipeline failure: {cobol_output}")

        # 5. Handle routing rules determined by user privileges or exit status code 3
        if user_role == "admin" or cobol_exit_code == 3:
            redirect_destination = "http://localhost:5174/admin/dashboard"
        else:
            redirect_destination = "/cart"

        return {
            "message": "Login successful!",
            "role": user_role,
            "redirect_to": redirect_destination,
            "user": {
                "email": user_record.user_email,
                "role": user_role
            }
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login structural crash handler trace: {e}")
        raise HTTPException(status_code=500, detail=f"Internal authentication system crash: {e}")

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
            subprocess.run(
                [COBOL_EXE_PATH, "CONFIRM_ORDER", generated_system_invoice, str(payload.total_qty), str(int(payload.net_amount)), payload.customer_email], 
                capture_output=True, text=True, check=False
            )
        except OSError as os_err:
            print(f"Bypassing architecture binary execution conflict cleanly: {os_err}")
            
        user_lookup = db.query(User).filter(User.user_email == payload.customer_email.strip()).first()
        final_numeric_id = user_lookup.user_id if user_lookup else 6
        customer_lookup = db.query(Customer).filter(Customer.customer_email == payload.customer_email.strip()).first()
        final_numeric_id = customer_lookup.customer_id if customer_lookup else 6

        past_orders_count = db.query(SaleOrdersHeader).filter(
            SaleOrdersHeader.customer_id == int(final_numeric_id)
        ).count()
        
        try:
            gross_amount = sum(float(item.qty) * float(item.selling_price) for item in payload.items)
            computed_total_discount = gross_amount * 0.10
        except Exception:
            computed_total_discount = (float(payload.net_amount) / 0.90) * 0.10
            gross_amount = float(payload.net_amount) / 0.90

        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
        cobol_dir = os.path.join(base_dir, "cobol")
        absolute_exe_path = os.path.join(cobol_dir, "customer_engine.exe")

        # ====== FAST DIRECT BINARY EXECUTOR (NO SHELL OVERHEAD) ======
        result = subprocess.run(
            [absolute_exe_path, "CONFIRM_ORDER", generated_system_invoice, str(payload.total_qty), str(past_orders_count), str(gross_amount)], 
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True, 
            check=False,
            cwd=cobol_dir, 
            shell=False 
        )
        
        cobol_raw_output = result.stdout.strip() if result.stdout else result.stderr.strip()

        # ၂။ 🎯 COBOL တွက်ချက်ပြီး DISPLAY ထုတ်ပေးလိုက်သော တန်ဖိုးများနှင့် စာသားများကို တိုက်ရိုက် ခွဲထုတ်ဖတ်ယူခြင်း
        computed_total_discount = 0.0
        cobol_success_message = ""
        
        if cobol_raw_output:
            for line in cobol_raw_output.split("\n"):
                if "COBOL_RESULT_DISCOUNT:" in line:
                    computed_total_discount = float(line.split(":")[1].strip())
                else:
                    cobol_success_message = line.strip()

        if result.returncode != 0:
            raise HTTPException(status_code=400, detail="COBOL Financial Calculator Pipeline Breakdown.")

        new_order_header = SaleOrdersHeader(
            customer_id=int(final_numeric_id), # 👈 ဤနေရာတွင် Customer Table ထဲမှလာသော id စစ်စစ် ဝင်သွားပါမည်!
            invoice_number=generated_system_invoice,
            total_amount=float(gross_amount),
            discount=float(computed_total_discount),
            status="Pending",
            order_date=datetime.now(),
            payment_method=payload.payment_method
        )
        db.add(new_order_header)
        db.flush() 

        # 2. AUTOMATICALLY GENERATES DYNAMIC REALTIME PAYMENT LEDGER RECORD ROW
        new_payment_record = Payment(
            sale_order_id=new_order_header.sale_order_id, 
            sale_payment_method=payload.payment_method,   
            amount_paid=float(payload.net_amount),         
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

        db.commit() 
        print("====== DATABASE SAVE SUCCESS ======")
        return {"message": "Success", "invoice_number": generated_system_invoice}
        
    except Exception as e:
        db.rollback()
        print("====== ERROR OCCURRED ======")
        import traceback
        traceback.print_exc()  
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
    

# =========================================================================
# 🎯 🟢 THE FINAL ULTIMATE INDESTRUCTIBLE PRICE-SAFE RETURN CONTROL ENGINE
# =========================================================================
# Product Name ချင်း တူညီနေသော်လည်း စျေးနှုန်းကွဲလွဲမှု (500 vs 2000) ပြဿနာကြီးအား အမြစ်ပြတ် တားဆီးချေမှုန်းလိုက်ခြင်းဖြစ်သည်
@app.post("/api/order/return-status", status_code=status.HTTP_201_CREATED)
def process_loose_product_return_status(
    customer_email: str = Form(...),
    product_name: str = Form(...),
    qty: int = Form(...),
    reason: str = Form(...),
    payment_method: str = Form(...),
    invoice_number: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print("====== API HIT: 100% SECURE PRICE-SAFE MOVEMENT PIPELINE ENGAGED ======")
    
    customer_lookup = db.query(Customer).filter(Customer.customer_email == customer_email.strip()).first()
    active_numeric_id = customer_lookup.customer_id if customer_lookup else 7
    parent_order_id = None
    if invoice_number and str(invoice_number).strip():
        matched_header = db.query(SaleOrdersHeader).filter(
            (SaleOrdersHeader.invoice_number == invoice_number.strip()) &
            (SaleOrdersHeader.customer_id == int(active_numeric_id))
        ).first()
        
        if not matched_header:
            all_headers_fallback = db.query(models.SaleOrdersHeader).filter(SaleOrdersHeader.customer_id == int(active_numeric_id)).order_by(SaleOrdersHeader.sale_order_id.asc()).all()
            for idx, h in enumerate(all_headers_fallback):
                if f"INV{idx + 1:05d}" == invoice_number.strip():
                    matched_header = h
                    break
                    
        if matched_header:
            parent_order_id = matched_header.sale_order_id

    if parent_order_id:
        past_order_detail = db.query(SaleOrdersDetails).join(
            Product, SaleOrdersDetails.product_id == Product.product_id
        ).filter(
            SaleOrdersDetails.sale_order_id == parent_order_id,
            Product.product_name == product_name.strip() 
        ).first()
    else:
        possible_headers = db.query(SaleOrdersHeader).filter(models.SaleOrdersHeader.customer_id == int(active_numeric_id)).all()
        possible_ids = [h.sale_order_id for h in possible_headers]
        past_order_detail = db.query(SaleOrdersDetails).join(
            Product, SaleOrdersDetails.product_id == Product.product_id
        ).filter(
            SaleOrdersDetails.sale_order_id.in_(possible_ids),
            Product.product_name == product_name.strip()
        ).order_by(SaleOrdersDetails.sale_order_id.desc()).first()

    if not past_order_detail:
        raise HTTPException(status_code=400, detail="No past purchase order record found matching this specific product name and invoice line.")
        
    parent_order_id = past_order_detail.sale_order_id
    parent_header = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.sale_order_id == parent_order_id).first()
    parent_invoice_str = parent_header.invoice_number if parent_header else f"INV{parent_order_id:05d}"
    raw_unit_price = float(past_order_detail.selling_price if past_order_detail.selling_price else 0.0)
    discount_allowed = float(parent_header.discount) if parent_header and parent_header.discount else 0.0
    order_gross_total = float(parent_header.total_amount) if parent_header and parent_header.total_amount else 0.0

    # 🌟 2. Calculate the item price after its proportional share of the global discount
    if discount_allowed > 0 and order_gross_total > 0:
        # Determine what percentage of the total order value this single unit represents
        discount_ratio = discount_allowed / order_gross_total
        
        # Deduct that exact percentage from this item's raw price
        actual_refund_unit_price = raw_unit_price * (1.0 - discount_ratio)
    else:
        actual_refund_unit_price = raw_unit_price

    # Round the price to prevent floating-point decimals in your currency
    actual_refund_unit_price = round(actual_refund_unit_price, 2)
    computed_subtotal = float(int(qty) * actual_refund_unit_price)


    try:
        saved_img_name = None
        if file:
            upload_dir = "return_images"
            os.makedirs(upload_dir, exist_ok=True)
            saved_img_name = f"{int(datetime.now().timestamp())}_{file.filename}"
            with open(os.path.join(upload_dir, saved_img_name), "wb") as f_out:
                f_out.write(file.file.read())

        new_return_header = SaleReturnHeader(
            sale_order_id=parent_order_id,
            total_returned_amount=computed_subtotal,
            sale_return_payment_method=payment_method,
            return_reason=reason,
            return_img_url=saved_img_name 
        )
        db.add(new_return_header)
        db.flush()

        new_return_detail = SaleReturnDetails(
            sale_return_id=new_return_header.sale_return_id,
            product_id=past_order_detail.product_id, 
            qty=int(qty),
            selling_price=actual_refund_unit_price, 
            sub_total=computed_subtotal
        )
        db.add(new_return_detail)
        
        db.flush()
        db.commit()
        db.refresh(new_return_header)
        
        return {
            "status": "success",
            "message": "Return Order processed natively and flawlessly using Price-Safe equations.",
            "return_id": str(new_return_header.sale_return_id)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database separate return storage failure: {e}")

@app.get("/api/order/history-logs/{customer_email}")
def get_customer_history_logs(customer_email: str, db: Session = Depends(get_db)):
    try:
        customer_lookup = db.query(Customer).filter(Customer.customer_email == customer_email.strip()).first()
        active_numeric_id = customer_lookup.customer_id if customer_lookup else 7
        
        orders_query = db.query(SaleOrdersHeader).filter(
            SaleOrdersHeader.customer_id == int(active_numeric_id)
        ).order_by(models.SaleOrdersHeader.sale_order_id.desc()).all()
        
        orders_list = []
        total_orders = len(orders_query)
        for idx, o in enumerate(orders_query):
            display_num = total_orders - idx
            orders_list.append({
                # ====== 🟢 🎯 THE ULTIMATE ROOTER TOKEN ID HANDSHAKE FIX ======
                # မိတ်ဆွေ၏ စာသားအလှ (INV00002) အား လုံးဝမဖျက်ဆီးဘဲ၊ Frontend OrderHistoryPage.jsx မှ 👁 ကိုနှိပ်လျှင် 
                # order/23 ဟု တကယ့် ID အစစ်အတိုင်း ခြွင်းချက်မရှိ လမ်းကြောင်းပြောင်းနိုင်စေရန် ID အစစ်များအား နောက်ကွယ်မှ ပူးတွဲထည့်သွင်းပေးလိုက်ခြင်းဖြစ်သည်
                "id": int(o.sale_order_id),
                "sale_order_id": int(o.sale_order_id),
                
                "invoice_number": f"INV{display_num:05d}",
                "status": o.status if o.status else "Pending",
                "total_amount": float(o.total_amount) if o.total_amount else 0.0, 
                "discount": float(o.discount) if o.discount else 0.0,
                "payment_method": getattr(o, 'payment_method', 'Cash Down'), 
                "sale_person": getattr(o, 'sale_person', 'Pending Assign'), 
                "order_date": o.order_date.strftime("%Y-%m-%d %H:%M:%S") if o.order_date else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        user_order_ids = [o.sale_order_id for o in orders_query]
        returns_list = []
        
        if user_order_ids:
            returns_query = db.query(SaleReturnHeader).filter(
                SaleReturnHeader.sale_order_id.in_(user_order_ids)
            ).order_by(SaleReturnHeader.sale_return_id.desc()).all()
            
            total_returns = len(returns_query)
            for idx, r in enumerate(returns_query):
                display_rtn = total_returns - idx
                returns_list.append({
                    # ====== 🟢 🎯 THE RETURN ROW TOKEN ID HANDSHAKE FIX ======
                    "id": int(r.sale_return_id),
                    "sale_return_id": int(r.sale_return_id),
                    
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

@app.get("/api/order/valid-return-invoices/{customer_email}")
def get_valid_return_invoices(customer_email: str, db: Session = Depends(get_db)):
    try:
        from sqlalchemy import func
        
        customer_lookup = db.query(Customer).filter(Customer.customer_email == customer_email.strip()).first()
        if not customer_lookup:
            return {"orders": []}
        
        all_user_orders = db.query(SaleOrdersHeader).filter(
            SaleOrdersHeader.customer_id == customer_lookup.customer_id
        ).order_by(SaleOrdersHeader.sale_order_id.desc()).all()
        
        total_history_count = len(all_user_orders)
        valid_orders_list = []
        
        for idx, order in enumerate(all_user_orders):
            display_num = total_history_count - idx
            computed_invoice_name = f"INV{display_num:05d}"
            
            # This is your condition checking that the order is confirmed
            if not order.status or str(order.status).strip().lower() != "confirmed":
                continue
                
            details = db.query(SaleOrdersDetails).filter(SaleOrdersDetails.sale_order_id == order.sale_order_id).all()
            has_returnable_items = False
            
            for detail in details:
                # 🌟 FIXED: Keep track of every historical return record that exists for this order item
                already_returned_scalar = db.query(func.sum(SaleReturnDetails.qty)).join(
                    SaleReturnHeader, SaleReturnDetails.sale_return_id == SaleReturnHeader.sale_return_id
                ).filter(
                    SaleReturnHeader.sale_order_id == order.sale_order_id,
                    SaleReturnDetails.product_id == detail.product_id
                ).scalar()
                
                already_returned = int(already_returned_scalar) if already_returned_scalar is not None else 0
                original_qty = int(detail.qty) if detail.qty else 0
                
                if original_qty - already_returned > 0:
                    has_returnable_items = True
            
            if has_returnable_items:
                valid_orders_list.append({
                    "invoice_number": computed_invoice_name,
                    "real_db_invoice": order.invoice_number,   
                    "status": order.status,
                    "discount": float(order.discount) if order.discount else 0.0,
                    "total_amount": float(order.total_amount) if order.total_amount else 0.0
                })
                
        return {"orders": valid_orders_list}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/order/return-items-check/{invoice_number}")
def get_items_by_invoice_number(invoice_number: str, db: Session = Depends(get_db)):
    try:
        from sqlalchemy import func
        header_record = db.query(SaleOrdersHeader).filter(
            SaleOrdersHeader.invoice_number == invoice_number.strip()
        ).first()
        
        if not header_record:
            all_headers_fallback = db.query(SaleOrdersHeader).order_by(SaleOrdersHeader.sale_order_id.asc()).all()
            for idx, h in enumerate(all_headers_fallback):
                generated_virtual_name = f"INV{idx + 1:05d}"
                if generated_virtual_name == invoice_number.strip():
                    header_record = h
                    break

        if not header_record:
            return {"items": []}
            
        items_query = db.query(SaleOrdersDetails).filter(
            SaleOrdersDetails.sale_order_id == header_record.sale_order_id
        ).all()
        
        formatted_items = []
        has_any_returnable_left = False 
        
        for detail in items_query:
            product_node = db.query(Product).filter(Product.product_id == detail.product_id).first()
            prod_name = product_node.product_name if product_node else "Unknown Item"

            # 🌟 FIXED: Counts previously returned quantities across all statuses so users cannot return them again
            already_returned_scalar = db.query(func.sum(SaleReturnDetails.qty)).join(
                SaleReturnHeader, SaleReturnDetails.sale_return_id == SaleReturnHeader.sale_return_id
                # 💡 If your SaleReturnHeader table uses a specific column to track its processing stage (e.g., status),
                # you can chain an explicit check here if needed: `.filter(SaleReturnHeader.status != 'Rejected')`
            ).filter(
                SaleReturnHeader.sale_order_id == header_record.sale_order_id,
                SaleReturnDetails.product_id == detail.product_id
            ).scalar()
            
            already_returned = int(already_returned_scalar) if already_returned_scalar is not None else 0
            original_qty = int(detail.qty) if detail.qty else 0
            actual_returnable_qty = original_qty - already_returned
            
            # 🌟 Only include the item if there is remaining returnable balance left
            if actual_returnable_qty > 0:
                has_any_returnable_left = True
                formatted_items.append({
                    "name": str(prod_name).strip(),
                    "product_name": str(prod_name).strip(),
                    "qty": int(actual_returnable_qty),
                    "selling_price": float(detail.selling_price) if detail.selling_price else 0.0
                })
                
        if not has_any_returnable_left:
            return {"items": []}
            
        return {"items": formatted_items}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

# =========================================================================
# 🎯 🟢 NEW COMPONENT: 100% CLEAN ORDER DETAILS FETCH ENGINE (NO RETURN DETAILS)
# =========================================================================
# သမိုင်းမှတ်တမ်းဇယား (History Table) ပေါ်ရှိ 👁 (အိုင်ကွန်ခလုတ်) အား နှိပ်လိုက်ပါက ၎င်းအော်ဒါ၏ အသေးစိတ်ဒေတာများအား တိုက်ရိုက်ဆွဲထုတ်ပေးမည့် API ဖြစ်သည်
@app.get("/api/order/confirm-orders/details/{order_id}")
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    try:
        from sqlalchemy.orm import joinedload
        
        # 🟢 ၁။ SaleOrdersHeader ဇယားမှ အချက်အလက်များအား Customer, Payments, Details, Products များနှင့်ပါ တစ်ပါတည်း ပေါင်းစပ်ဆွဲထုတ်ခြင်း
        order = (
            db.query(models.SaleOrdersHeader)
            .options(
                joinedload(models.SaleOrdersHeader.customer),
                joinedload(models.SaleOrdersHeader.payments),
                joinedload(models.SaleOrdersHeader.details)
                .joinedload(models.SaleOrdersDetails.product)
            )
            .filter(models.SaleOrdersHeader.sale_order_id == order_id)
            .first()
        )

        if not order:
            raise HTTPException(status_code=404, detail="Order details record logs not found inside core registries.")

        print("🎯 Relational Handshake Success: customer_id =", order.customer_id)
        
        # 🟢 ၂။ SaleOrdersDetails ဇယားကွက်ထဲမှ ကုန်ပစ္စည်းစာရင်းတစ်ခုချင်းစီ၏ အရေအတွက်နှင့် စျေးနှုန်းများအား ဆွဲထုတ်ခြင်း
        order_details = []
        for detail in order.details:
            order_details.append({
                "sale_order_detail_id": detail.sale_order_detail_id,
                "product_id": detail.product_id,
                "product_name": detail.product.product_name if detail.product else "Unknown Stationery Item",
                "qty": int(detail.qty) if detail.qty else 0,
                "selling_price": float(detail.selling_price) if detail.selling_price else 0.0,
                "sub_total": float(detail.sub_total) if detail.sub_total else 0.0,
            })

        # 🟢 ၃။ အပို COBOL Executable တွက်ချက်မှုများအား လုံးဝ(၁၀၀%) ဘေးဖယ်ထုတ်၍ Python (FastAPI) ဖြင့်သာ တိုက်ရိုက် တိကျစွာ ပေါင်းစပ်တွက်ချက်ခြင်း
        total_calculated_amount = sum(float(detail["sub_total"]) for detail in order_details)

        # ====== 🟢 🎯 THE PERFECT 1:1 RELATIONAL PAYLOAD HANDSHAKE ======
        # Frontend detail.jsx စာမျက်နှာမှ မျှော်လင့်တောင့်တနေသော Key Values ပုံစံအတိုင်း ကွက်တိကျစွာ ပြန်လည်ပေးပို့ခြင်းဖြစ်ပါသည်
        return {
            "header": {
                "sale_order_id": order.sale_order_id,
                "invoice_number": order.invoice_number,
                "order_date": order.order_date,
                "status": order.status,
                "discount": float(order.discount) if order.discount else 0.0,
                "total_amount": float(order.total_amount) if order.total_amount else 0.0,
                "calculated_total_amount": total_calculated_amount,
                
                # 🟢 🎯 Customer Table ထဲမှလာသော အချက်အလက်များအား သန့်ရှင်းကျစ်လျစ်စွာ ထည့်သွင်းခြင်း
                "customer": {
                    "customer_name": order.customer.customer_name if order.customer else "Guest Customer",
                    "customer_email": order.customer.customer_email if order.customer else "N/A",
                    "customer_phone": order.customer.phone_number if order.customer else "N/A",
                    "customer_address": order.customer.address if order.customer else "N/A"
                }
            },
            "details": order_details,
            
            "payments": [
                {
                    "payment_id": payment.payment_id,
                    "sale_payment_method": payment.sale_payment_method, 
                    "amount_paid": float(payment.amount_paid) if payment.amount_paid else 0.0,
                    "pay_date": payment.pay_date
                }
                for payment in order.payments
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database relational details query breakdown layers: {str(e)}")


# =====================================================================
# --- 6. PRODUCT & INVENTORY CONTROLLER (မင်း၏ Code) ---
# =====================================================================

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = None,
     category: Optional[str] = None, 
    sort: Optional[str] = "none", 
    db: Session = Depends(get_db)
):
    #Theingi Change
    query = db.query(Product).filter(
        Product.del_flag == 0,
         Product.current_qty > 0
        )
    # Product Name Search only
    if search:
     query = query.filter(
        Product.product_name.ilike(f"%{search}%")
    )


# Category Dropdown Filter
    if category:
     selected_category = db.query(Category).filter(
        Category.category_name == category,
        Category.del_flag == 0
    ).first()

     if selected_category:
        query = query.filter(
            Product.category_id == selected_category.category_id
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
@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):

    # order_by(Category.category_name.asc()) ကို ပေါင်းထည့်ထားပါသည်
    categories = db.query(Category).filter(
        Category.del_flag == 0
    ).order_by(Category.category_name.asc()).all()

    return [
        {
            "category_id": c.category_id,
            "category_name": c.category_name
        }
        for c in categories
    ]

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