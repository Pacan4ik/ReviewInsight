import csv
import io
import json
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form

from ..models.import_models import ImportRequest

router = APIRouter(prefix="/api/reviews", tags=["import"])


@router.post("/import")
async def import_csv(
    file: UploadFile = File(...),
    source: str = Form('csv'),
    batch_id: Optional[str] = Form(None),
    delimiter: str = Form(','),
    encoding: str = Form('utf-8'),
    metadata: Optional[str] = Form(None),
):
    # Собираем модель метаданных из полей формы
    req = ImportRequest(
        source=source,
        batch_id=batch_id,
        filename=file.filename,
        delimiter=delimiter,
        encoding=encoding,
        metadata=json.loads(metadata) if metadata else None,
    )

    content = await file.read()  # bytes с содержимым CSV

    try:
        decoded = content.decode(encoding or 'utf-8')
    except Exception:
        # fallback
        decoded = content.decode('utf-8', errors='replace')

    stream = io.StringIO(decoded)
    reader = csv.reader(stream, delimiter=',')

    imported_count = 0
    for row in reader:
        if not row:
            continue
        text = row[0].strip()
        if not text:
            continue
        # Вызов заглушки для каждого текста
        # TODO process_review_text(text)
        imported_count += 1
    # Здесь — логика парсинга CSV и создания batch в БД

    return {"status": "ok", "imported_count": 0, "batch_id": req.batch_id or "generated"}