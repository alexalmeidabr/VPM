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
    'SELECT id FROM holiday_locations WHERE country_code = ? AND region_code IS ?',
    (country_code, region_code)
  ).fetchone()
  if row:
    return row['id']
  cursor = conn.execute(
    'INSERT INTO holiday_locations (label, country_code, region_code) VALUES (?, ?, ?)',
    (label, country_code, region_code)
  )
  return cursor.lastrowid


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
    'SELECT fetched_at FROM holiday_cache WHERE country_code = ? AND region_code IS ? AND year = ?',
    (country_code, region_code, year)
  ).fetchone()
  return row['fetched_at'] if row else None


def upsert_holidays(conn, entries_to_store, country_code, year):
  for row, row_region, row_scope in entries_to_store:
    conn.execute(
      '''
      INSERT INTO holidays (date, name, country_code, region_code, scope, year, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date, country_code, region_code, scope)
      DO UPDATE SET name = excluded.name, source = excluded.source, year = excluded.year
      ''',
      (row['date'], row['name'], country_code, row_region, row_scope, year, row['source'])
    )


def upsert_holiday_cache(conn, country_code, region_code, year):
  conn.execute(
    '''
    INSERT INTO holiday_cache (country_code, region_code, year, fetched_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(country_code, region_code, year)
    DO UPDATE SET fetched_at = CURRENT_TIMESTAMP
    ''',
    (country_code, region_code, year)
  )


def upsert_consultant_holiday_load(conn, consultant_id, year, country_code, region_code):
  conn.execute(
    '''
    INSERT INTO consultant_holiday_loads (consultant_id, year, country_code, region_code, loaded_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(consultant_id, year, country_code, region_code)
    DO UPDATE SET loaded_at = CURRENT_TIMESTAMP
    ''',
    (consultant_id, year, country_code, region_code)
  )
