from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from .common import InputModel, PatchModel

class BudgetItemBase(InputModel):
    category: str = Field(..., min_length=1, max_length=100, description="Category name (e.g., Venue, Catering, Decoration)")
    item_name: str = Field(..., min_length=1, max_length=200, description="Item or expense description")
    estimated_amount: float = Field(..., ge=0.0, description="Estimated cost (must be non-negative)")
    actual_amount: float = Field(default=0.0, ge=0.0, description="Actual spent amount (must be non-negative)")
    notes: Optional[str] = Field(default=None, max_length=1000, description="Notes, quotation context, or vendor links")
    is_paid: bool = Field(default=False, description="Whether the expense is settled/paid")

class BudgetItemCreate(BudgetItemBase):
    pass

class BudgetItemUpdate(PatchModel):
    required_fields = {"category", "item_name", "estimated_amount", "actual_amount", "is_paid"}
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    item_name: Optional[str] = Field(None, min_length=1, max_length=200)
    estimated_amount: Optional[float] = Field(None, ge=0.0)
    actual_amount: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = Field(None, max_length=1000)
    is_paid: Optional[bool] = None

class BudgetItemResponse(BudgetItemBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryBreakdown(BaseModel):
    category: str
    estimated_total: float
    actual_total: float
    percentage_of_budget: float
    item_count: int

class BudgetSummaryResponse(BaseModel):
    event_id: str
    currency: str
    total_budget: float
    total_estimated: float
    total_actual: float
    remaining_budget: float
    is_over_budget: bool
    over_budget_amount: float
    categories: List[CategoryBreakdown]
    items: List[BudgetItemResponse]
