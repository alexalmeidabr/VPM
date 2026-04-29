# VPM Starter Feature: Project & Consultant Management

This starter feature includes project, consultant, and administration management with a default SQLite backend.

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

Database access is centralized in `db.py`.

- `DATABASE_TYPE` controls the backend mode and defaults to `sqlite`.
- SQLite remains the default/active backend for local use.

### SQLite mode (default)

- `DATABASE_TYPE=sqlite` (or unset).
- `DATABASE_PATH` controls the SQLite file path (default: `projects.db` in project root).
- Startup runs SQLite bootstrap/schema initialization (`init_db()`).
- Backup/restore flows are SQLite-specific.

### Azure SQL mode (connection mode only)

- `DATABASE_TYPE=azure_sql` enables Azure SQL connection mode in `db.py`.
- Required environment variables:
  - `AZURE_SQL_SERVER`
  - `AZURE_SQL_DATABASE`
  - `AZURE_SQL_USERNAME`
  - `AZURE_SQL_PASSWORD`
  - `AZURE_SQL_DRIVER` (optional; default: `ODBC Driver 18 for SQL Server`)
- In this mode, `server.py` skips SQLite bootstrap/schema initialization.
- Current Azure support is connection-layer preparation only: SQL dialect/schema/runtime compatibility is not fully migrated yet.
- Azure mode currently expects target schema/tables to already exist.

## API endpoints

- `GET/POST /api/projects`
- `PUT/DELETE /api/projects/:id`
- `GET/POST /api/consultants`
- `PUT/DELETE /api/consultants/:id`
- `GET/POST /api/roles`
- `DELETE /api/roles/:id`
- `GET/POST /api/areas`
- `DELETE /api/areas/:id`
