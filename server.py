#!/usr/bin/env python3
import json
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'projects.db'


def get_connection():
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  conn.execute('PRAGMA foreign_keys = ON')
  return conn


def init_db():
  with get_connection() as conn:
    conn.executescript(
      '''
      CREATE TABLE IF NOT EXISTS consultants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        area TEXT NOT NULL,
        position TEXT NOT NULL,
        salary REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        project_lead TEXT NOT NULL,
        client_contact TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_consultants (
        project_id INTEGER NOT NULL,
        consultant_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, consultant_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
      );
      '''
    )


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
    raw = self.rfile.read(length) if length > 0 else b'{}'
    return json.loads(raw.decode('utf-8'))

  def _path(self):
    return urlparse(self.path).path

  def _parts(self):
    return [part for part in self._path().split('/') if part]

  def _resource_id(self, resource):
    parts = self._parts()
    if len(parts) == 3 and parts[0] == 'api' and parts[1] == resource and parts[2].isdigit():
      return int(parts[2])
    return None

  def _project_payload_error(self, payload):
    required = ['projectName', 'clientName', 'projectLead', 'clientContact', 'startDate', 'endDate']
    for field in required:
      value = str(payload.get(field, '')).strip()
      if not value:
        return f'{field} is required'
      payload[field] = value

    consultant_ids = payload.get('consultantIds', [])
    if not isinstance(consultant_ids, list):
      return 'consultantIds must be a list'

    try:
      payload['consultantIds'] = [int(item) for item in consultant_ids]
    except (TypeError, ValueError):
      return 'consultantIds must contain numeric IDs'

    if payload['startDate'] > payload['endDate']:
      return 'startDate cannot be after endDate'

    return None

  def _consultant_payload_error(self, payload):
    required = ['name', 'area', 'position', 'salary']
    for field in required:
      value = str(payload.get(field, '')).strip()
      if not value:
        return f'{field} is required'
      payload[field] = value

    try:
      payload['salary'] = float(payload['salary'])
    except ValueError:
      return 'salary must be a number'

    if payload['salary'] < 0:
      return 'salary must be zero or more'

    return None

  def _consultant_ids_exist(self, conn, consultant_ids):
    if not consultant_ids:
      return True

    placeholders = ','.join(['?'] * len(consultant_ids))
    row = conn.execute(
      f'SELECT COUNT(*) AS total FROM consultants WHERE id IN ({placeholders})',
      consultant_ids
    ).fetchone()
    return row['total'] == len(set(consultant_ids))

  def _fetch_projects(self, conn):
    rows = conn.execute(
      '''
      SELECT id, project_name, client_name, project_lead, client_contact, start_date, end_date
      FROM projects
      ORDER BY created_at DESC, id DESC
      '''
    ).fetchall()

    projects = []
    for row in rows:
      consultant_rows = conn.execute(
        'SELECT consultant_id FROM project_consultants WHERE project_id = ? ORDER BY consultant_id',
        (row['id'],)
      ).fetchall()
      projects.append(
        {
          'id': row['id'],
          'projectName': row['project_name'],
          'clientName': row['client_name'],
          'projectLead': row['project_lead'],
          'clientContact': row['client_contact'],
          'startDate': row['start_date'],
          'endDate': row['end_date'],
          'consultantIds': [item['consultant_id'] for item in consultant_rows]
        }
      )

    return projects

  def _fetch_consultants(self, conn):
    rows = conn.execute(
      '''
      SELECT id, name, area, position, salary
      FROM consultants
      ORDER BY created_at DESC, id DESC
      '''
    ).fetchall()

    return [
      {
        'id': row['id'],
        'name': row['name'],
        'area': row['area'],
        'position': row['position'],
        'salary': row['salary']
      }
      for row in rows
    ]

  def do_GET(self):
    path = self._path()
    with get_connection() as conn:
      if path == '/api/projects':
        self._send_json({'projects': self._fetch_projects(conn)})
        return

      if path == '/api/consultants':
        self._send_json({'consultants': self._fetch_consultants(conn)})
        return

    super().do_GET()

  def do_POST(self):
    path = self._path()

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    if path == '/api/projects':
      error = self._project_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return

      with get_connection() as conn:
        if not self._consultant_ids_exist(conn, payload['consultantIds']):
          self._send_json({'error': 'One or more consultants do not exist'}, HTTPStatus.BAD_REQUEST)
          return

        cursor = conn.execute(
          '''
          INSERT INTO projects (project_name, client_name, project_lead, client_contact, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?)
          ''',
          (
            payload['projectName'], payload['clientName'], payload['projectLead'], payload['clientContact'],
            payload['startDate'], payload['endDate']
          )
        )
        project_id = cursor.lastrowid

        for consultant_id in sorted(set(payload['consultantIds'])):
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id) VALUES (?, ?)',
            (project_id, consultant_id)
          )

      self._send_json({'id': project_id}, HTTPStatus.CREATED)
      return

    if path == '/api/consultants':
      error = self._consultant_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return

      with get_connection() as conn:
        cursor = conn.execute(
          'INSERT INTO consultants (name, area, position, salary) VALUES (?, ?, ?, ?)',
          (payload['name'], payload['area'], payload['position'], payload['salary'])
        )
        consultant_id = cursor.lastrowid

      self._send_json({'id': consultant_id}, HTTPStatus.CREATED)
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
        if not self._consultant_ids_exist(conn, payload['consultantIds']):
          self._send_json({'error': 'One or more consultants do not exist'}, HTTPStatus.BAD_REQUEST)
          return

        cursor = conn.execute(
          '''
          UPDATE projects
          SET project_name = ?, client_name = ?, project_lead = ?, client_contact = ?, start_date = ?, end_date = ?
          WHERE id = ?
          ''',
          (
            payload['projectName'], payload['clientName'], payload['projectLead'], payload['clientContact'],
            payload['startDate'], payload['endDate'], project_id
          )
        )

        if cursor.rowcount == 0:
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return

        conn.execute('DELETE FROM project_consultants WHERE project_id = ?', (project_id,))
        for linked_consultant_id in sorted(set(payload['consultantIds'])):
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id) VALUES (?, ?)',
            (project_id, linked_consultant_id)
          )

      self._send_json({'status': 'updated'})
      return

    if consultant_id is not None:
      error = self._consultant_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return

      with get_connection() as conn:
        cursor = conn.execute(
          'UPDATE consultants SET name = ?, area = ?, position = ?, salary = ? WHERE id = ?',
          (payload['name'], payload['area'], payload['position'], payload['salary'], consultant_id)
        )

      if cursor.rowcount == 0:
        self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
        return

      self._send_json({'status': 'updated'})
      return

    self.send_error(HTTPStatus.NOT_FOUND)

  def do_DELETE(self):
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')

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

    self.send_error(HTTPStatus.NOT_FOUND)


if __name__ == '__main__':
  init_db()
  server = ThreadingHTTPServer(('0.0.0.0', 8000), VPMHandler)
  print('Serving on http://0.0.0.0:8000')
  server.serve_forever()
