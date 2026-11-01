import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False)
    event_type = Column(String(50), nullable=False, default="wedding")  # wedding, birthday, community, other
    date = Column(String(50), nullable=True)  # YYYY-MM-DD or milestone label
    city = Column(String(100), nullable=False, default="Ahmedabad")
    venue_status = Column(String(50), nullable=False, default="not_booked")  # not_booked, shortlisted, booked
    guest_count = Column(Integer, nullable=False, default=50)
    total_budget = Column(Float, nullable=False, default=50000.0)
    currency = Column(String(10), nullable=False, default="INR")
    language = Column(String(10), nullable=False, default="en")  # en, hi, gu
    theme_preference = Column(String(200), nullable=True)
    dietary_requirements = Column(String(300), nullable=True)
    indoor_outdoor = Column(String(20), nullable=False, default="flexible")  # indoor, outdoor, both, flexible
    additional_notes = Column(Text, nullable=True)

    # Generated plan details
    event_summary = Column(Text, nullable=True)
    theme_concept = Column(Text, nullable=True)
    weather_contingency = Column(Text, nullable=True)
    guest_experience_ideas = Column(Text, nullable=True)  # JSON encoded list
    prep_steps = Column(Text, nullable=True)              # JSON encoded list
    event_day_schedule = Column(Text, nullable=True)      # JSON encoded list
    plan_source = Column(String(30), nullable=False, default="none")  # none, gemini_ai, rules_fallback
    plan_generated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships with CASCADE delete
    budget_items = relationship(
        "BudgetItem",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="BudgetItem.created_at"
    )
    tasks = relationship(
        "Task",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="Task.created_at"
    )
    vendors = relationship(
        "VendorRecord",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="VendorRecord.created_at"
    )
    guests = relationship("Guest", back_populates="event", cascade="all, delete-orphan", order_by="Guest.created_at")
    feedback = relationship("EventFeedback", back_populates="event", cascade="all, delete-orphan", order_by="EventFeedback.created_at")


class EventFeedback(Base):
    __tablename__ = "event_feedback"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    author = Column(String(150), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    event = relationship("Event", back_populates="feedback")

class Guest(Base):
    __tablename__ = "guests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    party_size = Column(Integer, nullable=False, default=1)
    rsvp_status = Column(String(20), nullable=False, default="pending")
    dietary_requirements = Column(String(300), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    event = relationship("Event", back_populates="guests")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # Venue, Catering, Decoration, Photography, etc.
    item_name = Column(String(200), nullable=False)
    estimated_amount = Column(Float, nullable=False, default=0.0)
    actual_amount = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    is_paid = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    event = relationship("Event", back_populates="budget_items")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(String(50), nullable=True)
    milestone_phase = Column(String(50), nullable=False, default="preparation")
    priority = Column(String(20), nullable=False, default="medium")  # high, medium, low
    status = Column(String(20), nullable=False, default="pending")    # pending, in_progress, completed

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    event = relationship("Event", back_populates="tasks")

class VendorRecord(Base):
    __tablename__ = "vendor_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    estimated_quote = Column(Float, nullable=False, default=0.0)
    actual_quote = Column(Float, nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="not_contacted")  # not_contacted, contacted, quoted, booked, rejected
    notes = Column(Text, nullable=True)
    selection_criteria = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    event = relationship("Event", back_populates="vendors")
