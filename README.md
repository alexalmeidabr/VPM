# VPM Starter Feature: Project & Consultant Management

This starter feature includes SQLite-backed management for both projects and consultants.

## Included capabilities

- **Projects section** with form title **Manage Project**
  - Project name
  - Client name
  - Project lead
  - Client contact
  - Start date / End date
  - Assign one or more consultants to each project
- **Consultants section** with form title **Manage Consultants**
  - Name
  - Area
  - Position
  - Salary
- Left-side navigation menu:
  - Projects
  - Consultants
- Full CRUD for projects and consultants
- SQLite persistence (`projects.db`)

## Run locally

```bash
python3 server.py
```

Then open `http://localhost:8000`.

## API endpoints

- `GET/POST /api/projects`
- `PUT/DELETE /api/projects/:id`
- `GET/POST /api/consultants`
- `PUT/DELETE /api/consultants/:id`
