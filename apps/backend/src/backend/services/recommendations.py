from typing import List, Dict

def generate_recommendations_stub(priority: str | None) -> List[Dict]:
    base = [
        {"text": "Улучшить поддержку клиентов по электронной почте", "priority": "high"},
        {"text": "Снизить стоимость доставки для мелких заказов", "priority": "medium"},
        {"text": "Расширить FAQ раздел", "priority": "low"},
    ]
    if priority:
        # Фильтрация по приоритету, fallback если нет
        filtered = [item for item in base if item["priority"] == priority] or base
        return [{"id": i + 1, **item} for i, item in enumerate(filtered)]
    return [{"id": i + 1, **item} for i, item in enumerate(base)]