import os
from functools import lru_cache
from pydantic import BaseModel


class Settings(BaseModel):
    allowed_origins: list[str] = []
    log_level: str = "info"
    database_url: str | None = None

    def __init__(self, **data):
        super().__init__(**data)
        origins_raw = os.getenv("ALLOWED_ORIGINS", "")
        self.allowed_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
        self.log_level = os.getenv("LOG_LEVEL", "info")
        # DATABASE_URL по умолчанию берём из окружения. В docker-compose установлен URL для подключения к сервису db.
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://postgres:postgres@localhost:5432/reviewinsight",
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()