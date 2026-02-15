# VPM Starter Feature: Project & Consultant Management

This starter feature includes SQLite-backed management for projects, consultants, and administration lists.

## Included capabilities

- Left-side navigation menu:
  - Projects
  - Consultants
  - Mass Update (menu placeholder)
  - Authorization (menu placeholder)
  - Administration
- Projects workflow with on-demand **Manage Project** form
- Manager selected from existing consultants
- Project members panel and assignments
- Manage Consultants with:
  - Name
  - Area (from Administration Areas list)
  - Role (multi-select from Administration Roles list)
  - Salary
- Administration maintenance:
  - Manage Roles list
  - Manage Areas list
- Initial preloaded Roles and Areas
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
- `GET/POST /api/roles`
- `DELETE /api/roles/:id`
- `GET/POST /api/areas`
- `DELETE /api/areas/:id`
