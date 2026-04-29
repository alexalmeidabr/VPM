# Azure SQL Compatibility Audit (Phase 2A)

## 1) Executive summary

The backend now supports **connection-mode selection** (`DATABASE_TYPE=sqlite|azure_sql`) in `db.py`, with SQLite still default.

However, runtime SQL and operational code remain largely SQLite-shaped. This is expected at this stage. Azure SQL support is **not runtime-ready yet**: this phase documents blockers and isolates low-risk preparation points without changing behavior.

## 2) Must change before Azure runtime testing

These items can break API runtime paths when `DATABASE_TYPE=azure_sql`.

| File | Function/Area | Issue summary | Recommended next action |
|---|---|---|---|
| `repositories/timesheets_repository.py` | `ensure_monthly_timesheet`, `update_entry` | Uses SQLite upsert syntax (`ON CONFLICT ... DO NOTHING/DO UPDATE`). | Replace with Azure-compatible merge/upsert strategy (Phase 2B). |
| `repositories/holidays_repository.py` | `upsert_holidays`, `upsert_holiday_cache`, `upsert_consultant_holiday_load` | Uses SQLite `ON CONFLICT ... DO UPDATE`. | Replace with Azure-compatible upsert (`MERGE` or update-then-insert pattern). |
| `server.py` + repositories | many POST/create flows | Widespread reliance on `cursor.lastrowid` semantics. Azure SQL uses different identity retrieval behavior. | Introduce repository-level insert-id strategy for Azure (`OUTPUT INSERTED.id` or SCOPE_IDENTITY wrapper). |
| `repositories/holidays_repository.py` | null-sensitive lookups | Uses `region_code IS ?` placeholder semantics that are SQLite-specific in practice. | Replace with explicit `(region_code IS NULL AND ? IS NULL) OR region_code = ?` pattern for portability. |
| `db.py` helper methods | `execute()` | Returns `lastrowid` fallback; semantics differ in Azure. | Add backend-specific insert-id handling before Azure CRUD runtime tests. |

## 3) Must change before Azure schema creation/migration

These items are schema/bootstrap specific and must be handled before provisioning Azure schema.

| File | Function/Area | Issue summary | Recommended next action |
|---|---|---|---|
| `server.py` | `init_db()` | SQLite DDL via `executescript` with SQLite types/defaults and constraints. | Create separate Azure schema scripts/migrations (Phase 2C). |
| `server.py` | `ensure_column()` | Uses `PRAGMA table_info(...)` + SQLite `ALTER TABLE` assumptions. | Replace with backend-aware migration mechanism for Azure. |
| `server.py` | table definitions | Uses `INTEGER PRIMARY KEY AUTOINCREMENT` and SQLite-oriented defaults. | Map identity/PK/default semantics to SQL Server equivalents in migration scripts. |
| `server.py` | seeded/DDL assumptions | SQLite-specific metadata and schema version practices (`PRAGMA user_version`). | Implement Azure migration/version tracking strategy. |

## 4) Can remain SQLite-only for now

These are operational/local utilities and can stay SQLite-only during initial Azure runtime preparation.

| File | Function/Area | Reason it can stay SQLite-only now | Next action |
|---|---|---|---|
| `server.py` | backup/restore (`connection.backup`, safety snapshots) | Intended for local SQLite operations and not required for first Azure runtime endpoint tests. | Keep SQLite-only; optionally disable/hide in Azure mode later. |
| `server.py` | integrity checks / table checks (`PRAGMA integrity_check`, `sqlite_master`) | SQLite maintenance utilities. | Keep SQLite-only; add Azure-specific operational checks later if needed. |
| `db.py` | `database_path` + `uri=True` override behavior | Explicitly SQLite connection behavior and useful for local restore flows. | Keep as-is; already guarded for azure mode. |

## 5) Low-risk preparation changes completed in Phase 2A

1. Added tiny backend helper flags in `db.py`:
   - `is_sqlite()`
   - `is_azure_sql()`
2. Updated server startup guard to use `db.is_sqlite()` for SQLite bootstrap.

These are no-behavior-change refactors in SQLite mode and improve clarity for future backend branching.

## 6) Recommended next steps (Phase 2B / 2C)

### Phase 2B (runtime SQL portability)
1. Replace all SQLite `ON CONFLICT` runtime upserts with backend-aware repository strategies.
2. Standardize insert-id retrieval for Azure-safe behavior (repository-level abstraction).
3. Eliminate SQLite-specific null-comparison patterns (`IS ?`) in runtime SQL.
4. Add backend-aware tests for key CRUD paths (timesheets, holidays, invoices, project files, consultants/projects).

### Phase 2C (schema and migration)
1. Introduce explicit Azure SQL schema creation/migration scripts.
2. Map SQLite DDL semantics to SQL Server (`IDENTITY`, datetime defaults, constraints/indexes).
3. Add migration/versioning process independent from SQLite `PRAGMA` workflows.

---

This audit intentionally does **not** claim Azure runtime readiness yet. Connection mode exists; SQL portability and schema migration remain pending.
