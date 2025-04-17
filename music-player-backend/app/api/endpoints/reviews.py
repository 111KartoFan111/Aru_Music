from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.track import Track
from app.db.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewWithUser, ReviewList

router = APIRouter()

@router.get("/", response_model=ReviewList)
def get_reviews(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
    track_id: Optional[int] = None,
    user_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> Any:
    """
    Get reviews with optional filtering by track or user
    """
    query = db.query(Review)
    
    # Apply filters
    if track_id:
        query = query.filter(Review.track_id == track_id)
    
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    reviews = (
        query
        .join(User)
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    
    return {
        "items": reviews,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.post("/", response_model=ReviewWithUser)
def create_review(
    *,
    db: Session = Depends(get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new review
    """
    # Check if track exists
    track = db.query(Track).filter(Track.id == review_in.track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Check if user already reviewed this track
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.track_id == review_in.track_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this track"
        )
    
    # Create review
    review = Review(
        user_id=current_user.id,
        track_id=review_in.track_id,
        text=review_in.text
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review

@router.get("/{review_id}", response_model=ReviewWithUser)
def get_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
) -> Any:
    """
    Get review by ID
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review

@router.put("/{review_id}", response_model=ReviewWithUser)
def update_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    review_in: ReviewUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update review
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if current user is the author
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this review"
        )
    
    # Update review
    if review_in.text is not None:
        review.text = review_in.text
    
    db.commit()
    db.refresh(review)
    
    return review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete review
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if current user is the author or admin
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this review"
        )
    
    # Delete review
    db.delete(review)
    db.commit()