from fastapi import FastAPI
from db import models, database 

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()  

@app.get("/")
def read_root():
    return {"message": "Database is ready!"}

# testing