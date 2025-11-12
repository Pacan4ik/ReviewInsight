from fastapi import APIRouter, HTTPException
from ..models.analyze_models import AnalyzeRequest, AnalyzeResponse, SingleReviewAnalysis
from ..services.storage import storage
from ..services.analysis import analyze_reviews_stub

router = APIRouter(prefix="/api/reviews", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_reviews(payload: AnalyzeRequest):
    if not payload.review_ids:
        raise HTTPException(status_code=400, detail="review_ids is empty")

    # Check id in storage
    missing = [rid for rid in payload.review_ids if rid not in storage.reviews]
    if missing:
        raise HTTPException(status_code=404, detail=f"Reviews not found: {missing}")

    stub = analyze_reviews_stub(payload.review_ids)

    batch_key = "analysis-latest"
    storage.analysis_results[batch_key] = stub

    return AnalyzeResponse(
        status="success",
        analysis=[SingleReviewAnalysis(**item) for item in stub],
    )