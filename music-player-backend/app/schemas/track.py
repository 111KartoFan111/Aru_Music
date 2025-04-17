from typing import Optional
from pydantic import BaseModel

from app.db.models.track import Genre

class TrackBase(BaseModel):
    title: str
    artist: str
    genre: Genre
    duration: Optional[float] = None

class TrackCreate(TrackBase):
    pass

class TrackUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    genre: Optional[Genre] = None
    duration: Optional[float] = None

class Track(TrackBase):
    id: int
    cover_path: str
    audio_path: str

    class Config:
        orm_mode = True

class TrackWithStats(Track):
    favorites_count: int
    dislikes_count: int
    reviews_count: int
    is_favorited: Optional[bool] = None
    is_disliked: Optional[bool] = None

class TrackList(BaseModel):
    items: list[Track]
    total: int
    page: int
    size: int
    pages: int