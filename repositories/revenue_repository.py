def fetch_monthly_project_timesheet_hours_by_consultant(conn, project_id, month_start, month_from, month_to):
  rows = conn.execute(
    '''
    SELECT t.consultant_id, COALESCE(SUM(e.hours), 0) AS total_hours
    FROM monthly_timesheets t
    JOIN monthly_timesheet_lines l ON l.timesheet_id = t.id
    LEFT JOIN monthly_timesheet_entries e ON e.line_id = l.id
    WHERE l.project_id = ?
      AND t.month_start = ?
      AND (e.entry_date IS NULL OR (e.entry_date >= ? AND e.entry_date <= ?))
    GROUP BY t.consultant_id
    ''',
    (project_id, month_start, month_from, month_to)
  ).fetchall()
  return {int(row['consultant_id']): float(row['total_hours'] or 0.0) for row in rows if row['consultant_id'] is not None}


def project_active_assigned_positions_for_month(conn, project_id, month_start, month_end):
  return conn.execute(
    '''
    SELECT pp.id, pp.consultant_id, pp.project_role, pp.start_date, pp.end_date, pp.allocation, pp.billable, pp.daily_rate, pp.daily_rate_currency, c.name AS consultant_name
    FROM project_positions pp
    LEFT JOIN consultants c ON c.id = pp.consultant_id
    WHERE pp.project_id = ?
      AND pp.consultant_id IS NOT NULL
      AND COALESCE(pp.start_date, ?) <= ?
      AND COALESCE(pp.end_date, ?) >= ?
    ORDER BY pp.id
    ''',
    (project_id, month_end, month_end, month_start, month_start)
  ).fetchall()


def revenue_invoice_overlap_summary(conn, project_id, period_from, period_to):
  return conn.execute(
    '''
    SELECT COUNT(*) AS invoice_count, COALESCE(SUM(amount), 0) AS billed_total
    FROM invoices
    WHERE project_id = ?
      AND period_from <= ?
      AND period_to >= ?
    ''',
    (project_id, period_to, period_from)
  ).fetchone()


def get_monthly_timesheet_for_consultant(conn, consultant_id, month_start):
  return conn.execute(
    'SELECT id FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?',
    (consultant_id, month_start)
  ).fetchone()


def get_project_revenue_context(conn, project_id):
  return conn.execute(
    'SELECT id, start_date, end_date, project_type FROM projects WHERE id = ?',
    (project_id,)
  ).fetchone()


def get_project_type(conn, project_id):
  row = conn.execute('SELECT project_type FROM projects WHERE id = ?', (project_id,)).fetchone()
  return str(row['project_type'] or '').strip().lower() if row else ''


def list_project_positions_for_revenue_forecast(conn, project_id):
  return conn.execute(
    '''
    SELECT pp.id, pp.project_role, pp.consultant_id, pp.start_date, pp.end_date, pp.allocation, pp.billable, pp.daily_rate, pp.daily_rate_currency, pp.status, c.name AS consultant_name
    FROM project_positions pp
    LEFT JOIN consultants c ON c.id = pp.consultant_id
    WHERE pp.project_id = ?
    ORDER BY pp.id
    ''',
    (project_id,)
  ).fetchall()


def list_project_positions_for_forecast_total(conn, project_id):
  return conn.execute(
    '''
    SELECT id, start_date, end_date, allocation, billable, daily_rate
    FROM project_positions
    WHERE project_id = ?
    ''',
    (project_id,)
  ).fetchall()


def calculate_revenue_actuals_totals(conn, project_id):
  invoiced_row = conn.execute('SELECT COALESCE(SUM(amount), 0) AS total FROM invoices WHERE project_id = ?', (project_id,)).fetchone()
  paid_row = conn.execute(
    '''
    SELECT COALESCE(SUM(p.amount), 0) AS total
    FROM invoice_payments p
    JOIN invoices i ON i.id = p.invoice_id
    WHERE i.project_id = ?
    ''',
    (project_id,)
  ).fetchone()
  return float(invoiced_row['total'] or 0.0), float(paid_row['total'] or 0.0)


def get_consultant_salary_map(conn, consultant_ids):
  ids = [int(v) for v in consultant_ids if v is not None]
  if not ids:
    return {}
  placeholders = ','.join(['?'] * len(ids))
  rows = conn.execute(f'SELECT id, salary FROM consultants WHERE id IN ({placeholders})', ids).fetchall()
  return {int(row['id']): row['salary'] for row in rows}
