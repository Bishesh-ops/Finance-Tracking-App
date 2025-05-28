# Finance tracker backend main file
#import necessary libraries
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from passlib.context import CryptContext


from . import models, schemas, crud
from .database import engine, get_db, Base

app = FastAPI(
    title="Finance Tracker API",
    description="API for managing personal finance tracking",
    version="0.1.0",
)

#-----Database Initialization-----

Base.metadata.create_all(bind=engine)


#-----API Endpoints-----

@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_api(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user_in.username)
    
    if db_user:
        raise HTTPException(status_code=400, detail = 'Username already registered')
    
    new_user = crud.create_user(db=db, user=user_in)
    
    return new_user

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user_api(user_id: int, db:Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail = "User Not Found")
    return db_user
    
#---Account Endpoints---

@app.post("/users/{user_id}/accounts/", response_model=schemas.Account, status_code=status.HTTP_201_CREATED)
def create_account_for_user_api(user_id: int, account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not Found")
    return crud.create_user_account(db=db, account=account, user_id=user_id)

# Get all accounts for a specific user
@app.get("/users/{user_id}/accounts/", response_model=List[schemas.Account])
def read_user_accounts_api(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Ensure the user exists (optional, but good for validation)
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = crud.get_accounts(db, user_id=user_id, skip=skip, limit=limit)
    return accounts

# Get a single account by ID (and ensure it belongs to the specified user)
@app.get("/users/{user_id}/accounts/{account_id}", response_model=schemas.Account)
def read_user_account_by_id_api(user_id: int, account_id: int, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id=account_id, user_id=user_id) # Pass user_id for security
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    return db_account

@app.put("/users/{user_id}/accounts/{account_id}", response_model=schemas.Account)
def update_user_account_api(
    user_id: int,
    account_id: int,
    account_update: schemas.AccountUpdate,
    db:Session = Depends(get_db)   
):
    db_account = crud.get_account(db, account_id=account_id, user_id=user_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    return crud.update_account(db=db, db_account=db_account, account_update=account_update)

@app.delete("/users/{user_id}/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account_api(user_id: int, account_id: int, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id=account_id, user_id=user_id) # Get account ensuring ownership
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    crud.delete_account(db=db, db_account=db_account)
    return # No content for 204 status

# Create a new category
@app.post("/categories/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category_api(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.create_category(db=db, category=category)
    if db_category is None:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return db_category

@app.get("/categories/{category_id}", response_model=schemas.Category)
def read_category_api(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

# Get all categories
@app.get("/categories/", response_model=List[schemas.Category])
def read_all_categories_api(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

# Update a category
@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category_api(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    db: Session = Depends(get_db)
):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.update_category(db=db, db_category=db_category, category_update=category_update)

# Delete a category
@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_api(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(db=db, db_category=db_category)
    return # No content for 204 status
