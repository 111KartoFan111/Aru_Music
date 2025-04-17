from sqlalchemy import Column, String, Float, Enum
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel
import enum

class Genre(str, enum.Enum):
    POP = "Pop"
    HIPHOP = "Hip-Hop"
    ROCK = "Rock"
    INDIE = "Indie"
    RNB = "R&B"
    ELECTRONIC = "Electronic"
    JAZZ = "Jazz"
    CLASSICAL = "Classical"
    FOLK = "Folk"
    METAL = "Metal"

class Track(Base, BaseModel):
    __tablename__ = "tracks"

    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    genre = Column(Enum(Genre), nullable=False)
    duration = Column(Float, nullable=False)
    cover_path = Column(String, nullable=False)
    audio_path = Column(String, nullable=False)

    playlists = relationship("PlaylistTrack", back_populates="track")
    favorites = relationship("Favorite", back_populates="track", cascade="all, delete-orphan")
    dislikes = relationship("Dislike", back_populates="track", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="track", cascade="all, delete-orphan")