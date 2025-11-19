from fastapi import APIRouter, HTTPException
from ..models.recommendations_models import (
    RecommendationsRequest,
    RecommendationsResponse,
    RecommendationItem,
    FeedbackReportResponse,      # <--- НОВОЕ
)
from ..services.recommendations import generate_recommendations_stub
from ..services.storage import storage
from ..services.analysis import generate_feedback_recommendations  # <--- НОВОЕ
from typing import Any
router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/feedback-report", response_model=FeedbackReportResponse)
def feedback_report():
    total_reviews = 1247
    topics_dict = {
        "Скорость доставки": 234,
        "Повреждение товара": 198,
        "Неясные описания": 154,
    }

    data: dict[str, Any] = generate_feedback_recommendations(total_reviews, topics_dict)

    # Приводим feedback_analysis к списку
    fa = data.get("feedback_analysis")

    if isinstance(fa, dict):
        # если пришёл один объект — оборачиваем в список
        data["feedback_analysis"] = [fa]
    elif fa is None:
        # если ничего нет — делаем пустой список
        data["feedback_analysis"] = []
    # если это уже список — ничего не трогаем

    return data
