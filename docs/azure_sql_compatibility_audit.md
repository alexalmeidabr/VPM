# Azure SQL Compatibility Audit (Phase 2A/2B/2C + runtime query family review)

## 1) Executive summary

Connection-mode support exists (`sqlite` default, `azure_sql` optional), insert-id portability for active create flows is substantially improved, Azure SQL row-shape normalization has been added in the database abstraction layer, and initial Azure SQL schema scripts have been prepared locally.

This phase reviewed runtime SQL portability by endpoint/repository families and applied only low-risk query portability fixes. A follow-up row-shape preparation step added a small Azure-only connection/cursor wrapper so future pyodbc `fetchone()`/`fetchall()` results are converted to dict-like rows.

The backend is closer to meaningful Azure runtime testing, but is **not fully Azure runtime-ready** yet.

## 2) Families reviewed in this phase

- **Group A**: projects / consultants / business partners
- **Group B**: timesheets / holidays
- **Group C**: revenue / invoices / budgets / profitability
- **Group D**: project files / allocation simulations / company branches / admin runtime paths

## 3) Runtime portability issues fixed in this phase

1. **Removed SQLite-specific `LIMIT 1` usage in consultant role/area lookups**
   - File: `repositories/consultants_repository.py`
   - Functions: `create_consultant`, `update_consultant`
   - Change: replaced `... WHERE id = ? LIMIT 1` with `... WHERE id = ?` (same result semantics by PK, better SQL Server portability).

2. **Revalidated and retained previous runtime portability fixes**
   - Timesheet runtime upsert branching (sqlite conflict vs non-sqlite update/insert)
   - Holiday runtime upsert branching
   - Holiday NULL-safe region comparisons
   - Explicit inserted-id SQL (`OUTPUT INSERTED.id`) in priority and active create flows


3. **Inline server runtime LIMIT cleanup completed for key paths**
   - `_invoice_print_html()` invoice lookup
   - `_consultant_has_project_manager_role()` existence check
   - `_project_payload_error()` checks for company branch/project type existence
   - Removed unnecessary `LIMIT 1` in these runtime queries to reduce SQLite-specific syntax usage.

4. **Azure SQL row-shape abstraction added**
   - File: `db.py`
   - SQLite mode still returns native `sqlite3.Row` objects through the existing `row_factory`.
   - Azure SQL mode now wraps pyodbc connections/cursors so `execute().fetchone()` returns `None` when no row exists or an `AzureSqlRow` with dict-style column access when a row is present.
   - Azure SQL mode now wraps `execute().fetchall()` results as a list of `AzureSqlRow` objects.
   - Column names come from `cursor.description`, so query aliases such as `SELECT c.name AS consultant_name` are preserved as `row['consultant_name']`.
   - Positional access is retained on `AzureSqlRow` for compatibility with existing insert-id handling that reads `row[0]`.
   - Azure row conversion also normalizes pyodbc scalar values that are not JSON-safe by default: `Decimal` values become floats, and `datetime`/`date`/`time` values become ISO-style strings.

5. **Initial Azure SQL schema scripts prepared**
   - Files: `sql/azure/001_schema.sql`, `sql/azure/002_seed_reference_data.sql`, `sql/azure/README.md`
   - The scripts translate the current SQLite schema/bootstrap reference data into SQL Server / Azure SQL DDL and seed statements.
   - Selected foreign keys use Azure-specific `ON DELETE NO ACTION` comments where SQL Server multiple cascade path errors are likely.
   - Holiday tables with nullable `region_code` use filtered unique indexes instead of table-level UNIQUE constraints to better match SQLite NULL/UNIQUE migration behavior.
   - `project_positions.daily_rate_currency` uses a wider Azure SQL text column because live migration found existing non-ISO placeholder values longer than three characters.
   - They are not executed automatically by the local app; live Azure SQL validation is in progress and has already identified multiple-cascade-path adjustments for the `projects -> business_partners` foreign keys.

6. **Initial SQLite-to-Azure migration helper prepared**
   - File: `tools/migrate_sqlite_to_azure_sql.py`
   - The script supports local dry-run/source inspection without Azure credentials and can later migrate to Azure SQL with explicit `--migrate --yes`.
   - It preserves SQLite IDs by enabling `IDENTITY_INSERT` one identity table at a time and uses a dependency-safe table order.
   - It is not end-to-end validated against Azure SQL, does not run automatically, and does not handle file storage folders such as `project-files/`, `company-logo/`, or `backups/`.
   - Live dev migration testing found SQL Server NULL/UNIQUE differences for holiday `region_code` data; the Azure schema was adjusted with filtered unique indexes.
   - The helper now uses chunked pyodbc `executemany()` inserts with progress output for large tables and explicit rollback handling for interruptions.

7. **Local validation helper and Azure SQL runbook prepared**
   - Files: `tools/validate_azure_sql_readiness.py`, `sql/azure/RUNBOOK.md`
   - The validation helper can run local SQLite integrity/table/column/count/orphan checks and static Azure SQL script checks without Azure credentials.
   - It also includes a future read-only Azure count comparison mode for dev/test use when `pyodbc` and Azure SQL credentials are available.
   - The runbook documents local pre-checks, fresh-vs-migration setup paths, a future dev/test Azure sequence, UI smoke tests, and known limitations.
   - No Azure deployment or live Azure validation has been performed.

## 4) Remaining runtime portability risks

| Area | Remaining issue | Recommended next action |
|---|---|---|
| inline server runtime SQL | key `LIMIT 1` runtime occurrences were removed in critical helper/validation paths; additional inline query portability review may still be needed in later passes | continue targeted server inline runtime SQL pass by endpoint family |
| non-create runtime SQL breadth | selected queries may still rely on SQLite tolerance/behavior | continue incremental repository + server runtime query review during Azure test hardening |
| pyodbc row-shape expectations | database abstraction now normalizes rows returned through `db.get_connection().execute(...).fetchone()/fetchall()` in Azure SQL mode, which covers the dominant application access pattern; Azure runtime validation is still pending | verify against a real Azure SQL/pyodbc connection and expand the wrapper only if future cursor usage patterns require it |
| Azure SQL schema scripts | initial scripts are prepared from the current SQLite schema and include multiple-cascade-path hardening, filtered unique indexes for nullable holiday `region_code`, and a widened `project_positions.daily_rate_currency`; DEV Azure validation is in progress and not complete | rerun corrected DDL in a clean dev Azure SQL database and continue adjusting only SQL Server-incompatible constraints |
| SQLite-to-Azure data migration | one-time migration helper is prepared with dry-run, target preflight, identity preservation, chunked inserts, rollback handling, and row-count validation; dev execution has started but failed on schema compatibility before completion | rerun against a clean dev Azure SQL database after schema validation |
| Azure SQL validation/runbook | local validation helper and runbook are prepared, but Azure validation mode and app runtime testing have not been run against Azure SQL | run validation helper and smoke-test runbook against dev Azure SQL |
| file storage migration | database migration does not move files from `project-files/`, `company-logo/`, or `backups/` | plan separate file/blob migration before production cutover |

## 5) Still intentionally deferred (not in this phase)

- schema/bootstrap portability (`init_db`, `executescript`, `PRAGMA table_info`, `AUTOINCREMENT`)
- backup/restore and SQLite operational tooling
- production file/blob migration for `project-files/`, `company-logo/`, and `backups/`

## 6) Row-shape implementation status

- **SQLite behavior**: unchanged. SQLite remains the default when `DATABASE_TYPE` is unset, and SQLite connections still use `sqlite3.Row` directly.
- **Azure SQL behavior**: prepared but not runtime-tested against Azure. In `DATABASE_TYPE=azure_sql`, `db.get_connection()` returns a lightweight wrapper around the pyodbc connection. The wrapper returns cursors whose `fetchone()` and `fetchall()` methods convert pyodbc rows into `AzureSqlRow` objects using `cursor.description`, with `Decimal` and Python date/time values normalized for existing JSON responses.
- **Risk status**: the previous pyodbc row-shape risk is partially reduced, not fully closed. It should make the existing `conn.execute(...).fetchone()` and `conn.execute(...).fetchall()` usage safer for dict-style access, but this has not been validated with live Azure SQL access.
- **Remaining limitations**: no Azure runtime testing has been performed; schema/bootstrap portability remains deferred; any future code that bypasses `db.get_connection()` or relies on pyodbc-specific cursor behavior may need additional review.

## 7) Azure SQL schema script status

- **Prepared files**: `sql/azure/001_schema.sql`, `sql/azure/002_seed_reference_data.sql`, and `sql/azure/README.md`.
- **Local behavior**: unchanged. SQLite remains the default local database, and `init_db()` is still the only schema/bootstrap path used by the local app.
- **Cascade-path hardening**: selected Azure SQL foreign keys use `ON DELETE NO ACTION` instead of SQLite's cascade/null action where SQL Server multiple cascade path rejection is likely, including both `FK_projects_client_business_partner` and `FK_projects_delivery_partner_business_partner` for the dual `projects -> business_partners` relationship. Cleanup may remain application-managed or be refined in a later migration hardening pass.
- **Nullable region uniqueness hardening**: holiday location/cache/load tables now use filtered unique indexes with `WHERE region_code IS NOT NULL` instead of normal table-level UNIQUE constraints involving nullable `region_code`, because SQL Server rejected migrated SQLite holiday rows with `NULL` `region_code`.
- **Text width hardening**: `project_positions.daily_rate_currency` is widened for Azure SQL because live migration found existing SQLite values longer than a strict 3-character ISO currency code.
- **Validation status**: in progress. DEV Azure SQL runs exposed multiple cascade path, nullable UNIQUE, and text-width differences, but the corrected scripts still need a clean rerun; full Azure schema readiness is not claimed.
- **Remaining limitations**: schema and seed scripts still need live Azure validation; future Azure testing may require type/constraint adjustments based on pyodbc behavior and SQL Server DDL validation.

## 8) SQLite-to-Azure migration helper status

- **Prepared file**: `tools/migrate_sqlite_to_azure_sql.py`.
- **Dry-run behavior**: can inspect the SQLite source locally, print tables found, row counts by table, migration order, missing-table warnings, and basic source orphan warnings without Azure credentials.
- **Migration safety**: actual migration requires `--migrate --yes`, Azure SQL environment variables, an Azure connection, an empty target preflight, parameterized inserts, and transaction rollback on failure.
- **Identity preservation**: identity tables use `SET IDENTITY_INSERT dbo.<table> ON/OFF` around explicit ID inserts, with only one identity table enabled at a time.
- **Insert execution**: inserts are chunked, use pyodbc `fast_executemany` when available, print progress for large tables, and roll back explicitly if interrupted.
- **Validation status**: live dev testing has started but has not completed successfully. Data migration readiness is improved by having a prepared script, but remains pending a clean end-to-end execution against a dev/test Azure SQL database.
- **Out of scope**: file storage folders (`project-files/`, `company-logo/`, `backups/`) are not migrated by this script.

## 9) Validation helper and runbook status

- **Prepared files**: `tools/validate_azure_sql_readiness.py` and `sql/azure/RUNBOOK.md`.
- **Local checks**: source existence, SQLite integrity check, SQLite foreign-key check, expected tables/columns, migration-table row counts, total row count, basic orphan checks, and project file row warnings.
- **Static SQL checks**: required Azure SQL scripts/docs exist, expected `CREATE TABLE` statements and identity tables are present, and blocked SQLite-only syntax is absent.
- **Future Azure checks**: optional read-only Azure mode can compare SQLite and Azure SQL row counts after credentials/connectivity exist.
- **Validation status**: local tooling is prepared, but live Azure validation and deployment remain pending.

## 10) Current readiness statement

- Connection-mode: available
- Active create inserted-id handling: substantially improved with explicit Azure paths
- Azure SQL row-shape abstraction: added in `db.py`, pending live Azure validation
- Azure SQL schema scripts: prepared locally, live dev validation in progress and not complete
- SQLite-to-Azure data migration helper: prepared locally, pending dev Azure validation
- Local validation helper and runbook: prepared locally, pending dev Azure validation
- Runtime query portability: improved incrementally, but still incomplete
- File storage migration readiness: deferred to later phase

---

This document intentionally does **not** claim full Azure runtime readiness. It records concrete runtime portability progress and remaining blockers.
