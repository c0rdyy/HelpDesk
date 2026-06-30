.PHONY: run typecheck lint lint-check format test

run:
	uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
typecheck:
	uv run mypy .
lint:
	uv run ruff check . --fix
lint-check:
	uv run ruff check .
format:
	uv run ruff format .
test:
	uv run pytest
