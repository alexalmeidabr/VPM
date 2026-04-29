import db


def list_holiday_locations(conn):
  rows = conn.execute(
    '''
    SELECT id, label, country_code, region_code
    FROM holiday_locations
    ORDER BY country_code, region_code, label
    '''
  ).fetchall()
  return [
    {
      'id': row['id'],
      'label': row['label'],
      'countryCode': row['country_code'],
      'regionCode': row['region_code']
    }
    for row in rows
  ]


def ensure_holiday_location(conn, country_code, region_code, label):
  row = conn.execute(
    '''
    SELECT id
    FROM holiday_locations
    WHERE country_code = ?
      AND ((region_code IS NULL AND ? IS NULL) OR region_code = ?)
    ''',
    (country_code, region_code, region_code)
  ).fetchone()
  if row:
    return row['id']
  return db.execute_insert_and_get_id(
    conn,
    'INSERT INTO holiday_locations (label, country_code, region_code) VALUES (?, ?, ?)',
    'INSERT INTO holiday_locations (label, country_code, region_code) OUTPUT INSERTED.id VALUES (?, ?, ?)',
    (label, country_code, region_code)
  )


def fetch_holidays(conn, year, country_code, region_code):
  rows = conn.execute(
    '''
    SELECT id, date, name, country_code, region_code, scope, year, source
    FROM holidays
    WHERE year = ? AND country_code = ?
      AND (region_code IS NULL OR region_code = ?)
    ORDER BY date, CASE scope WHEN 'company_override' THEN 0 WHEN 'regional' THEN 1 ELSE 2 END
    ''',
    (year, country_code, region_code)
  ).fetchall()
  by_date = {}
  for row in rows:
    date_key = row['date']
    current = by_date.get(date_key)
    candidate = {
      'id': row['id'],
      'date': row['date'],
      'name': row['name'],
      'countryCode': row['country_code'],
      'regionCode': row['region_code'],
      'scope': row['scope'],
      'year': row['year'],
      'source': row['source']
    }
    if current is None or candidate['scope'] == 'company_override':
      by_date[date_key] = candidate
  return list(by_date.values())


def get_holiday_cache_fetched_at(conn, year, country_code, region_code):
  row = conn.execute(
    '''
    SELECT fetched_at
    FROM holiday_cache
    WHERE country_code = ?
      AND ((region_code IS NULL AND ? IS NULL) OR region_code = ?)
      AND year = ?
    ''',
    (country_code, region_code, region_code, year)
  ).fetchone()
  return row['fetched_at'] if row else None


def upsert_holidays(conn, entries_to_store, country_code, year):
  for row, row_region, row_scope in entries_to_store:
    if db.is_sqlite():
      conn.execute(
        '''
        INSERT INTO holidays (date, name, country_code, region_code, scope, year, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date, country_code, region_code, scope)
        DO UPDATE SET name = excluded.name, source = excluded.source, year = excluded.year
        ''',
        (row['date'], row['name'], country_code, row_region, row_scope, year, row['source'])
      )
      continue
    updated = conn.execute(
      '''
      UPDATE holidays
      SET name = ?, source = ?, year = ?
      WHERE date = ? AND country_code = ? AND scope = ?
        AND ((region_code IS NULL AND ? IS NULL) OR region_code = ?)
      ''',
      (row['name'], row['source'], year, row['date'], country_code, row_scope, row_region, row_region)
    )
    if getattr(updated, 'rowcount', 0) == 0:
      conn.execute(
        'INSERT INTO holidays (date, name, country_code, region_code, scope, year, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (row['date'], row['name'], country_code, row_region, row_scope, year, row['source'])
      )


def upsert_holiday_cache(conn, country_code, region_code, year):
  if db.is_sqlite():
    conn.execute(
      '''
      INSERT INTO holiday_cache (country_code, region_code, year, fetched_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(country_code, region_code, year)
      DO UPDATE SET fetched_at = CURRENT_TIMESTAMP
      ''',
      (country_code, region_code, year)
    )
    return
  updated = conn.execute(
    '''
    UPDATE holiday_cache
    SET fetched_at = CURRENT_TIMESTAMP
    WHERE country_code = ?
      AND ((region_code IS NULL AND ? IS NULL) OR region_code = ?)
      AND year = ?
    ''',
    (country_code, region_code, region_code, year)
  )
  if getattr(updated, 'rowcount', 0) == 0:
    conn.execute(
      'INSERT INTO holiday_cache (country_code, region_code, year, fetched_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      (country_code, region_code, year)
    )


def upsert_consultant_holiday_load(conn, consultant_id, year, country_code, region_code):
  if db.is_sqlite():
    conn.execute(
      '''
      INSERT INTO consultant_holiday_loads (consultant_id, year, country_code, region_code, loaded_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(consultant_id, year, country_code, region_code)
      DO UPDATE SET loaded_at = CURRENT_TIMESTAMP
      ''',
      (consultant_id, year, country_code, region_code)
    )
    return
  updated = conn.execute(
    '''
    UPDATE consultant_holiday_loads
    SET loaded_at = CURRENT_TIMESTAMP
    WHERE consultant_id = ? AND year = ? AND country_code = ?
      AND ((region_code IS NULL AND ? IS NULL) OR region_code = ?)
    ''',
    (consultant_id, year, country_code, region_code, region_code)
  )
  if getattr(updated, 'rowcount', 0) == 0:
    conn.execute(
      '''
      INSERT INTO consultant_holiday_loads (consultant_id, year, country_code, region_code, loaded_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ''',
      (consultant_id, year, country_code, region_code)
    )


def create_holiday_location(conn, label, country_code, region_code):
  return db.execute_insert_and_get_id(
    conn,
    'INSERT INTO holiday_locations (label, country_code, region_code) VALUES (?, ?, ?)',
    'INSERT INTO holiday_locations (label, country_code, region_code) OUTPUT INSERTED.id VALUES (?, ?, ?)',
    (label, country_code, region_code)
  )


def update_holiday_location(conn, holiday_location_id, label, country_code, region_code):
  cursor = conn.execute(
    'UPDATE holiday_locations SET label = ?, country_code = ?, region_code = ? WHERE id = ?',
    (label, country_code, region_code, holiday_location_id)
  )
  return cursor.rowcount


def delete_holiday_location(conn, holiday_location_id):
  cursor = conn.execute('DELETE FROM holiday_locations WHERE id = ?', (holiday_location_id,))
  return cursor.rowcount
