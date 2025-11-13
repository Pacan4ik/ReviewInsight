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

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("/generate", response_model=RecommendationsResponse)
def generate_recommendations(payload: RecommendationsRequest):
    if payload.analysis_batch_id not in storage.import_batches and payload.analysis_batch_id != "analysis-latest":
        raise HTTPException(status_code=400, detail="analysis_batch_id not found")

    items = generate_recommendations_stub(payload.priority)
    return RecommendationsResponse(
        status="success",
        recommendations=[RecommendationItem(**item) for item in items],
    )


# --- НОВОЕ: отчёт по отзывам и рекомендации от ИИ ---


@router.get("/feedback-report", response_model=FeedbackReportResponse)
def feedback_report():
    """
    Вызывает LLM-функцию generate_feedback_recommendations
    и возвращает её результат на фронт.
    """

    # TODO: здесь можно подставить реальные данные из анализа/дашборда
    total_reviews = 1247
    topics_dict = {
        "Скорость доставки": 234,
        "Повреждение товара": 198,
        "Неясные описания": 154,
    }

    data = generate_feedback_recommendations(total_reviews, topics_dict)

    # data должен уже быть в формате:
    # {
    #   "feedback_analysis": {...},
    #   "proposal_text": "...."
    # }
    return data
