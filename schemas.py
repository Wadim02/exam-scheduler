from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    hashed_password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class PropunereCreate(BaseModel):
    disciplina_id: int
    data: datetime
    durata: int
