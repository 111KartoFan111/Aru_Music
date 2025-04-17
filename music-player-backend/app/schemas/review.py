from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.schemas.user import User
from app.schemas.track import Track

class ReviewBase(BaseModel):
    text: str

class ReviewCreate(ReviewBase):
    track_id: int


class ReviewUpdate(BaseModel):
    text: Optional[str] = None

class Review(ReviewBase):
    id: int
    user_id: int
    track_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class ReviewWithUser(Review):
    user: User

class ReviewWithTrack(Review):
    track: Track

class ReviewWithUserAndTrack(Review):
    user: User
    track: Track

class ReviewList(BaseModel):
    items: List[ReviewWithUser]
    total: int
    page: int
    size: int
    pages: int