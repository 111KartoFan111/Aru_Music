from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.track import Track
from app.db.models.dislike import Dislike
from app.db.models.favorite import Favorite
from app.schemas.dislike import DislikeList, DislikeWithTrack

router = APIRouter()

@router.get("/", response_model=DislikeList)
def get_dislikes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> Any:
    """
    Get current user's disliked tracks
    """
    # Get total count for pagination
    total = db.query(Dislike).filter(Dislike.user_id == current_user.id).count()
    
    # Get dislikes with track details
    dislikes = (
        db.query(Dislike)
        .filter(Dislike.user_id == current_user.id)
        .join(Track)
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    
    return {
        "items": dislikes,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.post("/{track_id}", response_model=DislikeWithTrack)
def add_dislike(
    *,
    db: Session = Depends(get_db),
    track_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add track to dislikes
    """
    # Check if track exists
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Check if already in dislikes
    dislike = db.query(Dislike).filter(
        Dislike.user_id == current_user.id,
        Dislike.track_id == track_id
    ).first()
    
    if dislike:
        # Already disliked, return existing record
        return dislike
    
    # Check if track is favorited, remove from favorites if it is
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.track_id == track_id
    ).first()
    
    if favorite:
        db.delete(favorite)
    
    # Add to dislikes
    dislike = Dislike(
        user_id=current_user.id,
        track_id=track_id
    )
    
    db.add(dislike)
    db.commit()
    db.refresh(dislike)
    
    return dislike

@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_dislike(
    *,
    db: Session = Depends(get_db),
    track_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Remove track from dislikes
    """
    # Check if in dislikes
    dislike = db.query(Dislike).filter(
        Dislike.user_id == current_user.id,
        Dislike.track_id == track_id
    ).first()
    
    if not dislike:
        raise HTTPException(status_code=404, detail="Track not found in dislikes")
    
    # Remove from dislikes
    db.delete(dislike)
    db.commit()