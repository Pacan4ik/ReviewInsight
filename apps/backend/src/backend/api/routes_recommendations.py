import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any
from typing import Optional

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.recommendations_models import (
    FeedbackReportResponse,
)
from ..services.analysis import generate_feedback_recommendations
from ..services.dashboard_metrics import (
    get_total_reviews, get_top_themes, get_avg_sentiment_score,
)

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/feedback-report", response_model=FeedbackReportResponse)
async def feedback_report(
        starttime: Optional[int] = Query(None, description="Unix timestamp (seconds) для начала периода"),
        endtime: Optional[int] = Query(None, description="Unix timestamp (seconds) для конца периода"),
        db: AsyncSession = Depends(get_db_session)
):
    now = datetime.now(timezone.utc)
    # По умолчанию: последние 30 дней
    default_start = now - timedelta(days=30)
    default_end = now

    start_dt = datetime.fromtimestamp(starttime, tz=timezone.utc) if starttime is not None else default_start
    end_dt = datetime.fromtimestamp(endtime, tz=timezone.utc) if endtime is not None else default_end

    total_reviews = await get_total_reviews(db, start_dt, end_dt)

    if total_reviews == 0:
        # Возвращаем пустую структуру, соответствующую схеме
        return {
            "feedback_analysis": [],
            "proposal_text": "",
        }

    top_negative = await get_top_themes(db, start_dt, end_dt, sentiment="отрицательная")

    topics_dict = {tc.topic: tc.count for tc in top_negative}

    data: dict[str, Any] = await asyncio.to_thread(generate_feedback_recommendations, total_reviews, topics_dict)

    # Приводим feedback_analysis к списку
    fa = data.get("feedback_analysis")

    if isinstance(fa, dict):
        # если пришёл один объект — оборачиваем в список
        data["feedback_analysis"] = [fa]
    elif fa is None:
        # если ничего нет — делаем пустой список
        data["feedback_analysis"] = []

    # Гарантируем поле proposal_text
    if "proposal_text" not in data:
        data["proposal_text"] = ""

    return data

@router.get("/brief")
async def brief_recommendations(
        starttime: Optional[int] = Query(None, description="Unix timestamp (seconds) для начала периода"),
        endtime: Optional[int] = Query(None, description="Unix timestamp (seconds) для конца периода"),
        db: AsyncSession = Depends(get_db_session)
):
    now = datetime.now(timezone.utc)
    # По умолчанию: последние 30 дней
    default_start = now - timedelta(days=30)
    default_end = now

    start_dt = datetime.fromtimestamp(starttime, tz=timezone.utc) if starttime is not None else default_start
    end_dt = datetime.fromtimestamp(endtime, tz=timezone.utc) if endtime is not None else default_end

    total_reviews = await get_total_reviews(db, start_dt, end_dt)

    if total_reviews == 0:
        return {
            "total_reviews": 0,
            "avg_sentiment_score": 0.0,
            "top_negative_themes": [],
            "top_positive_themes": [],
        }

    top_negative = await get_top_themes(db, start_dt, end_dt, sentiment="отрицательная", limit=3)
    top_positive = await get_top_themes(db, start_dt, end_dt, sentiment="положительная", limit=3)
    avg_sentiment_score = await get_avg_sentiment_score(db, start_dt, end_dt)

    top_negative_list = [{"topic": tc.topic, "count": tc.count} for tc in top_negative]
    top_positive_list = [{"topic": tc.topic, "count": tc.count} for tc in top_positive]

    return {
        "total_reviews": total_reviews,
        "avg_sentiment_score": avg_sentiment_score,
        "top_negative_themes": top_negative_list,
        "top_positive_themes": top_positive_list,
    }
