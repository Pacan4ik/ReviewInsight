from typing import List, Dict
import random

def fake_sentiment() -> str:
    return random.choice(["positive", "neutral", "negative"])

def fake_topics() -> List[str]:
    corpus = [["качество", "доставка"], ["цена", "поддержка"], ["скорость"], ["интерфейс", "ошибки"]]
    return random.choice(corpus)

def analyze_reviews_stub(review_ids: List[int]) -> List[Dict]:
    result = []
    for rid in review_ids:
        result.append(
            {
                "review_id": rid,
                "sentiment": fake_sentiment(),
                "topics": fake_topics(),
            }
        )
    return result
