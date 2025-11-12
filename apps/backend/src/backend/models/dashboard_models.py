from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_reviews: int
    sentiment_distribution: dict[str, int]
    top_issues: list[dict[str, int]]