from datetime import datetime, timedelta
from typing import List, Dict

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ..core.db import get_db_session

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class ThemeCount(BaseModel):
    topic: str
    count: int


class DayCount(BaseModel):
    date: str
    count: int


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

    params = {"start": start_ts, "end": end_excl}

    # 1) Общее количество отзывов
    res_total = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt
            FROM reviews r
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            """
        ),
        params,
    )
    total_reviews = int(res_total.scalar() or 0)

    # 2) Распределение по сентименту
    res_dist = await db.execute(
        text(
            """
            SELECT r.overall_sentiment AS s, COUNT(*) AS cnt
            FROM reviews r
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY r.overall_sentiment
            """
        ),
        params,
    )
    dist_rows = res_dist.fetchall()
    sentiment_distribution = {"положительная": 0, "нейтральная": 0, "отрицательная": 0}
    for s, cnt in dist_rows:
        if s in sentiment_distribution:
            sentiment_distribution[s] = int(cnt or 0)

    # 3) Средняя оценка по шкале 5/3/1
    res_avg = await db.execute(
        text(
            """
            SELECT AVG(score)::float AS avg_score
            FROM (
                SELECT CASE r.overall_sentiment
                    WHEN 'положительная' THEN 5
                    WHEN 'нейтральная' THEN 3
                    WHEN 'отрицательная' THEN 1
                END AS score
                FROM reviews r
                WHERE r.review_created_at >= :start AND r.review_created_at < :end
            ) x
            """
        ),
        params,
    )
    avg_sentiment_score = float(res_avg.scalar() or 0.0)

    # 4) Всего количество тем (по связке review_themes + reviews с датами)
    res_total_themes = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            """
        ),
        params,
    )
    total_themes = int(res_total_themes.scalar() or 0)

    # 5) Количество тем нейтральная/отрицательная
    res_non_pos_themes = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE rt.sentiment IN ('нейтральная','отрицательная')
              AND r.review_created_at >= :start AND r.review_created_at < :end
            """
        ),
        params,
    )
    non_positive_themes = int(res_non_pos_themes.scalar() or 0)

    # 6) Топ-5 негативных тем
    res_top_neg = await db.execute(
        text(
            """
            SELECT rt.theme, COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE rt.sentiment = 'отрицательная'
              AND r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY rt.theme
            ORDER BY cnt DESC, rt.theme
            LIMIT 5
            """
        ),
        params,
    )
    top_negative_themes = [{"topic": row[0], "count": int(row[1])} for row in res_top_neg.fetchall()]

    # 7) Топ-5 позитивных тем
    res_top_pos = await db.execute(
        text(
            """
            SELECT rt.theme, COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE rt.sentiment = 'положительная'
              AND r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY rt.theme
            ORDER BY cnt DESC, rt.theme
            LIMIT 5
            """
        ),
        params,
    )
    top_positive_themes = [{"topic": row[0], "count": int(row[1])} for row in res_top_pos.fetchall()]

    # 8) Дневные ряды для каждой тональности
    async def load_daily_counts(sentiment: str) -> List[DayCount]:
        res_daily = await db.execute(
            text(
                """
                SELECT (date_trunc('day', r.review_created_at))::date AS day, COUNT(*) AS cnt
                FROM reviews r
                WHERE r.overall_sentiment = :sentiment
                  AND r.review_created_at >= :start AND r.review_created_at < :end
                GROUP BY day
                ORDER BY day
                """
            ),
            {"start": start_ts, "end": end_excl, "sentiment": sentiment},
        )
        return [DayCount(date=str(row[0]), count=int(row[1])) for row in res_daily.fetchall()]

    daily_counts: Dict[str, List[DayCount]] = {
        "положительная": await load_daily_counts("положительная"),
        "нейтральная": await load_daily_counts("нейтральная"),
        "отрицательная": await load_daily_counts("отрицательная"),
    }

    return DashboardSummaryResponse(
        total_reviews=total_reviews,
        sentiment_distribution=sentiment_distribution,
        avg_sentiment_score=avg_sentiment_score,
        total_themes=total_themes,
        non_positive_themes=non_positive_themes,
        top_negative_themes=[ThemeCount(**t) for t in top_negative_themes],
        top_positive_themes=[ThemeCount(**t) for t in top_positive_themes],
        daily_counts=daily_counts,
    )

