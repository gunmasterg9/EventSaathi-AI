from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import Event, Task
from backend.app.schemas.tasks import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TasksListResponse,
)

router = APIRouter(tags=["Timeline & Tasks"])

@router.get("/api/events/{event_id}/tasks", response_model=TasksListResponse)
def get_event_tasks(
    event_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    db: Session = Depends(get_db)
):
    """
    Get interactive planning timeline tasks for an event with optional filtering
    by status or priority, including completion progress percentage.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    query = db.query(Task).filter(Task.event_id == event_id)
    all_tasks = query.all()

    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for t in all_tasks if t.status == "completed")
    completion_pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    filtered_tasks = all_tasks
    if status_filter:
        filtered_tasks = [t for t in filtered_tasks if t.status.lower() == status_filter.lower()]
    if priority_filter:
        filtered_tasks = [t for t in filtered_tasks if t.priority.lower() == priority_filter.lower()]

    return TasksListResponse(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_percentage=completion_pct,
        tasks=[
            TaskResponse(
                id=t.id,
                event_id=t.event_id,
                title=t.title,
                description=t.description,
                due_date=t.due_date,
                milestone_phase=t.milestone_phase,
                priority=t.priority,
                status=t.status,
                created_at=t.created_at,
                updated_at=t.updated_at,
            )
            for t in filtered_tasks
        ]
    )

@router.post("/api/events/{event_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(event_id: str, task_in: TaskCreate, db: Session = Depends(get_db)):
    """
    Add a new task to the event timeline.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    task = Task(
        event_id=event.id,
        title=task_in.title.strip(),
        description=task_in.description,
        due_date=task_in.due_date,
        milestone_phase=task_in.milestone_phase or "preparation",
        priority=task_in.priority or "medium",
        status=task_in.status or "pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/api/events/{event_id}/tasks/{task_id}", response_model=TaskResponse)
@router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update a task (status, priority, due date, description) with cross-event protection.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found"
        )

    if event_id and task.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Task does not belong to event '{event_id}'"
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/api/events/{event_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Delete a task with cross-event validation.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found"
        )

    if event_id and task.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Task does not belong to event '{event_id}'"
        )

    db.delete(task)
    db.commit()
    return None
