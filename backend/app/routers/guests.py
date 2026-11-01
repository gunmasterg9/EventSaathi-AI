import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Event, Guest
from backend.app.schemas.guests import GuestCreate, GuestUpdate, GuestResponse, GuestSummary
from backend.app.services.csv_service import sanitize_csv_cell

router = APIRouter(prefix="/api/events/{event_id}/guests", tags=["Guests & RSVP"])


def require_event(event_id: str, db: Session):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    return event


def require_guest(event_id: str, guest_id: str, db: Session):
    require_event(event_id, db)
    guest = db.get(Guest, guest_id)
    if not guest:
        raise HTTPException(404, "Guest not found")
    if guest.event_id != event_id:
        raise HTTPException(403, "Guest does not belong to this event")
    return guest


@router.get("", response_model=GuestSummary)
def list_guests(event_id: str, db: Session = Depends(get_db)):
    event = require_event(event_id, db)
    guests = db.query(Guest).filter_by(event_id=event_id).order_by(Guest.created_at).all()
    return GuestSummary(
        guests=[GuestResponse.model_validate(guest) for guest in guests],
        invited_people=sum(guest.party_size for guest in guests),
        confirmed_people=sum(guest.party_size for guest in guests if guest.rsvp_status == "confirmed"),
        pending_people=sum(guest.party_size for guest in guests if guest.rsvp_status == "pending"),
        declined_people=sum(guest.party_size for guest in guests if guest.rsvp_status == "declined"),
        planned_capacity=event.guest_count,
    )


@router.get("/export-csv")
def export_guests(event_id: str, db: Session = Depends(get_db)):
    summary = list_guests(event_id, db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Phone", "Party size", "RSVP", "Dietary requirements", "Notes"])
    for guest in summary.guests:
        writer.writerow([sanitize_csv_cell(value) for value in (guest.name, guest.phone, guest.party_size, guest.rsvp_status, guest.dietary_requirements, guest.notes)])
    return Response(content='\ufeff' + output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="EventSaathi_Guests.csv"'})


@router.post("", response_model=GuestResponse, status_code=201)
def add_guest(event_id: str, data: GuestCreate, db: Session = Depends(get_db)):
    require_event(event_id, db)
    guest = Guest(event_id=event_id, **data.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.patch("/{guest_id}", response_model=GuestResponse)
def update_guest(event_id: str, guest_id: str, data: GuestUpdate, db: Session = Depends(get_db)):
    guest = require_guest(event_id, guest_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(guest, field, value)
    db.commit()
    db.refresh(guest)
    return guest


@router.delete("/{guest_id}", status_code=204)
def delete_guest(event_id: str, guest_id: str, db: Session = Depends(get_db)):
    guest = require_guest(event_id, guest_id, db)
    db.delete(guest)
    db.commit()
