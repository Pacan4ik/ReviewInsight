from datetime import datetime
from typing import List, Dict

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

class ThemeCount(BaseModel):
    topic: str
    count: int


class DayCount(BaseModel):
    date: str
    count: int

async def get_total_reviews(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> int:
    res_total = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt
            FROM reviews r
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            """
        ),
        {"start": start_ts, "end": end_excl},
    )
    return int(res_total.scalar() or 0)


async def get_sentiment_distribution(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> Dict[str, int]:
    res_dist = await db.execute(
        text(
            """
            SELECT r.overall_sentiment AS s, COUNT(*) AS cnt
            FROM reviews r
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY r.overall_sentiment
            """
        ),
        {"start": start_ts, "end": end_excl},
    )
    dist_rows = res_dist.fetchall()
    sentiment_distribution: Dict[str, int] = {
        "положительная": 0,
        "нейтральная": 0,
        "отрицательная": 0,
    }
    for s, cnt in dist_rows:
        if s in sentiment_distribution:
            sentiment_distribution[s] = int(cnt or 0)
    return sentiment_distribution


async def get_avg_sentiment_score(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> float:
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
        {"start": start_ts, "end": end_excl},
    )
    return float(res_avg.scalar() or 0.0)


async def get_total_themes(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> int:
    res_total_themes = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            """
        ),
        {"start": start_ts, "end": end_excl},
    )
    return int(res_total_themes.scalar() or 0)


async def get_non_positive_themes(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> int: #TODO LIMIT?
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
        {"start": start_ts, "end": end_excl},
    )
    return int(res_non_pos_themes.scalar() or 0)


async def get_top_themes(
    db: AsyncSession,
    start_ts: datetime,
    end_excl: datetime,
    sentiment: str,
    limit: int = 5,
) -> List[ThemeCount]:
    res = await db.execute(
        text(
            """
            SELECT rt.theme, COUNT(*) AS cnt
            FROM review_themes rt
            JOIN reviews r ON r.id = rt.review_id
            WHERE rt.sentiment = :sentiment
              AND r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY rt.theme
            ORDER BY cnt DESC, rt.theme
            LIMIT :limit
            """
        ),
        {"start": start_ts, "end": end_excl, "sentiment": sentiment, "limit": limit},
    )
    rows = res.fetchall()
    return [ThemeCount(topic=row[0], count=int(row[1])) for row in rows]


async def get_daily_counts_by_sentiment(
    db: AsyncSession,
    start_ts: datetime,
    end_excl: datetime,
    sentiment: str,
) -> List[DayCount]:
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


async def get_all_daily_counts(
    db: AsyncSession,
    start_ts: datetime,
    end_excl: datetime,
) -> Dict[str, List[DayCount]]:
    return {
        "положительная": await get_daily_counts_by_sentiment(db, start_ts, end_excl, "положительная"),
        "нейтральная": await get_daily_counts_by_sentiment(db, start_ts, end_excl, "нейтральная"),
        "отрицательная": await get_daily_counts_by_sentiment(db, start_ts, end_excl, "отрицательная"),
    }


async def get_count_reviews(db: AsyncSession, start_ts: datetime, end_excl: datetime) -> tuple[int, int, int]:
    res = await db.execute(
        text(
            """
            SELECT r.overall_sentiment AS s, COUNT(*) AS cnt
            FROM reviews r
            WHERE r.review_created_at >= :start AND r.review_created_at < :end
            GROUP BY r.overall_sentiment
            """
        ),
        {"start": start_ts, "end": end_excl},
    )
    rows = res.fetchall()
    counts = {"положительная": 0, "отрицательная": 0, "нейтральная": 0}
    for s, cnt in rows:
        if s in counts:
            counts[s] = int(cnt or 0)
    return (counts["положительная"], counts["отрицательная"], counts["нейтральная"])