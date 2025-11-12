from fastapi import APIRouter, HTTPException
from ..models.recommendations_models import (
    RecommendationsRequest,
    RecommendationsResponse,
    RecommendationItem,
)
from ..services.recommendations import generate_recommendations_stub
from ..services.storage import storage

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("/generate", response_model=RecommendationsResponse)
def generate_recommendations(payload: RecommendationsRequest):
    # Check batch key in storage
    # TODO: batch_id -> analysis_results
    if payload.analysis_batch_id not in storage.import_batches and payload.analysis_batch_id != "analysis-latest":
        raise HTTPException(status_code=400, detail="analysis_batch_id not found")

    items = generate_recommendations_stub(payload.priority)
    return RecommendationsResponse(
        status="success",
        recommendations=[RecommendationItem(**item) for item in items],
    )