import os
from functools import lru_cache
from pydantic import BaseModel


class Settings(BaseModel):
    allowed_origins: list[str] = []
    log_level: str = "info"

    def __init__(self, **data):
        super().__init__(**data)
        origins_raw = os.getenv("ALLOWED_ORIGINS", "")
        self.allowed_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
        self.log_level = os.getenv("LOG_LEVEL", "info")


@lru_cache
def get_settings() -> Settings:
    return Settings()