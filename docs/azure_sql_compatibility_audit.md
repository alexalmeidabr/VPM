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

5. **Initial Azure SQL schema scripts prepared**
   - Files: `sql/azure/001_schema.sql`, `sql/azure/002_seed_reference_data.sql`, `sql/azure/README.md`
   - The scripts translate the current SQLite schema/bootstrap reference data into SQL Server / Azure SQL DDL and seed statements.
   - They are not executed automatically by the local app and have not been validated against a live Azure SQL database.

## 4) Remaining runtime portability risks

| Area | Remaining issue | Recommended next action |
|---|---|---|
| inline server runtime SQL | key `LIMIT 1` runtime occurrences were removed in critical helper/validation paths; additional inline query portability review may still be needed in later passes | continue targeted server inline runtime SQL pass by endpoint family |
| non-create runtime SQL breadth | selected queries may still rely on SQLite tolerance/behavior | continue incremental repository + server runtime query review during Azure test hardening |
| pyodbc row-shape expectations | database abstraction now normalizes rows returned through `db.get_connection().execute(...).fetchone()/fetchall()` in Azure SQL mode, which covers the dominant application access pattern; Azure runtime validation is still pending | verify against a real Azure SQL/pyodbc connection and expand the wrapper only if future cursor usage patterns require it |
| Azure SQL schema scripts | initial scripts are prepared from the current SQLite schema, but have not been executed against Azure SQL | validate DDL and seed scripts in an Azure SQL database when access is available |

## 5) Still intentionally deferred (not in this phase)

- schema/bootstrap portability (`init_db`, `executescript`, `PRAGMA table_info`, `AUTOINCREMENT`)
- backup/restore and SQLite operational tooling
- SQLite-to-Azure data migration scripts

## 6) Row-shape implementation status

- **SQLite behavior**: unchanged. SQLite remains the default when `DATABASE_TYPE` is unset, and SQLite connections still use `sqlite3.Row` directly.
- **Azure SQL behavior**: prepared but not runtime-tested against Azure. In `DATABASE_TYPE=azure_sql`, `db.get_connection()` returns a lightweight wrapper around the pyodbc connection. The wrapper returns cursors whose `fetchone()` and `fetchall()` methods convert pyodbc rows into `AzureSqlRow` objects using `cursor.description`.
- **Risk status**: the previous pyodbc row-shape risk is partially reduced, not fully closed. It should make the existing `conn.execute(...).fetchone()` and `conn.execute(...).fetchall()` usage safer for dict-style access, but this has not been validated with live Azure SQL access.
- **Remaining limitations**: no Azure runtime testing has been performed; schema/bootstrap portability remains deferred; any future code that bypasses `db.get_connection()` or relies on pyodbc-specific cursor behavior may need additional review.

## 7) Azure SQL schema script status

- **Prepared files**: `sql/azure/001_schema.sql`, `sql/azure/002_seed_reference_data.sql`, and `sql/azure/README.md`.
- **Local behavior**: unchanged. SQLite remains the default local database, and `init_db()` is still the only schema/bootstrap path used by the local app.
- **Validation status**: static local review only. The scripts have not been run against Azure SQL, so full Azure schema readiness is not claimed.
- **Remaining limitations**: migration of existing SQLite data is not implemented; future Azure testing may require type/constraint adjustments based on pyodbc behavior and SQL Server DDL validation.

## 8) Current readiness statement

- Connection-mode: available
- Active create inserted-id handling: substantially improved with explicit Azure paths
- Azure SQL row-shape abstraction: added in `db.py`, pending live Azure validation
- Azure SQL schema scripts: prepared locally, pending live Azure validation
- Runtime query portability: improved incrementally, but still incomplete
- Data migration readiness: deferred to later phase

---

This document intentionally does **not** claim full Azure runtime readiness. It records concrete runtime portability progress and remaining blockers.
