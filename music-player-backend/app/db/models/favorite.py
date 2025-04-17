from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel

class Favorite(Base, BaseModel):

    __tablename__ = "favorites"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'track_id', name='_user_track_favorite_uc'),)

    user = relationship("User", back_populates="favorites")
    track = relationship("Track", back_populates="favorites")