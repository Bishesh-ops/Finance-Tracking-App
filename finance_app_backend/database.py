# finance_app_backend/database.py
from __future__ import annotations # Enables postponed evaluation of type annotations

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from .config import settings # Imports application settings

# Database URL comes from settings (e.g., from .env file).
# This allows flexible configuration for development, testing, and production.
DATABASE_URL = settings.DATABASE_URL

# Create the SQLAlchemy engine.
# pool_pre_ping=True helps ensure connections are still active.
# connect_args={"check_same_thread": False} is crucial for SQLite, or if using sync PG driver in async app.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Configure a SessionLocal class.
# Each instance will be an independent database session.
# autocommit=False: Changes won't be saved until db.commit() is called.
# autoflush=False: Objects won't be flushed to the database automatically.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy ORM models.
# Models inherit from this to be recognized by SQLAlchemy's declarative system.
Base = declarative_base()

# FastAPI dependency function to provide a database session per request.
# Ensures the session is properly created and closed after the request.
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db # Yields the session to the endpoint function
    finally:
        db.close() # Closes the session after the request is processed (or on error)

# Helper functions to create and drop all database tables.
# Primarily used for testing setup/teardown or initial schema creation.
def create_all_tables() -> None:
    Base.metadata.create_all(bind=engine)

def drop_all_tables() -> None:
    Base.metadata.drop_all(bind=engine)