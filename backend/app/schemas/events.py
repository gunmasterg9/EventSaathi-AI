from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from .common import InputModel, PatchModel

class EventBase(InputModel):
    name: str = Field(..., min_length=2, max_length=200, description="Name of the celebration or event")
    event_type: Literal["wedding", "birthday", "community", "other"] = "wedding"
    date: Optional[str] = Field(default=None, description="Event date or relative timeframe")
    city: str = Field(default="Ahmedabad", min_length=1, max_length=100, description="City / Location")
    venue_status: Literal["not_booked", "shortlisted", "booked"] = "not_booked"
    guest_count: int = Field(default=50, ge=1, le=100000, description="Expected guest count")
    total_budget: float = Field(default=50000.0, ge=0.0, description="Total budget in selected currency")
    currency: str = Field(default="INR", max_length=10, description="Currency code (e.g. INR)")
    language: Literal["en", "hi", "gu"] = "en"
    theme_preference: Optional[str] = Field(default=None, max_length=200, description="Theme or aesthetic style")
    dietary_requirements: Optional[str] = Field(default=None, max_length=300, description="Dietary and accessibility details")
    indoor_outdoor: Literal["indoor", "outdoor", "both", "flexible"] = "flexible"
    additional_notes: Optional[str] = Field(default=None, max_length=2000, description="Additional context or traditions")

class EventCreate(EventBase):
    pass

class EventUpdate(PatchModel):
    required_fields = {"name", "event_type", "city", "venue_status", "guest_count", "total_budget", "currency", "language", "indoor_outdoor"}
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    event_type: Optional[Literal["wedding", "birthday", "community", "other"]] = None
    date: Optional[str] = None
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    venue_status: Optional[Literal["not_booked", "shortlisted", "booked"]] = None
    guest_count: Optional[int] = Field(None, ge=1, le=100000)
    total_budget: Optional[float] = Field(None, ge=0.0)
    currency: Optional[str] = Field(None, min_length=1, max_length=10)
    language: Optional[Literal["en", "hi", "gu"]] = None
    theme_preference: Optional[str] = Field(None, max_length=200)
    dietary_requirements: Optional[str] = Field(None, max_length=300)
    indoor_outdoor: Optional[Literal["indoor", "outdoor", "both", "flexible"]] = None
    additional_notes: Optional[str] = Field(None, max_length=2000)

class EventListItem(BaseModel):
    id: str
    name: str
    event_type: str
    date: Optional[str]
    city: str
    guest_count: int
    total_budget: float
    currency: str
    language: str
    plan_source: str
    total_tasks: int = 0
    completed_tasks: int = 0
    task_completion_percentage: float = 0.0
    budget_total_estimated: float = 0.0
    budget_total_actual: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EventResponse(EventBase):
    id: str
    event_summary: Optional[str] = None
    theme_concept: Optional[str] = None
    weather_contingency: Optional[str] = None
    guest_experience_ideas: List[str] = []
    prep_steps: List[str] = []
    event_day_schedule: List[dict] = []
    plan_source: str = "none"
    plan_generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Computed statistics
    total_tasks: int = 0
    completed_tasks: int = 0
    task_completion_percentage: float = 0.0
    budget_total_estimated: float = 0.0
    budget_total_actual: float = 0.0
    budget_remaining: float = 0.0
    is_over_budget: bool = False

    model_config = ConfigDict(from_attributes=True)
