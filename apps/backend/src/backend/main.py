from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .core.logging import setup_logging
from .api import (
    routes_import,
    routes_analyze,
    routes_recommendations,
    routes_dashboard,
)

setup_logging()
settings = get_settings()

app = FastAPI(title="ReviewInsight Backend", version="0.1.0", docs_url="/docs")


if settings.allowed_origins and any(o.strip() for o in settings.allowed_origins):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in settings.allowed_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(routes_import.router)
app.include_router(routes_analyze.router)
app.include_router(routes_recommendations.router)
app.include_router(routes_dashboard.router)