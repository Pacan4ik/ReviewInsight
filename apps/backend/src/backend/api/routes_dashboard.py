from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from ..models.dashboard_models import DashboardSummaryResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def dashboard_summary(
    start_date: str = Query(...),
    end_date: str = Query(...),
    product_id: int = Query(...),
):
    # Date validation
    try:
        sd = datetime.strptime(start_date, "%Y-%m-%d")
        ed = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (expected YYYY-MM-DD)")
    if ed < sd:
        raise HTTPException(status_code=400, detail="end_date < start_date")

    # Data stub
    return DashboardSummaryResponse(
        total_reviews=540,
        sentiment_distribution={"positive": 320, "neutral": 120, "negative": 100},
        top_issues=[
            {"topic": "доставка", "count": 45},
            {"topic": "цена", "count": 30},
        ],
    )