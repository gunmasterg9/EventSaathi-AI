from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from .common import InputModel, PatchModel

class TaskBase(InputModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(default=None, max_length=1500, description="Detailed task instructions or notes")
    due_date: Optional[str] = Field(default=None, description="Due date or relative milestone")
    milestone_phase: str = Field(default="preparation", description="Milestone phase (e.g. 4_weeks_before, 2_weeks_before, event_day)")
    priority: Literal["high", "medium", "low"] = "medium"
    status: Literal["pending", "in_progress", "completed"] = "pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(PatchModel):
    required_fields = {"title", "milestone_phase", "priority", "status"}
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1500)
    due_date: Optional[str] = None
    milestone_phase: Optional[str] = None
    priority: Optional[Literal["high", "medium", "low"]] = None
    status: Optional[Literal["pending", "in_progress", "completed"]] = None

class TaskResponse(TaskBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TasksListResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_percentage: float
    tasks: List[TaskResponse]
