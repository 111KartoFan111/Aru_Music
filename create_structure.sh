#!/bin/bash

# Создание директорий
mkdir -p music-player-backend/{alembic,media/{covers,tracks}}
mkdir -p music-player-backend/app/{db/models,schemas,api/endpoints,core,services}
touch music-player-backend/.env
touch music-player-backend/alembic.ini
touch music-player-backend/requirements.txt
touch music-player-backend/docker-compose.yml

# Основные файлы
touch music-player-backend/app/__init__.py
touch music-player-backend/app/main.py
touch music-player-backend/app/config.py
touch music-player-backend/app/dependencies.py

# DB
touch music-player-backend/app/db/__init__.py
touch music-player-backend/app/db/base.py
touch music-player-backend/app/db/session.py
touch music-player-backend/app/db/models/__init__.py
touch music-player-backend/app/db/models/user.py
touch music-player-backend/app/db/models/track.py
touch music-player-backend/app/db/models/playlist.py
touch music-player-backend/app/db/models/favorite.py
touch music-player-backend/app/db/models/dislike.py
touch music-player-backend/app/db/models/review.py

# Schemas
touch music-player-backend/app/schemas/__init__.py
touch music-player-backend/app/schemas/user.py
touch music-player-backend/app/schemas/track.py
touch music-player-backend/app/schemas/playlist.py
touch music-player-backend/app/schemas/favorite.py
touch music-player-backend/app/schemas/dislike.py
touch music-player-backend/app/schemas/review.py

# API
touch music-player-backend/app/api/__init__.py
touch music-player-backend/app/api/api.py
touch music-player-backend/app/api/endpoints/__init__.py
touch music-player-backend/app/api/endpoints/auth.py
touch music-player-backend/app/api/endpoints/users.py
touch music-player-backend/app/api/endpoints/tracks.py
touch music-player-backend/app/api/endpoints/playlists.py
touch music-player-backend/app/api/endpoints/favorites.py
touch music-player-backend/app/api/endpoints/dislikes.py
touch music-player-backend/app/api/endpoints/reviews.py

# Core
touch music-player-backend/app/core/__init__.py
touch music-player-backend/app/core/auth.py
touch music-player-backend/app/core/security.py

# Services
touch music-player-backend/app/services/__init__.py
touch music-player-backend/app/services/user_service.py
touch music-player-backend/app/services/track_service.py
touch music-player-backend/app/services/playlist_service.py
touch music-player-backend/app/services/favorite_service.py
touch music-player-backend/app/services/dislike_service.py
touch music-player-backend/app/services/review_service.py
