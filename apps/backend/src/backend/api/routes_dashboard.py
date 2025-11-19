from datetime import datetime, timedelta
from typing import List, Dict

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..services.analysis_state import get_is_analyzing
from ..services.dashboard_metrics import ThemeCount, DayCount

from ..core.db import get_db_session
from ..services.dashboard_metrics import (
    get_total_reviews,
    get_sentiment_distribution,
    get_avg_sentiment_score,
    get_total_themes,
    get_non_positive_themes,
    get_top_themes,
    get_all_daily_counts,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardSummaryResponse(BaseModel):
    total_reviews: int
    sentiment_distribution: Dict[str, int]  # {'положительная': n, 'нейтральная': n, 'отрицательная': n}
    avg_sentiment_score: float  # по 5-балльной шкале: 5/3/1
    total_themes: int
    non_positive_themes: int  # нейтральная + отрицательная
    top_negative_themes: List[ThemeCount]
    top_positive_themes: List[ThemeCount]
    daily_counts: Dict[str, List[DayCount]]  # ключи: 'положительная','нейтральная','отрицательная'


@router.get("/summary", response_model=DashboardSummaryResponse)
async def dashboard_summary(
    start_date: str = Query(...),
    end_date: str = Query(...),
    product_id: int = Query(...),
    db: AsyncSession = Depends(get_db_session),
):
    # Проверка, не выполняется ли в данный момент анализ
    if get_is_analyzing():
        raise HTTPException(status_code=409, detail="Data analysis is in progress. Please try again later.")
    # Валидация дат
    try:
        sd = datetime.strptime(start_date, "%Y-%m-%d")
        ed = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (expected YYYY-MM-DD)")
    if ed < sd:
        raise HTTPException(status_code=400, detail="end_date < start_date")

    start_ts = sd
    end_excl = ed + timedelta(days=1)

    total_reviews = await get_total_reviews(db, start_ts, end_excl)
    sentiment_distribution = await get_sentiment_distribution(db, start_ts, end_excl)
    avg_sentiment_score = await get_avg_sentiment_score(db, start_ts, end_excl)
    total_themes = await get_total_themes(db, start_ts, end_excl)
    non_positive_themes = await get_non_positive_themes(db, start_ts, end_excl)
    top_negative_themes = await get_top_themes(db, start_ts, end_excl, sentiment="отрицательная")
    top_positive_themes = await get_top_themes(db, start_ts, end_excl, sentiment="положительная")
    daily_counts = await get_all_daily_counts(db, start_ts, end_excl)

    return DashboardSummaryResponse(
        total_reviews=total_reviews,
        sentiment_distribution=sentiment_distribution,
        avg_sentiment_score=avg_sentiment_score,
        total_themes=total_themes,
        non_positive_themes=non_positive_themes,
        top_negative_themes=top_negative_themes,
        top_positive_themes=top_positive_themes,
        daily_counts=daily_counts,
    )

@router.get("/is-analyzing")
async def is_analyzing_endpoint():
    from ..services.analysis_state import get_is_analyzing
    return {"is_analyzing": get_is_analyzing()}
