"""
Environment variable configuration schema with validation and type coercion.

Why: Every service needs a single source of truth for env vars. This pattern
uses pydantic BaseSettings for type safety, defaults, and validation aliases.

Usage:
    from index import AppConfig
    config = AppConfig()  # Reads from .env
    redis_url = config.redis_url
    ttl = config.access_token_ttl_minutes
"""
from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """Application configuration from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore unknown vars
    )

    # App metadata
    app_name: str = "Service"
    api_prefix: str = "/api/v1"
    debug: bool = Field(default=False, validation_alias="DEBUG")

    # Security
    jwt_secret: str = Field(
        default="change-me-in-production",
        min_length=16,
        validation_alias="JWT_SECRET",
    )
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 60 * 24  # 1 day

    # Database
    database_url: str = Field(
        default="postgresql+psycopg://user:pass@localhost:5432/db",
        validation_alias="DATABASE_URL",
    )

    # Redis
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL",
    )

    # External services
    openrouter_api_key: str | None = Field(
        default=None,
        validation_alias="OPENROUTER_API_KEY",
    )
    openrouter_model: str = "openai/gpt-4o-mini"
    gemini_api_key: str | None = Field(
        default=None,
        validation_alias="GEMINI_API_KEY",
    )

    # CORS
    cors_origins: list[str] = ["*"]

    @property
    def is_prod(self) -> bool:
        """Check if running in production."""
        return not self.debug


# Global singleton
config = AppConfig()
