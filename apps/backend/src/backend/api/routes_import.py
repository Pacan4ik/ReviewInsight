import csv
import io
import json
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form
from fastapi import BackgroundTasks
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.db_models import ImportBatch, Review, ReviewTheme
from ..models.import_models import ImportRequest
from ..services.analysis import analyze_review
from ..services.analysis_state import set_analysis_state, set_is_analyzing

router = APIRouter(prefix="/api/reviews", tags=["import"])


@router.post("/import")
async def import_csv(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        source: str = Form('csv'),
        batch_id: Optional[str] = Form(None),
        delimiter: str = Form(','),
        encoding: str = Form('utf-8'),
        metadata: Optional[str] = Form(None),
        delete_dublicates: bool = Form(False),
        delete_spam: bool = Form(False),
        normalize_text: bool = Form(False),
        language: Optional[str] = Form(None),
        db: AsyncSession = Depends(get_db_session)
):


    # Собираем модель метаданных из полей формы
    req = ImportRequest(
        source=source,
        batch_id=batch_id,
        filename=None,
        delimiter=delimiter,
        encoding=encoding,
        metadata=json.loads(metadata) if metadata else None,
    )

    try:
        content = await file.read()
    except Exception:
        file.file.seek(0)
        content = file.file.read()

    try:
        decoded = content.decode(encoding or 'utf-8')
    except Exception:
        decoded = content.decode('utf-8', errors='replace')

    set_is_analyzing(True)
    stream = io.StringIO(decoded)
    reader = csv.reader(stream, delimiter=',')
    total_rows = sum(1 for row in reader)
    stream.seek(0)
    reader = csv.reader(stream, delimiter=',')

    new_batch = ImportBatch(source_type=source, source_name=req.filename, meta_info=req.metadata)
    db.add(new_batch)

    await db.commit()
    await db.refresh(new_batch)

    await set_analysis_state(db, is_analyzed=False, result_text=None)
    background_tasks.add_task(process_batch_data, new_batch.id, decoded, delimiter)

    return {"status": "ok", "imported_count": total_rows, "batch_id": new_batch.id or "generated"}


async def process_batch_data(batch_id: int, decoded_text: str, delimiter: str = ','):
    agen = get_db_session()
    session = await agen.__anext__()
    try:
        imported_count = 0
        stream = io.StringIO(decoded_text)
        reader = csv.reader(stream, delimiter=delimiter)

        for row in reader:
            if not row:
                continue
            text = row[0].strip()
            if not text:
                continue

            print(text)
            analysis = await analyze_review(text)
            if isinstance(analysis, str):
                try:
                    parsed = json.loads(analysis)
                except Exception:
                    parsed = {}
            else:
                parsed = analysis or {}


            print(f"Parsed analysis: {parsed}")
            ra = parsed.get("review_analysis", {}) if isinstance(parsed, dict) else {}
            overall = ra.get("overall_sentiment")
            themes = ra.get("key_themes", []) or []

            # сохраняем Review
            review = Review(batch_id=batch_id, raw_text=text, overall_sentiment=overall)
            session.add(review)
            print("Saving review...")
            await session.flush()  # чтобы получить review.id

            # сохраняем темы
            for t in themes:
                theme_name = t.get("theme")
                sentiment = t.get("sentiment")
                theme_obj = ReviewTheme(review_id=review.id, theme=theme_name, sentiment=sentiment)
                session.add(theme_obj)
                print("Saving theme...")
                await session.flush()
            imported_count += 1

        await session.commit()
        return imported_count
    finally:
        set_is_analyzing(False)
        try :
            await agen.close()
        except Exception:
            pass


@router.get("/last_imports")
async def get_last_imports(
        limit: int = 10,
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(
        ImportBatch.__table__.select().order_by(ImportBatch.created_at.desc()).limit(limit)
    )
    batches = result.fetchall()
    return {"batches": [dict(batch) for batch in batches]}