# VPM Starter Feature: Project & Consultant Management

This starter feature includes SQLite-backed management for both projects and consultants.

## Included capabilities

- Left-side navigation menu:
  - Projects
  - Consultants
- **Projects** view with list + actions and an **Add a New Project** workflow
- **Manage Project** form (shown on demand) with:
  - Project name
  - Client name
  - Manager (selected from existing consultants)
  - Client contact
  - Start date / End date
  - Assigned consultants (project members)
  - Project Members side panel showing selected consultants
- **Manage Consultants** section with fields:
  - Name
  - Area
  - Position
  - Salary
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
