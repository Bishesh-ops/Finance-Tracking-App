# finance_app_backend/schemas.py
from __future__ import annotations # Enables postponed evaluation of type annotations

from pydantic import BaseModel, ConfigDict # <-- Import ConfigDict here!
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True) # <-- Updated syntax!

# --- Account Schemas ---
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

    model_config = ConfigDict(from_attributes=True) # <-- Updated syntax!

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    type: str  # "income", "expense", or "both"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None

class Category(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True) # <-- Updated syntax!

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    amount: float
    type: str # "income" or "expense"
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    account_id: int
    category_id: Optional[int] = None

class TransactionUpdate(BaseModel):
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
    category_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True) # <-- Updated syntax!

# --- Authentication Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None