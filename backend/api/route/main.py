import os
import sys

# Keep this path fixer that solved our previous error
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.db import models, database
# Import your customer router component
from .customer_routes import router as customer_router

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()  

# Enable CORS so your React frontend can talk to this backend safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root landing check
@app.get("/")
def read_root():
    return {"message": "Database is ready!"}

# Register your signup routes right here
app.include_router(customer_router)
