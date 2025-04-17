from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.track import Track
from app.db.models.favorite import Favorite
from app.db.models.dislike import Dislike
from app.schemas.favorite import FavoriteList, FavoriteWithTrack

router = APIRouter()

@router.get("/", response_model=FavoriteList)
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> Any:
    total = db.query(Favorite).filter(Favorite.user_id == current_user.id).count()

    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .join(Track)
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "items": favorites,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.post("/{track_id}", response_model=FavoriteWithTrack)
def add_favorite(
    *,
    db: Session = Depends(get_db),
    track_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.track_id == track_id
    ).first()
    if favorite:
        return favorite

    dislike = db.query(Dislike).filter(
        Dislike.user_id == current_user.id,
        Dislike.track_id == track_id
    ).first()

    if dislike:
        db.delete(dislike)

    favorite = Favorite(
        user_id=current_user.id,
        track_id=track_id
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite

@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    *,
    db: Session = Depends(get_db),
    track_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Remove track from favorites
    """
    # Check if in favorites
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.track_id == track_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Track not found in favorites")
    
    # Remove from favorites
    db.delete(favorite)
    db.commit()