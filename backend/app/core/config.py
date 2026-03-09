from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Investment Platform"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: PostgresDsn = "postgresql+asyncpg://user:password@localhost:5432/fintech_db"
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION"
    ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # RS256 Keys for JWT (in production these should be loaded from env or secrets manager)
    # Using a placeholder generation mechanism if not provided
    PRIVATE_KEY: str = ""
    PUBLIC_KEY: str = ""


    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
