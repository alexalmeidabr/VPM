import db

from datetime import datetime


def fetch_project_budgets(conn, project_id):
  return conn.execute(
    '''
    SELECT id, project_id, budget_name, budget_type, status, start_date, end_date, amount, currency, notes, created_at, updated_at
    FROM project_budgets
    WHERE project_id = ?
    ORDER BY start_date, id
    ''',
    (project_id,)
  ).fetchall()


def list_project_budgets(conn, project_id):
  return fetch_project_budgets(conn, project_id)


def budget_counts_for_totals(status):
  return str(status or '').strip().lower() in {'approved', 'closed'}


def budget_monthly_allocation_rows(iterate_months_between, working_days_between, start_date, end_date, amount):
  allocations = []
  amount = float(amount or 0.0)
  if amount == 0 or not start_date or not end_date or end_date < start_date:
    return allocations
  month_ranges = []
  total_working_days = 0
  for month_start, month_end in iterate_months_between(start_date, end_date):
    overlap_start = max(start_date, month_start.isoformat())
    overlap_end = min(end_date, month_end.isoformat())
    if overlap_end < overlap_start:
      continue
    working_days = working_days_between(overlap_start, overlap_end)
    if working_days <= 0:
      continue
    month_key = month_start.strftime('%Y-%m')
    month_ranges.append((month_key, month_start.strftime('%b %Y'), working_days))
    total_working_days += working_days
  if total_working_days <= 0 and month_ranges:
    share = amount / len(month_ranges)
    return [(month_key, month_label, share) for month_key, month_label, _ in month_ranges]
  for month_key, month_label, working_days in month_ranges:
    allocations.append((month_key, month_label, amount * working_days / total_working_days))
  return allocations


def calculate_fixed_price_budget_summary(conn, project_id):
  budgets = fetch_project_budgets(conn, project_id)
  initial_budget = 0.0
  approved_extensions = 0.0
  total_approved = 0.0
  committed_rows = []
  for row in budgets:
    if budget_counts_for_totals(row['status']):
      committed_rows.append(row)
      amount = float(row['amount'] if row['amount'] is not None else 0.0)
      total_approved += amount
      if str(row['budget_type'] or '').strip().lower() == 'extension':
        approved_extensions += amount
      else:
        initial_budget += amount
  coverage_start = min((row['start_date'] for row in committed_rows if row['start_date']), default=None)
  coverage_end = max((row['end_date'] for row in committed_rows if row['end_date']), default=None)
  coverage_label = f'{coverage_start} → {coverage_end}' if coverage_start and coverage_end else 'No approved budget periods'
  return {
    'initialBudget': initial_budget,
    'approvedExtensions': approved_extensions,
    'totalApprovedBudget': total_approved,
    'coverageStartDate': coverage_start,
    'coverageEndDate': coverage_end,
    'coverageLabel': coverage_label,
    'budgets': budgets
  }


def create_project_budget(conn, project_id, budget_name, budget_type, status, start_date, end_date, amount, currency, notes):
  cursor = conn.execute(
    '''
    INSERT INTO project_budgets (project_id, budget_name, budget_type, status, start_date, end_date, amount, currency, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (project_id, budget_name, budget_type, status, start_date, end_date, amount, currency, notes)
  )
  return db.get_last_insert_id(cursor, conn)


def get_project_budget(conn, budget_id):
  return conn.execute(
    '''
    SELECT pb.id, p.project_type
    FROM project_budgets pb
    JOIN projects p ON p.id = pb.project_id
    WHERE pb.id = ?
    ''',
    (budget_id,)
  ).fetchone()


def update_project_budget(conn, budget_id, budget_name, budget_type, status, start_date, end_date, amount, currency, notes):
  conn.execute(
    '''
    UPDATE project_budgets
    SET budget_name = ?, budget_type = ?, status = ?, start_date = ?, end_date = ?, amount = ?, currency = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''',
    (budget_name, budget_type, status, start_date, end_date, amount, currency, notes, budget_id)
  )


def delete_project_budget(conn, budget_id):
  cursor = conn.execute('DELETE FROM project_budgets WHERE id = ?', (budget_id,))
  return cursor.rowcount
