from typing import Literal, Optional, Dict, Any

from pydantic import BaseModel, HttpUrl


class ImportRequest(BaseModel):
    source: Literal['csv', 'excel', 'api'] = 'csv'
    data_url: Optional[HttpUrl] = None
    batch_id: Optional[str] = None
    filename: Optional[str] = None
    delimiter: Optional[str] = ','
    encoding: Optional[str] = 'utf-8'
    metadata: Optional[Dict[str, Any]] = None


class ImportResponse(BaseModel):
    status: str
    imported_count: int
    batch_id: str





