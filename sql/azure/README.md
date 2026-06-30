# Azure SQL schema preparation

These scripts are prepared for a future Azure SQL setup of the VPM / Inhouse PSA backend.
They are **not** executed automatically by the local application, and they do not replace the
current SQLite bootstrap in `server.py`.

Current local behavior remains unchanged:

- SQLite is still the default database when `DATABASE_TYPE` is unset.
- `init_db()` remains the local SQLite schema/bootstrap path.
- No Azure connection or deployment is performed by these scripts.
- Live Azure SQL validation is in progress and may still require additional script hardening.

## Choose the setup path first

There are two intended Azure SQL setup paths. Choose one before running any seed or migration step.

### Path A — Fresh empty Azure app with no SQLite import

Use this path only when the Azure SQL app should start with empty transactional data and default
reference/master data:

1. Run `001_schema.sql`.
2. Run `002_seed_reference_data.sql`.

### Path B — Existing SQLite `projects.db` migration

Use this path when importing an existing local SQLite database and preserving its primary keys and
foreign-key relationships:

1. Run `001_schema.sql` only.
2. Do **not** run `002_seed_reference_data.sql` before migration.
3. Run `tools/migrate_sqlite_to_azure_sql.py --source projects.db --dry-run` and review the output.
4. After testing against a dev/test Azure SQL database, run the migration with `--migrate --yes`.

The migration helper brings the existing reference/master data from SQLite and preserves IDs using
`IDENTITY_INSERT`. If seed/reference data is already present in the Azure target, the helper fails
fast rather than silently duplicating rows or changing IDs.

The schema script intentionally keeps app-facing table and column names aligned with the current
SQLite schema. Date-only values are stored as `NVARCHAR(10)` in `YYYY-MM-DD` format for now because
the current application code treats them as strings in several validation, comparison, and JSON
serialization paths. Timestamp audit fields use `DATETIME2` with `SYSUTCDATETIME()` defaults.

Some Azure SQL foreign-key delete actions intentionally differ from SQLite. SQL Server can reject
`ON DELETE CASCADE` / `ON DELETE SET NULL` chains that create multiple cascade paths, so selected
risky relationships use `ON DELETE NO ACTION` in `001_schema.sql`. Cleanup for those cases may remain
handled by application-level delete logic or be revisited during later Azure migration hardening.

## Rerunning after a partially failed DEV schema attempt

If `001_schema.sql` partially failed while testing against an empty DEV Azure SQL database, drop the
partially created tables before rerunning the corrected schema script. SQL Server may have created the
earlier independent tables before stopping at a later foreign-key error, and rerunning the script over
that partial state can cause confusing "object already exists" failures.

For an existing SQLite `projects.db` migration, rerun only `001_schema.sql` after cleanup. Do **not**
run `002_seed_reference_data.sql` before the migration helper, because the migration brings the
reference/master rows from SQLite and preserves their IDs.

## Data migration helper

A one-time SQLite-to-Azure-SQL migration helper has been prepared at
`tools/migrate_sqlite_to_azure_sql.py`. It is not run by the app and should be used only after the
Azure SQL schema has been created. Start with dry-run mode locally, then test against a dev/test Azure
SQL database before any production cutover. The helper has **not** been live-tested against Azure SQL
yet. Existing file storage folders such as `project-files/`, `company-logo/`, and `backups/` are
outside the database migration scope and require separate handling later. See `MIGRATION.md` for
details.
