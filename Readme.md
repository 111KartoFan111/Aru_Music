1. Установить 11 вервию пайтона

## Cоздать базу данных в бд tuneviewer



https://www.python.org/downloads/release/python-3110/

## Запуск бэкенда

# Перейти в директорию бэкенда
```bash
cd music-player-backend
```

# Создать виртуальное окружение (опционально, но рекомендуется)
```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

# Установить зависимости
```bash
pip install -r requirements.txt
```

# Настроить базу данных и выполнить миграции
```bash
alembic upgrade head
```

# Запустить FastAPI сервер
```bash
uvicorn app.main:app --reload
```

## Запуск фронтенда:
# Перейти в директорию фронтенда
```bash
cd music-player
```

# Установить зависимости
```bash
npm install
```

# Запустить сервер разработки
```bash
npm run dev
```