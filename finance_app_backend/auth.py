# finance_app_backend/auth.py

from __future__ import annotations # Enables postponed evaluation of type annotations
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from .config import settings
from . import schemas, crud
from .database import get_db # Correct import for database session dependency


# --- Password Hashing Setup ---
# Context for securely hashing and verifying passwords.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- OAuth2PasswordBearer for token extraction from headers ---
# tokenUrl specifies the endpoint where clients can obtain an access token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Password Verification Utility ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT Token Creation Utility ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT access token.

    Args:
        data: Payload to encode in the token (e.g., {"sub": username}).
        expires_delta: Optional timedelta for token expiry. If None, uses default from settings.

    Returns:
        The encoded JWT string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) # Add expiration time to payload
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# --- Dependency to Get Current Authenticated User ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    Dependency that authenticates the user based on the provided JWT.

    Args:
        token: JWT extracted from the Authorization header (handled by OAuth2PasswordBearer).
        db: Database session.

    Returns:
        The User ORM model corresponding to the authenticated user.

    Raises:
        HTTPException 401_UNAUTHORIZED: If credentials cannot be validated or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub") # 'sub' claim typically holds the subject (username here)
        
        if username is None:
            raise credentials_exception
        
        # Validate the token data against a Pydantic schema
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception # Raise exception if JWT decoding fails

    # Retrieve user from DB to ensure they still exist and are active
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
        
    return user