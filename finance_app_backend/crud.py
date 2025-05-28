# finance_app_backend/ crud.py

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from . import models, schemas
from typing import Optional

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
    return {"message": "Account deleted successfully"}

#----Category Crud Functions-------

def create_category(db: Session, category: schemas.CategoryCreate):
    # Check if category name already exists (optional, but good for uniqueness)
    db_category = db.query(models.Category).filter(models.Category.name == category.name).first()
    if db_category:
        return None # Indicate category already exists
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

# Get a category by name
def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

# Get all categories
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

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
    return {"message": "Category deleted successfully"}