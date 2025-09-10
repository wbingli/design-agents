# Prompts

This directory stores prompt files used to drive ML system design agents.

Conventions:
- Use `.md` for longform prompts, `.txt` for short prompts, `.json` for structured configs.
- You can create subfolders later if needed; current API lists only top-level files.

API usage examples:
- List: `GET /api/prompts`
- Read: `GET /api/prompts/<name>`
- Upsert: `POST /api/prompts/<name>` with body `{ "content": "..." }` or raw text
- Run (stub): `POST /api/run/<name>` with `{ "parameters": { ... } }`

Security note: Backend restricts to top-level file names; do not include slashes in `<name>`.


