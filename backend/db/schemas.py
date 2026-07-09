from pydantic import BaseModel
from typing import Optional

class PurchaseRequest(BaseModel):
    product_id: int
    buy_qty: int

class ProductResponse(BaseModel):
    product_id: int
    product_name: Optional[str]
    selling_price: int
    display_price: str
    current_qty: int
    product_img_url: Optional[str]
    description: Optional[str] = None

    class Config:
        from_attributes = True

# 🌟 စျေးနှုန်းအသစ် ပြောင်းလဲရန်အတွက် Schema အသစ် 🌟
class ProductPriceUpdate(BaseModel):
    new_price: int
    