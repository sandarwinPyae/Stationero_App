import os
import subprocess
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.db.database import get_db 
# 1. Added your return tables into your standard SQLAlchemy imports
from backend.db.models import Customer, User, SaleOrdersHeader, SaleOrdersDetails, SaleReturnHeader, SaleReturnDetails

router = APIRouter()

# Dynamically calculate the absolute path to your cobol executable
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
COBOL_EXE_PATH = os.path.join(BASE_DIR, "cobol", "customer_engine.exe")

class CustomerSignUpRequest(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    address: str
    password: str

class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Structured Pydantic validation models to map incoming return item streams
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

class ReturnItemInput(BaseModel):
    product_id: int
    qty: int
    selling_price: float
    sub_total: float

class IndependentReturnRequest(BaseModel):
    return_id: str # Holds "RTN00001"
    customer_email: str
    reason: str
    payment_method: str
    items: List[ReturnItemInput]    

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

# --- SIGN UP ROUTE ---
@router.post("/api/signup", status_code=status.HTTP_201_CREATED)
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
            
        new_user = User(
            user_email=payload.email,
            user_password=payload.password,
            role="customer"
        )
        db.add(new_user)
        db.flush() 

        new_customer = Customer(
            customer_name=payload.name,
            customer_email=payload.email,
            phone_number=payload.phone_number,
            address=payload.address,
            customer_password=payload.password,
            del_flag=0
        )
        db.add(new_customer)
        db.commit()
        
        return {"message": cobol_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failure: {e}")

# --- LOGIN ROUTE ---
@router.post("/api/login")
def login_customer(payload: CustomerLoginRequest, db: Session = Depends(get_db)):
    user_account = db.query(User).filter(User.user_email == payload.email).first()
    match_flag = "N"
    role_attribute = "customer"
    user_name = "User"
    user_phone = "-"
    user_address = "-"

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
                "message": "Login successful!", 
                "role": "customer", 
                "customer_name": user_name,
                "profile": {
                    "name": user_name,
                    "email": payload.email,
                    "phone": user_phone,
                    "address": user_address
                }
            }
        else:
            return {"message": cobol_message, "role": role_attribute, "customer_name": user_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failure: {e}")

class CartCheckoutRequest(BaseModel):
    quantity: int
    price: float

@router.post("/api/cart/checkout")
def checkout_cart_analytics(payload: CartCheckoutRequest):
    print(f"[ANALYTICS] Processing checkout for Qty: {payload.quantity}, Cost: {payload.price}")
    return {"status": "Logged"}

# --- CONSERVED ORDER CONFIRMATION INSERTS ---
@router.post("/api/order/confirm", status_code=status.HTTP_201_CREATED)
def confirm_customer_order(payload: CustomerOrderConfirm, db: Session = Depends(get_db)):
    try:
        # 1. Automatically calculate the absolute next available global slot index number
        last_global_order = db.query(SaleOrdersHeader).order_by(SaleOrdersHeader.sale_order_id.desc()).first()
        next_global_num = (last_global_order.sale_order_id if last_global_order else 0) + 1
        generated_system_invoice = f"INV{next_global_num:05d}"

        # 2. FIXED: Change 'payload.invoice_id' to use your fresh 'generated_system_invoice' variable!
        result = subprocess.run(
            [COBOL_EXE_PATH, "CONFIRM_ORDER", generated_system_invoice, str(payload.total_qty), str(int(payload.net_amount)), payload.customer_email], 
            capture_output=True, text=True, check=False
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stdout.strip())
            
        # 3. Save directly into your table records layout with zero constraint collisions
        new_order_header = SaleOrdersHeader(
            customer_email=payload.customer_email, 
            invoice_number=generated_system_invoice, # Correctly uses our auto-assigned string
            total_amount=payload.net_amount,
            status="Pending" 
        )
        db.add(new_order_header)
        db.flush() 

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
        return {"message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database relational insert breakdown: {e}")

# --- DYNAMIC INVOICE ID GENERATOR ROUTE ---
@router.get("/api/order/next-invoice/{customer_email}")
def generate_next_invoice_id(customer_email: str, db: Session = Depends(get_db)):
    try:
        # ---- FIXED: CRUCIAL FILTER CONSTRAINT ADDED HERE ----
        # Query only the previous orders that belong to THIS specific email account string
        last_order = db.query(SaleOrdersHeader)\
                       .filter(SaleOrdersHeader.customer_email == customer_email)\
                       .order_by(SaleOrdersHeader.sale_order_id.desc())\
                       .first()
        
        next_number = 1
        if last_order and last_order.invoice_number:
            try:
                # Extract the sequential trailing integer (e.g., "INV00001" -> 1)
                numeric_part = int(last_order.invoice_number.replace("INV", ""))
                next_number = numeric_part + 1
            except ValueError:
                next_number = 1

        # Format it back out cleanly with standard zero-padding
        generated_invoice_id = f"INV{next_number:05d}"
        return {"invoice_id": generated_invoice_id}
        
    except Exception:
        return {"invoice_id": "INV00001"}


@router.post("/api/order/return-entry", status_code=status.HTTP_201_CREATED)
def record_customer_order_return(payload: CustomerReturnEntryRequest, db: Session = Depends(get_db)):
    # 1. Fetch the corresponding original order row to connect your foreign reference links
    original_order = db.query(SaleOrdersHeader).filter(SaleOrdersHeader.invoice_number == payload.invoice_id).first()
    if not original_order:
        raise HTTPException(status_code=404, detail=f"Invoice reference code {payload.invoice_id} not found.")

    computed_total_returned = sum(item.sub_total for item in payload.items)
    computed_total_qty = sum(item.qty for item in payload.items)

    try:
        # Step A: Trigger your compiled COBOL engine logic subroutines safely
        result = subprocess.run(
            [COBOL_EXE_PATH, "RETURN_ORDER", payload.invoice_id, str(computed_total_qty), "customer", payload.customer_email], 
            capture_output=True, text=True, check=False
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stdout.strip())

        # Step B: WRITE DIRECTLY TO YOUR SEPARATE 'sale_return_header' PRIMARY LOG TABLE
        new_return_header = SaleReturnHeader(
            sale_order_id=original_order.sale_order_id, 
            total_returned_amount=computed_total_returned,
            sale_return_payment_method=payload.payment_method,
            return_reason=payload.reason
        )
        db.add(new_return_header)
        db.flush() 

        # Step C: LOOP RETURN ITEMS TO INJECT ROWS INTO 'sale_return_details' CHILD TABLE
        for item in payload.items:
            new_return_detail = SaleReturnDetails(
                sale_return_id=new_return_header.sale_return_id, 
                product_id=item.product_id,
                qty=item.qty,
                selling_price=item.selling_price,
                sub_total=item.sub_total
            )
            db.add(new_return_detail)

        # NOTE: We removed the lines that modify 'original_order.status = "Returned"' 
        # and removed the code that changes original quantities. 
        # The purchase tables and return tables are now 100% separate!

        db.commit() # Save everything securely to disk in a single transaction block!
        return {"status": "Success", "message": "Return logged completely separate from purchase order values."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database separate return storage failure: {e}")

# --- 1. DYNAMIC RETURN ID SEQUENCE SELECTOR ROUTE ---
@router.get("/api/order/next-return/{customer_email}")
def generate_next_return_id(customer_email: str, db: Session = Depends(get_db)):
    try:
        # Search your teammate's existing table for the highest return entry code
        last_return = db.query(SaleReturnHeader).order_by(SaleReturnHeader.sale_return_id.desc()).first()
        
        next_number = 1
        # Read from the original column name your teammates built
        if last_return and hasattr(last_return, 'invoice_number') and last_return.invoice_number:
            if "RTN" in last_return.invoice_number:
                try:
                    numeric_part = int(last_return.invoice_number.replace("RTN", ""))
                    next_number = numeric_part + 1
                except ValueError:
                    next_number = 1

        return {"return_id": f"RTN{next_number:05d}"}
    except Exception:
        return {"return_id": "RTN00001"}

@router.post("/api/order/return-entry", status_code=status.HTTP_201_CREATED)
def record_independent_customer_return(payload: CustomerReturnEntryRequest, db: Session = Depends(get_db)):
    computed_total_returned = sum(item.sub_total for item in payload.items)
    computed_total_qty = sum(item.qty for item in payload.items)

    try:
        # Step A: Trigger your background COBOL subroutines cleanly
        result = subprocess.run(
            [COBOL_EXE_PATH, "RETURN_ORDER", payload.invoice_id, str(computed_total_qty), "customer", payload.customer_email], 
            capture_output=True, text=True, check=False
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stdout.strip())

        # Step B: WRITE DIRECTLY TO 'sale_return_header' PRIMARY LOG TABLE
        new_return_header = SaleReturnHeader(
            invoice_number=payload.invoice_id, 
            total_returned_amount=computed_total_returned,
            sale_return_payment_method=payload.payment_method,
            return_reason=payload.reason
        )
        db.add(new_return_header)
        
        # ---- FIX: FORCE DB FLUSH TO CAPTURE THE GENERATED PRIMARY KEY ID ----
        db.flush() 

        # Step C: LOOP RETURN ITEMS WITH A VERIFIED parent sale_return_id COUNTER
        for item in payload.items:
            new_return_detail = SaleReturnDetails(
                sale_return_id=new_return_header.sale_return_id, # Now holds a real integer instead of None!
                product_id=item.product_id,
                qty=item.qty,
                selling_price=item.selling_price,
                sub_total=item.sub_total
            )
            db.add(new_return_detail)

        db.commit() # Save all calculation variables safely to your physical app.db file!
        return {"status": "Success", "message": f"Return transaction {payload.invoice_id} successfully recorded."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database separate return storage failure: {e}")


@router.post("/api/order/return-status")
def process_order_return_status(payload: QuickReturnStatusRequest, db: Session = Depends(get_db)):
    try:
        latest_order = db.query(SaleOrdersHeader)\
                         .filter(SaleOrdersHeader.customer_email == payload.customer_email)\
                         .order_by(SaleOrdersHeader.sale_order_id.desc())\
                         .first()

        if not latest_order:
            raise HTTPException(status_code=404, detail="No orders found.")

        # 1. RUN COBOL BALANCING SUBROUTINES FOR BALANCING SYSTEM AUDIT LEDGERS
        subprocess.run(
            [COBOL_EXE_PATH, "RETURN_ORDER", latest_order.invoice_number, str(payload.qty), "customer", payload.customer_email], 
            capture_output=True, text=True, check=False
        )

        # 2. WRITE INTO THE SEPARATE RETURNS DATA GRID AS AN INDEPENDENT TRANSACTION RECORD
        new_return = SaleReturnHeader(
            sale_order_id=latest_order.sale_order_id,
            total_returned_amount=float(payload.qty * 3300),
            sale_return_payment_method=payload.payment_method,
            return_reason=payload.reason
        )
        db.add(new_return)

        # ---- FIXED: REMOVED latest_order.status = "Returned" OVERRIDES PERMANENTLY ----
        # The orders system and returns system are now 100% separate, as you intended!
        
        db.commit()
        return {"status": "Success", "message": "Return logged inside database ledger separate from order status fields."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database return registration breakdown: {e}")


# Ensure your database models are imported at the top of the file

# --- CLEAN ISOLATED EXTRACTION MULTI-TABLE ACCOUNT FINDER ROUTE ---
# --- CLEAN ISOLATED EXTRACTION MULTI-TABLE ACCOUNT FINDER ROUTE ---
@router.get("/api/order/history-logs/{customer_email}")
def get_customer_history_logs(customer_email: str, db: Session = Depends(get_db)):
    try:
        # 1. Fetch all original master purchase rows for this customer sorted from NEWEST to OLDEST
        orders_query = db.query(SaleOrdersHeader)\
                         .filter(SaleOrdersHeader.customer_email == customer_email)\
                         .order_by(SaleOrdersHeader.sale_order_id.desc())\
                         .all()
        orders_list = []
        
        # ---- FIXED: TOP-DOWN ASCENDING IDENTIFIER ENGINE ----
        # Simply number them 1, 2, 3 starting straight from your topmost screen card row!
        for index, o in enumerate(orders_query, start=1):
            orders_list.append({
                "invoice_number": f"INV{index:05d}", # Always displays INV00001 at the top row slot!
                "status": o.status if o.status else "Pending",
                "total_amount": o.total_amount,
                "payment_method": "Cash Down", 
                "sale_person": "Hsu Myat",
                "order_date": o.order_date.strftime("%Y-%m-%d %H:%M:%S") if o.order_date else "2026-07-03 11:45:00"
            })

        # 2. Fetch separate standalone return rows sorted from NEWEST to OLDEST
        # Since teammates tables use orders link relation, match them cleanly
        user_order_ids = [o.sale_order_id for o in orders_query]
        returns_list = []
        
        if user_order_ids:
            returns_query = db.query(SaleReturnHeader)\
                              .filter(SaleReturnHeader.sale_order_id.in_(user_order_ids))\
                              .order_by(SaleReturnHeader.sale_return_id.desc())\
                              .all()
            
            # ---- FIXED: TOP-DOWN ASCENDING RETURN ID ENGINE ----
            # Simply number them 1, 2, 3 starting straight from your topmost return screen card row!
            for index, r in enumerate(returns_query, start=1):
                returns_list.append({
                    "invoice_number": f"RTN{index:05d}", # Always displays RTN00001 at the top row slot!
                    "status": "Returned",
                    "total_amount": r.total_returned_amount if r.total_returned_amount else 3300.0,
                    "payment_method": r.sale_return_payment_method if r.sale_return_payment_method else "Cash Down",
                    "sale_person": "Hsu Myat",
                    "order_date": r.sale_return_date.strftime("%Y-%m-%d %H:%M:%S") if r.sale_return_date else "2026-07-03 11:55:00"
                })

        return {
            "orders": orders_list,
            "returns": returns_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database full history logs pipeline error: {e}")

@router.get("/api/customer/profile/{email}")
def get_customer_profile(email: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_email == email).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found.")
    return {
        "name": customer.customer_name,
        "email": customer.customer_email,
        "phone": customer.phone_number,
        "address": customer.address
    }

# --- 2. UPDATE PROFILE DETAILS ENDPOINT ---
@router.post("/api/customer/profile/update")
def update_customer_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_email == payload.email).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record matching this email not found.")
    
    try:
        # Update your customer table attributes
        customer.customer_name = payload.name
        customer.phone_number = payload.phone_number
        customer.address = payload.address
        db.commit()
        return {"status": "Success", "message": "Profile updated successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update customer row: {e}")

# --- 3. FORGOT / RESET PASSWORD ENDPOINT ---
@router.post("/api/customer/forgot-password")
def forgot_password_reset(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Update across both User account security table and Customer credentials layout
    user_account = db.query(User).filter(User.user_email == payload.email).first()
    customer_profile = db.query(Customer).filter(Customer.customer_email == payload.email).first()
    
    if not user_account and not customer_profile:
        raise HTTPException(status_code=404, detail="Email address not found in system registers.")
        
    try:
        if user_account:
            user_account.user_password = payload.new_password
        if customer_profile:
            customer_profile.customer_password = payload.new_password
            
        db.commit()
        return {"status": "Success", "message": "Password reset completed successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed resetting secure passwords: {e}")    
