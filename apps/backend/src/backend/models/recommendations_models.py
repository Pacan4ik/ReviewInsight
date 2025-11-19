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



class FeedbackAnalysis(BaseModel):
    prio: str
    problem: str
    proposal_text: str


class FeedbackReportResponse(BaseModel):
    feedback_analysis: list[FeedbackAnalysis]   # ✅ теперь это список
    proposal_text: str
