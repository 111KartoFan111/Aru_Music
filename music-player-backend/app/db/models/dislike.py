from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel

class Dislike(Base, BaseModel):

    __tablename__ = "dislikes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'track_id', name='_user_track_dislike_uc'),)

    user = relationship("User", back_populates="dislikes")
    track = relationship("Track", back_populates="dislikes")