# finance_app_backend/main.py

from __future__ import annotations # Enables postponed evaluation of type annotations
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta, date # Import date for filtering

from starlette.middleware.cors import CORSMiddleware

from . import models, schemas, crud, auth # Import core modules for app logic and data models
from .database import engine, get_db, Base # Import database setup


# Initialize the FastAPI application instance.
app = FastAPI(
    title="Personal Finance Tracker API",
    description="A backend API for managing personal finances, including users, accounts, categories, and transactions.",
    version="0.1.0",
)
origins = [
    "http://localhost:3000", # Your Next.js frontend development server
    # "https://your-frontend-domain.com",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # List of origins that can make requests
    allow_credentials=True,         # Allow cookies to be included in cross-origin requests
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allow all headers in cross-origin requests
)

# --- Authentication Endpoint ---
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), # Handles standard OAuth2 form data (username, password)
    db: Session = Depends(get_db) # Database session dependency
) -> schemas.Token:
    """
    Authenticates a user and returns a JWT access token.

    Expects form-urlencoded data with 'username' and 'password'.
    """
    # Attempt to retrieve the user by username
    user = crud.get_user_by_username(db, username=form_data.username)

    # Verify user existence and password validity
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}, # Standard header for authentication challenges
        )
    
    # Define token expiration time
    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create the JWT access token
    access_token = auth.create_access_token(
        data={"sub": user.username}, # 'sub' claim typically holds the subject of the token (username here)
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# --- User Endpoints ---
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_api(user_in: schemas.UserCreate, db: Session = Depends(get_db)) -> schemas.User:
    """
    Registers a new user.
    """
    # Check if a user with the given username already exists to prevent duplicates
    db_user = crud.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create the user via the CRUD layer (handles password hashing)
    new_user = crud.create_user(db=db, user=user_in)
    return new_user

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)) -> models.User:
    """
    Retrieves details of the current authenticated user.
    Requires a valid JWT in the Authorization header.
    """
    # The 'current_user' object is provided by the authentication dependency.
    return current_user

# --- Account Endpoints ---
@app.post("/users/{user_id}/accounts/", response_model=schemas.Account, status_code=status.HTTP_201_CREATED)
async def create_account_for_user_api(
    user_id: int,
    account: schemas.AccountCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Authenticates user
) -> schemas.Account:
    """
    Creates a new account for a specific user.
    Authorization: Only the authenticated user can create accounts for themselves.
    """
    # Authorization check: Ensure the requested user_id matches the authenticated user's ID
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create account for this user")

    return crud.create_user_account(db=db, account=account, user_id=user_id)

@app.get("/users/{user_id}/accounts/", response_model=List[schemas.Account])
async def read_user_accounts_api(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> List[schemas.Account]:
    """
    Retrieves all accounts for a specific user with pagination.
    Authorization: Only the authenticated user can view their own accounts.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view accounts for this user")

    accounts = crud.get_accounts(db, user_id=user_id, skip=skip, limit=limit)
    return accounts

@app.get("/users/{user_id}/accounts/{account_id}", response_model=schemas.Account)
async def read_user_account_by_id_api(
    user_id: int,
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Account:
    """
    Retrieves a single account by ID for a specific user.
    Authorization: User can only retrieve their own accounts.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this account")

    db_account = crud.get_account(db, account_id=account_id, user_id=user_id) # Filter by user_id for security
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
) -> schemas.Account:
    """
    Updates an existing account for a specific user.
    Authorization: User can only update their own accounts.
    """
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
): # Return type is None
    """
    Deletes an account for a specific user.
    Authorization: User can only delete their own accounts.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this account")

    db_account = crud.get_account(db, account_id=account_id, user_id=user_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")
    crud.delete_account(db=db, db_account=db_account)


# --- Category Endpoints ---
@app.post("/categories/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
async def create_category_api(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Categories can be created by any authenticated user
) -> schemas.Category:
    """
    Creates a new transaction category.
    Authorization: Any authenticated user can create categories.
    """
    db_category = crud.create_category(db=db, category=category)
    if db_category is None:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return db_category

@app.get("/categories/{category_id}", response_model=schemas.Category)
async def read_category_api(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Viewable by any authenticated user
) -> schemas.Category:
    """
    Retrieves a single category by ID.
    Authorization: Any authenticated user can view categories.
    """
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.get("/categories/", response_model=List[schemas.Category])
async def read_all_categories_api(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Viewable by any authenticated user
) -> List[schemas.Category]:
    """
    Retrieves all categories with pagination and optional type filtering.
    Authorization: Any authenticated user can view categories.
    Query param 'type' can filter by: "income", "expense", or "both"
    """
    categories = crud.get_categories(db, skip=skip, limit=limit, type_filter=type)
    return categories

@app.put("/categories/{category_id}", response_model=schemas.Category)
async def update_category_api(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Updatable by any authenticated user
) -> schemas.Category:
    """
    Updates an existing category.
    Authorization: Any authenticated user can update categories.
    """
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.update_category(db=db, db_category=db_category, category_update=category_update)

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_api(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
): # Return type is None
    """
    Deletes a category.
    Authorization: Any authenticated user can delete categories.
    """
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(db=db, db_category=db_category)


# --- Transaction Endpoints ---
@app.post("/users/{user_id}/transactions/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction_for_user_api(
    user_id: int,
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Transaction:
    """
    Creates a new transaction for a specific user and adjusts account balance.
    Authorization: User can only create transactions for their own ID.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create transaction for this user")

    db_account = crud.get_account(db, account_id=transaction.account_id, user_id=user_id) # Verify account ownership
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found or does not belong to this user")

    # Verify category exists if provided (category is optional)
    if transaction.category_id is not None:
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
) -> schemas.Transaction:
    """
    Retrieves a single transaction by ID for a specific user.
    Authorization: User can only retrieve their own transactions.
    """
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
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    sort_by: str = "date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> List[schemas.Transaction]:
    """
    Retrieves transactions for a user with filtering, sorting, and pagination.
    Authorization: User can only retrieve their own transactions.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view transactions for this user")

    transactions = crud.get_transactions(
        db,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        transaction_type=transaction_type,
        sort_by=sort_by,
        order=order,
        skip=skip,
        limit=limit
    )
    return transactions

@app.put("/users/{user_id}/transactions/{transaction_id}", response_model=schemas.Transaction)
async def update_transaction_api(
    user_id: int,
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Transaction:
    """
    Updates a transaction for a specific user and re-adjusts account balance.
    Authorization: User can only update their own transactions.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this transaction")

    db_transaction = crud.get_transaction(db, transaction_id=transaction_id, user_id=user_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found or does not belong to this user")

    # If the account_id is being updated, verify the new account exists and belongs to the user
    if transaction_update.account_id is not None and transaction_update.account_id != db_transaction.account_id:
        new_account = crud.get_account(db, account_id=transaction_update.account_id, user_id=user_id)
        if not new_account:
            raise HTTPException(status_code=400, detail="New account not found or does not belong to this user")

    # If the category_id is being updated, verify the new category exists (category is optional, so allow None)
    if transaction_update.category_id is not None:
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
): # Return type is None
    """
    Deletes a transaction for a specific user and reverses its impact on account balance.
    Authorization: User can only delete their own transactions.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this transaction")

    db_transaction = crud.get_transaction(db, transaction_id=transaction_id, user_id=user_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found or does not belong to this user")

    crud.delete_transaction(db=db, db_transaction=db_transaction)


# --- Budget Endpoints ---
@app.post("/users/{user_id}/budgets/", response_model=schemas.Budget, status_code=status.HTTP_201_CREATED)
async def create_budget_for_user_api(
    user_id: int,
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Budget:
    """
    Creates a new budget for a specific user and category.
    Authorization: User can only create budgets for themselves.
    Note: Only one budget per user per category is allowed.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create budget for this user")

    # Verify category exists
    db_category = crud.get_category(db, category_id=budget.category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create the budget
    db_budget = crud.create_budget(db=db, budget=budget, user_id=user_id)
    if db_budget is None:
        raise HTTPException(status_code=400, detail="Budget already exists for this category")

    return db_budget

@app.get("/users/{user_id}/budgets/", response_model=List[schemas.Budget])
async def read_user_budgets_api(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> List[schemas.Budget]:
    """
    Retrieves all budgets for a specific user with pagination.
    Authorization: User can only retrieve their own budgets.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view budgets for this user")

    budgets = crud.get_budgets(db, user_id=user_id, skip=skip, limit=limit)
    return budgets

@app.get("/users/{user_id}/budgets/{budget_id}", response_model=schemas.Budget)
async def read_budget_api(
    user_id: int,
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Budget:
    """
    Retrieves a single budget by ID for a specific user.
    Authorization: User can only retrieve their own budgets.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this budget")

    db_budget = crud.get_budget(db, budget_id=budget_id, user_id=user_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found or does not belong to this user")
    return db_budget

@app.put("/users/{user_id}/budgets/{budget_id}", response_model=schemas.Budget)
async def update_budget_api(
    user_id: int,
    budget_id: int,
    budget_update: schemas.BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
) -> schemas.Budget:
    """
    Updates an existing budget for a specific user.
    Authorization: User can only update their own budgets.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this budget")

    db_budget = crud.get_budget(db, budget_id=budget_id, user_id=user_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found or does not belong to this user")

    # If the category_id is being updated, verify the new category exists
    if budget_update.category_id is not None:
        new_category = crud.get_category(db, category_id=budget_update.category_id)
        if not new_category:
            raise HTTPException(status_code=400, detail="New category not found")

    return crud.update_budget(db=db, db_budget=db_budget, budget_update=budget_update)

@app.delete("/users/{user_id}/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget_api(
    user_id: int,
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deletes a budget for a specific user.
    Authorization: User can only delete their own budgets.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this budget")

    db_budget = crud.get_budget(db, budget_id=budget_id, user_id=user_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found or does not belong to this user")

    crud.delete_budget(db=db, db_budget=db_budget)
