import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.models import Event, BudgetItem, Task, VendorRecord
from backend.app.schemas.events import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListItem,
)
from backend.app.services.ai_service import ai_planner
from backend.app.schemas.budget import BudgetItemResponse
from backend.app.schemas.tasks import TaskResponse
from backend.app.schemas.vendors import VendorResponse
from backend.app.schemas.guests import GuestResponse
from backend.app.schemas.operations import FeedbackResponse

router = APIRouter(prefix="/api/events", tags=["Events"])

def compute_event_stats(event: Event) -> dict:
    total_tasks = len(event.tasks)
    completed_tasks = sum(1 for t in event.tasks if t.status == "completed")
    completion_pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    total_est = round(sum(item.estimated_amount or 0.0 for item in event.budget_items), 2)
    total_act = round(sum(item.actual_amount or 0.0 for item in event.budget_items), 2)
    budget_remaining = round(float(event.total_budget) - total_act, 2)
    is_over = budget_remaining < 0

    ideas = []
    if event.guest_experience_ideas:
        try:
            ideas = json.loads(event.guest_experience_ideas)
        except Exception:
            ideas = []

    prep = []
    if event.prep_steps:
        try:
            prep = json.loads(event.prep_steps)
        except Exception:
            prep = []

    schedule = []
    if event.event_day_schedule:
        try:
            schedule = json.loads(event.event_day_schedule)
        except Exception:
            schedule = []

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "task_completion_percentage": completion_pct,
        "budget_total_estimated": total_est,
        "budget_total_actual": total_act,
        "budget_remaining": budget_remaining,
        "is_over_budget": is_over,
        "guest_experience_ideas": ideas,
        "prep_steps": prep,
        "event_day_schedule": schedule,
    }

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    """
    Create a new event with input validation.
    """
    event = Event(
        name=event_in.name,
        event_type=event_in.event_type,
        date=event_in.date,
        city=event_in.city,
        venue_status=event_in.venue_status,
        guest_count=event_in.guest_count,
        total_budget=round(float(event_in.total_budget), 2),
        currency=event_in.currency or "INR",
        language=event_in.language or "en",
        theme_preference=event_in.theme_preference,
        dietary_requirements=event_in.dietary_requirements,
        indoor_outdoor=event_in.indoor_outdoor or "flexible",
        additional_notes=event_in.additional_notes,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    stats = compute_event_stats(event)
    return EventResponse(
        id=event.id,
        name=event.name,
        event_type=event.event_type,
        date=event.date,
        city=event.city,
        venue_status=event.venue_status,
        guest_count=event.guest_count,
        total_budget=event.total_budget,
        currency=event.currency,
        language=event.language,
        theme_preference=event.theme_preference,
        dietary_requirements=event.dietary_requirements,
        indoor_outdoor=event.indoor_outdoor,
        additional_notes=event.additional_notes,
        event_summary=event.event_summary,
        theme_concept=event.theme_concept,
        weather_contingency=event.weather_contingency,
        plan_source=event.plan_source,
        plan_generated_at=event.plan_generated_at,
        created_at=event.created_at,
        updated_at=event.updated_at,
        **stats
    )

@router.get("", response_model=List[EventListItem])
def list_events(db: Session = Depends(get_db)):
    """
    List all saved events with quick stats.
    """
    events = db.query(Event).order_by(Event.created_at.desc()).all()
    results = []
    for ev in events:
        stats = compute_event_stats(ev)
        results.append(
            EventListItem(
                id=ev.id,
                name=ev.name,
                event_type=ev.event_type,
                date=ev.date,
                city=ev.city,
                guest_count=ev.guest_count,
                total_budget=ev.total_budget,
                currency=ev.currency,
                language=ev.language,
                plan_source=ev.plan_source,
                total_tasks=stats["total_tasks"],
                completed_tasks=stats["completed_tasks"],
                task_completion_percentage=stats["task_completion_percentage"],
                budget_total_estimated=stats["budget_total_estimated"],
                budget_total_actual=stats["budget_total_actual"],
                created_at=ev.created_at,
                updated_at=ev.updated_at,
            )
        )
    return results

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details for an event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    stats = compute_event_stats(event)
    return EventResponse(
        id=event.id,
        name=event.name,
        event_type=event.event_type,
        date=event.date,
        city=event.city,
        venue_status=event.venue_status,
        guest_count=event.guest_count,
        total_budget=event.total_budget,
        currency=event.currency,
        language=event.language,
        theme_preference=event.theme_preference,
        dietary_requirements=event.dietary_requirements,
        indoor_outdoor=event.indoor_outdoor,
        additional_notes=event.additional_notes,
        event_summary=event.event_summary,
        theme_concept=event.theme_concept,
        weather_contingency=event.weather_contingency,
        plan_source=event.plan_source,
        plan_generated_at=event.plan_generated_at,
        created_at=event.created_at,
        updated_at=event.updated_at,
        **stats
    )

@router.get("/{event_id}/export-json")
def export_event(event_id: str, db: Session = Depends(get_db)):
    """Download a portable snapshot of the plan and all workspace records."""
    details = get_event(event_id, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    snapshot = {
        "schema_version": 1,
        "event": details.model_dump(),
        "budget_items": [BudgetItemResponse.model_validate(item).model_dump() for item in event.budget_items],
        "tasks": [TaskResponse.model_validate(item).model_dump() for item in event.tasks],
        "vendors": [VendorResponse.model_validate(item).model_dump() for item in event.vendors],
        "guests": [GuestResponse.model_validate(item).model_dump() for item in event.guests],
        "feedback": [FeedbackResponse.model_validate(item).model_dump() for item in event.feedback],
    }
    return JSONResponse(
        content=jsonable_encoder(snapshot),
        headers={"Content-Disposition": f'attachment; filename="event-{event.id}.json"'},
    )


@router.patch("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, update_in: EventUpdate, db: Session = Depends(get_db)):
    """
    Update event settings or parameters.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "total_budget" and val is not None:
            val = round(float(val), 2)
        setattr(event, field, val)

    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)

    stats = compute_event_stats(event)
    return EventResponse(
        id=event.id,
        name=event.name,
        event_type=event.event_type,
        date=event.date,
        city=event.city,
        venue_status=event.venue_status,
        guest_count=event.guest_count,
        total_budget=event.total_budget,
        currency=event.currency,
        language=event.language,
        theme_preference=event.theme_preference,
        dietary_requirements=event.dietary_requirements,
        indoor_outdoor=event.indoor_outdoor,
        additional_notes=event.additional_notes,
        event_summary=event.event_summary,
        theme_concept=event.theme_concept,
        weather_contingency=event.weather_contingency,
        plan_source=event.plan_source,
        plan_generated_at=event.plan_generated_at,
        created_at=event.created_at,
        updated_at=event.updated_at,
        **stats
    )

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, db: Session = Depends(get_db)):
    """
    Delete an event and its cascading dependencies (budget, tasks, vendors).
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    db.delete(event)
    db.commit()
    return None

@router.post("/{event_id}/generate-plan", response_model=EventResponse)
async def generate_event_plan(event_id: str, db: Session = Depends(get_db)):
    """
    Invokes the AI planner (or deterministic fallback engine) to generate
    or refresh the event plan, populating budget items, timeline tasks,
    and vendor recommendations.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    plan = await ai_planner.generate_plan(
        event_type=event.event_type,
        name=event.name,
        city=event.city,
        guest_count=event.guest_count,
        total_budget=event.total_budget,
        currency=event.currency,
        language=event.language,
        theme_preference=event.theme_preference,
        dietary_requirements=event.dietary_requirements,
        indoor_outdoor=event.indoor_outdoor,
        additional_notes=event.additional_notes,
        event_date=event.date,
    )

    populate_workspace = event.plan_generated_at is None

    # Update event fields with generated plan
    event.event_summary = plan.event_summary
    event.theme_concept = plan.theme
    event.weather_contingency = "\n".join(plan.contingencies) if plan.contingencies else ""
    event.guest_experience_ideas = json.dumps(plan.ideas)
    event.prep_steps = json.dumps(plan.prep_steps)
    event.event_day_schedule = json.dumps([item.model_dump() for item in plan.event_day_schedule])
    event.plan_source = plan.plan_source
    event.plan_generated_at = datetime.utcnow()
    event.updated_at = datetime.utcnow()

    # Generate workspace records only on the first plan. Regeneration refreshes
    # ideas and schedules while preserving user edits, payments and bookings.

    # Populate budget items from generated plan
    if populate_workspace and not event.budget_items and plan.budget and plan.budget.items:
        for b_item in plan.budget.items:
            db_b_item = BudgetItem(
                event_id=event.id,
                category=b_item.category,
                item_name=b_item.item_name,
                estimated_amount=round(float(b_item.estimated_amount), 2),
                actual_amount=0.0,
                notes=b_item.reason or "",
                is_paid=False,
            )
            db.add(db_b_item)

    # Populate timeline tasks from generated plan
    if populate_workspace and not event.tasks and plan.timeline:
        for t_item in plan.timeline:
            db_task = Task(
                event_id=event.id,
                title=t_item.title,
                description=t_item.description or "",
                due_date=t_item.due_date,
                milestone_phase=t_item.milestone_phase or "preparation",
                priority=t_item.priority or "medium",
                status="pending",
            )
            db.add(db_task)

    # Populate vendor items from generated plan
    if populate_workspace and not event.vendors and plan.vendors:
        for v_item in plan.vendors:
            db_vendor = VendorRecord(
                event_id=event.id,
                category=v_item.category,
                name=v_item.suggested_title or f"{v_item.category} Partner",
                contact_person="",
                phone="",
                email="",
                estimated_quote=0.0,
                actual_quote=0.0,
                status=v_item.status or "not_contacted",
                notes="",
                selection_criteria=", ".join(v_item.requirements) if v_item.requirements else "",
            )
            db.add(db_vendor)

    db.commit()
    db.refresh(event)

    stats = compute_event_stats(event)
    return EventResponse(
        id=event.id,
        name=event.name,
        event_type=event.event_type,
        date=event.date,
        city=event.city,
        venue_status=event.venue_status,
        guest_count=event.guest_count,
        total_budget=event.total_budget,
        currency=event.currency,
        language=event.language,
        theme_preference=event.theme_preference,
        dietary_requirements=event.dietary_requirements,
        indoor_outdoor=event.indoor_outdoor,
        additional_notes=event.additional_notes,
        event_summary=event.event_summary,
        theme_concept=event.theme_concept,
        weather_contingency=event.weather_contingency,
        plan_source=event.plan_source,
        plan_generated_at=event.plan_generated_at,
        created_at=event.created_at,
        updated_at=event.updated_at,
        **stats
    )
