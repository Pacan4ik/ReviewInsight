from pydantic import BaseModel


class RecommendationsRequest(BaseModel):
    analysis_batch_id: str
    priority: str | None = None


class RecommendationItem(BaseModel):
    id: int
    text: str
    priority: str


class RecommendationsResponse(BaseModel):
    status: str
    recommendations: list[RecommendationItem]