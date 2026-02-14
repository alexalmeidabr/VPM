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
  return conn


def init_db():
  with get_connection() as conn:
    conn.execute(
      '''
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        project_lead TEXT NOT NULL,
        client_contact TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
      '''
    )


class ProjectHandler(SimpleHTTPRequestHandler):
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
    content_length = int(self.headers.get('Content-Length', 0))
    raw = self.rfile.read(content_length) if content_length > 0 else b'{}'
    return json.loads(raw.decode('utf-8'))

  def _path(self):
    return urlparse(self.path).path

  def _parse_project_id(self):
    parts = [part for part in self._path().split('/') if part]
    if len(parts) == 3 and parts[0] == 'api' and parts[1] == 'projects' and parts[2].isdigit():
      return int(parts[2])
    return None

  def _validate_payload(self, payload):
    required_fields = [
      'projectName',
      'clientName',
      'projectLead',
      'clientContact',
      'startDate',
      'endDate'
    ]

    for field in required_fields:
      value = str(payload.get(field, '')).strip()
      if not value:
        return f"{field} is required"
      payload[field] = value

    if payload['startDate'] > payload['endDate']:
      return 'startDate cannot be after endDate'

    return None

  def do_GET(self):
    if self._path() == '/api/projects':
      with get_connection() as conn:
        rows = conn.execute(
          '''
          SELECT id, project_name, client_name, project_lead, client_contact, start_date, end_date
          FROM projects
          ORDER BY created_at DESC, id DESC
          '''
        ).fetchall()

      projects = [
        {
          'id': row['id'],
          'projectName': row['project_name'],
          'clientName': row['client_name'],
          'projectLead': row['project_lead'],
          'clientContact': row['client_contact'],
          'startDate': row['start_date'],
          'endDate': row['end_date']
        }
        for row in rows
      ]
      self._send_json({'projects': projects})
      return

    super().do_GET()

  def do_POST(self):
    if self._path() != '/api/projects':
      self.send_error(HTTPStatus.NOT_FOUND)
      return

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    error = self._validate_payload(payload)
    if error:
      self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
      return

    with get_connection() as conn:
      cursor = conn.execute(
        '''
        INSERT INTO projects (project_name, client_name, project_lead, client_contact, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?)
        ''',
        (
          payload['projectName'],
          payload['clientName'],
          payload['projectLead'],
          payload['clientContact'],
          payload['startDate'],
          payload['endDate']
        )
      )
      project_id = cursor.lastrowid

    self._send_json({'id': project_id}, HTTPStatus.CREATED)

  def do_PUT(self):
    project_id = self._parse_project_id()
    if project_id is None:
      self.send_error(HTTPStatus.NOT_FOUND)
      return

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    error = self._validate_payload(payload)
    if error:
      self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
      return

    with get_connection() as conn:
      cursor = conn.execute(
        '''
        UPDATE projects
        SET project_name = ?, client_name = ?, project_lead = ?, client_contact = ?, start_date = ?, end_date = ?
        WHERE id = ?
        ''',
        (
          payload['projectName'],
          payload['clientName'],
          payload['projectLead'],
          payload['clientContact'],
          payload['startDate'],
          payload['endDate'],
          project_id
        )
      )

    if cursor.rowcount == 0:
      self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
      return

    self._send_json({'status': 'updated'})

  def do_DELETE(self):
    project_id = self._parse_project_id()
    if project_id is None:
      self.send_error(HTTPStatus.NOT_FOUND)
      return

    with get_connection() as conn:
      cursor = conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))

    if cursor.rowcount == 0:
      self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
      return

    self._send_json({'status': 'deleted'})


if __name__ == '__main__':
  init_db()
  server = ThreadingHTTPServer(('0.0.0.0', 8000), ProjectHandler)
  print('Serving on http://0.0.0.0:8000')
  server.serve_forever()
