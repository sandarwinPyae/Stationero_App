from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True)
    user_password = Column(String)
    role = Column(String)

class Customer(Base):
    __tablename__ = "customer"
    customer_id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    phone_number = Column(String)
    customer_email = Column(String, unique=True)
    customer_password = Column(String)
    address = Column(String)
    del_flag = Column(Integer, default=0)
    # ဆက်စပ်နေသော table များအတွက် relationship သုံးနိုင်သည်
    orders = relationship("SaleOrdersHeader", back_populates="customer")

class Category(Base):
    __tablename__ = "category"
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String)
    del_flag = Column(Integer, default=0)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "product"
    product_id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("category.category_id"))
    product_name = Column(String)
    unit_price = Column(Float)
    selling_price = Column(Float)
    current_qty = Column(Integer)
    product_img_url = Column(String)
    del_flag = Column(Integer,default=0)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    category = relationship("Category", back_populates="products")
    sale_order_details = relationship("SaleOrdersDetails",back_populates="product")
    sale_return_details = relationship("SaleReturnDetails",back_populates="product")
    purchase_order_details = relationship("PurchaseOrdersDetails",back_populates="product")
    purchase_return_details = relationship("PurchaseReturnDetails",back_populates="product")

class SaleOrdersHeader(Base):
    __tablename__ = "sale_orders_header"
    sale_order_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.customer_id"))
    invoice_number = Column(String, unique=True)
    total_amount = Column(Float)
    status = Column(String)
    order_date = Column(DateTime, default=func.now())
    customer = relationship("Customer", back_populates="orders")
    details = relationship("SaleOrdersDetails", back_populates="sale_order")
    payments = relationship("Payment",back_populates="sale_order")
    sale_returns = relationship("SaleReturnHeader",back_populates="sale_order")

class SaleOrdersDetails(Base):
    __tablename__ = "sale_orders_details"
    sale_order_detail_id = Column(Integer, primary_key=True, index=True)
    sale_order_id = Column(Integer, ForeignKey("sale_orders_header.sale_order_id"))
    product_id = Column(Integer,ForeignKey("product.product_id"))
    qty = Column(Integer)
    selling_price = Column(Float)
    sub_total = Column(Float)
    sale_order = relationship("SaleOrdersHeader", back_populates="details")
    product = relationship("Product",back_populates="sale_order_details")

class Payment(Base):
    __tablename__ = "payment"
    payment_id = Column(Integer, primary_key=True, index=True)
    sale_order_id = Column(Integer, ForeignKey("sale_orders_header.sale_order_id"))
    sale_payment_method = Column(String)
    amount_paid = Column(Float)
    pay_date = Column(DateTime, default=func.now())
    sale_order = relationship("SaleOrdersHeader",back_populates="payments")

class SaleReturnHeader(Base):
    __tablename__ = "sale_return_header"
    sale_return_id = Column(Integer, primary_key=True, index=True)
    sale_order_id = Column(Integer, ForeignKey("sale_orders_header.sale_order_id"))
    total_returned_amount = Column(Float)
    sale_return_payment_method = Column(String)
    sale_return_date = Column(DateTime, default=func.now())
    return_reason = Column(String)
    sale_order = relationship("SaleOrdersHeader",back_populates="sale_returns")
    details = relationship("SaleReturnDetails",back_populates="sale_return")
    
class SaleReturnDetails(Base):
    __tablename__ = "sale_return_details"
    sale_return_details_id = Column(Integer, primary_key=True, index=True)
    sale_return_id = Column(Integer, ForeignKey("sale_return_header.sale_return_id"))
    product_id = Column(Integer,ForeignKey("product.product_id"))
    qty = Column(Integer)
    selling_price = Column(Float)
    sub_total = Column(Float)
    sale_return = relationship("SaleReturnHeader",back_populates="details")
    product = relationship("Product",back_populates="sale_return_details")

class Supplier(Base):
    __tablename__ = "supplier"
    supplier_id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String)
    supplier_email = Column(String)
    supplier_phone_no = Column(String)
    supplier_address = Column(String)
    del_flag = Column(Integer,default=0)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    purchase_orders = relationship("PurchaseOrdersHeader",back_populates="supplier")
    

class PurchaseOrdersHeader(Base):
    __tablename__ = "purchase_orders_header"
    purchase_order_id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("supplier.supplier_id"))
    po_number = Column(String, unique=True)
    total_amount = Column(Float)
    payment_method = Column(String)
    purchase_order_date = Column(DateTime, default=func.now())
    supplier = relationship("Supplier",back_populates="purchase_orders")
    details = relationship("PurchaseOrdersDetails",back_populates="purchase_order")
    purchase_returns = relationship("PurchaseReturnHeader",back_populates="purchase_order")

class PurchaseOrdersDetails(Base):
    __tablename__ = "purchase_orders_details"
    purchase_order_details_id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders_header.purchase_order_id"))
    product_id = Column(Integer,ForeignKey("product.product_id"))
    qty = Column(Integer)
    unit_price = Column(Float)
    sub_total = Column(Float)
    purchase_order = relationship("PurchaseOrdersHeader",back_populates="details")
    product = relationship("Product",back_populates="purchase_order_details")


class PurchaseReturnHeader(Base):
    __tablename__ = "purchase_return_header"
    purchase_return_id = Column(Integer, primary_key=True, index=True)
    purchase_order_id= Column(Integer, ForeignKey("purchase_orders_header.purchase_order_id"))
    total_amount = Column(Float)
    purchase_return_payment_method = Column(String)
    purchase_return_date = Column(DateTime, default=func.now())
    purchase_order = relationship("PurchaseOrdersHeader",back_populates="purchase_returns")
    details = relationship("PurchaseReturnDetails",back_populates="purchase_return")

class PurchaseReturnDetails(Base):
    __tablename__ = "purchase_return_details"
    purchase_return_details_id = Column(Integer, primary_key=True, index=True)
    purchase_return_id= Column(Integer, ForeignKey("purchase_return_header.purchase_return_id"))
    product_id = Column(Integer,ForeignKey("product.product_id"))
    returned_qty = Column(Integer)
    unit_price = Column(Float)
    returned_amount = Column(Float)
    purchase_return = relationship("PurchaseReturnHeader",back_populates="details")
    product = relationship("Product",back_populates="purchase_return_details")
    
