from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import Event, VendorRecord
from backend.app.schemas.vendors import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    VendorsListResponse,
)

router = APIRouter(tags=["Vendor Planning"])

@router.get("/api/events/{event_id}/vendors", response_model=VendorsListResponse)
def get_event_vendors(
    event_id: str,
    category_filter: Optional[str] = Query(None, alias="category"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Get vendor records and quotes for an event with optional filtering
    by category or status.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    all_vendors = db.query(VendorRecord).filter(VendorRecord.event_id == event_id).order_by(VendorRecord.created_at.asc()).all()

    total_vendors = len(all_vendors)
    booked_vendors = sum(1 for v in all_vendors if v.status == "booked")

    filtered = all_vendors
    if category_filter:
        filtered = [v for v in filtered if v.category.lower() == category_filter.lower()]
    if status_filter:
        filtered = [v for v in filtered if v.status.lower() == status_filter.lower()]

    return VendorsListResponse(
        total_vendors=total_vendors,
        booked_vendors=booked_vendors,
        vendors=[
            VendorResponse(
                id=v.id,
                event_id=v.event_id,
                category=v.category,
                name=v.name,
                contact_person=v.contact_person,
                phone=v.phone,
                email=v.email,
                estimated_quote=round(float(v.estimated_quote or 0.0), 2),
                actual_quote=round(float(v.actual_quote or 0.0), 2),
                status=v.status,
                notes=v.notes,
                selection_criteria=v.selection_criteria,
                created_at=v.created_at,
                updated_at=v.updated_at,
            )
            for v in filtered
        ]
    )

@router.post("/api/events/{event_id}/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def add_vendor(event_id: str, vendor_in: VendorCreate, db: Session = Depends(get_db)):
    """
    Add a new vendor planning record or quotation to the event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    vendor = VendorRecord(
        event_id=event.id,
        category=vendor_in.category.strip(),
        name=vendor_in.name.strip(),
        contact_person=vendor_in.contact_person,
        phone=vendor_in.phone,
        email=vendor_in.email,
        estimated_quote=round(float(vendor_in.estimated_quote or 0.0), 2),
        actual_quote=round(float(vendor_in.actual_quote or 0.0), 2),
        status=vendor_in.status or "not_contacted",
        notes=vendor_in.notes,
        selection_criteria=vendor_in.selection_criteria,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor

@router.patch("/api/events/{event_id}/vendors/{vendor_id}", response_model=VendorResponse)
@router.patch("/api/vendors/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    vendor_in: VendorUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update vendor status, quote, or details with cross-event protection.
    """
    vendor = db.query(VendorRecord).filter(VendorRecord.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor record with id '{vendor_id}' not found"
        )

    if event_id and vendor.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Vendor record does not belong to event '{event_id}'"
        )

    update_data = vendor_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field in ("estimated_quote", "actual_quote") and val is not None:
            val = round(float(val), 2)
        setattr(vendor, field, val)

    db.commit()
    db.refresh(vendor)
    return vendor

@router.delete("/api/events/{event_id}/vendors/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/vendors/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(
    vendor_id: str,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Delete a vendor entry with cross-event validation.
    """
    vendor = db.query(VendorRecord).filter(VendorRecord.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor record with id '{vendor_id}' not found"
        )

    if event_id and vendor.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Vendor record does not belong to event '{event_id}'"
        )

    db.delete(vendor)
    db.commit()
    return None
