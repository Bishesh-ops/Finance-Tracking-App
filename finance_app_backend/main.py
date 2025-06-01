# Finance tracker backend main file
#import necessary libraries
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from passlib.context import CryptContext


from . import models, schemas, crud, auth
from .database import engine, get_db, Base

app = FastAPI(
    title="Personal Finance Tracker API",
    description="A backend API for managing personal finances, including users, accounts, categories, and transactions.",
    version="0.1.0",
)

#-----Database Initialization-----

Base.metadata.create_all(bind=engine)


#-----API Endpoints-----

@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_api(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = crud.create_user(db=db, user=user_in)
    return new_user

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    # The 'current_user' object already contains the User ORM model from the DB
    return current_user

    
#---Account Endpoints---

@app.post("/users/{user_id}/accounts/", response_model=schemas.Account, status_code=status.HTTP_201_CREATED)
async def create_account_for_user_api(
    user_id: int,
    account: schemas.AccountCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Dependency for authentication
):
    # Authorization Check: Ensure the requested user_id matches the authenticated user's ID
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create account for this user")

    # The rest of the logic remains the same, but now it's guarded by authentication
    return crud.create_user_account(db=db, account=account, user_id=user_id)
# Get all accounts for a specific user
@app.get("/users/{user_id}/accounts/", response_model=List[schemas.Account])
async def read_user_accounts_api(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view accounts for this user")

    accounts = crud.get_accounts(db, user_id=user_id, skip=skip, limit=limit)
    return accounts

# Get a single account by ID (and ensure it belongs to the specified user)
@app.get("/users/{user_id}/accounts/{account_id}", response_model=schemas.Account)
async def read_user_account_by_id_api(
    user_id: int,
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this account")

    db_account = crud.get_account(db, account_id=account_id, user_id=user_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    return db_account

@app.put("/users/{user_id}/accounts/{account_id}", response_model=schemas.Account)
async def update_user_account_api(
    user_id: int,
    account_id: int,
    account_update: schemas.AccountUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this account")

    db_account = crud.get_account(db, account_id=account_id, user_id=user_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    return crud.update_account(db=db, db_account=db_account, account_update=account_update)

@app.delete("/users/{user_id}/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account_api(
    user_id: int,
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this account")

    db_account = crud.get_account(db, account_id=account_id, user_id=user_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    crud.delete_account(db=db, db_account=db_account)
    return

# --- Category Endpoints (Can remain public or secure, depends on app needs. Let's make them secure for consistency) ---

@app.post("/categories/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
async def create_category_api(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    # Potentially add a check here if categories are user-specific,
    # or just let any authenticated user create them. For simplicity, let's allow any auth user.
    db_category = crud.create_category(db=db, category=category)
    if db_category is None:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return db_category

@app.get("/categories/{category_id}", response_model=schemas.Category)
async def read_category_api(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.get("/categories/", response_model=List[schemas.Category])
async def read_all_categories_api(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.put("/categories/{category_id}", response_model=schemas.Category)
async def update_category_api(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.update_category(db=db, db_category=db_category, category_update=category_update)

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_api(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(db=db, db_category=db_category)
    return

# --- Transaction Endpoints (Now require authentication and ensure user owns data) ---
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
  form_data: OAuth2PasswordRequestForm = Depends(),
  db: Session = Depends(get_db)
):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
        )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/{user_id}/transactions/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction_for_user_api(
    user_id: int,
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Secured
):
    # Authorization Check: Ensure the requested user_id matches the authenticated user's ID
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create transaction for this user")

    # Verify Account exists AND belongs to the user
    db_account = crud.get_account(db, account_id=transaction.account_id, user_id=user_id) # Use user_id for verification
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")

    # Verify Category exists (categories are global, so no user_id check needed here)
    db_category = crud.get_category(db, category_id=transaction.category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    return crud.create_user_transaction(db=db, transaction=transaction, user_id=user_id)

@app.get("/users/{user_id}/transactions/{transaction_id}", response_model=schemas.Transaction)
async def read_transaction_api(
    user_id: int,
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this transaction")

    db_transaction = crud.get_transaction(db, transaction_id=transaction_id, user_id=user_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found or does not belong to this user")
    return db_transaction

@app.get("/users/{user_id}/transactions/", response_model=List[schemas.Transaction])
async def read_user_transactions_api(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view transactions for this user")

    transactions = crud.get_transactions(db, user_id=user_id, skip=skip, limit=limit)
    return transactions

@app.put("/users/{user_id}/transactions/{transaction_id}", response_model=schemas.Transaction)
async def update_transaction_api(
    user_id: int,
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this transaction")

    db_transaction = crud.get_transaction(db, transaction_id=transaction_id, user_id=user_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found or does not belong to this user")

    if transaction_update.account_id is not None and transaction_update.account_id != db_transaction.account_id:
        new_account = crud.get_account(db, account_id=transaction_update.account_id, user_id=user_id) # Verify new account ownership
        if not new_account:
            raise HTTPException(status_code=400, detail="New account not found or does not belong to this user")

    if transaction_update.category_id is not None and transaction_update.category_id != db_transaction.category_id:
        new_category = crud.get_category(db, category_id=transaction_update.category_id)
        if not new_category:
            raise HTTPException(status_code=400, detail="New category not found")

    return crud.update_transaction(db=db, db_transaction=db_transaction, transaction_update=transaction_update)

@app.delete("/users/{user_id}/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction_api(
    user_id: int,
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this transaction")

    db_transaction = crud.get_transaction(db, transaction_id=transaction_id, user_id=user_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found or does not belong to this user")

    crud.delete_transaction(db=db, db_transaction=db_transaction)
    return