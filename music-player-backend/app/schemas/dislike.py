from typing import List
from pydantic import BaseModel

from app.schemas.track import Track

class Dislike(BaseModel):
    id: int
    user_id: int
    track_id: int

    class Config:
        orm_mode = True

class DislikeWithTrack(Dislike):
    track: Track

class DislikeList(BaseModel):
    items: List[DislikeWithTrack]
    total: int
    page: int
    size: int
    pages: int