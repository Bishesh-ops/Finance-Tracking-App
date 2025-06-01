# finance_app_backend/config.py
from __future__ import annotations # Enables postponed evaluation of type annotations

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.
    """
    # Configure Pydantic to load variables from the .env file.
    model_config = SettingsConfigDict(env_file='../.env', env_file_encoding='utf-8')

    # Database connection URL (e.g., postgresql://user:pass@host/db_name)
    DATABASE_URL: str

    # JWT Authentication Settings
    # Secret key for signing JWTs. MUST be a strong, random string in production.
    SECRET_KEY: str
    # Algorithm used for JWT signing (e.g., "HS256").
    ALGORITHM: str
    # Access token expiration time in minutes.
    ACCESS_TOKEN_EXPIRE_MINUTES: int

# Create a global settings instance to be imported throughout the application.
settings = Settings()