from pydantic import BaseModel, HttpUrl


class ImportRequest(BaseModel):
    source: str
    data_url: HttpUrl
    batch_id: str | None = None


class ImportResponse(BaseModel):
    status: str
    imported_count: int
    batch_id: str