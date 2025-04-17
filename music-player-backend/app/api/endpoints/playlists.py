import os
import shutil
import uuid
from typing import Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.track import Track
from app.db.models.playlist import Playlist, PlaylistTrack
from app.schemas.playlist import (
    PlaylistCreate, PlaylistUpdate, Playlist as PlaylistSchema, 
    PlaylistWithTracks, AddTrackToPlaylist, UpdateTrackPosition, PlaylistList
)

router = APIRouter()

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate file extension"""
    extension = filename.split(".")[-1].lower()
    return extension in allowed_extensions

@router.get("/", response_model=PlaylistList)
def get_playlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    is_public: Optional[bool] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> Any:
    # Start with user's playlists
    query = db.query(Playlist).filter(Playlist.user_id == current_user.id)
    
    # If not filtering for is_public=False, also show all public playlists from other users
    if is_public is None or is_public:
        # Add public playlists from other users
        public_query = db.query(Playlist).filter(
            Playlist.user_id != current_user.id,
            Playlist.is_public == True
        )
        
        query = query.union(public_query)
    else:
        # Only private playlists from current user
        query = query.filter(Playlist.is_public == False)
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    playlists = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "items": playlists,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.post("/", response_model=PlaylistSchema)
def create_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_in: PlaylistCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    playlist = Playlist(
        name=playlist_in.name,
        description=playlist_in.description,
        is_public=playlist_in.is_public,
        user_id=current_user.id
    )

    db.add(playlist)
    db.commit()
    db.refresh(playlist)

    return playlist

@router.get("/{playlist_id}", response_model=PlaylistWithTracks)
def get_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Check access
    if playlist.user_id != current_user.id and not playlist.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this playlist"
        )
    
    # Get tracks
    tracks = (
        db.query(PlaylistTrack)
        .filter(PlaylistTrack.playlist_id == playlist_id)
        .join(Track)
        .order_by(PlaylistTrack.position)
        .all()
    )
    
    # Return playlist with tracks
    playlist.tracks = tracks
    
    return playlist

@router.put("/{playlist_id}", response_model=PlaylistSchema)
def update_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    playlist_in: PlaylistUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Check if current user is the owner
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this playlist"
        )
    
    # Update text fields
    if playlist_in.name is not None:
        playlist.name = playlist_in.name
    
    if playlist_in.description is not None:
        playlist.description = playlist_in.description
    
    if playlist_in.is_public is not None:
        playlist.is_public = playlist_in.is_public

    db.commit()
    db.refresh(playlist)
    
    return playlist

@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    current_user: User = Depends(get_current_user),
) -> None:

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Check if current user is the owner
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this playlist"
        )
    # Delete playlist
    db.delete(playlist)
    db.commit()

@router.post("/{playlist_id}/tracks", response_model=PlaylistWithTracks)
def add_track_to_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    track_in: AddTrackToPlaylist,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add track to playlist
    """
    # Check if playlist exists and current user is the owner
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this playlist"
        )
    
    # Check if track exists
    track = db.query(Track).filter(Track.id == track_in.track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Check if track is already in playlist
    existing_track = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_in.track_id
    ).first()
    
    if existing_track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Track is already in playlist"
        )
    
    # Determine position
    position = track_in.position
    if position is None:
        # Add to the end
        max_position = db.query(func.max(PlaylistTrack.position)).filter(
            PlaylistTrack.playlist_id == playlist_id
        ).scalar() or 0
        position = max_position + 1
    else:
        # Shift tracks if position is specified
        db.query(PlaylistTrack).filter(
            PlaylistTrack.playlist_id == playlist_id,
            PlaylistTrack.position >= position
        ).update(
            {PlaylistTrack.position: PlaylistTrack.position + 1},
            synchronize_session=False
        )
    
    # Add track to playlist
    playlist_track = PlaylistTrack(
        playlist_id=playlist_id,
        track_id=track_in.track_id,
        position=position
    )
    
    db.add(playlist_track)
    db.commit()
    
    # Return updated playlist
    return get_playlist(db=db, playlist_id=playlist_id, current_user=current_user)

@router.put("/{playlist_id}/tracks/{track_id}", response_model=PlaylistWithTracks)
def update_track_position(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    track_id: int,
    position_in: UpdateTrackPosition,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update track position in playlist
    """
    # Check if playlist exists and current user is the owner
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this playlist"
        )
    
    # Check if track is in playlist
    playlist_track = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_id
    ).first()
    
    if not playlist_track:
        raise HTTPException(status_code=404, detail="Track not found in playlist")
    
    # Get current position
    current_position = playlist_track.position
    new_position = position_in.position
    
    # Update positions
    if current_position < new_position:
        # Moving track down
        db.query(PlaylistTrack).filter(
            PlaylistTrack.playlist_id == playlist_id,
            PlaylistTrack.position > current_position,
            PlaylistTrack.position <= new_position
        ).update(
            {PlaylistTrack.position: PlaylistTrack.position - 1},
            synchronize_session=False
        )
    elif current_position > new_position:
        # Moving track up
        db.query(PlaylistTrack).filter(
            PlaylistTrack.playlist_id == playlist_id,
            PlaylistTrack.position >= new_position,
            PlaylistTrack.position < current_position
        ).update(
            {PlaylistTrack.position: PlaylistTrack.position + 1},
            synchronize_session=False
        )
    
    # Update track position
    playlist_track.position = new_position
    db.commit()
    
    # Return updated playlist
    return get_playlist(db=db, playlist_id=playlist_id, current_user=current_user)

@router.delete("/{playlist_id}/tracks/{track_id}", response_model=PlaylistWithTracks)
def remove_track_from_playlist(
    *,
    db: Session = Depends(get_db),
    playlist_id: int,
    track_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    # Check if playlist exists and current user is the owner
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this playlist"
        )
    
    # Check if track is in playlist
    playlist_track = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_id
    ).first()
    
    if not playlist_track:
        raise HTTPException(status_code=404, detail="Track not found in playlist")
    
    # Get position
    position = playlist_track.position
    
    # Delete track from playlist
    db.delete(playlist_track)
    
    # Update positions of other tracks
    db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.position > position
    ).update(
        {PlaylistTrack.position: PlaylistTrack.position - 1},
        synchronize_session=False
    )
    
    db.commit()
    
    # Return updated playlist
    return get_playlist(db=db, playlist_id=playlist_id, current_user=current_user)