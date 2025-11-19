from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.db_models import AnalysisState


is_analyzing = False  # Глобальный флаг, указывающий, выполняется ли в данный момент анализ

get_is_analyzing = lambda: is_analyzing
set_is_analyzing = lambda val: globals().update(is_analyzing=val)


async def get_analysis_state(db: AsyncSession) -> Optional[AnalysisState]:
    """Вернуть единственную запись AnalysisState (id=1) либо None.

    Контракт:
    - Вход: AsyncSession (уже открытая сессия)
    - Выход: экземпляр AnalysisState или None, если запись отсутствует
    - Ошибки пробрасываются наружу
    """
    # проще и атомарно получить объект через db.get
    state = await db.get(AnalysisState, 1)
    return state


async def set_analysis_state(db: AsyncSession, is_analyzed: bool, result_text: Optional[str]) -> AnalysisState:
    """Создать или обновить запись AnalysisState (id=1) и вернуть её.

    Если запись не существует — создаёт новую с id=1.
    Функция коммитит транзакцию в базе (await db.commit()).

    Контракт:
    - Вход: AsyncSession
    - Выход: обновлённый/созданный AnalysisState
    - Ошибки: при исключении функция откатит транзакцию и пробросит ошибку дальше
    """
    try:
        instance = await db.get(AnalysisState, 1)
        if instance is None:
            instance = AnalysisState(id=1, is_analyzed=is_analyzed, result_text=result_text)
            db.add(instance)
        else:
            instance.is_analyzed = is_analyzed
            instance.result_text = result_text

        await db.commit()
        # refresh to get DB defaults if any
        await db.refresh(instance)
        return instance
    except Exception:
        await db.rollback()
        raise
