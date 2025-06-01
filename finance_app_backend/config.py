# finance_app_backend/config.py
from __future__ import annotations # Added this line at the very top

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='../.env', env_file_encoding='utf-8')

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

settings = Settings()

# Keep the debug print for now to confirm what URL Pydantic loads
print(f"DEBUG: DATABASE_URL loaded by Pydantic: {settings.DATABASE_URL}")