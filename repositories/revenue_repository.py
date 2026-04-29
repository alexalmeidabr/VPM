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
