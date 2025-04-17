import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "TuneViewer API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:0000@localhost:5432/tuneviewer")

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:3000",
    ]

    MEDIA_ROOT: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
    COVERS_DIR: str = "covers"
    TRACKS_DIR: str = "tracks"

    MAX_COVER_SIZE_MB: int = 5
    MAX_TRACK_SIZE_MB: int = 20

    ALLOWED_COVER_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "gif", "webp"]
    ALLOWED_TRACK_EXTENSIONS: list[str] = ["mp3", "wav", "ogg", "m4a", "flac"]

    class Config:
        case_sensitive = True


settings = Settings()

os.makedirs(os.path.join(settings.MEDIA_ROOT, settings.COVERS_DIR), exist_ok=True)
os.makedirs(os.path.join(settings.MEDIA_ROOT, settings.TRACKS_DIR), exist_ok=True)