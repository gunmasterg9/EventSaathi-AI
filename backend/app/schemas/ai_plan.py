from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class AIPlanBudgetItem(BaseModel):
    category: str = Field(..., description="Category name (e.g. Venue, Catering, Decoration)")
    item_name: str = Field(default="Standard Category Expense", description="Expense name")
    estimated_amount: float = Field(..., ge=0.0, description="Allocated amount")
    reason: Optional[str] = Field(default=None, description="Reason or allocation basis")

class AIPlanBudgetBlock(BaseModel):
    currency: str = "INR"
    total: float = 0.0
    items: List[AIPlanBudgetItem] = []

class AIPlanTimelineItem(BaseModel):
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(default=None, description="Actionable details")
    due_date: Optional[str] = Field(default=None, description="Milestone or due date")
    milestone_phase: str = Field(default="preparation", description="e.g. 4_weeks_before, 2_weeks_before, event_day")
    priority: str = Field(default="medium", description="high, medium, low")
    status: str = Field(default="pending", description="pending, in_progress, completed")

class AIPlanVendorItem(BaseModel):
    category: str = Field(..., description="Vendor category")
    suggested_title: Optional[str] = Field(default=None, description="Recommended vendor role")
    requirements: List[str] = Field(default_factory=list, description="Criteria and questions to ask")
    status: str = Field(default="not_contacted")

class AIPlanScheduleItem(BaseModel):
    time_slot: str = Field(..., description="e.g. 10:00 AM - 11:30 AM")
    activity: str = Field(..., description="Activity description")
    notes: Optional[str] = Field(default=None, description="Key notes or coordination point")

class AIPlanGenerated(BaseModel):
    event_summary: str = Field(..., description="High-level personalized celebration summary")
    theme: str = Field(..., description="Theme concept and styling ideas")
    budget: AIPlanBudgetBlock = Field(default_factory=AIPlanBudgetBlock)
    timeline: List[AIPlanTimelineItem] = Field(default_factory=list)
    vendors: List[AIPlanVendorItem] = Field(default_factory=list)
    ideas: List[str] = Field(default_factory=list, description="Personalized celebration & guest experience ideas")
    contingencies: List[str] = Field(default_factory=list, description="Contingency & backup plans")
    prep_steps: List[str] = Field(default_factory=list, description="Recommended key preparation steps")
    event_day_schedule: List[AIPlanScheduleItem] = Field(default_factory=list, description="Event-day itinerary")
    plan_source: str = Field(default="gemini_ai", description="gemini_ai or rules_fallback")
    fallback_reason: Optional[str] = Field(default=None, description="Explanation if fallback engine was used")
