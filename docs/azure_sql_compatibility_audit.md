# Azure SQL Compatibility Audit (Phase 2A + 2B status)

## 1) Executive summary

The backend now supports **connection-mode selection** (`DATABASE_TYPE=sqlite|azure_sql`) in `db.py`, with SQLite still default.

Phase 2B introduced low-risk runtime portability prep for key blockers:
- targeted runtime upserts in timesheets/holidays now have backend-aware paths,
- holiday null-comparison patterns (`IS ?`) were replaced with portable NULL-safe predicates,
- a small insert-id compatibility helper was added in `db.py` for future rollout.

The system is still **not fully Azure runtime-ready**. Many routes/repositories still rely on SQLite SQL semantics and `lastrowid` patterns.

## 2) Must change before Azure runtime testing (remaining)

| File | Function/Area | Issue summary | Recommended next action |
|---|---|---|---|
| `server.py` + multiple repositories | many POST/create flows | Widespread reliance on `cursor.lastrowid` semantics. | Migrate repository create paths to backend-safe insert-id retrieval (`OUTPUT INSERTED.id` for azure_sql). |
| `repositories/*` (multiple) | create helpers | Many create methods still return `cursor.lastrowid` directly. | Incrementally switch to a shared insert-id helper strategy per repository. |
| `server.py` runtime SQL | selected inline SQL | Some runtime SQL remains SQLite-biased and unreviewed for SQL Server syntax/function differences. | Continue targeted runtime query audit per endpoint group in Phase 2C runtime pass. |

## 3) Must change before Azure schema creation/migration

| File | Function/Area | Issue summary | Recommended next action |
|---|---|---|---|
| `server.py` | `init_db()` | SQLite DDL via `executescript` with SQLite types/defaults and constraints. | Create separate Azure schema scripts/migrations. |
| `server.py` | `ensure_column()` | Uses `PRAGMA table_info(...)` + SQLite `ALTER TABLE` assumptions. | Replace with backend-aware migration mechanism for Azure. |
| `server.py` | table definitions | Uses `INTEGER PRIMARY KEY AUTOINCREMENT` and SQLite-oriented defaults. | Map identity/PK/default semantics to SQL Server equivalents in migration scripts. |
| `server.py` | seeded/DDL assumptions | SQLite-specific metadata and schema version practices (`PRAGMA user_version`). | Implement Azure migration/version tracking strategy. |

## 4) Can remain SQLite-only for now

| File | Function/Area | Reason it can stay SQLite-only now | Next action |
|---|---|---|---|
| `server.py` | backup/restore (`connection.backup`, safety snapshots) | Local operational feature, not required for first Azure runtime endpoint validation. | Keep SQLite-only for now. |
| `server.py` | integrity checks (`PRAGMA integrity_check`, `sqlite_master`) | SQLite maintenance utilities. | Keep SQLite-only; add Azure operational equivalents later if needed. |
| `db.py` | `database_path` + `uri=True` override behavior | Explicit SQLite behavior used by restore/snapshot paths. | Keep guarded as sqlite-only. |

## 5) What Phase 2B addressed

1. **Timesheets runtime upserts** (`repositories/timesheets_repository.py`)
   - `ensure_monthly_timesheet`: SQLite keeps `ON CONFLICT DO NOTHING`; non-sqlite path uses exists-then-insert.
   - `update_entry`: SQLite keeps `ON CONFLICT DO UPDATE`; non-sqlite path uses update-then-insert.

2. **Holiday runtime upserts** (`repositories/holidays_repository.py`)
   - `upsert_holidays`, `upsert_holiday_cache`, `upsert_consultant_holiday_load` now branch:
     - SQLite keeps existing `ON CONFLICT` behavior.
     - Non-sqlite uses update-then-insert.

3. **NULL-comparison portability fix**
   - Replaced `region_code IS ?` runtime patterns with portable NULL-safe predicates in holiday lookup/cache paths.

4. **Insert-id compatibility pattern prep**
   - Added `db.get_last_insert_id(cursor, conn=None)` as a shared compatibility helper for future incremental adoption.

## 6) Recommended next steps (Phase 2C)

1. Expand insert-id strategy across all create repositories and remaining direct creates in `server.py`.
2. Continue endpoint-group runtime SQL portability pass for remaining non-portable SQL constructs.
3. Implement Azure schema/migration scripts and backend-aware migration/version workflow.
4. Add backend-targeted integration tests (sqlite baseline + azure_sql dry/runtime checks).

---

This document intentionally does **not** claim full Azure runtime readiness. Connection mode exists, and selected runtime blockers were reduced, but broader SQL portability and schema migration are still pending.
