from __future__ import annotations

from sqlalchemy import (
    BigInteger,
    Column,
    ForeignKey,
    Index,
    String,
    Text,
    TIMESTAMP,
    CheckConstraint,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(BigInteger, primary_key=True)
    source_type = Column(Text, nullable=False)
    source_name = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
    meta_info = Column(JSONB, nullable=True)

    __table_args__ = (
        CheckConstraint("source_type IN ('csv','excel','api')", name="ck_import_batches_source_type"),
    )

    reviews = relationship("Review", back_populates="batch", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(BigInteger, primary_key=True)
    batch_id = Column(BigInteger, ForeignKey("import_batches.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=False)
    language_code = Column(String(10), nullable=True)
    overall_sentiment = Column(Text, nullable=True)
    review_created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        CheckConstraint("overall_sentiment IN ('отрицательная','нейтральная','позитивная')", name="ck_reviews_overall_sentiment"),
    )

    batch = relationship("ImportBatch", back_populates="reviews")
    themes = relationship("ReviewTheme", back_populates="review", cascade="all, delete-orphan")


# индексы
Index("idx_reviews_batch", Review.batch_id)
Index("idx_reviews_sentiment", Review.overall_sentiment)
Index("idx_reviews_created_at", Review.review_created_at)


class ReviewTheme(Base):
    __tablename__ = "review_themes"

    id = Column(BigInteger, primary_key=True)
    review_id = Column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    theme = Column(Text, nullable=False)
    sentiment = Column(Text, nullable=False)

    # Примечание: в исходной схеме был UNIQUE (analysis_id, theme), но столбец analysis_id не определён.
    # Логично предположить, что уникальность должна быть гарантирована по (review_id, theme).
    __table_args__ = (
        CheckConstraint("sentiment IN ('отрицательная','нейтральная','позитивная')", name="ck_review_themes_sentiment"),
        UniqueConstraint("review_id", "theme", name="uq_review_themes_review_theme"),
    )

    review = relationship("Review", back_populates="themes")


# индексы
Index("idx_review_themes_theme", ReviewTheme.theme)
Index("idx_review_themes_sentiment", ReviewTheme.sentiment)


__all__ = ["Base", "ImportBatch", "Review", "ReviewTheme"]

