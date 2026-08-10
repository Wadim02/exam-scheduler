"""
Pydantic schemas for data validation and serialization across API requests and responses.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ===============================
# User Schemas
# ===============================

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    hashed_password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# ===============================
# Exam Proposal Schemas
# ===============================

class ProposalCreate(BaseModel):
    subject_id: int
    date: datetime
    duration: int

class ProposalResponse(BaseModel):
    id: int
    subject_id: int
    group_leader_id: int
    room_id: Optional[int] = None
    date: datetime
    duration: int
    status: str
    rejection_reason: Optional[str] = None
    assistant_id: Optional[int] = None

    class Config:
        from_attributes = True