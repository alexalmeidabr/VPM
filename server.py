#!/usr/bin/env python3
import json
import sqlite3
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'projects.db'

DEFAULT_ROLES = [
  'TM Junior Consultant',
  'TM Regular Consultant',
  'TM Senior Consultant',
  'Project Manager',
  'EWM Junior Consultant',
  'EWM Regular Consultant',
  'EWM Senior Consultant'
]

DEFAULT_AREAS = [
  'TM (Transport Management)',
  'EWM (Extended Warehouse Management)',
  'YL (Yard Logistics)'
]


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

      CREATE TABLE IF NOT EXISTS consultants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        area TEXT,
        position TEXT,
        salary REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
        type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
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
      '''
    )

    ensure_column(conn, 'projects', 'manager_consultant_id', 'manager_consultant_id INTEGER')
    ensure_column(conn, 'projects', 'project_type', 'project_type TEXT')
    ensure_column(conn, 'project_consultants', 'project_role', 'project_role TEXT')
    ensure_column(conn, 'project_consultants', 'start_date', 'start_date TEXT')
    ensure_column(conn, 'project_consultants', 'end_date', 'end_date TEXT')
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

  def _parts(self):
    return [part for part in self._path().split('/') if part]

  def _resource_id(self, resource):
    parts = self._parts()
    if len(parts) == 3 and parts[0] == 'api' and parts[1] == resource and parts[2].isdigit():
      return int(parts[2])
    return None

  def _availability_route(self):
    parts = self._parts()
    if len(parts) == 4 and parts[:3] == ['api', 'consultants', parts[2]] and parts[2].isdigit() and parts[3] == 'availability':
      return int(parts[2]), None
    if len(parts) == 5 and parts[:3] == ['api', 'consultants', parts[2]] and parts[2].isdigit() and parts[3] == 'availability' and parts[4].isdigit():
      return int(parts[2]), int(parts[4])
    return None, None

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

  def _project_payload_error(self, payload):
    required = ['projectName', 'clientName', 'clientContact', 'startDate', 'endDate', 'managerConsultantId', 'projectType']
    for field in required:
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

    assignments = payload.get('consultantAssignments')
    if assignments is None:
      consultant_ids = payload.get('consultantIds', [])
      if not isinstance(consultant_ids, list):
        return 'consultantIds must be a list'
      try:
        assignments = [
          {
            'consultantId': int(cid),
            'projectRole': 'Project Member',
            'startDate': payload['startDate'],
            'endDate': payload['endDate']
          }
          for cid in consultant_ids
        ]
      except (TypeError, ValueError):
        return 'consultantIds must contain numeric IDs'

    if not isinstance(assignments, list):
      return 'consultantAssignments must be a list'

    normalized = []
    for assignment in assignments:
      if not isinstance(assignment, dict):
        return 'consultantAssignments items must be objects'
      role = str(assignment.get('projectRole', '')).strip()
      if not role:
        return 'projectRole is required for each project consultant'
      start_date = str(assignment.get('startDate', '')).strip()
      end_date = str(assignment.get('endDate', '')).strip()
      if start_date and end_date and start_date > end_date:
        return 'project member startDate cannot be after endDate'
      if not self._valid_iso_date(start_date) or not self._valid_iso_date(end_date):
        return 'project member dates must be YYYY-MM-DD'
      try:
        consultant_id = int(assignment.get('consultantId'))
      except (TypeError, ValueError):
        return 'consultantId must be numeric for each project consultant'
      normalized.append({
        'consultantId': consultant_id,
        'projectRole': role,
        'startDate': start_date,
        'endDate': end_date
      })

    payload['consultantAssignments'] = normalized
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

    company_role_id = payload.get('companyRoleId')
    if company_role_id in (None, ''):
      role_ids = payload.get('roleIds', [])
      if isinstance(role_ids, list) and role_ids:
        company_role_id = role_ids[0]

    try:
      payload['areaIds'] = [int(value) for value in area_ids]
      payload['companyRoleId'] = int(company_role_id)
    except (TypeError, ValueError):
      return 'areaIds and companyRoleId must be numeric IDs'

    return None

  def _availability_payload_error(self, payload):
    leave_type = str(payload.get('type', '')).strip()
    start = str(payload.get('startDate', '')).strip()
    end = str(payload.get('endDate', '')).strip()
    if leave_type not in ('Vacation', 'PTO'):
      return 'type must be Vacation or PTO'
    if not start or not end:
      return 'startDate and endDate are required'
    if not self._valid_iso_date(start) or not self._valid_iso_date(end):
      return 'startDate and endDate must be YYYY-MM-DD'
    if start > end:
      return 'startDate cannot be after endDate'
    payload['type'] = leave_type
    payload['startDate'] = start
    payload['endDate'] = end
    return None

  def _name_payload_error(self, payload):
    payload['name'] = str(payload.get('name', '')).strip()
    if not payload['name']:
      return 'name is required'
    return None

  def _fetch_simple_table(self, conn, table):
    rows = conn.execute(f'SELECT id, name FROM {table} ORDER BY name').fetchall()
    return [{'id': row['id'], 'name': row['name']} for row in rows]

  def _fetch_consultants(self, conn):
    consultant_rows = conn.execute('SELECT id, name, salary FROM consultants ORDER BY created_at DESC, id DESC').fetchall()
    consultants = []
    for consultant in consultant_rows:
      role_row = conn.execute(
        '''
        SELECT r.id, r.name
        FROM consultant_roles cr
        JOIN roles r ON r.id = cr.role_id
        WHERE cr.consultant_id = ?
        ORDER BY r.name
        LIMIT 1
        ''',
        (consultant['id'],)
      ).fetchone()

      area_rows = conn.execute(
        '''
        SELECT a.id, a.name
        FROM consultant_areas ca
        JOIN areas a ON a.id = ca.area_id
        WHERE ca.consultant_id = ?
        ORDER BY a.name
        ''',
        (consultant['id'],)
      ).fetchall()

      availability_rows = conn.execute(
        '''
        SELECT id, type, start_date, end_date
        FROM consultant_availability
        WHERE consultant_id = ?
        ORDER BY start_date
        ''',
        (consultant['id'],)
      ).fetchall()

      consultants.append(
        {
          'id': consultant['id'],
          'name': consultant['name'],
          'salary': consultant['salary'],
          'companyRoleId': role_row['id'] if role_row else None,
          'companyRole': role_row['name'] if role_row else None,
          'areaIds': [row['id'] for row in area_rows],
          'areaNames': [row['name'] for row in area_rows],
          'availability': [
            {
              'id': row['id'],
              'type': row['type'],
              'startDate': row['start_date'],
              'endDate': row['end_date']
            }
            for row in availability_rows
          ]
        }
      )
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
        SELECT pc.consultant_id, pc.project_role, pc.start_date, pc.end_date, c.name as consultant_name
        FROM project_consultants pc
        JOIN consultants c ON c.id = pc.consultant_id
        WHERE pc.project_id = ?
        ORDER BY c.name
        ''',
        (row['id'],)
      ).fetchall()
      projects.append(
        {
          'id': row['id'],
          'projectName': row['project_name'],
          'clientName': row['client_name'],
          'clientContact': row['client_contact'],
          'startDate': row['start_date'],
          'endDate': row['end_date'],
          'projectType': row['project_type'],
          'managerConsultantId': row['manager_consultant_id'],
          'managerName': row['manager_name'],
          'consultantIds': [member['consultant_id'] for member in members],
          'consultantAssignments': [
            {
              'consultantId': member['consultant_id'],
              'consultantName': member['consultant_name'],
              'projectRole': member['project_role'] or 'Project Member',
              'startDate': member['start_date'] or '',
              'endDate': member['end_date'] or ''
            }
            for member in members
          ]
        }
      )
    return projects

  def do_GET(self):
    path = self._path()
    with get_connection() as conn:
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
      error = self._availability_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        if not self._ids_exist(conn, 'consultants', [consultant_id]):
          self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
          return
        cursor = conn.execute(
          'INSERT INTO consultant_availability (consultant_id, type, start_date, end_date) VALUES (?, ?, ?, ?)',
          (consultant_id, payload['type'], payload['startDate'], payload['endDate'])
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
          (
            payload['projectName'], payload['clientName'], manager_name or 'Manager', payload['clientContact'],
            payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType']
          )
        )
        project_id = cursor.lastrowid
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'])
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

        cursor = conn.execute(
          'INSERT INTO consultants (name, area, position, salary) VALUES (?, ?, ?, ?)',
          (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'])
        )
        new_consultant_id = cursor.lastrowid
        for area_id in sorted(set(payload['areaIds'])):
          conn.execute('INSERT INTO consultant_areas (consultant_id, area_id) VALUES (?, ?)', (new_consultant_id, area_id))
        conn.execute('INSERT INTO consultant_roles (consultant_id, role_id) VALUES (?, ?)', (new_consultant_id, payload['companyRoleId']))
      self._send_json({'id': new_consultant_id}, HTTPStatus.CREATED)
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

    self.send_error(HTTPStatus.NOT_FOUND)

  def do_PUT(self):
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')

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
          (
            payload['projectName'], payload['clientName'], manager_name or 'Manager', payload['clientContact'],
            payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], project_id
          )
        )
        if cursor.rowcount == 0:
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return

        conn.execute('DELETE FROM project_consultants WHERE project_id = ?', (project_id,))
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'])
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

        first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
        role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()

        cursor = conn.execute(
          'UPDATE consultants SET name = ?, area = ?, position = ?, salary = ? WHERE id = ?',
          (
            payload['name'],
            first_area['name'] if first_area else None,
            role_row['name'] if role_row else None,
            payload['salary'],
            consultant_id
          )
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

    self.send_error(HTTPStatus.NOT_FOUND)

  def do_DELETE(self):
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')
    role_id = self._resource_id('roles')
    area_id = self._resource_id('areas')
    availability_consultant_id, availability_id = self._availability_route()

    if availability_consultant_id is not None and availability_id is not None:
      with get_connection() as conn:
        cursor = conn.execute(
          'DELETE FROM consultant_availability WHERE id = ? AND consultant_id = ?',
          (availability_id, availability_consultant_id)
        )
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

    self.send_error(HTTPStatus.NOT_FOUND)


if __name__ == '__main__':
  init_db()
  server = ThreadingHTTPServer(('0.0.0.0', 8000), VPMHandler)
  print('Serving on http://0.0.0.0:8000')
  server.serve_forever()
