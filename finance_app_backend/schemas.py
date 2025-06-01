from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    # accounts: List["Account"] = []
    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    name: str
    balance: Optional[float] = 0.0

class AccountCreate(AccountBase):
    pass

class AccountUpdate(AccountBase):
    name: Optional[str] = None
    balance: Optional[float] = None

class Account(AccountBase):
    id : int
    owner_id: int

    class Config:
        from_attributes = True


# ---Category Schemas ---

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

# Schema for updating a category (e.g., changing name)
class CategoryUpdate(CategoryBase):
    name: Optional[str] = None # Make name optional for updates

class Category(CategoryBase):
    id: int
    # transactions: List["Transaction"] = [] # Optional: include transactions if desired

    class Config:
        from_attributes = True

# --- Transaction Schemas ---
# MAKE SURE THESE CLASSES ARE NOT INDENTED BENEATH 'Category'
# They should be at the same level as 'Category', 'Account', 'User' etc.
class TransactionBase(BaseModel):
    amount: float # CORRECTED: 'ammount' -> 'amount'
    type: str
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    account_id: int
    category_id: int


class TransactionUpdate(BaseModel): # Inherit from BaseModel directly for full optionality
    amount: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    account_id: Optional[int] = None
    category_id: Optional[int] = None


class Transaction(TransactionBase):
    id: int
    user_id: int
    account_id: int
    category_id: int

    class Config:
        from_attributes = True
        
        
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    username: Optional[str] = None