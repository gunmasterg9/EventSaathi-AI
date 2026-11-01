from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import EventFeedback, Task
from backend.app.routers.guests import require_event
from backend.app.schemas.operations import BundleRequest, FeedbackInput, FeedbackResponse, FeedbackSummary

router = APIRouter(prefix="/api/events/{event_id}", tags=["Event operations"])

# Original operational templates inspired by event-service categories. These
# create ordinary editable tasks; they do not claim any third-party bookings.
BUNDLES = {
    "hospitality": ["Assign a guest welcome-desk coordinator", "Confirm dietary and accessibility arrangements", "Prepare guest welcome information and emergency contacts"],
    "travel": ["Collect arrival and departure details from travelling guests", "Confirm room allocations and accommodation check-in times", "Confirm pickup routes, transport capacity and driver contacts"],
    "registration": ["Finalize the attendee registration list", "Prepare check-in desk materials and name badges", "Assign entry and queue-management volunteers"],
    "hybrid": ["Test venue internet, microphones and camera coverage", "Rehearse the livestream and remote attendee access", "Prepare backup internet and recording arrangements"],
    "coordination": ["Confirm the event-day schedule with all vendors", "Assign a coordinator for each ceremony or session", "Review weather backup, safety and escalation contacts"],
}


@router.post("/service-checklists")
def add_checklist(event_id: str, data: BundleRequest, db: Session = Depends(get_db)):
    event = require_event(event_id, db)
    phase = f"service_{data.bundle}"
    existing = {task.title for task in event.tasks if task.milestone_phase == phase}
    added = 0
    for title in BUNDLES[data.bundle]:
        if title not in existing:
            db.add(Task(event_id=event_id, title=title, milestone_phase=phase, priority="high", status="pending"))
            added += 1
    event.updated_at = datetime.utcnow()
    db.commit()
    return {"added": added, "bundle": data.bundle}


@router.get("/feedback", response_model=FeedbackSummary)
def list_feedback(event_id: str, db: Session = Depends(get_db)):
    require_event(event_id, db)
    entries = db.query(EventFeedback).filter_by(event_id=event_id).order_by(EventFeedback.created_at.desc()).all()
    return FeedbackSummary(entries=[FeedbackResponse.model_validate(entry) for entry in entries], total=len(entries), average_rating=round(sum(entry.rating for entry in entries) / len(entries), 1) if entries else None)


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def add_feedback(event_id: str, data: FeedbackInput, db: Session = Depends(get_db)):
    require_event(event_id, db)
    entry = EventFeedback(event_id=event_id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/feedback/{feedback_id}", status_code=204)
def delete_feedback(event_id: str, feedback_id: str, db: Session = Depends(get_db)):
    require_event(event_id, db)
    entry = db.get(EventFeedback, feedback_id)
    if not entry:
        raise HTTPException(404, "Feedback not found")
    if entry.event_id != event_id:
        raise HTTPException(403, "Feedback does not belong to this event")
    db.delete(entry)
    db.commit()
