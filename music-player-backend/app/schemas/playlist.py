from typing import Optional, List
from pydantic import BaseModel

from app.schemas.track import Track

class PlaylistBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class Playlist(PlaylistBase):
    id: int
    user_id: int
    cover_path: Optional[str] = None

    class Config:
        orm_mode = True

class PlaylistTrack(BaseModel):
    track: Track
    position: int

    class Config:
        orm_mode = True

class PlaylistWithTracks(Playlist):
    tracks: List[PlaylistTrack] = []

class AddTrackToPlaylist(BaseModel):
    track_id: int
    position: Optional[int] = None

class UpdateTrackPosition(BaseModel):
    position: int

class PlaylistList(BaseModel):
    items: List[Playlist]
    total: int
    page: int
    size: int
    pages: int