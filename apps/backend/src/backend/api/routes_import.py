from fastapi import APIRouter, HTTPException
from ..models.import_models import ImportRequest, ImportResponse
from ..services.storage import storage

router = APIRouter(prefix="/api/reviews", tags=["import"])


@router.post("/import", response_model=ImportResponse)
def import_reviews(payload: ImportRequest):
    # Заглушка: проверка URL, "симуляция" импорта
    if not payload.data_url.scheme.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid data_url scheme")

    batch_id = payload.batch_id or "stub-batch-001"
    # Сгенерируем фиктивные ID
    imported_ids = list(range(1000, 1000 + 5))  # 5 штук для примера
    storage.import_batches[batch_id] = imported_ids
    for rid in imported_ids:
        storage.reviews[rid] = f"Stub review text for id {rid}"

    return ImportResponse(status="success", imported_count=len(imported_ids), batch_id=batch_id)