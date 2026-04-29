# Azure SQL Compatibility Audit (Phase 2A/2B/2C + runtime query family review)

## 1) Executive summary

Connection-mode support exists (`sqlite` default, `azure_sql` optional), and insert-id portability for active create flows is substantially improved.

This phase reviewed runtime SQL portability by endpoint/repository families and applied only low-risk query portability fixes.

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

## 4) Remaining runtime portability risks

| Area | Remaining issue | Recommended next action |
|---|---|---|
| inline server runtime SQL | some runtime inline queries still use SQLite-specific syntax patterns (e.g. `LIMIT` in selected server paths) | continue targeted server inline runtime SQL pass by endpoint family |
| non-create runtime SQL breadth | selected queries may still rely on SQLite tolerance/behavior | continue incremental repository + server runtime query review during Azure test hardening |
| pyodbc row-shape expectations | codebase broadly assumes dict-style row access (`row['col']`) while pyodbc row handling differs | introduce a safe row-shaping abstraction for azure mode before broad runtime testing |

## 5) Still intentionally deferred (not in this phase)

- schema/bootstrap portability (`init_db`, `executescript`, `PRAGMA table_info`, `AUTOINCREMENT`)
- backup/restore and SQLite operational tooling
- Azure schema creation/migration scripts

## 6) Current readiness statement

- Connection-mode: available
- Active create inserted-id handling: substantially improved with explicit Azure paths
- Runtime query portability: improved incrementally, but still incomplete
- Schema/migration readiness: deferred to later phase

---

This document intentionally does **not** claim full Azure runtime readiness. It records concrete runtime portability progress and remaining blockers.
