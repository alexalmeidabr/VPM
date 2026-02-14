# VPM Starter Feature: Project Register

This starter feature is a lightweight project register with a clean Material Design-style UI and **SQLite persistence**.

## Included capabilities

- Add a project with:
  - Project name
  - Client name
  - Project lead (internal)
  - Client contact
  - Start date
  - End date
- Edit existing projects
- Delete projects
- Persist projects to SQLite (`projects.db`)
- Basic date validation (start date cannot be after end date)

## Run locally

```bash
python3 server.py
```

Then open `http://localhost:8000`.

## Tech choice

- Front-end: Materialize CSS (Material Design-like UI framework) via CDN
- Back-end: Python standard-library HTTP server + SQLite (`sqlite3`)
