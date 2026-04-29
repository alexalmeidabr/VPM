# Azure SQL Compatibility Audit (Phase 2A/2B/2C runtime prep)

## 1) Executive summary

Connection-mode support exists (`sqlite` default, `azure_sql` optional), and runtime portability work has progressed in phases.

This Phase 2C pass implemented **real Azure-safe inserted-id SQL paths** (`OUTPUT INSERTED.id`) for priority create flows while keeping SQLite behavior unchanged.

The backend is still not fully Azure runtime-ready, but key create-path blocker risk is now significantly reduced.

## 2) What Phase 2C addressed

### A) Real Azure-safe insert-id retrieval added (priority flows)
The following create flows now use backend-aware insert SQL via `db.execute_insert_and_get_id(...)`:

- `repositories/projects_repository.py`
  - `create_project`
  - phase inserts in `create_project` / `update_project` phase mapping paths
- `repositories/consultants_repository.py`
  - `create_consultant`
- `repositories/business_partners_repository.py`
  - `create_business_partner`
  - `_replace_contacts` contact insert
- `repositories/invoices_repository.py`
  - `create_invoice`
  - `create_invoice_payment`
- `repositories/timesheets_repository.py`
  - `create_manual_line`
- `repositories/holidays_repository.py`
  - `create_holiday_location`
  - insert path in `ensure_holiday_location`

SQLite path: unchanged (`lastrowid` behavior preserved through helper).  
Azure path: explicit `OUTPUT INSERTED.id` retrieval.

### B) Runtime query group review status
- **Group A (projects/consultants/business partners)**: reviewed and priority create paths upgraded to explicit inserted-id SQL.
- **Group B (timesheets/holidays)**: prior Phase 2B upsert/null portability retained; create-path inserted-id upgraded.
- **Group C (invoices/budgets/project files/allocation simulations/company branches)**:
  - invoices, budgets, project files, company branches, and allocation simulations create flows upgraded to explicit inserted-id SQL.
  - active server-side catalog/availability create endpoints upgraded to backend-aware insert-id retrieval.

## 3) Remaining runtime blockers before meaningful Azure runtime testing

| Area | Remaining issue | Recommended next action |
|---|---|---|
| insert-id handling in remaining low-touch create paths | most active repository/server create flows now use explicit inserted-id SQL; some low-priority paths may still need explicit review | continue incremental sweep and convert any remaining helper-only paths |
| runtime SQL portability breadth | selected non-create runtime queries still may rely on SQLite behavior/functions | continue endpoint-group runtime query review and patch non-portable constructs |
| operational parity | backup/restore and SQLite maintenance utilities remain SQLite-only by design | keep deferred until Azure operational phase |

## 4) Must change before Azure schema creation/migration

| File/Area | Issue summary | Next action |
|---|---|---|
| `server.py` bootstrap/migrations | SQLite DDL (`executescript`), `PRAGMA table_info`, `AUTOINCREMENT`, SQLite metadata assumptions | implement dedicated Azure schema/migration scripts and migration workflow |

## 5) Recommended next step

1. Finish explicit `OUTPUT INSERTED.id` rollout for any remaining helper-only create paths not covered by active endpoints.
2. Continue runtime query portability review by endpoint family.
3. Maintain SQLite parity validation for each portability patch.

---

This document does **not** claim full Azure runtime readiness. It records targeted, real progress on high-priority inserted-id and runtime portability blockers.
