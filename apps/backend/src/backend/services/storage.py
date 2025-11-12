"""
IN MEMORY
TODO: заменить на нормальное хранилище
"""

from typing import Dict, List


class Storage:
    def __init__(self) -> None:
        # review_id -> текст отзыва
        self.reviews: Dict[int, str] = {}
        # batch_id -> list(review_ids)
        self.import_batches: Dict[str, List[int]] = {}
        # analysis_batch_id -> результаты анализа
        self.analysis_results: Dict[str, List[dict]] = {}


storage = Storage()