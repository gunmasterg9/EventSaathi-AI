from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class VendorBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100, description="Vendor category (e.g. Venue, Catering, Decoration)")
    name: str = Field(..., min_length=1, max_length=200, description="Vendor or business name")
    contact_person: Optional[str] = Field(default=None, max_length=150, description="Contact person name")
    phone: Optional[str] = Field(default=None, max_length=50, description="Contact phone or WhatsApp")
    email: Optional[str] = Field(default=None, max_length=150, description="Contact email")
    estimated_quote: float = Field(default=0.0, ge=0.0, description="Estimated or initial quote")
    actual_quote: float = Field(default=0.0, ge=0.0, description="Agreed or final quote")
    status: str = Field(default="not_contacted", description="not_contacted, contacted, quoted, booked, rejected")
    notes: Optional[str] = Field(default=None, max_length=2000, description="Deliverables, package details, notes")
    selection_criteria: Optional[str] = Field(default=None, max_length=1000, description="Key criteria (e.g., taste test passed, guest capacity 100+)")

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=150)
    estimated_quote: Optional[float] = Field(None, ge=0.0)
    actual_quote: Optional[float] = Field(None, ge=0.0)
    status: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=2000)
    selection_criteria: Optional[str] = Field(None, max_length=1000)

class VendorResponse(VendorBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VendorsListResponse(BaseModel):
    total_vendors: int
    booked_vendors: int
    vendors: List[VendorResponse]
