# VPM Starter Feature: Project & Consultant Management

This starter feature includes SQLite-backed management for projects, consultants, and administration catalogs.

## Included capabilities

- Left-side navigation menu:
  - Projects
  - Consultants
  - Mass Update (placeholder)
  - Authorization (placeholder)
  - Administration
- Projects panel with:
  - table view
  - `View` action (read-only Manage Project mode)
  - horizontal action icons
  - `Add a New Project` workflow
- Manage Project form includes:
  - Project name
  - Client name
  - Type (`Time Material`, `Fixed Price`)
  - Manager (only consultants with role `Project Manager`)
  - Client contact
  - Start / End date
  - Member area filter + consultant assignment by area
- Project Members panel stays on the right side (only while Manage Project is open) and shows member name + role(s)
- Consultants panel with hidden-by-default Manage Consultants form and `Add New Consultant` button
- Manage Consultants supports:
  - multiple Areas per consultant
  - multiple Roles per consultant
- Administration supports maintaining Roles and Areas lists
- Initial seeded roles and areas are created automatically

## Run locally

```bash
python3 server.py
```

Then open `http://localhost:8000`.

## Database configuration

- Backend database access is centralized in `db.py`.
- Current supported backend is SQLite only.
- By default, SQLite uses `projects.db` in the project root.
- Set `DATABASE_PATH` to point to a different SQLite file if needed.
- `DATABASE_TYPE` defaults to `sqlite`; any other value currently raises an unsupported database type error.
- Future Azure SQL support should be implemented behind the same `db.py` interface without changing API routes/contracts.

## API endpoints

- `GET/POST /api/projects`
- `PUT/DELETE /api/projects/:id`
- `GET/POST /api/consultants`
- `PUT/DELETE /api/consultants/:id`
- `GET/POST /api/roles`
- `DELETE /api/roles/:id`
- `GET/POST /api/areas`
- `DELETE /api/areas/:id`
