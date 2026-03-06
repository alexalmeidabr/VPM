#!/usr/bin/env python3
import json
import sqlite3
from datetime import datetime, timedelta
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen

try:
  import holidays as pyholidays
except ImportError:
  pyholidays = None

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'projects.db'

DEFAULT_ROLES = [
  'TM Junior Consultant', 'TM Regular Consultant', 'TM Senior Consultant',
  'Project Manager', 'EWM Junior Consultant', 'EWM Regular Consultant', 'EWM Senior Consultant'
]
DEFAULT_AREAS = ['TM (Transport Management)', 'EWM (Extended Warehouse Management)', 'YL (Yard Logistics)']
DEFAULT_DAY_OFF_TYPES = ['Vacation', 'PTO']


def get_connection():
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  conn.execute('PRAGMA foreign_keys = ON')
  return conn


def ensure_column(conn, table, column, ddl):
  existing = {row['name'] for row in conn.execute(f'PRAGMA table_info({table})').fetchall()}
  if column not in existing:
    conn.execute(f'ALTER TABLE {table} ADD COLUMN {ddl}')


def seed_defaults(conn):
  if conn.execute('SELECT COUNT(*) AS total FROM roles').fetchone()['total'] == 0:
    for role in DEFAULT_ROLES:
      conn.execute('INSERT INTO roles (name) VALUES (?)', (role,))
  if conn.execute('SELECT COUNT(*) AS total FROM areas').fetchone()['total'] == 0:
    for area in DEFAULT_AREAS:
      conn.execute('INSERT INTO areas (name) VALUES (?)', (area,))
  if conn.execute('SELECT COUNT(*) AS total FROM day_off_types').fetchone()['total'] == 0:
    for day_off_type in DEFAULT_DAY_OFF_TYPES:
      conn.execute('INSERT INTO day_off_types (name) VALUES (?)', (day_off_type,))


def init_db():
  with get_connection() as conn:
    conn.executescript(
      '''
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS day_off_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        area TEXT,
        position TEXT,
        holiday_location_id INTEGER,
        salary REAL NOT NULL,
        start_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (holiday_location_id) REFERENCES holiday_locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS holiday_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        country_code TEXT NOT NULL,
        region_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country_code, region_code)
      );

      CREATE TABLE IF NOT EXISTS holidays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        country_code TEXT NOT NULL,
        region_code TEXT,
        scope TEXT NOT NULL CHECK(scope IN ('national', 'regional', 'company_override')),
        year INTEGER NOT NULL,
        source TEXT NOT NULL,
        UNIQUE(date, country_code, region_code, scope)
      );

      CREATE TABLE IF NOT EXISTS holiday_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country_code TEXT NOT NULL,
        region_code TEXT,
        year INTEGER NOT NULL,
        fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country_code, region_code, year)
      );

      CREATE TABLE IF NOT EXISTS consultant_holiday_loads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultant_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        country_code TEXT NOT NULL,
        region_code TEXT,
        loaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(consultant_id, year, country_code, region_code),
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS consultant_roles (
        consultant_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (consultant_id, role_id),
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS consultant_areas (
        consultant_id INTEGER NOT NULL,
        area_id INTEGER NOT NULL,
        PRIMARY KEY (consultant_id, area_id),
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
        FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS consultant_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultant_id INTEGER NOT NULL,
        day_off_type_id INTEGER,
        type TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
        FOREIGN KEY (day_off_type_id) REFERENCES day_off_types(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        project_lead TEXT NOT NULL,
        client_contact TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        manager_consultant_id INTEGER,
        project_type TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_consultant_id) REFERENCES consultants(id) ON DELETE SET NULL
      );


      CREATE TABLE IF NOT EXISTS project_phases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS project_milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        phase_id INTEGER,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS project_consultants (
        project_id INTEGER NOT NULL,
        consultant_id INTEGER NOT NULL,
        project_role TEXT,
        start_date TEXT,
        end_date TEXT,
        PRIMARY KEY (project_id, consultant_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS allocation_simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      '''
    )

    ensure_column(conn, 'projects', 'manager_consultant_id', 'manager_consultant_id INTEGER')
    ensure_column(conn, 'projects', 'project_type', 'project_type TEXT')
    ensure_column(conn, 'project_consultants', 'project_role', 'project_role TEXT')
    ensure_column(conn, 'project_consultants', 'start_date', 'start_date TEXT')
    ensure_column(conn, 'project_consultants', 'end_date', 'end_date TEXT')
    ensure_column(conn, 'consultant_availability', 'day_off_type_id', 'day_off_type_id INTEGER')
    ensure_column(conn, 'consultant_availability', 'type', 'type TEXT')
    ensure_column(conn, 'consultants', 'holiday_location_id', 'holiday_location_id INTEGER REFERENCES holiday_locations(id) ON DELETE SET NULL')
    ensure_column(conn, 'consultants', 'start_date', 'start_date TEXT')
    seed_defaults(conn)


class VPMHandler(SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    super().end_headers()

  def do_OPTIONS(self):
    self.send_response(HTTPStatus.NO_CONTENT)
    self.end_headers()

  def _send_json(self, payload, status=HTTPStatus.OK):
    body = json.dumps(payload).encode('utf-8')
    self.send_response(status)
    self.send_header('Content-Type', 'application/json')
    self.send_header('Content-Length', str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def _read_json(self):
    length = int(self.headers.get('Content-Length', 0))
    return json.loads((self.rfile.read(length) if length > 0 else b'{}').decode('utf-8'))

  def _path(self):
    return urlparse(self.path).path

  def _query(self):
    return parse_qs(urlparse(self.path).query)

  def _parts(self):
    return [part for part in self._path().split('/') if part]

  def _resource_id(self, resource):
    parts = self._parts()
    if len(parts) == 3 and parts[0] == 'api' and parts[1] == resource and parts[2].isdigit():
      return int(parts[2])
    return None

  def _availability_route(self):
    parts = self._parts()
    if len(parts) == 4 and parts[0:2] == ['api', 'consultants'] and parts[2].isdigit() and parts[3] == 'availability':
      return int(parts[2]), None
    if len(parts) == 5 and parts[0:2] == ['api', 'consultants'] and parts[2].isdigit() and parts[3] == 'availability' and parts[4].isdigit():
      return int(parts[2]), int(parts[4])
    return None, None

  def _holiday_location_id(self):
    parts = self._parts()
    if len(parts) == 3 and parts[0:2] == ['api', 'holiday-locations'] and parts[2].isdigit():
      return int(parts[2])
    return None

  def _allocation_simulation_id(self):
    parts = self._parts()
    if len(parts) == 3 and parts[0:2] == ['api', 'allocation-simulations'] and parts[2].isdigit():
      return int(parts[2])
    return None

  def _ids_exist(self, conn, table, ids):
    unique_ids = sorted(set(ids))
    if not unique_ids:
      return True
    placeholders = ','.join(['?'] * len(unique_ids))
    row = conn.execute(f'SELECT COUNT(*) AS total FROM {table} WHERE id IN ({placeholders})', unique_ids).fetchone()
    return row['total'] == len(unique_ids)

  def _consultant_has_project_manager_role(self, conn, consultant_id):
    row = conn.execute(
      '''
      SELECT 1
      FROM consultant_roles cr
      JOIN roles r ON r.id = cr.role_id
      WHERE cr.consultant_id = ? AND r.name = 'Project Manager'
      LIMIT 1
      ''',
      (consultant_id,)
    ).fetchone()
    return row is not None

  def _consultant_name(self, conn, consultant_id):
    row = conn.execute('SELECT name FROM consultants WHERE id = ?', (consultant_id,)).fetchone()
    return row['name'] if row else None

  def _valid_iso_date(self, value):
    if not value:
      return True
    try:
      datetime.strptime(value, '%Y-%m-%d')
      return True
    except ValueError:
      return False

  def _is_weekend(self, date_value):
    return date_value.weekday() >= 5

  def _next_weekday(self, date_value):
    current = date_value
    while self._is_weekend(current):
      current += timedelta(days=1)
    return current

  def _previous_weekday(self, date_value):
    current = date_value
    while self._is_weekend(current):
      current -= timedelta(days=1)
    return current

  def _normalize_assignment_weekdays(self, start_iso, end_iso):
    if not start_iso or not end_iso:
      return start_iso, end_iso
    start_date = datetime.strptime(start_iso, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_iso, '%Y-%m-%d').date()
    normalized_start = self._next_weekday(start_date) if self._is_weekend(start_date) else start_date
    normalized_end = self._previous_weekday(end_date) if self._is_weekend(end_date) else end_date
    return normalized_start.isoformat(), normalized_end.isoformat()

  def _name_payload_error(self, payload):
    payload['name'] = str(payload.get('name', '')).strip()
    return None if payload['name'] else 'name is required'

  def _project_payload_error(self, payload):
    for field in ['projectName', 'clientName', 'clientContact', 'startDate', 'endDate', 'managerConsultantId', 'projectType']:
      value = str(payload.get(field, '')).strip()
      if not value:
        return f'{field} is required'
      payload[field] = value

    if payload['projectType'] not in ('Time Material', 'Fixed Price'):
      return 'projectType must be Time Material or Fixed Price'
    if payload['startDate'] > payload['endDate']:
      return 'startDate cannot be after endDate'

    try:
      payload['managerConsultantId'] = int(payload['managerConsultantId'])
    except (TypeError, ValueError):
      return 'managerConsultantId must be numeric'

    assignments = payload.get('consultantAssignments', [])
    if not isinstance(assignments, list):
      return 'consultantAssignments must be a list'

    normalized = []
    for assignment in assignments:
      if not isinstance(assignment, dict):
        return 'consultantAssignments items must be objects'
      role = str(assignment.get('projectRole', '')).strip()
      if not role:
        return 'projectRole is required for each project consultant'
      start = str(assignment.get('startDate', '')).strip()
      end = str(assignment.get('endDate', '')).strip()
      if start and end and start > end:
        return 'project member startDate cannot be after endDate'
      if not self._valid_iso_date(start) or not self._valid_iso_date(end):
        return 'project member dates must be YYYY-MM-DD'
      start, end = self._normalize_assignment_weekdays(start, end)
      if start and end and start > end:
        return 'project member assignment only covers weekends; choose a range that includes at least one weekday'
      try:
        consultant_id = int(assignment.get('consultantId'))
      except (TypeError, ValueError):
        return 'consultantId must be numeric for each project consultant'
      normalized.append({'consultantId': consultant_id, 'projectRole': role, 'startDate': start, 'endDate': end})

    payload['consultantAssignments'] = normalized

    phases = payload.get('projectPhases', [])
    milestones = payload.get('projectMilestones', [])
    if not isinstance(phases, list):
      return 'projectPhases must be a list'
    if not isinstance(milestones, list):
      return 'projectMilestones must be a list'

    normalized_phases = []
    phase_ids = set()
    for phase in phases:
      if not isinstance(phase, dict):
        return 'projectPhases items must be objects'
      phase_id = str(phase.get('id', '')).strip()
      name = str(phase.get('name', '')).strip()
      start = str(phase.get('startDate', '')).strip()
      end = str(phase.get('endDate', '')).strip()
      if not name or not start or not end:
        return 'project phase name, startDate and endDate are required'
      if not self._valid_iso_date(start) or not self._valid_iso_date(end):
        return 'project phase dates must be YYYY-MM-DD'
      if start > end:
        return 'project phase startDate cannot be after endDate'
      if phase_id:
        phase_ids.add(phase_id)
      normalized_phases.append({'id': phase_id, 'name': name, 'startDate': start, 'endDate': end})

    normalized_milestones = []
    for milestone in milestones:
      if not isinstance(milestone, dict):
        return 'projectMilestones items must be objects'
      name = str(milestone.get('name', '')).strip()
      start = str(milestone.get('startDate', '')).strip()
      end = str(milestone.get('endDate', '')).strip()
      phase_id = str(milestone.get('phaseId', '')).strip()
      if not name or not start or not end:
        return 'project milestone name, startDate and endDate are required'
      if not self._valid_iso_date(start) or not self._valid_iso_date(end):
        return 'project milestone dates must be YYYY-MM-DD'
      if start > end:
        return 'project milestone startDate cannot be after endDate'
      if phase_id and phase_id not in phase_ids:
        return 'project milestone phaseId must reference an existing phase'
      normalized_milestones.append({'name': name, 'startDate': start, 'endDate': end, 'phaseId': phase_id})

    payload['projectPhases'] = normalized_phases
    payload['projectMilestones'] = normalized_milestones
    return None

  def _consultant_payload_error(self, payload):
    payload['name'] = str(payload.get('name', '')).strip()
    if not payload['name']:
      return 'name is required'
    try:
      payload['salary'] = float(payload.get('salary'))
    except (TypeError, ValueError):
      return 'salary must be a number'
    if payload['salary'] < 0:
      return 'salary must be zero or more'
    area_ids = payload.get('areaIds', [])
    if not isinstance(area_ids, list) or not area_ids:
      return 'areaIds is required'
    try:
      payload['areaIds'] = [int(value) for value in area_ids]
      payload['companyRoleId'] = int(payload.get('companyRoleId'))
    except (TypeError, ValueError):
      return 'areaIds and companyRoleId must be numeric IDs'

    start_date = str(payload.get('startDate', '')).strip()
    if not start_date:
      return 'startDate is required'
    if not self._is_iso_date(start_date):
      return 'startDate must be YYYY-MM-DD'
    payload['startDate'] = start_date

    holiday_location_id = payload.get('holidayLocationId')
    if holiday_location_id in ('', None):
      payload['holidayLocationId'] = None
    else:
      try:
        payload['holidayLocationId'] = int(holiday_location_id)
      except (TypeError, ValueError):
        return 'holidayLocationId must be numeric when provided'
    return None

  def _holiday_location_payload_error(self, payload):
    label = str(payload.get('label', '')).strip()
    country_code = str(payload.get('countryCode', '')).strip().upper()
    region_raw = payload.get('regionCode')
    region_code = str(region_raw).strip().upper() if region_raw not in (None, '') else None
    if not label:
      return 'label is required'
    if len(country_code) != 2 or not country_code.isalpha():
      return 'countryCode must be ISO alpha-2'
    payload['label'] = label
    payload['countryCode'] = country_code
    payload['regionCode'] = region_code
    return None

  def _holiday_load_payload_error(self, payload):
    country_code = str(payload.get('countryCode', '')).strip().upper()
    region_raw = payload.get('regionCode')
    region_code = str(region_raw).strip().upper() if region_raw not in (None, '') else None
    try:
      year = int(payload.get('year'))
    except (TypeError, ValueError):
      return 'year must be numeric'
    if year < 1970 or year > 2100:
      return 'year is out of supported range'
    if len(country_code) != 2 or not country_code.isalpha():
      return 'countryCode must be ISO alpha-2'
    payload['year'] = year
    payload['countryCode'] = country_code
    payload['regionCode'] = region_code
    return None

  def _fetch_holiday_locations(self, conn):
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

  def _holiday_location_label(self, country_code, region_code):
    return f'{country_code} - {region_code}' if region_code else country_code

  def _ensure_holiday_location(self, conn, country_code, region_code):
    row = conn.execute(
      'SELECT id FROM holiday_locations WHERE country_code = ? AND region_code IS ?',
      (country_code, region_code)
    ).fetchone()
    if row:
      return row['id']
    label = self._holiday_location_label(country_code, region_code)
    cursor = conn.execute(
      'INSERT INTO holiday_locations (label, country_code, region_code) VALUES (?, ?, ?)',
      (label, country_code, region_code)
    )
    return cursor.lastrowid

  def _fetch_holidays(self, conn, year, country_code, region_code):
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
      if current is None:
        by_date[date_key] = candidate
        continue
      if candidate['scope'] == 'company_override':
        by_date[date_key] = candidate
    return list(by_date.values())

  def _cache_is_fresh(self, conn, year, country_code, region_code):
    row = conn.execute(
      'SELECT fetched_at FROM holiday_cache WHERE country_code = ? AND region_code IS ? AND year = ?',
      (country_code, region_code, year)
    ).fetchone()
    if not row:
      return False
    try:
      fetched = datetime.fromisoformat(str(row['fetched_at']).replace('Z', '+00:00'))
    except ValueError:
      return False
    return fetched >= datetime.utcnow() - timedelta(days=30)

  def _generate_holidays_for_location(self, year, country_code, region_code):
    if pyholidays is not None:
      try:
        generated = pyholidays.country_holidays(country_code, subdiv=region_code, years=[year])
      except Exception as error:
        raise RuntimeError(str(error)) from error
      rows = []
      for day, name in generated.items():
        if int(day.year) != year:
          continue
        rows.append({'date': day.isoformat(), 'name': str(name), 'scope': 'regional' if region_code else 'national', 'source': 'library'})
      return rows

    # Fallback provider: Nager.Date public holidays API (works without Python holidays package)
    api_url = f'https://date.nager.at/api/v3/PublicHolidays/{year}/{country_code}'
    try:
      with urlopen(api_url, timeout=15) as response:
        payload = json.loads(response.read().decode('utf-8'))
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
      raise RuntimeError(f'Unable to load holidays from fallback API: {error}') from error

    rows = []
    for item in payload if isinstance(payload, list) else []:
      date_value = str(item.get('date', '')).strip()
      if not date_value:
        continue

      counties = item.get('counties')
      is_regional = isinstance(counties, list) and len(counties) > 0

      if region_code:
        if not is_regional:
          continue
        normalized_region = region_code.upper()
        regional_tokens = {f'{country_code.upper()}-{normalized_region}', normalized_region}
        if not any(str(code).upper() in regional_tokens for code in counties):
          continue
        scope = 'regional'
      else:
        if is_regional:
          continue
        scope = 'national'

      name_value = str(item.get('localName') or item.get('name') or 'Public Holiday').strip()
      rows.append({'date': date_value, 'name': name_value, 'scope': scope, 'source': 'api'})

    return rows

  def _load_holidays(self, conn, year, country_code, region_code):
    if not self._cache_is_fresh(conn, year, country_code, region_code):
      entries_to_store = []
      national = self._generate_holidays_for_location(year, country_code, None)
      entries_to_store.extend([(row, None, 'national') for row in national])
      if region_code:
        regional = self._generate_holidays_for_location(year, country_code, region_code)
        entries_to_store.extend([(row, region_code, 'regional') for row in regional])

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

      conn.execute(
        '''
        INSERT INTO holiday_cache (country_code, region_code, year, fetched_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(country_code, region_code, year)
        DO UPDATE SET fetched_at = CURRENT_TIMESTAMP
        ''',
        (country_code, region_code, year)
      )
    return self._fetch_holidays(conn, year, country_code, region_code)

  def _availability_payload_error(self, conn, payload):
    day_off_type_id = payload.get('dayOffTypeId')
    try:
      payload['dayOffTypeId'] = int(day_off_type_id)
    except (TypeError, ValueError):
      return 'dayOffTypeId is required and must be numeric'

    type_row = conn.execute('SELECT name FROM day_off_types WHERE id = ?', (payload['dayOffTypeId'],)).fetchone()
    if not type_row:
      return 'Selected day off type does not exist'

    start = str(payload.get('startDate', '')).strip()
    end = str(payload.get('endDate', '')).strip()
    if not start or not end:
      return 'startDate and endDate are required'
    if not self._valid_iso_date(start) or not self._valid_iso_date(end):
      return 'startDate and endDate must be YYYY-MM-DD'
    if start > end:
      return 'startDate cannot be after endDate'

    payload['typeName'] = type_row['name']
    payload['startDate'] = start
    payload['endDate'] = end
    return None

  def _fetch_simple_table(self, conn, table):
    rows = conn.execute(f'SELECT id, name FROM {table} ORDER BY name').fetchall()
    return [{'id': row['id'], 'name': row['name']} for row in rows]

  def _fetch_consultants(self, conn):
    rows = conn.execute('SELECT id, name, salary, holiday_location_id, start_date FROM consultants ORDER BY created_at DESC, id DESC').fetchall()
    consultants = []
    for consultant in rows:
      role_row = conn.execute(
        '''
        SELECT r.id, r.name FROM consultant_roles cr
        JOIN roles r ON r.id = cr.role_id
        WHERE cr.consultant_id = ? ORDER BY r.name LIMIT 1
        ''',
        (consultant['id'],)
      ).fetchone()

      area_rows = conn.execute(
        '''
        SELECT a.id, a.name FROM consultant_areas ca
        JOIN areas a ON a.id = ca.area_id
        WHERE ca.consultant_id = ? ORDER BY a.name
        ''',
        (consultant['id'],)
      ).fetchall()

      availability_rows = conn.execute(
        '''
        SELECT ca.id, ca.day_off_type_id, ca.type, ca.start_date, ca.end_date, dot.name AS type_name
        FROM consultant_availability ca
        LEFT JOIN day_off_types dot ON dot.id = ca.day_off_type_id
        WHERE ca.consultant_id = ?
        ORDER BY ca.start_date
        ''',
        (consultant['id'],)
      ).fetchall()

      holiday_load_row = conn.execute(
        '''
        SELECT year, country_code, region_code, loaded_at
        FROM consultant_holiday_loads
        WHERE consultant_id = ?
        ORDER BY loaded_at DESC, id DESC
        LIMIT 1
        ''',
        (consultant['id'],)
      ).fetchone()

      consultants.append({
        'id': consultant['id'],
        'name': consultant['name'],
        'salary': consultant['salary'],
        'startDate': consultant['start_date'],
        'companyRoleId': role_row['id'] if role_row else None,
        'companyRole': role_row['name'] if role_row else None,
        'areaIds': [row['id'] for row in area_rows],
        'areaNames': [row['name'] for row in area_rows],
        'holidayLocationId': consultant['holiday_location_id'],
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
          for row in availability_rows
        ]
      })
    return consultants

  def _fetch_projects(self, conn):
    rows = conn.execute(
      '''
      SELECT p.id, p.project_name, p.client_name, p.client_contact, p.start_date, p.end_date,
             p.project_type, p.manager_consultant_id, c.name AS manager_name
      FROM projects p
      LEFT JOIN consultants c ON c.id = p.manager_consultant_id
      ORDER BY p.created_at DESC, p.id DESC
      '''
    ).fetchall()

    projects = []
    for row in rows:
      members = conn.execute(
        '''
        SELECT pc.consultant_id, pc.project_role, pc.start_date, pc.end_date, c.name AS consultant_name
        FROM project_consultants pc
        JOIN consultants c ON c.id = pc.consultant_id
        WHERE pc.project_id = ? ORDER BY c.name
        ''',
        (row['id'],)
      ).fetchall()
      phases = conn.execute(
        'SELECT id, name, start_date, end_date FROM project_phases WHERE project_id = ? ORDER BY start_date, id',
        (row['id'],)
      ).fetchall()
      milestones = conn.execute(
        'SELECT id, phase_id, name, start_date, end_date FROM project_milestones WHERE project_id = ? ORDER BY start_date, id',
        (row['id'],)
      ).fetchall()
      projects.append({
        'id': row['id'],
        'projectName': row['project_name'],
        'clientName': row['client_name'],
        'clientContact': row['client_contact'],
        'startDate': row['start_date'],
        'endDate': row['end_date'],
        'projectType': row['project_type'],
        'managerConsultantId': row['manager_consultant_id'],
        'managerName': row['manager_name'],
        'projectPhases': [
          {'id': str(p['id']), 'name': p['name'], 'startDate': p['start_date'], 'endDate': p['end_date']}
          for p in phases
        ],
        'projectMilestones': [
          {'id': str(m['id']), 'phaseId': str(m['phase_id']) if m['phase_id'] is not None else '', 'name': m['name'], 'startDate': m['start_date'], 'endDate': m['end_date']}
          for m in milestones
        ],
        'consultantAssignments': [
          {
            'consultantId': m['consultant_id'],
            'consultantName': m['consultant_name'],
            'projectRole': m['project_role'] or 'Project Member',
            'startDate': m['start_date'] or '',
            'endDate': m['end_date'] or ''
          }
          for m in members
        ]
      })
    return projects

  def _allocation_simulation_payload_error(self, payload, require_state=False):
    if 'name' in payload:
      payload['name'] = str(payload.get('name', '')).strip()
      if not payload['name']:
        return 'name cannot be empty'
    if require_state and 'state' not in payload:
      return 'state is required'
    if 'state' in payload and not isinstance(payload.get('state'), dict):
      return 'state must be an object'
    return None

  def _fetch_allocation_simulations(self, conn):
    rows = conn.execute(
      'SELECT id, name, created_at, updated_at FROM allocation_simulations ORDER BY created_at DESC, id DESC'
    ).fetchall()
    return [
      {'id': row['id'], 'name': row['name'], 'createdAt': row['created_at'], 'updatedAt': row['updated_at']}
      for row in rows
    ]

  def _fetch_allocation_simulation(self, conn, simulation_id):
    row = conn.execute(
      'SELECT id, name, state_json, created_at, updated_at FROM allocation_simulations WHERE id = ?',
      (simulation_id,)
    ).fetchone()
    if not row:
      return None
    try:
      state = json.loads(row['state_json'])
    except json.JSONDecodeError:
      state = {}
    return {
      'id': row['id'],
      'name': row['name'],
      'state': state,
      'createdAt': row['created_at'],
      'updatedAt': row['updated_at']
    }

  def do_GET(self):
    path = self._path()
    query = self._query()
    allocation_simulation_id = self._allocation_simulation_id()
    with get_connection() as conn:
      if path == '/api/allocation-simulations':
        self._send_json({'simulations': self._fetch_allocation_simulations(conn)})
        return
      if allocation_simulation_id is not None:
        simulation = self._fetch_allocation_simulation(conn, allocation_simulation_id)
        if not simulation:
          self._send_json({'error': 'Allocation simulation not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(simulation)
        return
      if path == '/api/projects':
        self._send_json({'projects': self._fetch_projects(conn)})
        return
      if path == '/api/consultants':
        self._send_json({'consultants': self._fetch_consultants(conn)})
        return
      if path == '/api/roles':
        self._send_json({'roles': self._fetch_simple_table(conn, 'roles')})
        return
      if path == '/api/areas':
        self._send_json({'areas': self._fetch_simple_table(conn, 'areas')})
        return
      if path == '/api/day-off-types':
        self._send_json({'dayOffTypes': self._fetch_simple_table(conn, 'day_off_types')})
        return
      if path == '/api/holiday-locations':
        self._send_json({'holidayLocations': self._fetch_holiday_locations(conn)})
        return
      if path == '/api/holidays':
        payload = {
          'year': (query.get('year') or [None])[0],
          'countryCode': (query.get('countryCode') or [''])[0],
          'regionCode': (query.get('regionCode') or [''])[0]
        }
        error = self._holiday_load_payload_error(payload)
        if error:
          self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
          return
        rows = self._fetch_holidays(conn, payload['year'], payload['countryCode'], payload['regionCode'])
        self._send_json({'holidays': rows})
        return

    super().do_GET()

  def do_POST(self):
    path = self._path()
    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    consultant_id, _ = self._availability_route()
    if consultant_id is not None and path.endswith('/availability'):
      with get_connection() as conn:
        if not self._ids_exist(conn, 'consultants', [consultant_id]):
          self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
          return
        error = self._availability_payload_error(conn, payload)
        if error:
          self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
          return
        cursor = conn.execute(
          'INSERT INTO consultant_availability (consultant_id, day_off_type_id, type, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
          (consultant_id, payload['dayOffTypeId'], payload['typeName'], payload['startDate'], payload['endDate'])
        )
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/projects':
      error = self._project_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        ids_to_check = [item['consultantId'] for item in payload['consultantAssignments']] + [payload['managerConsultantId']]
        if not self._ids_exist(conn, 'consultants', ids_to_check):
          self._send_json({'error': 'Manager or members include unknown consultant IDs'}, HTTPStatus.BAD_REQUEST)
          return
        if not self._consultant_has_project_manager_role(conn, payload['managerConsultantId']):
          self._send_json({'error': 'Selected manager must have the Project Manager role'}, HTTPStatus.BAD_REQUEST)
          return

        manager_name = self._consultant_name(conn, payload['managerConsultantId'])
        cursor = conn.execute(
          '''
          INSERT INTO projects (project_name, client_name, project_lead, client_contact, start_date, end_date, manager_consultant_id, project_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ''',
          (payload['projectName'], payload['clientName'], manager_name or 'Manager', payload['clientContact'], payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'])
        )
        project_id = cursor.lastrowid
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'])
          )
        phase_id_map = {}
        for phase in payload['projectPhases']:
          cursor_phase = conn.execute(
            'INSERT INTO project_phases (project_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
            (project_id, phase['name'], phase['startDate'], phase['endDate'])
          )
          phase_id_map[phase['id']] = cursor_phase.lastrowid
        for milestone in payload['projectMilestones']:
          conn.execute(
            'INSERT INTO project_milestones (project_id, phase_id, name, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, phase_id_map.get(milestone['phaseId']), milestone['name'], milestone['startDate'], milestone['endDate'])
          )
      self._send_json({'id': project_id}, HTTPStatus.CREATED)
      return

    if path == '/api/consultants':
      error = self._consultant_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        if not self._ids_exist(conn, 'areas', payload['areaIds']):
          self._send_json({'error': 'Unknown area selected'}, HTTPStatus.BAD_REQUEST)
          return
        if not self._ids_exist(conn, 'roles', [payload['companyRoleId']]):
          self._send_json({'error': 'Selected company role does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
        role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()
        if payload['holidayLocationId'] is not None and not self._ids_exist(conn, 'holiday_locations', [payload['holidayLocationId']]):
          self._send_json({'error': 'Selected holiday location does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        cursor = conn.execute(
          'INSERT INTO consultants (name, area, position, salary, holiday_location_id, start_date) VALUES (?, ?, ?, ?, ?, ?)',
          (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['startDate'])
        )
        consultant_id = cursor.lastrowid
        for area_id in sorted(set(payload['areaIds'])):
          conn.execute('INSERT INTO consultant_areas (consultant_id, area_id) VALUES (?, ?)', (consultant_id, area_id))
        conn.execute('INSERT INTO consultant_roles (consultant_id, role_id) VALUES (?, ?)', (consultant_id, payload['companyRoleId']))
      self._send_json({'id': consultant_id}, HTTPStatus.CREATED)
      return

    if path == '/api/allocation-simulations':
      error = self._allocation_simulation_payload_error(payload, require_state=False)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      now = datetime.utcnow().strftime('%Y-%m-%d %H:%M')
      simulation_name = payload.get('name') or f'Simulation {now}'
      state = payload.get('state') or {'projects': [], 'unassignedConsultantIds': []}
      with get_connection() as conn:
        cursor = conn.execute(
          'INSERT INTO allocation_simulations (name, state_json) VALUES (?, ?)',
          (simulation_name, json.dumps(state))
        )
      self._send_json({'id': cursor.lastrowid, 'name': simulation_name}, HTTPStatus.CREATED)
      return

    if path == '/api/roles':
      error = self._name_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute('INSERT INTO roles (name) VALUES (?)', (payload['name'],))
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Role already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/areas':
      error = self._name_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute('INSERT INTO areas (name) VALUES (?)', (payload['name'],))
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Area already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/day-off-types':
      error = self._name_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute('INSERT INTO day_off_types (name) VALUES (?)', (payload['name'],))
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Day off type already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/holiday-locations':
      error = self._holiday_location_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute(
            'INSERT INTO holiday_locations (label, country_code, region_code) VALUES (?, ?, ?)',
            (payload['label'], payload['countryCode'], payload['regionCode'])
          )
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Holiday location already exists for this country/region'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/holidays/load':
      error = self._holiday_load_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return

      consultant_id = payload.get('consultantId')
      if consultant_id not in (None, ''):
        try:
          consultant_id = int(consultant_id)
        except (TypeError, ValueError):
          self._send_json({'error': 'consultantId must be numeric when provided'}, HTTPStatus.BAD_REQUEST)
          return
      else:
        consultant_id = None

      with get_connection() as conn:
        try:
          rows = self._load_holidays(conn, payload['year'], payload['countryCode'], payload['regionCode'])
        except RuntimeError as error:
          self._send_json({'error': str(error)}, HTTPStatus.BAD_REQUEST)
          return

        response_payload = {'holidays': rows}
        if consultant_id is not None:
          if not self._ids_exist(conn, 'consultants', [consultant_id]):
            self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
            return
          holiday_location_id = self._ensure_holiday_location(conn, payload['countryCode'], payload['regionCode'])
          conn.execute(
            'UPDATE consultants SET holiday_location_id = ? WHERE id = ?',
            (holiday_location_id, consultant_id)
          )
          conn.execute(
            '''
            INSERT INTO consultant_holiday_loads (consultant_id, year, country_code, region_code, loaded_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(consultant_id, year, country_code, region_code)
            DO UPDATE SET loaded_at = CURRENT_TIMESTAMP
            ''',
            (consultant_id, payload['year'], payload['countryCode'], payload['regionCode'])
          )
          response_payload['holidayLocationId'] = holiday_location_id
          response_payload['holidayCalendarLoad'] = {
            'year': payload['year'],
            'countryCode': payload['countryCode'],
            'regionCode': payload['regionCode'],
            'loadedAt': datetime.utcnow().isoformat(timespec='seconds')
          }

      self._send_json(response_payload)
      return

    self.send_error(HTTPStatus.NOT_FOUND)

  def do_PUT(self):
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')
    holiday_location_id = self._holiday_location_id()
    allocation_simulation_id = self._allocation_simulation_id()

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    if project_id is not None:
      error = self._project_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        ids_to_check = [item['consultantId'] for item in payload['consultantAssignments']] + [payload['managerConsultantId']]
        if not self._ids_exist(conn, 'consultants', ids_to_check):
          self._send_json({'error': 'Manager or members include unknown consultant IDs'}, HTTPStatus.BAD_REQUEST)
          return
        if not self._consultant_has_project_manager_role(conn, payload['managerConsultantId']):
          self._send_json({'error': 'Selected manager must have the Project Manager role'}, HTTPStatus.BAD_REQUEST)
          return

        manager_name = self._consultant_name(conn, payload['managerConsultantId'])
        cursor = conn.execute(
          '''
          UPDATE projects
          SET project_name = ?, client_name = ?, project_lead = ?, client_contact = ?, start_date = ?, end_date = ?, manager_consultant_id = ?, project_type = ?
          WHERE id = ?
          ''',
          (payload['projectName'], payload['clientName'], manager_name or 'Manager', payload['clientContact'], payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], project_id)
        )
        if cursor.rowcount == 0:
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute('DELETE FROM project_consultants WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_milestones WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_phases WHERE project_id = ?', (project_id,))
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'])
          )
        phase_id_map = {}
        for phase in payload['projectPhases']:
          cursor_phase = conn.execute(
            'INSERT INTO project_phases (project_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
            (project_id, phase['name'], phase['startDate'], phase['endDate'])
          )
          phase_id_map[phase['id']] = cursor_phase.lastrowid
        for milestone in payload['projectMilestones']:
          conn.execute(
            'INSERT INTO project_milestones (project_id, phase_id, name, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, phase_id_map.get(milestone['phaseId']), milestone['name'], milestone['startDate'], milestone['endDate'])
          )
      self._send_json({'status': 'updated'})
      return

    if consultant_id is not None:
      error = self._consultant_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        if not self._ids_exist(conn, 'areas', payload['areaIds']):
          self._send_json({'error': 'Unknown area selected'}, HTTPStatus.BAD_REQUEST)
          return
        if not self._ids_exist(conn, 'roles', [payload['companyRoleId']]):
          self._send_json({'error': 'Selected company role does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        if payload['holidayLocationId'] is not None and not self._ids_exist(conn, 'holiday_locations', [payload['holidayLocationId']]):
          self._send_json({'error': 'Selected holiday location does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
        role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()
        cursor = conn.execute(
          'UPDATE consultants SET name = ?, area = ?, position = ?, salary = ?, holiday_location_id = ?, start_date = ? WHERE id = ?',
          (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['startDate'], consultant_id)
        )
        if cursor.rowcount == 0:
          self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute('DELETE FROM consultant_areas WHERE consultant_id = ?', (consultant_id,))
        conn.execute('DELETE FROM consultant_roles WHERE consultant_id = ?', (consultant_id,))
        for area_id in sorted(set(payload['areaIds'])):
          conn.execute('INSERT INTO consultant_areas (consultant_id, area_id) VALUES (?, ?)', (consultant_id, area_id))
        conn.execute('INSERT INTO consultant_roles (consultant_id, role_id) VALUES (?, ?)', (consultant_id, payload['companyRoleId']))
      self._send_json({'status': 'updated'})
      return

    if holiday_location_id is not None:
      error = self._holiday_location_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute(
            'UPDATE holiday_locations SET label = ?, country_code = ?, region_code = ? WHERE id = ?',
            (payload['label'], payload['countryCode'], payload['regionCode'], holiday_location_id)
          )
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Holiday location already exists for this country/region'}, HTTPStatus.BAD_REQUEST)
          return
      if cursor.rowcount == 0:
        self._send_json({'error': 'Holiday location not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'updated'})
      return

    if allocation_simulation_id is not None:
      error = self._allocation_simulation_payload_error(payload, require_state=True)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      simulation_name = payload.get('name', '').strip() or f"Simulation {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
      with get_connection() as conn:
        cursor = conn.execute(
          '''
          UPDATE allocation_simulations
          SET name = ?, state_json = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          ''',
          (simulation_name, json.dumps(payload['state']), allocation_simulation_id)
        )
      if cursor.rowcount == 0:
        self._send_json({'error': 'Allocation simulation not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'updated'})
      return

    self.send_error(HTTPStatus.NOT_FOUND)

  def do_DELETE(self):
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')
    role_id = self._resource_id('roles')
    area_id = self._resource_id('areas')
    day_off_type_id = self._resource_id('day-off-types')
    availability_consultant_id, availability_id = self._availability_route()
    allocation_simulation_id = self._allocation_simulation_id()

    if availability_consultant_id is not None and availability_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM consultant_availability WHERE id = ? AND consultant_id = ?', (availability_id, availability_consultant_id))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Availability entry not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if project_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if consultant_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM consultants WHERE id = ?', (consultant_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if role_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM roles WHERE id = ?', (role_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Role not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if area_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM areas WHERE id = ?', (area_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Area not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if day_off_type_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM day_off_types WHERE id = ?', (day_off_type_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Day off type not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if allocation_simulation_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM allocation_simulations WHERE id = ?', (allocation_simulation_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Allocation simulation not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    self.send_error(HTTPStatus.NOT_FOUND)


if __name__ == '__main__':
  init_db()
  server = ThreadingHTTPServer(('0.0.0.0', 8000), VPMHandler)
  print('Serving on http://0.0.0.0:8000')
  server.serve_forever()
