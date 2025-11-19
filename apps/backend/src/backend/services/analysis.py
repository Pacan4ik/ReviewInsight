import asyncio
from typing import List, Dict
import random
import requests
import json

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

def _analyze_review_sync(review_text: str) -> dict:
    """
    Отправляет отзыв на анализ и возвращает JSON-объект результата.
    """
    url = "http://ollama:11434/api/generate"

    payload = {
        "model": "deepseek-r1:8b",
        "prompt": review_text,
        "context": [],
        "stream": False,
        "format": "json",
        "system": (
            "Ты - профессиональный аналитик отзывов со стажем 10 лет. "
            "Тебе будет отправлен текст отзыва. Вот твои задачи: "
            "- выделить ключевые темы отзыва "
            "- определить тональность отзыва (нейтральная, положительная, отрицательная) "
            "- для каждой темы отзыва определить тональность темы (нейтральная, положительная, отрицательная). "
            "Отвечай только корректным JSON. Без текста до или после. Без комментариев."
            "Вот пример ответа для отзыва: \"Доставка была быстрой, но качество товара оставляет желать лучшего. Упаковка хорошая.\" "
            "{\"review_analysis\":{\"overall_sentiment\":\"нейтральная\",\"key_themes\":[{\"theme\":\"доставка\",\"sentiment\":\"положительная\"},{\"theme\":\"качество товара\",\"sentiment\":\"отрицательная\"},{\"theme\":\"упаковка\",\"sentiment\":\"положительная\"}]}} "
            "При выборе тем используй ТОЛЬКО следующие формулировки. "
            "Должно использоваться что-то СТРОГО из этих критериев: "
            "(Качество товара, функциональность, дизайн, материалы, сборка, соответствие описанию, комплектация, размеры, простота использования, "
            "работа персонала, квалификация сотрудников, вежливость, скорость обслуживания, готовность помочь, скорость доставки, стоимость доставки, "
            "аккуратность доставки, работа курьера, сроки доставки, соотношение цена-качество, цены, скидки, общая стоимость, упаковка, гарантия, "
            "возврат, удобство сайта, функциональность сайта, скорость сайта, дизайн интерфейса, работа call-центра, онлайн-консультант, ответы на вопросы, "
            "время ответа, общая удовлетворенность, рекомендация другим, повторная покупка, соответствие ожиданиям)"
        )
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()

        print(data)

        # Извлекаем и очищаем JSON из "response"
        raw_json_str = data.get("response", "").strip()
        cleaned_json = json.loads(raw_json_str)

        return cleaned_json

    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
    except json.JSONDecodeError:
        print("❌ Не удалось распарсить JSON из поля 'response'.")

    return {}

def _generate_feedback_recommendations_sync(total_reviews: int, topics_dict: dict) -> dict:
    """
    Отправляет статистику негативных аспектов в LLM и получает рекомендации.
    Возвращает JSON-ответ (словарь).
    """
    url = "http://ollama:11434/api/generate"

    # Формируем текст для prompt
    # Пример: "Количество отзывов 1247, темы с количеством упоминаний в скобках: Скорость доставки (234 упоминания) ..."
    topics_str = " ".join(
        [f"{topic} ({count} упоминания)" for topic, count in topics_dict.items()]
    )
    prompt_text = f"Количество отзывов {total_reviews}, темы с количеством упоминаний в скобках: {topics_str}"

    print(prompt_text)

    payload = {
        "model": "deepseek-r1:8b",
        "prompt": prompt_text,
        "context": [],
        "stream": False,
        "format": "json",
        "system": (
            "Ты - профессиональный аналитик отзывов со стажем 10 лет. "
            "Тебе будут отправлены следующие данные: общее количество отзывов, "
            "негативные аспекты с количеством их упоминания в отзывах. "
            "Тебе нужно выдать рекомендации на русском языке на основе этой информации в следующем формате"
            "(приоритет - высокий, средний, низкий, текст предложения по улучшению, предложить шаги по улучшению через точку с запятой), разбирать нужно ВСЕ темы, названия полей строго по шаблону: "
            "Отвечай только корректным JSON. Без текста до или после. Без комментариев. Далее будет пример ответа. Проблем может быть НЕСКОЛЬКО, ни одна, не двае, будь внимательнее. Пример ответа: "
            "{"
              "\"feedback_analysis\": ["
                "{"
                  "\"prio\": \"уровень приоритета 1\","
                  "\"problem\": \"самый негативный аспект 1\","
                  "\"proposal_text\": \"текст предложения по улучшению 1\""
                "},"
                "{"
                  "\"prio\": \"уровень приоритета 2\","
                  "\"problem\": \"самый негативный аспект 2\","
                  "\"proposal_text\": \"текст предложения по улучшению 2\""
                "}"
              "],"
              "\"proposal_text\": \"текст предложений по улучшению через точку с запятой (без номеров пунктов, н-р, сделайте это; сделайте то;\""
            "}"
        )
    }
    #TODO change name of second proposal_text. E.g. overall_proposal_text (related to all topics)
    headers = {"Content-Type": "application/json"}

    print(payload)

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()

        print(data)

        # Извлекаем JSON из поля "response"
        raw_json_str = data.get("response", "").strip()
        cleaned_json = json.loads(raw_json_str)

        return cleaned_json

    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
    except json.JSONDecodeError:
        print("❌ Не удалось распарсить JSON из поля 'response'.")

    return {}


async def analyze_review(review_text: str) -> dict:
    """
    Асинхронная обёртка над синхронным LLM-вызовом.
    Сама функция не блокирует event loop.
    """
    return await asyncio.to_thread(_analyze_review_sync, review_text)


async def generate_feedback_recommendations(total_reviews: int, topics_dict: dict) -> dict:
    """
    Асинхронная обёртка над синхронным LLM-вызовом.
    """
    return await asyncio.to_thread(
        _generate_feedback_recommendations_sync,
        total_reviews,
        topics_dict,
    )