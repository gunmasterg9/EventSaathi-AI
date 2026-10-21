from collections import defaultdict
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import Event, BudgetItem
from backend.app.schemas.budget import (
    BudgetItemCreate,
    BudgetItemUpdate,
    BudgetItemResponse,
    BudgetSummaryResponse,
    CategoryBreakdown,
)
from backend.app.services.csv_service import generate_budget_csv

router = APIRouter(tags=["Budget Intelligence"])

@router.get("/api/events/{event_id}/budget", response_model=BudgetSummaryResponse)
def get_event_budget_summary(event_id: str, db: Session = Depends(get_db)):
    """
    Get full budget intelligence summary: category allocations, totals,
    estimated vs actual variance, over-budget indicators, and expense items.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    items = db.query(BudgetItem).filter(BudgetItem.event_id == event_id).order_by(BudgetItem.created_at.asc()).all()

    total_est = 0.0
    total_act = 0.0
    cat_stats = defaultdict(lambda: {"est": 0.0, "act": 0.0, "count": 0})

    for item in items:
        est = round(float(item.estimated_amount or 0.0), 2)
        act = round(float(item.actual_amount or 0.0), 2)
        total_est += est
        total_act += act

        cat = item.category.strip() or "General"
        cat_stats[cat]["est"] += est
        cat_stats[cat]["act"] += act
        cat_stats[cat]["count"] += 1

    total_budget = round(float(event.total_budget), 2)
    total_est = round(total_est, 2)
    total_act = round(total_act, 2)
    remaining = round(total_budget - total_act, 2)
    is_over = remaining < 0
    over_amount = round(abs(remaining), 2) if is_over else 0.0

    categories_list = []
    for cat_name, stats in cat_stats.items():
        cat_est = round(stats["est"], 2)
        cat_act = round(stats["act"], 2)
        pct = round((cat_est / total_budget * 100), 1) if total_budget > 0 else 0.0
        categories_list.append(
            CategoryBreakdown(
                category=cat_name,
                estimated_total=cat_est,
                actual_total=cat_act,
                percentage_of_budget=pct,
                item_count=stats["count"]
            )
        )

    # Sort categories by estimated total descending
    categories_list.sort(key=lambda c: c.estimated_total, reverse=True)

    items_response = [
        BudgetItemResponse(
            id=item.id,
            event_id=item.event_id,
            category=item.category,
            item_name=item.item_name,
            estimated_amount=round(item.estimated_amount, 2),
            actual_amount=round(item.actual_amount, 2),
            notes=item.notes,
            is_paid=item.is_paid,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in items
    ]

    return BudgetSummaryResponse(
        event_id=event.id,
        currency=event.currency,
        total_budget=total_budget,
        total_estimated=total_est,
        total_actual=total_act,
        remaining_budget=remaining,
        is_over_budget=is_over,
        over_budget_amount=over_amount,
        categories=categories_list,
        items=items_response
    )

@router.post("/api/events/{event_id}/budget/items", response_model=BudgetItemResponse, status_code=status.HTTP_201_CREATED)
def add_budget_item(event_id: str, item_in: BudgetItemCreate, db: Session = Depends(get_db)):
    """
    Add a new budget expense item to the event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    item = BudgetItem(
        event_id=event.id,
        category=item_in.category.strip(),
        item_name=item_in.item_name.strip(),
        estimated_amount=round(float(item_in.estimated_amount), 2),
        actual_amount=round(float(item_in.actual_amount), 2),
        notes=item_in.notes,
        is_paid=item_in.is_paid,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/api/events/{event_id}/budget/items/{item_id}", response_model=BudgetItemResponse)
@router.patch("/api/budget/items/{item_id}", response_model=BudgetItemResponse)
def update_budget_item(
    item_id: str,
    item_in: BudgetItemUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update an existing budget item with cross-event access validation.
    """
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget item with id '{item_id}' not found"
        )

    # Cross-event boundary check
    if event_id and item.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Budget item does not belong to event '{event_id}'"
        )

    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field in ("estimated_amount", "actual_amount") and val is not None:
            val = round(float(val), 2)
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/api/events/{event_id}/budget/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/budget/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_item(
    item_id: str,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Delete a budget item with cross-event validation.
    """
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget item with id '{item_id}' not found"
        )

    if event_id and item.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Budget item does not belong to event '{event_id}'"
        )

    db.delete(item)
    db.commit()
    return None

@router.get("/api/events/{event_id}/budget/export-csv")
def export_budget_csv(event_id: str, db: Session = Depends(get_db)):
    """
    Export the event's budget breakdown to a secure, sanitized CSV file.
    Includes formula injection mitigation and detailed totals.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    items = db.query(BudgetItem).filter(BudgetItem.event_id == event_id).order_by(BudgetItem.created_at.asc()).all()
    csv_content = generate_budget_csv(event, items)

    clean_filename = "".join(c for c in event.name if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    filename = f"EventSaathi_Budget_{clean_filename or 'Report'}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        }
    )
