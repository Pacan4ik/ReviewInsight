from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    review_ids: list[int]
    language: str = "auto"


class SingleReviewAnalysis(BaseModel):
    review_id: int
    sentiment: str
    topics: list[str]


class AnalyzeResponse(BaseModel):
    status: str
    analysis: list[SingleReviewAnalysis]