Приложение для приёма и обработки заявок в техподдержку:
любой сотрудник может создать заявку и следить за её статусом, администратор
дополнительно может удалять заявки.

## Структура проекта

```
backend/
  app/
    core/          # конфиг, БД, security (JWT)
    models/        # SQLAlchemy-модели
    schemas/       # Pydantic-схемы запросов/ответов
    repositories/  # доступ к БД
    services/      # бизнес-логика
    routers/       # FastAPI-роуты
    alembic/       # миграции БД
  tests/           # тесты

frontend/
  src/
    app/                 # роутинг, error boundary, точка входа приложения
    pages/               # страницы (роуты)
    features/helpdesk/   # UI-фича заявок: компоненты, хуки, утилиты
    shared/api/          # axios-клиент, типы DTO, api-клиенты (auth, requests)
    stores/              # Zustand-сторы
    components/ui/       # shadcn-компоненты
```

## Backend - запуск

Требуется Python 3.13+ и uv.

```bash
cd backend
uv sync
```

Примените миграции и запустите сервер:

```bash
uv run alembic upgrade head
make run
```

### Полезные команды

```bash
make test         # pytest
make typecheck    # mypy --strict
make lint-check   # ruff check
make lint         # ruff check --fix
make format       # ruff format
```

## Frontend — запуск

Требуется Node.js 20+.

```bash
cd frontend
npm install
```

```bash
npm run dev
```

### Полезные команды

```bash
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run test      # vitest run
npm run format    # prettier --write .
```