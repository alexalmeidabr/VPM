import db


def list_consultants(conn=None):
  if conn is None:
    with db.get_connection() as db_conn:
      return list_consultants(db_conn)
  rows = conn.execute(
    '''
    SELECT c.id, c.name, c.salary, c.holiday_location_id, c.start_date, c.company_branch_id, cb.name AS company_branch_name
    FROM consultants c
    LEFT JOIN company_branches cb ON cb.id = c.company_branch_id
    ORDER BY c.created_at DESC, c.id DESC
    '''
  ).fetchall()
  consultant_ids = [row['id'] for row in rows]
  if not consultant_ids:
    return []

  placeholders = ','.join('?' for _ in consultant_ids)

  role_rows = conn.execute(
    f'''
    SELECT cr.consultant_id, r.id, r.name
    FROM consultant_roles cr
    JOIN roles r ON r.id = cr.role_id
    WHERE cr.consultant_id IN ({placeholders})
    ORDER BY cr.consultant_id, r.name
    ''',
    tuple(consultant_ids)
  ).fetchall()
  role_by_consultant = {}
  for row in role_rows:
    role_by_consultant.setdefault(row['consultant_id'], row)

  area_rows = conn.execute(
    f'''
    SELECT ca.consultant_id, a.id, a.name
    FROM consultant_areas ca
    JOIN areas a ON a.id = ca.area_id
    WHERE ca.consultant_id IN ({placeholders})
    ORDER BY ca.consultant_id, a.name
    ''',
    tuple(consultant_ids)
  ).fetchall()
  areas_by_consultant = {}
  for row in area_rows:
    areas_by_consultant.setdefault(row['consultant_id'], []).append(row)

  availability_rows = conn.execute(
    f'''
    SELECT ca.consultant_id, ca.id, ca.day_off_type_id, ca.type, ca.start_date, ca.end_date, dot.name AS type_name
    FROM consultant_availability ca
    LEFT JOIN day_off_types dot ON dot.id = ca.day_off_type_id
    WHERE ca.consultant_id IN ({placeholders})
    ORDER BY ca.consultant_id, ca.start_date
    ''',
    tuple(consultant_ids)
  ).fetchall()
  availability_by_consultant = {}
  for row in availability_rows:
    availability_by_consultant.setdefault(row['consultant_id'], []).append(row)

  holiday_load_rows = conn.execute(
    f'''
    SELECT consultant_id, year, country_code, region_code, loaded_at, id
    FROM consultant_holiday_loads
    WHERE consultant_id IN ({placeholders})
    ORDER BY consultant_id, loaded_at DESC, id DESC
    ''',
    tuple(consultant_ids)
  ).fetchall()
  holiday_load_by_consultant = {}
  for row in holiday_load_rows:
    holiday_load_by_consultant.setdefault(row['consultant_id'], row)

  consultants = []
  for consultant in rows:
    consultant_id = consultant['id']
    role_row = role_by_consultant.get(consultant_id)
    consultant_areas = areas_by_consultant.get(consultant_id, [])
    consultant_availability = availability_by_consultant.get(consultant_id, [])
    holiday_load_row = holiday_load_by_consultant.get(consultant_id)

    consultants.append({
      'id': consultant['id'],
      'name': consultant['name'],
      'salary': consultant['salary'],
      'startDate': consultant['start_date'],
      'companyRoleId': role_row['id'] if role_row else None,
      'companyRole': role_row['name'] if role_row else None,
      'areaIds': [row['id'] for row in consultant_areas],
      'areaNames': [row['name'] for row in consultant_areas],
      'holidayLocationId': consultant['holiday_location_id'],
      'companyBranchId': consultant['company_branch_id'],
      'companyBranchName': consultant['company_branch_name'],
      'holidayCalendarLoad': {
        'year': holiday_load_row['year'],
        'countryCode': holiday_load_row['country_code'],
        'regionCode': holiday_load_row['region_code'],
        'loadedAt': holiday_load_row['loaded_at']
      } if holiday_load_row else None,
      'availability': [
        {
          'id': row['id'],
          'dayOffTypeId': row['day_off_type_id'],
          'type': row['type_name'] or row['type'] or 'Days Off',
          'startDate': row['start_date'],
          'endDate': row['end_date']
        }
        for row in consultant_availability
      ]
    })
  return consultants


def create_consultant(conn, payload):
  first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
  role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()
  cursor = conn.execute(
    'INSERT INTO consultants (name, area, position, salary, holiday_location_id, company_branch_id, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['companyBranchId'], payload['startDate'])
  )
  consultant_id = db.get_last_insert_id(cursor, conn)
  for area_id in sorted(set(payload['areaIds'])):
    conn.execute('INSERT INTO consultant_areas (consultant_id, area_id) VALUES (?, ?)', (consultant_id, area_id))
  conn.execute('INSERT INTO consultant_roles (consultant_id, role_id) VALUES (?, ?)', (consultant_id, payload['companyRoleId']))
  return consultant_id


def update_consultant(conn, consultant_id, payload):
  first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
  role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()
  cursor = conn.execute(
    'UPDATE consultants SET name = ?, area = ?, position = ?, salary = ?, holiday_location_id = ?, company_branch_id = ?, start_date = ? WHERE id = ?',
    (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['companyBranchId'], payload['startDate'], consultant_id)
  )
  if cursor.rowcount == 0:
    return 0
  conn.execute('DELETE FROM consultant_areas WHERE consultant_id = ?', (consultant_id,))
  conn.execute('DELETE FROM consultant_roles WHERE consultant_id = ?', (consultant_id,))
  for area_id in sorted(set(payload['areaIds'])):
    conn.execute('INSERT INTO consultant_areas (consultant_id, area_id) VALUES (?, ?)', (consultant_id, area_id))
  conn.execute('INSERT INTO consultant_roles (consultant_id, role_id) VALUES (?, ?)', (consultant_id, payload['companyRoleId']))
  return cursor.rowcount


def delete_consultant(conn, consultant_id):
  cursor = conn.execute('DELETE FROM consultants WHERE id = ?', (consultant_id,))
  return cursor.rowcount
