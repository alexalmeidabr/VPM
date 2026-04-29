# Azure SQL Compatibility Audit (Phase 2A + 2B + current pass)

## 1) Executive summary

The backend supports connection-mode selection (`DATABASE_TYPE=sqlite|azure_sql`) and now includes incremental runtime portability improvements.

This pass focused on two areas:
1. expanding insert-id portability pattern usage across key create flows,
2. continuing targeted runtime SQL portability in holiday/timesheet runtime paths.

Azure SQL is still **not fully runtime-ready** yet, but major preparatory blockers have been reduced.

## 2) Runtime blockers improved in this pass

### A) Insert-id portability pattern expanded
The following create flows were updated to use `db.get_last_insert_id(cursor, conn)` instead of direct `cursor.lastrowid` access:

- `repositories/holidays_repository.py`
  - `ensure_holiday_location`
  - `create_holiday_location`
- `repositories/timesheets_repository.py`
  - `create_manual_line`
- `repositories/project_files_repository.py`
  - `create_project_file`
- `repositories/invoices_repository.py`
  - `create_invoice`
  - `create_invoice_payment`
- `repositories/budgets_repository.py`
  - `create_project_budget`
- `repositories/company_branches_repository.py`
  - `create_company_branch`
- `repositories/business_partners_repository.py`
  - `create_business_partner` (+ contact insert linkage)
- `repositories/consultants_repository.py`
  - `create_consultant`
- `repositories/projects_repository.py`
  - `create_project`
  - phase ID mappings during project create/update flows
- `repositories/allocation_simulations_repository.py`
  - `create_allocation_simulation`

Notes:
- SQLite behavior is preserved.
- Azure insert-id retrieval is still not universally implemented end-to-end; helper use now makes remaining work explicit and centralized.

### B) Runtime upsert/NULL portability from previous phase remains in place
- Timesheet upsert runtime paths have backend-aware branching.
- Holiday upsert runtime paths have backend-aware branching.
- Holiday runtime null comparisons use portable NULL-safe predicates.

## 3) Remaining blockers before Azure runtime testing

| Area | Remaining issue | Recommended next action |
|---|---|---|
| insert-id semantics | helper currently fails clearly when backend/cursor cannot provide `lastrowid`; Azure-safe SQL (`OUTPUT INSERTED.id`) still needs rollout per create path | implement backend-specific insert-id SQL in high-priority create flows |
| runtime SQL portability | selected inline/runtime queries may still rely on SQLite function/behavior assumptions | continue endpoint-group runtime SQL review and replace non-portable constructs |
| operational feature parity | backup/restore and sqlite maintenance logic remain SQLite-only | keep SQLite-only for now; explicitly disable/branch in Azure operational mode later |

## 4) Must change before Azure schema creation/migration

| File/Area | Issue summary | Next action |
|---|---|---|
| `server.py` bootstrap/migrations | SQLite DDL (`executescript`), `PRAGMA table_info`, `AUTOINCREMENT`, SQLite metadata assumptions | create dedicated Azure schema/migration scripts and migration workflow |

## 5) Runtime query groups reviewed in this pass

- **Group A (holiday runtime)**: reviewed/kept Phase 2B portability fixes in place.
- **Group B (timesheet runtime)**: reviewed/kept Phase 2B portability fixes in place.
- **Group C (invoices/budgets/project files create-read)**: create-path insert-id portability pattern applied.
- **Group D (consultants/projects/business partners/company branches/allocation simulations create flows)**: create-path insert-id portability pattern applied.

## 6) Recommended next phase (runtime portability continuation)

1. Prioritize Azure-safe insert-id rollout (`OUTPUT INSERTED.id`) for create endpoints exercised most often.
2. Continue targeted runtime SQL portability by endpoint family (remaining inline SQL + repository queries).
3. Keep behavior parity checks in SQLite for every portability change.

---

This document intentionally does **not** claim full Azure runtime readiness. It records incremental runtime portability progress and the remaining blockers for the next phases.
