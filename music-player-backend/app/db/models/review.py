from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel

class Review(Base, BaseModel):

    __tablename__ = "reviews"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    text = Column(Text, nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'track_id', name='_user_track_review_uc'),)

    user = relationship("User", back_populates="reviews")
    track = relationship("Track", back_populates="reviews")