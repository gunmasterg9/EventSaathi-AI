from datetime import datetime
from typing import Literal
from pydantic import ConfigDict, Field
from .common import InputModel, PatchModel

RsvpStatus = Literal["pending", "confirmed", "declined"]


class GuestCreate(InputModel):
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    party_size: int = Field(default=1, ge=1, le=1000)
    rsvp_status: RsvpStatus = "pending"
    dietary_requirements: str | None = Field(default=None, max_length=300)
    notes: str | None = Field(default=None, max_length=2000)


class GuestUpdate(PatchModel):
    required_fields = {"name", "party_size", "rsvp_status"}
    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    party_size: int | None = Field(default=None, ge=1, le=1000)
    rsvp_status: RsvpStatus | None = None
    dietary_requirements: str | None = Field(default=None, max_length=300)
    notes: str | None = Field(default=None, max_length=2000)


class GuestResponse(GuestCreate):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class GuestSummary(InputModel):
    guests: list[GuestResponse]
    invited_people: int
    confirmed_people: int
    pending_people: int
    declined_people: int
    planned_capacity: int
