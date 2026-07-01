# One-time SQLite to Azure SQL data migration

`tools/migrate_sqlite_to_azure_sql.py` is a prepared one-time migration helper for copying the
current SQLite `projects.db` data into a newly-created Azure SQL database after the Azure schema
scripts have been applied.

## Current status

- The script is prepared locally only.
- It is **not** executed automatically by the application.
- It has **not** been tested against live Azure SQL yet.
- SQLite remains the default local database and local runtime path.
- File storage folders such as `project-files/`, `company-logo/`, and `backups/` are outside this
  database migration and require separate handling later.

## Expected Azure target state

The safest target is an empty Azure SQL schema created by `sql/azure/001_schema.sql` with no data
loaded yet. The script preserves SQLite primary-key values by using `SET IDENTITY_INSERT` for tables
with identity primary keys, so pre-existing rows can conflict with incoming SQLite IDs.

If `002_seed_reference_data.sql` has already been run, the migration currently fails fast instead of
silently duplicating or overwriting seed/reference data. For an initial live migration, prefer an
empty schema or explicitly clear seed data before running the migration.

## Common commands

Dry-run locally without Azure credentials:

```bash
python tools/migrate_sqlite_to_azure_sql.py --source projects.db --dry-run
```

Validate row counts against Azure SQL after credentials and connectivity are available:

```bash
python tools/migrate_sqlite_to_azure_sql.py --source projects.db --validate-only
```

Run the one-time migration after reviewing dry-run output and testing against a dev/test Azure SQL
database:

```bash
python tools/migrate_sqlite_to_azure_sql.py --source projects.db --migrate --yes
```

## Azure SQL settings

Actual Azure modes use the same environment variables as `db.py`:

- `AZURE_SQL_SERVER`
- `AZURE_SQL_DATABASE`
- `AZURE_SQL_USERNAME`
- `AZURE_SQL_PASSWORD`
- `AZURE_SQL_DRIVER` (optional; defaults to `ODBC Driver 18 for SQL Server`)

These variables are not required for `--dry-run`.
