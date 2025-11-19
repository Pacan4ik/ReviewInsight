from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from ..models.db_models import Base

_engine: AsyncEngine | None = None
_SessionLocal: sessionmaker | None = None


def get_engine(database_url: str) -> AsyncEngine:
    global _engine, _SessionLocal
    if _engine is None:
        _engine = create_async_engine(database_url, future=True, echo=False)
        _SessionLocal = sessionmaker(bind=_engine, class_=AsyncSession, expire_on_commit=False)
    return _engine


def get_session() -> sessionmaker:
    if _SessionLocal is None:
        raise RuntimeError("Engine is not initialized. Call get_engine(database_url) first.")
    return _SessionLocal

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    session_maker = get_session()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db(engine: AsyncEngine) -> None:
    # Создаёт все таблицы, описанные в моделях
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
