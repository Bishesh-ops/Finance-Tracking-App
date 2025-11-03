# finance_app_backend/ crud.py

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from . import models, schemas
from typing import Optional, List
from datetime import datetime, date

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    # db.query(models.User) creates a query object for the User model.
    # .filter(models.User.id == user_id) adds a WHERE clause to the query.
    # .first() executes the query and returns the first result (or None if no match).
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate):
    # Hash the password using the helper function
    hashed_password = get_password_hash(user.password)

    # Create a new instance of the SQLAlchemy User model
    # Note: 'username' and 'hashed_password' are direct attributes of the model
    db_user = models.User(username=user.username, hashed_password=hashed_password)

    # Add the new user object to the database session
    db.add(db_user)
    # Commit the transaction to save changes to the database
    db.commit()
    # Refresh the object to populate it with any database-generated values (like 'id')
    db.refresh(db_user)

    return db_user

def create_user_account(db: Session, account: schemas.AccountCreate, user_id: int):
    db_account = models.Account(**account.model_dump(), owner_id=user_id)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_account(db: Session, account_id: int, user_id: Optional[int] = None):
    query = db.query(models.Account).filter(models.Account.id == account_id)
    if user_id: # If user_id is provided, ensure account belongs to this user
        query = query.filter(models.Account.owner_id == user_id)
    return query.first()

def get_accounts(db: Session, user_id: int, skip: int=0, limit:int=100):
    return db.query(models.Account).filter(models.Account.owner_id == user_id).offset(skip).limit(limit).all()

def update_account(db: Session, db_account: models.Account, account_update: schemas.AccountUpdate):
    # Convert Pydantic model to a dictionary, excluding unset fields
    update_data = account_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_account, key, value) # Update attributes on the SQLAlchemy model
    db.add(db_account) # Add to session (needed if it was detached)
    db.commit()
    db.refresh(db_account)
    return db_account

def delete_account(db: Session, db_account: models.Account):
    db.delete(db_account)
    db.commit()


#----Category Crud Functions-------

def create_category(db: Session, category: schemas.CategoryCreate):
    # Check if category with same name AND type already exists
    db_category = db.query(models.Category).filter(
        models.Category.name == category.name,
        models.Category.type == category.type
    ).first()
    if db_category:
        return None # Indicate category already exists
    db_category = models.Category(name=category.name, type=category.type)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

# Get a category by name
def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

# Get all categories with optional type filtering
def get_categories(db: Session, skip: int = 0, limit: int = 100, type_filter: Optional[str] = None):
    query = db.query(models.Category)

    # Filter by type if provided
    if type_filter:
        # Return categories that match the type OR are type "both"
        query = query.filter(
            (models.Category.type == type_filter) | (models.Category.type == "both")
        )

    return query.offset(skip).limit(limit).all()

# Update an existing category
def update_category(db: Session, db_category: models.Category, category_update: schemas.CategoryUpdate):
    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Delete a category
def delete_category(db: Session, db_category: models.Category):
    db.delete(db_category)
    db.commit()


def _adjust_account_balance(db: Session, account_id: int, amount: float, transaction_type: str):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if account:
        if transaction_type == "income":
            account.balance += amount
        elif transaction_type == "expense":
            account.balance -= amount
        else:
            raise ValueError("Invalid transaction type. Use 'income' or 'expense'.")
        
        db.add(account)
        db.commit()
        db.refresh(account)
        return account

def create_user_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int):
    # Create the transaction ORM model instance
    db_transaction = models.Transaction(
        **transaction.model_dump(exclude={"account_id", "category_id"}),
        user_id=user_id,
        account_id=transaction.account_id,
        category_id=transaction.category_id
    )
    db.add(db_transaction)
    db.flush() # Flush to get the transaction ID and make it available for balance adjustment before final commit

    # Adjust the associated account's balance
    _adjust_account_balance(db, db_transaction.account_id, db_transaction.amount, db_transaction.type)

    db.commit() # Final commit for both transaction and account balance
    db.refresh(db_transaction)
    return db_transaction
    
    
def get_transaction(db: Session, transaction_id: int, user_id: Optional[int] = None):
    query = db.query(models.Transaction).filter(models.Transaction.id == transaction_id)
    if user_id:  # If user_id is provided, ensure transaction belongs to this user
        query = query.filter(models.Transaction.user_id == user_id)
    return query.first()

def get_transactions(
    db: Session,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    sort_by: str = "date",
    order: str = "desc",
    skip: int = 0,
    limit: int = 100    
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)

    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(models.Transaction.type == transaction_type)

    sort_column = None
    if sort_by == "date":
        sort_column = models.Transaction.date
    elif sort_by == "amount":
        sort_column = models.Transaction.amount
    else:
        sort_column = models.Transaction.id  # Default to ID if invalid sort_by
    if sort_column:
        if order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(models.Transaction.date.desc())  # Default order

    return query.offset(skip).limit(limit).all()


def update_transaction(db: Session, db_transaction: models.Transaction, transaction_update: schemas.TransactionUpdate):
    old_ammount = db_transaction.amount
    old_type = db_transaction.type
    old_account_id = db_transaction.account_id
    
    update_data = transaction_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    db.add(db_transaction)
    
    new_ammount = db_transaction.amount
    new_type = db_transaction.type
    new_account_id = db_transaction.account_id
    
    if old_account_id != new_account_id:
        reverse_type = "expense" if old_type == "income" else "income"
        _adjust_account_balance(db, old_account_id, old_ammount, reverse_type)
        _adjust_account_balance(db, new_account_id, new_ammount, new_type)
    elif old_ammount!= new_ammount or old_type != new_type:
        reverse_type = "expense" if old_type == "income" else "income"
        _adjust_account_balance(db, old_account_id, old_ammount, reverse_type)
        _adjust_account_balance(db, new_account_id, new_ammount, new_type)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, db_transaction: models.Transaction):
    reverse_type = "expense" if db_transaction.type == "income" else "income"
    _adjust_account_balance(db, db_transaction.account_id, db_transaction.amount, reverse_type)
    db.delete(db_transaction)
    db.commit()
