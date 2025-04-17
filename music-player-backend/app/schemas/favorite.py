from typing import List
from pydantic import BaseModel

from app.schemas.track import Track

class Favorite(BaseModel):
    id: int
    user_id: int
    track_id: int

    class Config:
        orm_mode = True

class FavoriteWithTrack(Favorite):
    track: Track

class FavoriteList(BaseModel):
    items: List[FavoriteWithTrack]
    total: int
    page: int
    size: int
    pages: int