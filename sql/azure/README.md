# Azure SQL schema preparation

These scripts are prepared for a future Azure SQL setup of the VPM / Inhouse PSA backend.
They are **not** executed automatically by the local application, and they do not replace the
current SQLite bootstrap in `server.py`.

Current local behavior remains unchanged:

- SQLite is still the default database when `DATABASE_TYPE` is unset.
- `init_db()` remains the local SQLite schema/bootstrap path.
- No Azure connection or deployment is performed by these scripts.
- Live Azure SQL validation is still pending.

Suggested execution order when an Azure SQL database is available:

1. `001_schema.sql`
2. `002_seed_reference_data.sql`

The schema script intentionally keeps app-facing table and column names aligned with the current
SQLite schema. Date-only values are stored as `NVARCHAR(10)` in `YYYY-MM-DD` format for now because
the current application code treats them as strings in several validation, comparison, and JSON
serialization paths. Timestamp audit fields use `DATETIME2` with `SYSUTCDATETIME()` defaults.

Some Azure SQL foreign-key delete actions intentionally differ from SQLite. SQL Server can reject
`ON DELETE CASCADE` / `ON DELETE SET NULL` chains that create multiple cascade paths, so selected
risky relationships use `ON DELETE NO ACTION` in `001_schema.sql`. Cleanup for those cases may remain
handled by application-level delete logic or be revisited during later Azure migration hardening.
