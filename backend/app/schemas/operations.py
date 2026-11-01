from datetime import datetime
from typing import Literal
from pydantic import ConfigDict, Field
from .common import InputModel

BundleId = Literal["hospitality", "travel", "registration", "hybrid", "coordination"]


class BundleRequest(InputModel):
    bundle: BundleId


class FeedbackInput(InputModel):
    author: str = Field(min_length=1, max_length=150)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)


class FeedbackResponse(FeedbackInput):
    id: str
    event_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FeedbackSummary(InputModel):
    entries: list[FeedbackResponse]
    total: int
    average_rating: float | None
