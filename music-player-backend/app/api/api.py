from fastapi import APIRouter

from app.api.endpoints import auth, users, tracks, playlists, favorites, dislikes, reviews

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
api_router.include_router(dislikes.router, prefix="/dislikes", tags=["dislikes"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])