# Azure SQL dev/test validation runbook

## Current status

- This is local preparation only; no Azure deployment has been performed.
- SQLite remains the default local database when `DATABASE_TYPE` is unset.
- Azure SQL schema scripts and migration helpers are prepared, but live Azure SQL validation is still pending.
- Do not use these steps for production cutover until the full dev/test sequence succeeds.

## Setup paths

### Fresh empty Azure app

Use this path when starting with default reference data and no SQLite import:

1. Run `sql/azure/001_schema.sql`.
2. Run `sql/azure/002_seed_reference_data.sql`.
3. Start the app with `DATABASE_TYPE=azure_sql` only after dev/test validation.

### Existing SQLite `projects.db` migration

Use this path when importing an existing SQLite database:

1. Run `sql/azure/001_schema.sql` only.
2. Do **not** run `sql/azure/002_seed_reference_data.sql` before migration.
3. Run the local dry-run and review row counts/warnings.
4. Run the migration only against a dev/test Azure SQL database first.
5. Run Azure validation and UI smoke tests before considering production cutover.

## Local pre-check commands

```bash
python -m py_compile db.py server.py tools/migrate_sqlite_to_azure_sql.py tools/validate_azure_sql_readiness.py
python tools/validate_azure_sql_readiness.py --source projects.db --local
python tools/validate_azure_sql_readiness.py --check-sql-scripts
python tools/migrate_sqlite_to_azure_sql.py --source projects.db --dry-run
```

The validation helper defaults to local SQLite + static SQL script checks if no mode is provided.

## Future Azure SQL dev/test sequence

1. Create the Azure SQL Server and Azure SQL Database.
2. Configure firewall/network access from the local PC or test runner.
3. Set Azure SQL environment variables:
   - `AZURE_SQL_SERVER`
   - `AZURE_SQL_DATABASE`
   - `AZURE_SQL_USERNAME`
   - `AZURE_SQL_PASSWORD`
   - `AZURE_SQL_DRIVER` if the default ODBC driver name is not correct.
4. Run `sql/azure/001_schema.sql`.
5. If migrating existing SQLite data, do **not** run `002_seed_reference_data.sql`.
6. Run `python tools/migrate_sqlite_to_azure_sql.py --source projects.db --dry-run`.
7. Run `python tools/migrate_sqlite_to_azure_sql.py --source projects.db --migrate --yes` against dev/test only.
8. Run `python tools/validate_azure_sql_readiness.py --source projects.db --azure`.
9. Start the app locally with `DATABASE_TYPE=azure_sql` and the Azure SQL environment variables.
10. Perform UI smoke tests.

## UI smoke-test checklist

- Open Consultants.
- Open Projects.
- Open Business Partners.
- Open Timesheets.
- Open Revenue / Invoices if available.
- Open one existing consultant.
- Open one existing project.
- Create, edit, and delete a small test item in Azure dev/test only.
- Verify project files behavior separately because file bytes are not migrated by the database migration.

## Known limitations

- Schema scripts are not live-tested against Azure SQL yet.
- The migration helper is not live-tested against Azure SQL yet.
- Runtime query portability is improved but still incomplete.
- Backup/restore remains SQLite-specific.
- File folders `project-files/`, `company-logo/`, and `backups/` require a separate migration/storage plan.
- Production cutover should happen only after successful dev/test schema, migration, validation, app runtime, and UI smoke testing.
