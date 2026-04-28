from datetime import datetime, timedelta

import db


def month_range(month_start):
  start = datetime.strptime(month_start, '%Y-%m-%d').date()
  if start.month == 12:
    next_month = start.replace(year=start.year + 1, month=1, day=1)
  else:
    next_month = start.replace(month=start.month + 1, day=1)
  end = next_month - timedelta(days=1)
  return start.isoformat(), end.isoformat()


def ensure_monthly_timesheet(conn, consultant_id, month_start):
  conn.execute('INSERT INTO monthly_timesheets (consultant_id, month_start) VALUES (?, ?) ON CONFLICT(consultant_id, month_start) DO NOTHING', (consultant_id, month_start))
  row = conn.execute('SELECT id, consultant_id, month_start, status FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?', (consultant_id, month_start)).fetchone()
  if not row:
    return None
  month_start_iso, month_end_iso = month_range(month_start)
  assigned_projects = conn.execute('SELECT DISTINCT p.id AS project_id, p.project_name FROM projects p JOIN project_consultants pc ON pc.project_id = p.id WHERE pc.consultant_id = ? AND COALESCE(pc.start_date, p.start_date) <= ? AND COALESCE(pc.end_date, p.end_date) >= ? ORDER BY p.project_name', (consultant_id, month_end_iso, month_start_iso)).fetchall()
  existing_project_ids = {int(item['project_id']) for item in conn.execute('SELECT project_id FROM monthly_timesheet_lines WHERE timesheet_id = ? AND project_id IS NOT NULL', (row['id'],)).fetchall()}
  for project in assigned_projects:
    project_id = int(project['project_id'])
    if project_id in existing_project_ids:
      continue
    conn.execute('INSERT INTO monthly_timesheet_lines (timesheet_id, project_id, activity, is_manual) VALUES (?, ?, ?, 0)', (row['id'], project_id, None))

  existing_time_off_labels = {
    str(item['activity']).strip().lower()
    for item in conn.execute(
      '''
      SELECT activity
      FROM monthly_timesheet_lines
      WHERE timesheet_id = ?
        AND project_id IS NULL
        AND is_manual = 0
        AND activity IS NOT NULL
        AND TRIM(activity) <> ''
      ''',
      (row['id'],)
    ).fetchall()
  }
  availability_types = conn.execute(
    '''
    SELECT DISTINCT COALESCE(NULLIF(TRIM(dot.name), ''), NULLIF(TRIM(ca.type), ''), 'Time Off') AS type_name
    FROM consultant_availability ca
    LEFT JOIN day_off_types dot ON dot.id = ca.day_off_type_id
    WHERE ca.consultant_id = ?
      AND ca.start_date <= ?
      AND ca.end_date >= ?
    ORDER BY type_name
    ''',
    (consultant_id, month_end_iso, month_start_iso)
  ).fetchall()
  for availability in availability_types:
    type_name = str(availability['type_name'] or '').strip()
    if not type_name:
      continue
    if type_name.lower() in existing_time_off_labels:
      continue
    conn.execute('INSERT INTO monthly_timesheet_lines (timesheet_id, project_id, activity, is_manual) VALUES (?, NULL, ?, 0)', (row['id'], type_name))
    existing_time_off_labels.add(type_name.lower())
  return row


def fetch_timesheet_months(conn, consultant_id):
  consultant = conn.execute('SELECT start_date FROM consultants WHERE id = ?', (consultant_id,)).fetchone()
  if not consultant:
    return None
  if not consultant['start_date']:
    return []
  try:
    start = datetime.strptime(consultant['start_date'], '%Y-%m-%d').date().replace(day=1)
  except ValueError:
    return []
  today = datetime.utcnow().date().replace(day=1)
  months = []
  cursor = start
  while cursor <= today:
    month_start = cursor.isoformat()
    existing = conn.execute('SELECT id, status FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?', (consultant_id, month_start)).fetchone()
    months.append({'monthStart': month_start, 'label': cursor.strftime('%B %Y'), 'timesheetId': existing['id'] if existing else None, 'status': existing['status'] if existing else None})
    if cursor.month == 12:
      cursor = cursor.replace(year=cursor.year + 1, month=1)
    else:
      cursor = cursor.replace(month=cursor.month + 1)
  return months


def _fetch_entries_for_line_ids(conn, line_ids):
  if not line_ids:
    return {}
  placeholders = ','.join('?' for _ in line_ids)
  entry_rows = conn.execute(f'SELECT line_id, entry_date, hours FROM monthly_timesheet_entries WHERE line_id IN ({placeholders})', tuple(line_ids)).fetchall()
  entries_by_line = {}
  for entry in entry_rows:
    entries_by_line.setdefault(entry['line_id'], {})[entry['entry_date']] = entry['hours']
  return entries_by_line


def fetch_timesheet_detail(conn, consultant_id, month_start):
  row = ensure_monthly_timesheet(conn, consultant_id, month_start)
  if not row:
    return None
  lines = conn.execute('SELECT l.id, l.project_id, l.activity, l.is_manual, p.project_name FROM monthly_timesheet_lines l LEFT JOIN projects p ON p.id = l.project_id WHERE l.timesheet_id = ? ORDER BY l.is_manual, p.project_name, l.id', (row['id'],)).fetchall()
  entries_by_line = _fetch_entries_for_line_ids(conn, [line['id'] for line in lines])
  return {
    'timesheetId': row['id'],
    'consultantId': row['consultant_id'],
    'monthStart': row['month_start'],
    'status': row['status'],
    'lines': [
      {'id': item['id'], 'projectId': item['project_id'], 'projectName': item['project_name'], 'activity': item['activity'] or '', 'isManual': bool(item['is_manual']), 'entries': entries_by_line.get(item['id'], {})}
      for item in lines
    ]
  }


def get_timesheet_row(conn, timesheet_id):
  return conn.execute('SELECT id, status FROM monthly_timesheets WHERE id = ?', (timesheet_id,)).fetchone()


def create_manual_line(conn, timesheet_id, activity):
  cursor = conn.execute('INSERT INTO monthly_timesheet_lines (timesheet_id, activity, is_manual) VALUES (?, ?, 1)', (timesheet_id, activity))
  return cursor.lastrowid


def get_line_with_timesheet_status(conn, line_id):
  return conn.execute(
    '''
    SELECT l.id, t.status
    FROM monthly_timesheet_lines l
    JOIN monthly_timesheets t ON t.id = l.timesheet_id
    WHERE l.id = ?
    ''',
    (line_id,)
  ).fetchone()


def update_entry(conn, line_id, entry_date, hours):
  conn.execute(
    '''
    INSERT INTO monthly_timesheet_entries (line_id, entry_date, hours)
    VALUES (?, ?, ?)
    ON CONFLICT(line_id, entry_date) DO UPDATE SET hours = excluded.hours
    ''',
    (line_id, entry_date, hours)
  )


def update_timesheet_status(conn, timesheet_id, status):
  cursor = conn.execute('UPDATE monthly_timesheets SET status = ? WHERE id = ?', (status, timesheet_id))
  return cursor.rowcount


def delete_monthly_timesheet(conn, consultant_id, month_start):
  cursor = conn.execute('DELETE FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?', (consultant_id, month_start))
  return cursor.rowcount
