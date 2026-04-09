#!/usr/bin/env python3
import json
import html
import io
import mimetypes
import re
import sqlite3
import shutil
import tempfile
import threading
import uuid
import zipfile
from datetime import datetime, timedelta
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import urlopen

try:
  import holidays as pyholidays
except ImportError:
  pyholidays = None

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'projects.db'
PROJECT_FILES_DIR = BASE_DIR / 'project-files'
COMPANY_LOGO_DIR = BASE_DIR / 'company-logo'
BACKUPS_DIR = BASE_DIR / 'backups'
BACKUP_RESTORE_LOCK = threading.Lock()

DEFAULT_ROLES = [
  'TM Junior Consultant', 'TM Regular Consultant', 'TM Senior Consultant',
  'Project Manager', 'EWM Junior Consultant', 'EWM Regular Consultant', 'EWM Senior Consultant'
]
DEFAULT_AREAS = ['TM (Transport Management)', 'EWM (Extended Warehouse Management)', 'YL (Yard Logistics)']
DEFAULT_DAY_OFF_TYPES = ['Vacation', 'PTO']
DEFAULT_PROJECT_TYPES = ['Time Material', 'Fixed Price', 'Milestone Billing', 'Non-Billable']
DEFAULT_COMPANY_BRANCHES = ['Poland', 'Germany']
ALLOWED_PROJECT_STATUSES = {'Not Started', 'In Progress', 'Delayed', 'Completed'}


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
  if conn.execute('SELECT COUNT(*) AS total FROM business_partner_types').fetchone()['total'] == 0:
    for bp_type in ['Client', 'Third Party']:
      conn.execute('INSERT INTO business_partner_types (name) VALUES (?)', (bp_type,))
  if conn.execute('SELECT COUNT(*) AS total FROM project_types').fetchone()['total'] == 0:
    for project_type in DEFAULT_PROJECT_TYPES:
      conn.execute('INSERT INTO project_types (name) VALUES (?)', (project_type,))
  if conn.execute('SELECT COUNT(*) AS total FROM company_branches').fetchone()['total'] == 0:
    for branch in DEFAULT_COMPANY_BRANCHES:
      conn.execute('INSERT INTO company_branches (name) VALUES (?)', (branch,))


def init_db():
  PROJECT_FILES_DIR.mkdir(parents=True, exist_ok=True)
  COMPANY_LOGO_DIR.mkdir(parents=True, exist_ok=True)
  BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
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

      CREATE TABLE IF NOT EXISTS business_partner_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS business_partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        address_street TEXT,
        address_number TEXT,
        postal_code TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        business_partner_type_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_partner_type_id) REFERENCES business_partner_types(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS business_partner_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_partner_id INTEGER NOT NULL,
        name TEXT,
        last_name TEXT,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_partner_id) REFERENCES business_partners(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS business_partner_contact_phones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        phone_number TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES business_partner_contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS business_partner_contact_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES business_partner_contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS consultants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        area TEXT,
        position TEXT,
        holiday_location_id INTEGER,
        company_branch_id INTEGER,
        salary REAL NOT NULL,
        start_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (holiday_location_id) REFERENCES holiday_locations(id) ON DELETE SET NULL,
        FOREIGN KEY (company_branch_id) REFERENCES company_branches(id) ON DELETE SET NULL
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

      CREATE TABLE IF NOT EXISTS monthly_timesheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultant_id INTEGER NOT NULL,
        month_start TEXT NOT NULL,
        status TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(consultant_id, month_start),
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS monthly_timesheet_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timesheet_id INTEGER NOT NULL,
        project_id INTEGER,
        activity TEXT,
        is_manual INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (timesheet_id) REFERENCES monthly_timesheets(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS monthly_timesheet_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        line_id INTEGER NOT NULL,
        entry_date TEXT NOT NULL,
        hours REAL NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(line_id, entry_date),
        FOREIGN KEY (line_id) REFERENCES monthly_timesheet_lines(id) ON DELETE CASCADE
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

      CREATE TABLE IF NOT EXISTS project_client_contacts (
        project_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, contact_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES business_partner_contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS project_delivery_partner_contacts (
        project_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, contact_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES business_partner_contacts(id) ON DELETE CASCADE
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
        billable INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (project_id, consultant_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS project_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        consultant_id INTEGER,
        area_id INTEGER,
        project_role TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        allocation REAL NOT NULL DEFAULT 100,
        billable INTEGER NOT NULL DEFAULT 1,
        daily_rate REAL,
        daily_rate_currency TEXT,
        comments TEXT,
        status TEXT NOT NULL DEFAULT 'Open',
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE SET NULL,
        FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS allocation_simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        original_filename TEXT NOT NULL,
        stored_filename TEXT NOT NULL UNIQUE,
        file_size INTEGER NOT NULL,
        uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        position_id INTEGER,
        invoice_ref TEXT,
        period_from TEXT NOT NULL,
        period_to TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        amount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Draft',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (position_id) REFERENCES project_positions(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS invoice_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        payment_date TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      );
      '''
    )

    ensure_column(conn, 'projects', 'manager_consultant_id', 'manager_consultant_id INTEGER')
    ensure_column(conn, 'projects', 'project_type', 'project_type TEXT')
    ensure_column(conn, 'projects', 'project_status', 'project_status TEXT')
    ensure_column(conn, 'projects', 'client_business_partner_id', 'client_business_partner_id INTEGER REFERENCES business_partners(id) ON DELETE SET NULL')
    ensure_column(conn, 'projects', 'delivery_partner_business_partner_id', 'delivery_partner_business_partner_id INTEGER REFERENCES business_partners(id) ON DELETE SET NULL')
    ensure_column(conn, 'projects', 'contract_with_branch_id', 'contract_with_branch_id INTEGER REFERENCES company_branches(id) ON DELETE SET NULL')
    ensure_column(conn, 'project_consultants', 'project_role', 'project_role TEXT')
    ensure_column(conn, 'project_consultants', 'start_date', 'start_date TEXT')
    ensure_column(conn, 'project_consultants', 'end_date', 'end_date TEXT')
    ensure_column(conn, 'project_consultants', 'billable', 'billable INTEGER NOT NULL DEFAULT 1')
    ensure_column(conn, 'project_positions', 'daily_rate', 'daily_rate REAL')
    ensure_column(conn, 'project_positions', 'daily_rate_currency', 'daily_rate_currency TEXT')
    ensure_column(conn, 'consultant_availability', 'day_off_type_id', 'day_off_type_id INTEGER')
    ensure_column(conn, 'consultant_availability', 'type', 'type TEXT')
    ensure_column(conn, 'consultants', 'holiday_location_id', 'holiday_location_id INTEGER REFERENCES holiday_locations(id) ON DELETE SET NULL')
    ensure_column(conn, 'consultants', 'company_branch_id', 'company_branch_id INTEGER REFERENCES company_branches(id) ON DELETE SET NULL')
    ensure_column(conn, 'consultants', 'start_date', 'start_date TEXT')
    ensure_column(conn, 'business_partners', 'tax_identification', 'tax_identification TEXT')
    ensure_column(conn, 'company_branches', 'tax_identification', 'tax_identification TEXT')
    ensure_column(conn, 'company_branches', 'street_name', 'street_name TEXT')
    ensure_column(conn, 'company_branches', 'street_number', 'street_number TEXT')
    ensure_column(conn, 'company_branches', 'postal_code', 'postal_code TEXT')
    ensure_column(conn, 'company_branches', 'city', 'city TEXT')
    ensure_column(conn, 'company_branches', 'region', 'region TEXT')
    ensure_column(conn, 'company_branches', 'country', 'country TEXT')
    conn.execute(
      '''
      INSERT INTO project_positions (project_id, consultant_id, project_role, start_date, end_date, billable, status)
      SELECT pc.project_id, pc.consultant_id, COALESCE(NULLIF(TRIM(pc.project_role), ''), 'Project Position'), pc.start_date, pc.end_date, COALESCE(pc.billable, 1), 'Assigned'
      FROM project_consultants pc
      WHERE NOT EXISTS (
        SELECT 1 FROM project_positions pp
        WHERE pp.project_id = pc.project_id
          AND COALESCE(pp.consultant_id, 0) = COALESCE(pc.consultant_id, 0)
          AND COALESCE(pp.project_role, '') = COALESCE(pc.project_role, '')
          AND COALESCE(pp.start_date, '') = COALESCE(pc.start_date, '')
          AND COALESCE(pp.end_date, '') = COALESCE(pc.end_date, '')
      )
      '''
    )
    seed_defaults(conn)


class VPMHandler(SimpleHTTPRequestHandler):
  def _detect_company_logo_extension(self, original_filename, file_data):
    suffix = Path(str(original_filename or '')).suffix.lower()
    if suffix in ('.png', '.jpg', '.jpeg', '.svg'):
      ext = '.jpg' if suffix == '.jpeg' else suffix
    else:
      ext = ''

    if file_data.startswith(b'\x89PNG\r\n\x1a\n'):
      return '.png'
    if file_data.startswith(b'\xff\xd8\xff'):
      return '.jpg'
    try:
      head = file_data[:2048].decode('utf-8', errors='ignore').lower()
    except Exception:
      head = ''
    if '<svg' in head:
      return '.svg'
    return ext

  def _company_logo_path(self):
    for candidate in sorted(COMPANY_LOGO_DIR.glob('current.*')):
      if candidate.is_file():
        return candidate
    return None

  def _company_logo_payload(self):
    logo_path = self._company_logo_path()
    if not logo_path:
      return {'hasLogo': False, 'logoUrl': None}
    return {
      'hasLogo': True,
      'logoUrl': f'/api/company-logo/file?ts={int(logo_path.stat().st_mtime)}'
    }

  def _replace_company_logo_file(self, ext, file_data):
    COMPANY_LOGO_DIR.mkdir(parents=True, exist_ok=True)
    for candidate in COMPANY_LOGO_DIR.glob('current.*'):
      if candidate.is_file():
        candidate.unlink(missing_ok=True)
    target = COMPANY_LOGO_DIR / f'current{ext}'
    target.write_bytes(file_data)
    return target

  def _send_binary_file(self, file_path):
    if not file_path or not file_path.exists() or not file_path.is_file():
      self._send_json({'error': 'Company logo not found'}, HTTPStatus.NOT_FOUND)
      return
    mime_type = mimetypes.guess_type(str(file_path))[0] or 'application/octet-stream'
    data = file_path.read_bytes()
    self.send_response(HTTPStatus.OK)
    self.send_header('Content-Type', mime_type)
    self.send_header('Content-Length', str(len(data)))
    self.send_header('Cache-Control', 'no-store')
    self.end_headers()
    self.wfile.write(data)

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

  def _send_html(self, html_text, status=HTTPStatus.OK):
    body = html_text.encode('utf-8')
    self.send_response(status)
    self.send_header('Content-Type', 'text/html; charset=utf-8')
    self.send_header('Content-Length', str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def _backup_required_tables(self):
    return {
      'consultants',
      'projects',
      'project_positions',
      'consultant_availability',
      'monthly_timesheets',
      'monthly_timesheet_lines',
      'monthly_timesheet_entries',
      'business_partners',
      'invoices',
      'invoice_payments',
      'roles',
      'areas',
      'day_off_types',
      'business_partner_types',
      'project_types',
      'company_branches'
    }

  def _validate_backup_database_file(self, db_path):
    if not db_path or not Path(db_path).exists():
      raise ValueError('Backup does not contain a readable projects.db file')
    try:
      with sqlite3.connect(db_path) as test_conn:
        integrity_row = test_conn.execute('PRAGMA integrity_check').fetchone()
        integrity_status = str(integrity_row[0] if integrity_row else '').strip().lower()
        if integrity_status != 'ok':
          raise ValueError('SQLite integrity check failed for backup database')
        table_rows = test_conn.execute(
          "SELECT name FROM sqlite_master WHERE type = 'table'"
        ).fetchall()
    except sqlite3.Error as error:
      raise ValueError('Backup projects.db is not a valid SQLite database') from error
    existing_tables = {str(row[0]) for row in table_rows}
    missing = sorted(self._backup_required_tables() - existing_tables)
    if missing:
      raise ValueError(f'Backup database is missing required tables: {", ".join(missing)}')

  def _create_database_snapshot(self, output_path):
    output_path = Path(output_path)
    source_uri = f'file:{DB_PATH.as_posix()}?mode=ro'
    source_conn = None
    snapshot_conn = None
    try:
      source_conn = sqlite3.connect(source_uri, uri=True)
      snapshot_conn = sqlite3.connect(output_path)
      source_conn.backup(snapshot_conn)
    except sqlite3.Error as error:
      raise ValueError(f'Unable to create SQLite snapshot for backup: {error}') from error
    finally:
      if snapshot_conn is not None:
        snapshot_conn.close()
      if source_conn is not None:
        source_conn.close()

  def _build_backup_manifest(self):
    schema_version = None
    try:
      with sqlite3.connect(DB_PATH) as conn:
        schema_version = conn.execute('PRAGMA user_version').fetchone()[0]
    except sqlite3.Error:
      schema_version = None
    return {
      'app_name': 'Inhouse PSA',
      'created_at': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
      'database_name': DB_PATH.name,
      'backup_format_version': 1,
      'schema_version': schema_version
    }

  def _create_backup_zip_payload(self):
    with tempfile.TemporaryDirectory(prefix='psa-backup-') as temp_dir:
      temp_dir_path = Path(temp_dir)
      snapshot_path = temp_dir_path / 'projects_snapshot.db'
      self._create_database_snapshot(snapshot_path)
      # Defensive check to guarantee the snapshot file is closed/released before zipping.
      if not snapshot_path.exists() or snapshot_path.stat().st_size <= 0:
        raise ValueError('SQLite snapshot file was not created correctly for backup export')
      print(f'[Backup] Snapshot created and released: {snapshot_path.name} ({snapshot_path.stat().st_size} bytes)')
      manifest_bytes = json.dumps(self._build_backup_manifest(), indent=2).encode('utf-8')
      snapshot_bytes = snapshot_path.read_bytes()
      buffer = io.BytesIO()
      with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(DB_PATH.name, snapshot_bytes)
        archive.writestr('manifest.json', manifest_bytes)
      return buffer.getvalue()

  def _create_safety_backup(self):
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    safety_path = BACKUPS_DIR / f'projects_backup_{timestamp}.db'
    source_uri = f'file:{DB_PATH.as_posix()}?mode=ro'
    source_conn = None
    safety_conn = None
    try:
      source_conn = sqlite3.connect(source_uri, uri=True)
      safety_conn = sqlite3.connect(safety_path)
      source_conn.backup(safety_conn)
    except sqlite3.Error as error:
      raise ValueError(f'Unable to create safety backup snapshot: {error}') from error
    finally:
      if safety_conn is not None:
        safety_conn.close()
      if source_conn is not None:
        source_conn.close()
    return safety_path

  def _restore_database_from_snapshot(self, imported_db_path):
    source_conn = None
    target_conn = None
    source_uri = f'file:{Path(imported_db_path).as_posix()}?mode=ro'
    try:
      source_conn = sqlite3.connect(source_uri, uri=True)
      target_conn = sqlite3.connect(DB_PATH)
      source_conn.backup(target_conn)
    except sqlite3.Error as error:
      raise ValueError(f'Unable to restore live database from backup snapshot: {error}') from error
    finally:
      if target_conn is not None:
        target_conn.close()
      if source_conn is not None:
        source_conn.close()

  def _restore_backup_from_zip_bytes(self, zip_bytes):
    if not zip_bytes:
      raise ValueError('Uploaded backup file is empty')
    with tempfile.TemporaryDirectory(prefix='psa-restore-') as temp_dir:
      temp_dir_path = Path(temp_dir)
      try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as archive:
          names = set(archive.namelist())
          if DB_PATH.name not in names:
            raise ValueError('Backup ZIP must include projects.db')
          extracted_db_path = temp_dir_path / DB_PATH.name
          with archive.open(DB_PATH.name, 'r') as source_fp, open(extracted_db_path, 'wb') as target_fp:
            shutil.copyfileobj(source_fp, target_fp)
      except zipfile.BadZipFile as error:
        raise ValueError('Uploaded file is not a valid ZIP archive') from error

      self._validate_backup_database_file(extracted_db_path)
      safety_path = self._create_safety_backup()
      self._restore_database_from_snapshot(extracted_db_path)
      return safety_path

  def _invoice_print_html(self, conn, invoice_id):
    row = conn.execute(
      '''
      SELECT i.id, i.invoice_ref, i.period_from, i.period_to, i.invoice_date, i.due_date, i.amount, i.notes,
             p.project_name, p.contract_with_branch_id, p.client_business_partner_id,
             cb.name AS branch_name, cb.tax_identification AS branch_tax_identification,
             cb.street_name AS branch_street_name, cb.street_number AS branch_street_number,
             cb.postal_code AS branch_postal_code, cb.city AS branch_city, cb.region AS branch_region, cb.country AS branch_country,
             bp.company_name AS client_company_name, bp.tax_identification AS client_tax_identification,
             bp.address_street AS client_street_name, bp.address_number AS client_street_number,
             bp.postal_code AS client_postal_code, bp.city AS client_city, bp.region AS client_region, bp.country AS client_country
      FROM invoices i
      JOIN projects p ON p.id = i.project_id
      LEFT JOIN company_branches cb ON cb.id = p.contract_with_branch_id
      LEFT JOIN business_partners bp ON bp.id = p.client_business_partner_id
      WHERE i.id = ?
      LIMIT 1
      ''',
      (invoice_id,)
    ).fetchone()
    if not row:
      return None

    def _address_lines(street_name, street_number, postal_code, city, region, country):
      street = ' '.join(part for part in [street_name or '', street_number or ''] if str(part).strip()).strip()
      locality = ' '.join(part for part in [postal_code or '', city or ''] if str(part).strip()).strip()
      region_country = ', '.join(part for part in [region or '', country or ''] if str(part).strip()).strip()
      return [line for line in [street, locality, region_country] if line]

    def _money(value):
      try:
        amount = float(value or 0)
      except (TypeError, ValueError):
        amount = 0.0
      return f'EUR {amount:,.2f}'

    def _fmt_date(value):
      value = str(value or '').strip()
      if not value:
        return '—'
      try:
        return datetime.strptime(value, '%Y-%m-%d').strftime('%d %b %Y')
      except ValueError:
        return value

    logo_payload = self._company_logo_payload()
    logo_html = f'<img class="logo" src="{html.escape(logo_payload["logoUrl"])}" alt="Company logo" />' if logo_payload.get('hasLogo') and logo_payload.get('logoUrl') else f'<strong>{html.escape(str(row["branch_name"] or "VPM Workspace"))}</strong>'
    period_label = f'{_fmt_date(row["period_from"])} - {_fmt_date(row["period_to"])}'
    branch_lines = ''.join(f'<div>{html.escape(line)}</div>' for line in _address_lines(row['branch_street_name'], row['branch_street_number'], row['branch_postal_code'], row['branch_city'], row['branch_region'], row['branch_country']))
    client_lines = ''.join(f'<div>{html.escape(line)}</div>' for line in _address_lines(row['client_street_name'], row['client_street_number'], row['client_postal_code'], row['client_city'], row['client_region'], row['client_country']))
    amount_label = _money(row['amount'])
    notes_value = str(row['notes'] or '').strip() or 'Payment terms: as agreed in contract.'

    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice {html.escape(str(row["invoice_ref"] or row["id"]))}</title>
  <style>
    @page {{ size: A4; margin: 18mm; }}
    body {{ font-family: Arial, sans-serif; color: #1f2933; margin: 0; }}
    .invoice-wrap {{ max-width: 760px; margin: 0 auto; }}
    .header {{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:2px solid #d8e0e6; padding-bottom:12px; margin-bottom:14px; }}
    .logo {{ max-height:56px; max-width:220px; object-fit:contain; }}
    h1 {{ margin: 0; letter-spacing: 1px; }}
    .meta {{ font-size: 13px; line-height: 1.5; text-align:right; }}
    .blocks {{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }}
    .block {{ border:1px solid #d8e0e6; border-radius:6px; padding:10px 12px; font-size:13px; line-height:1.5; }}
    .block h3 {{ margin: 0 0 6px 0; font-size: 12px; color:#4a5a67; text-transform: uppercase; letter-spacing: 0.04em; }}
    .ref {{ border:1px solid #d8e0e6; border-radius:6px; padding:10px 12px; margin-bottom:14px; font-size:13px; line-height:1.5; }}
    table {{ width:100%; border-collapse: collapse; margin-bottom: 14px; }}
    th, td {{ border:1px solid #d8e0e6; padding:8px; font-size:13px; text-align:left; }}
    th {{ background:#f4f7f9; }}
    .num {{ text-align:right; }}
    .totals {{ margin-left:auto; width: 260px; border:1px solid #d8e0e6; border-radius:6px; }}
    .totals div {{ display:flex; justify-content:space-between; padding:8px 10px; font-size:13px; }}
    .totals div + div {{ border-top:1px solid #d8e0e6; }}
    .totals .grand {{ font-weight:700; font-size:15px; background:#f4f7f9; }}
    .notes {{ margin-top:14px; font-size:12px; color:#5c6b77; white-space:pre-wrap; }}
    .top-actions {{ margin: 10px 0 16px 0; }}
    .btn {{ border: 1px solid #cfd8de; border-radius: 6px; padding: 6px 10px; text-decoration: none; color: #1f2933; font-size: 12px; margin-right: 8px; }}
    @media print {{ .top-actions {{ display:none; }} }}
  </style>
</head>
<body>
  <div class="invoice-wrap">
    <div class="top-actions"><a class="btn" href="javascript:history.back()">Back</a><a class="btn" href="javascript:window.print()">Print</a></div>
    <div class="header">
      <div>{logo_html}</div>
      <div>
        <h1>INVOICE</h1>
        <div class="meta">
          <div><strong>Invoice #:</strong> {html.escape(str(row['invoice_ref'] or row['id']))}</div>
          <div><strong>Invoice Date:</strong> {html.escape(_fmt_date(row['invoice_date']))}</div>
          <div><strong>Billing Period:</strong> {html.escape(period_label)}</div>
          <div><strong>Currency:</strong> EUR</div>
        </div>
      </div>
    </div>
    <div class="blocks">
      <div class="block">
        <h3>Issuer</h3>
        <div><strong>{html.escape(str(row['branch_name'] or '—'))}</strong></div>
        {branch_lines or '<div>—</div>'}
        <div><strong>Tax ID:</strong> {html.escape(str(row['branch_tax_identification'] or '—'))}</div>
      </div>
      <div class="block">
        <h3>Bill To</h3>
        <div><strong>{html.escape(str(row['client_company_name'] or '—'))}</strong></div>
        {client_lines or '<div>—</div>'}
        <div><strong>Tax ID:</strong> {html.escape(str(row['client_tax_identification'] or '—'))}</div>
      </div>
    </div>
    <div class="ref">
      <div><strong>Project:</strong> {html.escape(str(row['project_name'] or '—'))}</div>
      <div><strong>Client:</strong> {html.escape(str(row['client_company_name'] or '—'))}</div>
      <div><strong>Contract With:</strong> {html.escape(str(row['branch_name'] or '—'))}</div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Period</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>Consulting services for period {html.escape(period_label)}</td>
          <td>{html.escape(period_label)}</td>
          <td class="num">1</td>
          <td class="num">{html.escape(amount_label)}</td>
          <td class="num">{html.escape(amount_label)}</td>
        </tr>
      </tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>{html.escape(amount_label)}</span></div>
      <div class="grand"><span>Total</span><span>{html.escape(amount_label)}</span></div>
    </div>
    <div class="notes">{html.escape(notes_value)}</div>
  </div>
</body>
</html>'''

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

  def _project_files_route(self):
    parts = self._parts()
    if len(parts) == 4 and parts[0:2] == ['api', 'projects'] and parts[2].isdigit() and parts[3] == 'files':
      return int(parts[2]), None, None
    if len(parts) == 6 and parts[0:2] == ['api', 'projects'] and parts[2].isdigit() and parts[3] == 'files' and parts[4].isdigit() and parts[5] == 'download':
      return int(parts[2]), int(parts[4]), 'download'
    return None, None, None

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

  def _project_payload_error(self, conn, payload):
    for field in ['projectName', 'startDate', 'endDate', 'managerConsultantId', 'projectType']:
      value = str(payload.get(field, '')).strip()
      if not value:
        return f'{field} is required'
      payload[field] = value

    client_bp = payload.get('clientBusinessPartnerId')
    if client_bp in (None, '', 0):
      return 'clientBusinessPartnerId is required'
    try:
      payload['clientBusinessPartnerId'] = int(client_bp)
    except (TypeError, ValueError):
      return 'clientBusinessPartnerId must be numeric'

    delivery_bp = payload.get('deliveryPartnerBusinessPartnerId')
    if delivery_bp in (None, ''):
      payload['deliveryPartnerBusinessPartnerId'] = None
    else:
      try:
        payload['deliveryPartnerBusinessPartnerId'] = int(delivery_bp)
      except (TypeError, ValueError):
        return 'deliveryPartnerBusinessPartnerId must be numeric'

    contract_with_branch = payload.get('contractWithBranchId')
    if contract_with_branch in (None, ''):
      payload['contractWithBranchId'] = None
    else:
      try:
        payload['contractWithBranchId'] = int(contract_with_branch)
      except (TypeError, ValueError):
        return 'contractWithBranchId must be numeric'
      branch_exists = conn.execute('SELECT 1 FROM company_branches WHERE id = ? LIMIT 1', (payload['contractWithBranchId'],)).fetchone()
      if not branch_exists:
        return 'contractWithBranchId must reference an existing company branch'

    for key in ('clientContactIds', 'deliveryPartnerContactIds'):
      values = payload.get(key, [])
      if not isinstance(values, list):
        return f'{key} must be a list'
      normalized_ids = []
      for value in values:
        try:
          normalized_ids.append(int(value))
        except (TypeError, ValueError):
          return f'{key} must include only numeric ids'
      payload[key] = sorted(set(normalized_ids))

    project_status = str(payload.get('projectStatus', '')).strip()
    if project_status and project_status not in ALLOWED_PROJECT_STATUSES:
      return 'projectStatus must be one of: Not Started, In Progress, Delayed, Completed'
    payload['projectStatus'] = project_status

    type_exists = conn.execute('SELECT 1 FROM project_types WHERE name = ? LIMIT 1', (payload['projectType'],)).fetchone()
    if not type_exists:
      return 'projectType must exist in configured project types'
    if payload['startDate'] > payload['endDate']:
      return 'startDate cannot be after endDate'

    try:
      payload['managerConsultantId'] = int(payload['managerConsultantId'])
    except (TypeError, ValueError):
      return 'managerConsultantId must be numeric'

    positions = payload.get('projectPositions', payload.get('consultantAssignments', []))
    if not isinstance(positions, list):
      return 'projectPositions must be a list'

    allowed_position_statuses = {'Open', 'Proposed', 'Approved', 'Assigned', 'Closed'}
    normalized_positions = []
    normalized_assignments = []
    for position in positions:
      if not isinstance(position, dict):
        return 'projectPositions items must be objects'
      role = str(position.get('projectRole', '')).strip()
      if not role:
        return 'projectRole is required for each project position'
      start = str(position.get('startDate', '')).strip()
      end = str(position.get('endDate', '')).strip()
      if start and end and start > end:
        return 'project position startDate cannot be after endDate'
      if not self._valid_iso_date(start) or not self._valid_iso_date(end):
        return 'project position dates must be YYYY-MM-DD'
      start, end = self._normalize_assignment_weekdays(start, end)
      if start and end and start > end:
        return 'project position date range must include at least one weekday'
      consultant_raw = position.get('consultantId')
      consultant_id = None
      if consultant_raw not in (None, '', 0):
        try:
          consultant_id = int(consultant_raw)
        except (TypeError, ValueError):
          return 'consultantId must be numeric when provided'
      billable = position.get('billable', True)
      if isinstance(billable, str):
        billable = billable.strip().lower() not in ('false', '0', 'no', 'off', '')
      else:
        billable = bool(billable)
      daily_rate_raw = position.get('dailyRate')
      daily_rate = None
      if daily_rate_raw not in (None, ''):
        try:
          daily_rate = float(daily_rate_raw)
        except (TypeError, ValueError):
          return 'dailyRate must be numeric when provided'
        if daily_rate < 0:
          return 'dailyRate cannot be negative'
      daily_rate_currency = str(position.get('dailyRateCurrency', '')).strip().upper() or None
      status = str(position.get('status', '')).strip() or ('Assigned' if consultant_id else 'Open')
      if status not in allowed_position_statuses:
        return 'project position status must be one of: Open, Proposed, Approved, Assigned, Closed'
      area_raw = position.get('areaId')
      area_id = None
      if area_raw not in (None, '', 0):
        try:
          area_id = int(area_raw)
        except (TypeError, ValueError):
          return 'areaId must be numeric when provided'
      normalized_position = {
        'id': str(position.get('id', '')).strip(),
        'consultantId': consultant_id,
        'areaId': area_id,
        'projectRole': role,
        'startDate': start,
        'endDate': end,
        'allocation': float(position.get('allocation', 100) or 100),
        'billable': billable,
        'dailyRate': daily_rate,
        'dailyRateCurrency': daily_rate_currency,
        'comments': str(position.get('comments', '')).strip(),
        'status': status
      }
      normalized_positions.append(normalized_position)
      if consultant_id is not None:
        normalized_assignments.append({'consultantId': consultant_id, 'projectRole': role, 'startDate': start, 'endDate': end, 'billable': billable})

    payload['projectPositions'] = normalized_positions
    payload['consultantAssignments'] = normalized_assignments

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
    if not self._valid_iso_date(start_date):
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
    company_branch_id = payload.get('companyBranchId')
    if company_branch_id in ('', None):
      payload['companyBranchId'] = None
    else:
      try:
        payload['companyBranchId'] = int(company_branch_id)
      except (TypeError, ValueError):
        return 'companyBranchId must be numeric when provided'
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

  def _fetch_company_branches(self, conn):
    rows = conn.execute(
      '''
      SELECT id, name, tax_identification, street_name, street_number, postal_code, city, region, country
      FROM company_branches
      ORDER BY name
      '''
    ).fetchall()
    return [
      {
        'id': row['id'],
        'name': row['name'],
        'taxIdentification': row['tax_identification'],
        'streetName': row['street_name'],
        'streetNumber': row['street_number'],
        'postalCode': row['postal_code'],
        'city': row['city'],
        'region': row['region'],
        'country': row['country']
      }
      for row in rows
    ]

  def _fetch_business_partners(self, conn):
    partners = conn.execute(
      '''
      SELECT id, company_name, tax_identification, address_street, address_number, postal_code, city, region, country, business_partner_type_id
      FROM business_partners
      ORDER BY company_name
      '''
    ).fetchall()
    result = []
    for partner in partners:
      contacts = conn.execute(
        'SELECT id, name, last_name, email FROM business_partner_contacts WHERE business_partner_id = ? ORDER BY id',
        (partner['id'],)
      ).fetchall()
      contact_payload = []
      for contact in contacts:
        emails = conn.execute(
          'SELECT email FROM business_partner_contact_emails WHERE contact_id = ? ORDER BY id',
          (contact['id'],)
        ).fetchall()
        phones = conn.execute(
          'SELECT phone_number FROM business_partner_contact_phones WHERE contact_id = ? ORDER BY id',
          (contact['id'],)
        ).fetchall()
        normalized_emails = [item['email'] for item in emails if str(item['email'] or '').strip()]
        if not normalized_emails and str(contact['email'] or '').strip():
          normalized_emails = [str(contact['email']).strip()]
        contact_payload.append({
          'id': contact['id'],
          'name': contact['name'],
          'lastName': contact['last_name'],
          'email': normalized_emails[0] if normalized_emails else '',
          'emails': normalized_emails,
          'phoneNumbers': [item['phone_number'] for item in phones]
        })
      result.append({
        'id': partner['id'],
        'companyName': partner['company_name'],
        'taxIdentification': partner['tax_identification'],
        'addressStreet': partner['address_street'],
        'addressNumber': partner['address_number'],
        'postalCode': partner['postal_code'],
        'city': partner['city'],
        'region': partner['region'],
        'country': partner['country'],
        'businessPartnerTypeId': partner['business_partner_type_id'],
        'contacts': contact_payload
      })
    return result

  def _fetch_consultants(self, conn):
    rows = conn.execute(
      '''
      SELECT c.id, c.name, c.salary, c.holiday_location_id, c.start_date, c.company_branch_id, cb.name AS company_branch_name
      FROM consultants c
      LEFT JOIN company_branches cb ON cb.id = c.company_branch_id
      ORDER BY c.created_at DESC, c.id DESC
      '''
    ).fetchall()
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
          for row in availability_rows
        ]
      })
    return consultants

  def _fetch_projects(self, conn):
    rows = conn.execute(
      '''
      SELECT p.id, p.project_name, p.client_name, p.client_contact, p.start_date, p.end_date,
             p.project_type, p.project_status, p.manager_consultant_id, p.client_business_partner_id, p.delivery_partner_business_partner_id,
             p.contract_with_branch_id, c.name AS manager_name, cb.name AS contract_with_branch_name
      FROM projects p
      LEFT JOIN consultants c ON c.id = p.manager_consultant_id
      LEFT JOIN company_branches cb ON cb.id = p.contract_with_branch_id
      ORDER BY p.created_at DESC, p.id DESC
      '''
    ).fetchall()

    projects = []
    for row in rows:
      positions = conn.execute(
        '''
        SELECT pp.id, pp.consultant_id, pp.area_id, pp.project_role, pp.start_date, pp.end_date, pp.allocation, pp.billable, pp.daily_rate, pp.daily_rate_currency, pp.comments, pp.status, c.name AS consultant_name
        FROM project_positions pp
        LEFT JOIN consultants c ON c.id = pp.consultant_id
        WHERE pp.project_id = ?
        ORDER BY pp.id
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
      client_contacts = conn.execute(
        '''
        SELECT bc.id, bc.name, bc.last_name, bc.email
        FROM project_client_contacts pcc
        JOIN business_partner_contacts bc ON bc.id = pcc.contact_id
        WHERE pcc.project_id = ?
        ORDER BY bc.id
        ''',
        (row['id'],)
      ).fetchall()
      delivery_contacts = conn.execute(
        '''
        SELECT bc.id, bc.name, bc.last_name, bc.email
        FROM project_delivery_partner_contacts pdc
        JOIN business_partner_contacts bc ON bc.id = pdc.contact_id
        WHERE pdc.project_id = ?
        ORDER BY bc.id
        ''',
        (row['id'],)
      ).fetchall()
      projects.append({
        'id': row['id'],
        'projectName': row['project_name'],
        'clientName': row['client_name'],
        'clientContact': row['client_contact'],
        'clientBusinessPartnerId': row['client_business_partner_id'],
        'deliveryPartnerBusinessPartnerId': row['delivery_partner_business_partner_id'],
        'contractWithBranchId': row['contract_with_branch_id'],
        'contractWithBranchName': row['contract_with_branch_name'],
        'clientContacts': [{'id': c['id'], 'name': c['name'], 'lastName': c['last_name'], 'email': c['email']} for c in client_contacts],
        'deliveryPartnerContacts': [{'id': c['id'], 'name': c['name'], 'lastName': c['last_name'], 'email': c['email']} for c in delivery_contacts],
        'startDate': row['start_date'],
        'endDate': row['end_date'],
        'projectType': row['project_type'],
        'projectStatus': row['project_status'],
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
        'projectPositions': [
          {
            'id': m['id'],
            'consultantId': m['consultant_id'],
            'consultantName': m['consultant_name'],
            'areaId': m['area_id'],
            'projectRole': m['project_role'] or 'Project Position',
            'startDate': m['start_date'] or '',
            'endDate': m['end_date'] or '',
            'allocation': m['allocation'] if m['allocation'] is not None else 100,
            'billable': bool(m['billable']) if m['billable'] is not None else True,
            'dailyRate': m['daily_rate'],
            'dailyRateCurrency': m['daily_rate_currency'],
            'comments': m['comments'] or '',
            'status': m['status'] or ('Assigned' if m['consultant_id'] else 'Open')
          }
          for m in positions
        ],
        'consultantAssignments': [
          {
            'consultantId': m['consultant_id'],
            'consultantName': m['consultant_name'],
            'projectRole': m['project_role'] or 'Project Position',
            'startDate': m['start_date'] or '',
            'endDate': m['end_date'] or '',
            'allocation': m['allocation'] if m['allocation'] is not None else 100,
            'billable': bool(m['billable']) if m['billable'] is not None else True,
            'comments': m['comments'] or ''
          }
          for m in positions if m['consultant_id'] is not None
        ]
      })
    return projects

  def _fetch_project_files(self, conn, project_id):
    rows = conn.execute(
      '''
      SELECT id, project_id, original_filename, stored_filename, file_size, uploaded_at
      FROM project_files
      WHERE project_id = ?
      ORDER BY uploaded_at DESC, id DESC
      ''',
      (project_id,)
    ).fetchall()
    return [
      {
        'id': row['id'],
        'projectId': row['project_id'],
        'originalFilename': row['original_filename'],
        'storedFilename': row['stored_filename'],
        'fileSize': row['file_size'],
        'uploadedAt': row['uploaded_at']
      }
      for row in rows
    ]

  def _read_request_body(self):
    length_raw = self.headers.get('Content-Length', '')
    try:
      content_length = int(length_raw or '0')
    except ValueError as error:
      raise ValueError('Invalid Content-Length header') from error
    if content_length <= 0:
      raise ValueError('Request body is required')
    return self.rfile.read(content_length)

  def _extract_boundary(self, content_type):
    content_type_value = str(content_type or '').strip()
    if not content_type_value.lower().startswith('multipart/form-data'):
      raise ValueError('Content-Type must be multipart/form-data')
    match = re.search(r'boundary=(?:"([^"]+)"|([^;]+))', content_type_value, re.IGNORECASE)
    boundary = (match.group(1) if match and match.group(1) is not None else (match.group(2) if match else '')).strip()
    if not boundary:
      raise ValueError('multipart/form-data boundary is missing')
    return boundary.encode('utf-8')

  def _parse_content_disposition(self, header_value):
    value = str(header_value or '').strip()
    if not value:
      return {}
    parts = [item.strip() for item in value.split(';') if item.strip()]
    if not parts:
      return {}
    metadata = {'type': parts[0].lower()}
    for item in parts[1:]:
      if '=' not in item:
        continue
      key, raw_value = item.split('=', 1)
      key = key.strip().lower()
      parsed_value = raw_value.strip().strip('"')
      metadata[key] = parsed_value
    return metadata

  def _parse_multipart_form_data(self, content_type, raw_body):
    boundary = self._extract_boundary(content_type)
    delimiter = b'--' + boundary
    if delimiter not in raw_body:
      raise ValueError('Malformed multipart payload: boundary not found in body')
    parts = []
    segments = raw_body.split(delimiter)
    for segment in segments[1:]:
      if segment in (b'', b'--', b'--\r\n'):
        continue
      if segment.startswith(b'\r\n'):
        segment = segment[2:]
      if segment.endswith(b'--\r\n'):
        segment = segment[:-4]
      elif segment.endswith(b'--'):
        segment = segment[:-2]
      if segment.endswith(b'\r\n'):
        segment = segment[:-2]
      header_blob, separator, body = segment.partition(b'\r\n\r\n')
      if not separator:
        raise ValueError('Malformed multipart payload: part headers are incomplete')
      headers = {}
      for header_line in header_blob.split(b'\r\n'):
        line = header_line.decode('utf-8', errors='replace')
        if ':' not in line:
          continue
        key, header_value = line.split(':', 1)
        headers[key.strip().lower()] = header_value.strip()
      disposition = self._parse_content_disposition(headers.get('content-disposition', ''))
      parts.append({
        'headers': headers,
        'name': disposition.get('name', ''),
        'filename': disposition.get('filename', ''),
        'data': body
      })
    if not parts:
      raise ValueError('Multipart request did not include any form parts')
    return parts

  def _read_upload_file(self):
    raw_body = self._read_request_body()
    parts = self._parse_multipart_form_data(self.headers.get('Content-Type', ''), raw_body)
    file_part = next((part for part in parts if part.get('name') == 'file'), None)
    if not file_part:
      raise ValueError('No "file" form part found in multipart request')
    original_filename = Path(str(file_part.get('filename') or '')).name
    if not original_filename:
      raise ValueError('Uploaded file must include a filename')
    file_data = file_part.get('data', b'')
    if not isinstance(file_data, (bytes, bytearray)):
      raise ValueError('Uploaded file payload is invalid')
    return original_filename, bytes(file_data)

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

  def _parse_month_start(self, value):
    month_raw = str(value or '').strip()
    try:
      parsed = datetime.strptime(month_raw, '%Y-%m')
    except ValueError:
      return None
    return parsed.strftime('%Y-%m-01')

  def _month_range(self, month_start):
    start = datetime.strptime(month_start, '%Y-%m-%d').date()
    if start.month == 12:
      next_month = start.replace(year=start.year + 1, month=1, day=1)
    else:
      next_month = start.replace(month=start.month + 1, day=1)
    end = next_month - timedelta(days=1)
    return start.isoformat(), end.isoformat()

  def _ensure_monthly_timesheet(self, conn, consultant_id, month_start):
    conn.execute('INSERT INTO monthly_timesheets (consultant_id, month_start) VALUES (?, ?) ON CONFLICT(consultant_id, month_start) DO NOTHING', (consultant_id, month_start))
    row = conn.execute('SELECT id, consultant_id, month_start, status FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?', (consultant_id, month_start)).fetchone()
    if not row:
      return None

    month_start_iso, month_end_iso = self._month_range(month_start)
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
      conn.execute(
        'INSERT INTO monthly_timesheet_lines (timesheet_id, project_id, activity, is_manual) VALUES (?, NULL, ?, 0)',
        (row['id'], type_name)
      )
      existing_time_off_labels.add(type_name.lower())

    return row

  def _fetch_timesheet_months(self, conn, consultant_id):
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

  def _working_days_between(self, start_date, end_date):
    if not start_date or not end_date:
      return 0
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()
    if end < start:
      return 0
    days = 0
    cursor = start
    while cursor <= end:
      if cursor.weekday() < 5:
        days += 1
      cursor += timedelta(days=1)
    return days

  def _position_forecast_amount(self, position, project_start, project_end):
    daily_rate = position['daily_rate']
    if daily_rate is None:
      return 0.0
    start = position['start_date'] or project_start
    end = position['end_date'] or project_end
    if not start or not end:
      return 0.0
    overlap_start = max(start, project_start)
    overlap_end = min(end, project_end)
    working_days = self._working_days_between(overlap_start, overlap_end)
    allocation = float(position['allocation'] if position['allocation'] is not None else 100.0)
    billable_days = working_days * max(allocation, 0.0) / 100.0
    return billable_days * float(daily_rate)

  def calculate_time_material_forecast(self, conn, project_id):
    project = conn.execute('SELECT start_date, end_date, project_type FROM projects WHERE id = ?', (project_id,)).fetchone()
    if not project:
      return 0.0
    if str(project['project_type'] or '').strip().lower() != 'time material':
      return 0.0
    project_start = project['start_date']
    project_end = project['end_date']
    if not project_start or not project_end:
      return 0.0
    rows = conn.execute(
      '''
      SELECT id, start_date, end_date, allocation, billable, daily_rate
      FROM project_positions
      WHERE project_id = ?
      ''',
      (project_id,)
    ).fetchall()
    total = 0.0
    for row in rows:
      if not bool(row['billable']):
        continue
      total += self._position_forecast_amount(row, project_start, project_end)
    return float(total)

  def calculate_invoice_paid_amount(self, conn, invoice_id):
    row = conn.execute('SELECT COALESCE(SUM(amount), 0) AS total FROM invoice_payments WHERE invoice_id = ?', (invoice_id,)).fetchone()
    return float(row['total'] if row and row['total'] is not None else 0.0)

  def recalculate_invoice_status(self, conn, invoice_id):
    invoice = conn.execute('SELECT id, amount, status FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
    if not invoice:
      return None
    paid_amount = self.calculate_invoice_paid_amount(conn, invoice_id)
    base_status = str(invoice['status'] or 'Draft')
    if base_status == 'Draft':
      return {'status': 'Draft', 'paidAmount': paid_amount}
    amount = float(invoice['amount'] if invoice['amount'] is not None else 0.0)
    if paid_amount >= amount and amount > 0:
      next_status = 'Paid'
    elif paid_amount > 0:
      next_status = 'Partially Paid'
    else:
      next_status = 'Issued'
    conn.execute('UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', (next_status, invoice_id))
    return {'status': next_status, 'paidAmount': paid_amount}

  def get_project_revenue_summary(self, conn, project_id):
    forecast_payload = self.calculate_time_material_revenue_forecast(conn, project_id)
    forecast = float(forecast_payload['summary']['totalForecastRevenueUntilProjectEnd'])
    actuals = self.calculate_revenue_actuals_summary(conn, project_id)
    return {
      'totalContractedRevenue': forecast_payload['summary']['totalContractedRevenue'],
      'revenueThisMonth': forecast_payload['summary']['revenueThisMonth'],
      'revenueNext3Months': forecast_payload['summary']['revenueNext3Months'],
      'totalForecastRevenueUntilProjectEnd': forecast_payload['summary']['totalForecastRevenueUntilProjectEnd'],
      'invoicedAmount': actuals['totalInvoiced'],
      'paidAmount': actuals['totalPaid'],
      'outstandingAmount': actuals['outstanding'],
      'unbilledForecast': forecast - actuals['totalInvoiced']
    }

  def calculate_revenue_actuals_summary(self, conn, project_id):
    invoiced_row = conn.execute('SELECT COALESCE(SUM(amount), 0) AS total FROM invoices WHERE project_id = ?', (project_id,)).fetchone()
    invoiced = float(invoiced_row['total'] if invoiced_row and invoiced_row['total'] is not None else 0.0)
    paid_row = conn.execute(
      '''
      SELECT COALESCE(SUM(p.amount), 0) AS total
      FROM invoice_payments p
      JOIN invoices i ON i.id = p.invoice_id
      WHERE i.project_id = ?
      ''',
      (project_id,)
    ).fetchone()
    paid = float(paid_row['total'] if paid_row and paid_row['total'] is not None else 0.0)
    outstanding = max(invoiced - paid, 0.0)
    return {
      'totalInvoiced': invoiced,
      'totalPaid': paid,
      'outstanding': outstanding
    }

  def get_revenue_actuals_summary(self, conn, project_id):
    actuals = self.calculate_revenue_actuals_summary(conn, project_id)
    return {
      'totalInvoiced': actuals['totalInvoiced'],
      'totalPaid': actuals['totalPaid'],
      'outstanding': actuals['outstanding'],
      'chart': [
        {'label': 'Paid', 'value': actuals['totalPaid']},
        {'label': 'Outstanding', 'value': actuals['outstanding']}
      ]
    }

  def get_revenue_forecast_summary(self, conn, project_id):
    forecast_payload = self.calculate_time_material_revenue_forecast(conn, project_id)
    return {
      'totalContractedRevenue': forecast_payload['summary']['totalContractedRevenue'],
      'revenueThisMonth': forecast_payload['summary']['revenueThisMonth'],
      'revenueNext3Months': forecast_payload['summary']['revenueNext3Months'],
      'totalForecastRevenueUntilProjectEnd': forecast_payload['summary']['totalForecastRevenueUntilProjectEnd'],
      'unbilledForecast': max(float(forecast_payload['summary']['totalForecastRevenueUntilProjectEnd']) - self.calculate_revenue_actuals_summary(conn, project_id)['totalInvoiced'], 0.0)
    }

  def iterate_months_between(self, start_date, end_date):
    if not start_date or not end_date:
      return []
    start = datetime.strptime(start_date, '%Y-%m-%d').date().replace(day=1)
    end = datetime.strptime(end_date, '%Y-%m-%d').date().replace(day=1)
    months = []
    cursor = start
    while cursor <= end:
      month_start = cursor
      if cursor.month == 12:
        next_month = cursor.replace(year=cursor.year + 1, month=1, day=1)
      else:
        next_month = cursor.replace(month=cursor.month + 1, day=1)
      month_end = next_month - timedelta(days=1)
      months.append((month_start, month_end))
      cursor = next_month
    return months

  def calculate_time_material_revenue_forecast(self, conn, project_id):
    project = conn.execute('SELECT id, start_date, end_date, project_type FROM projects WHERE id = ?', (project_id,)).fetchone()
    if not project or str(project['project_type'] or '').strip().lower() != 'time material':
      return {'summary': {'totalContractedRevenue': 0.0, 'revenueThisMonth': 0.0, 'revenueNext3Months': 0.0, 'totalForecastRevenueUntilProjectEnd': 0.0}, 'rows': []}
    rows = conn.execute(
      '''
      SELECT pp.id, pp.project_role, pp.consultant_id, pp.start_date, pp.end_date, pp.allocation, pp.billable, pp.daily_rate, pp.daily_rate_currency, pp.status, c.name AS consultant_name
      FROM project_positions pp
      LEFT JOIN consultants c ON c.id = pp.consultant_id
      WHERE pp.project_id = ?
      ORDER BY pp.id
      ''',
      (project_id,)
    ).fetchall()
    monthly_rows = []
    total = 0.0
    current_month = datetime.utcnow().date().replace(day=1)
    next_three_total = 0.0
    this_month_total = 0.0
    for position in rows:
      if not bool(position['billable']) or position['daily_rate'] is None:
        continue
      display_status = 'Closed' if (position['end_date'] and position['end_date'] < datetime.utcnow().date().isoformat()) else str(position['status'] or '')
      if display_status == 'Closed':
        continue
      position_start = position['start_date'] or project['start_date']
      position_end = position['end_date'] or project['end_date']
      if not position_start or not position_end:
        continue
      for month_start, month_end in self.iterate_months_between(position_start, position_end):
        overlap_start = max(position_start, month_start.isoformat())
        overlap_end = min(position_end, month_end.isoformat())
        working_days = self._working_days_between(overlap_start, overlap_end)
        if working_days <= 0:
          continue
        consultant_id = int(position['consultant_id']) if position['consultant_id'] is not None else None
        if consultant_id is not None:
          days_off = self._consultant_days_off_between(conn, consultant_id, overlap_start, overlap_end)
          working_days = max(working_days - days_off, 0)
        if working_days <= 0:
          continue
        allocation = float(position['allocation'] if position['allocation'] is not None else 100.0)
        billable_days = working_days * max(allocation, 0.0) / 100.0
        revenue = billable_days * float(position['daily_rate'])
        month_key = month_start.strftime('%Y-%m')
        row = {
          'month': month_key,
          'monthLabel': month_start.strftime('%b %Y'),
          'positionId': position['id'],
          'positionName': position['project_role'] or 'Project Position',
          'consultantId': position['consultant_id'],
          'consultantName': position['consultant_name'] or 'Open Position',
          'allocationPercent': allocation,
          'dailyRate': float(position['daily_rate']),
          'dailyRateCurrency': position['daily_rate_currency'] or 'EUR',
          'billableDays': billable_days,
          'revenue': revenue
        }
        monthly_rows.append(row)
        total += revenue
        if month_start == current_month:
          this_month_total += revenue
        month_diff = (month_start.year - current_month.year) * 12 + (month_start.month - current_month.month)
        if 0 <= month_diff <= 2:
          next_three_total += revenue
    return {
      'summary': {
        'totalContractedRevenue': total,
        'revenueThisMonth': this_month_total,
        'revenueNext3Months': next_three_total,
        'totalForecastRevenueUntilProjectEnd': total
      },
      'rows': monthly_rows
    }

  def get_revenue_forecast_monthly(self, conn, project_id):
    revenue_payload = self.calculate_time_material_revenue_forecast(conn, project_id)
    monthly = {}
    for row in revenue_payload['rows']:
      month = row['month']
      entry = monthly.setdefault(month, {
        'month': month,
        'monthLabel': row['monthLabel'],
        'billableDays': 0.0,
        'revenue': 0.0,
        'positionsCount': 0,
        'consultantsCount': 0,
        '_positions': set(),
        '_consultants': set()
      })
      entry['billableDays'] += float(row['billableDays'] or 0.0)
      entry['revenue'] += float(row['revenue'] or 0.0)
      entry['_positions'].add(row['positionId'])
      if row['consultantId']:
        entry['_consultants'].add(row['consultantId'])
    rows = []
    for month in sorted(monthly.keys()):
      entry = monthly[month]
      entry['positionsCount'] = len(entry['_positions'])
      entry['consultantsCount'] = len(entry['_consultants'])
      entry.pop('_positions', None)
      entry.pop('_consultants', None)
      rows.append(entry)
    return {'rows': rows}

  def get_revenue_forecast_month_details(self, conn, project_id, month):
    revenue_payload = self.calculate_time_material_revenue_forecast(conn, project_id)
    rows = [row for row in revenue_payload['rows'] if str(row.get('month', '')) == str(month or '')]
    return {'rows': rows}

  def _weekday_date_set_for_ranges(self, ranges):
    covered = set()
    for start_iso, end_iso in ranges:
      if not start_iso or not end_iso:
        continue
      start = datetime.strptime(start_iso, '%Y-%m-%d').date()
      end = datetime.strptime(end_iso, '%Y-%m-%d').date()
      cursor = start
      while cursor <= end:
        if cursor.weekday() < 5:
          covered.add(cursor.isoformat())
        cursor += timedelta(days=1)
    return covered

  def _consultant_days_off_between(self, conn, consultant_id, start_date, end_date):
    non_working_dates = set()

    # 1) Manual/availability day-off entries.
    availability_rows = conn.execute(
      '''
      SELECT start_date, end_date
      FROM consultant_availability
      WHERE consultant_id = ?
        AND start_date <= ?
        AND end_date >= ?
      ''',
      (consultant_id, end_date, start_date)
    ).fetchall()
    availability_ranges = []
    for row in availability_rows:
      overlap_start = max(start_date, row['start_date'])
      overlap_end = min(end_date, row['end_date'])
      if overlap_end >= overlap_start:
        availability_ranges.append((overlap_start, overlap_end))
    non_working_dates.update(self._weekday_date_set_for_ranges(availability_ranges))

    # 2) Holiday calendar dates loaded for the consultant's holiday location.
    holiday_location = conn.execute(
      '''
      SELECT hl.country_code, hl.region_code
      FROM consultants c
      LEFT JOIN holiday_locations hl ON hl.id = c.holiday_location_id
      WHERE c.id = ?
      ''',
      (consultant_id,)
    ).fetchone()

    if holiday_location and holiday_location['country_code']:
      country_code = holiday_location['country_code']
      region_code = holiday_location['region_code']
      if region_code:
        holiday_rows = conn.execute(
          '''
          SELECT date
          FROM holidays
          WHERE country_code = ?
            AND date BETWEEN ? AND ?
            AND (region_code IS NULL OR region_code = ?)
          ''',
          (country_code, start_date, end_date, region_code)
        ).fetchall()
      else:
        holiday_rows = conn.execute(
          '''
          SELECT date
          FROM holidays
          WHERE country_code = ?
            AND date BETWEEN ? AND ?
            AND region_code IS NULL
          ''',
          (country_code, start_date, end_date)
        ).fetchall()

      for row in holiday_rows:
        holiday_date = str(row['date'])
        holiday_day = datetime.strptime(holiday_date, '%Y-%m-%d').date()
        if holiday_day.weekday() < 5:
          non_working_dates.add(holiday_date)

    return len(non_working_dates)

  def _fetch_monthly_project_timesheet_hours_by_consultant(self, conn, project_id, month_start):
    month_from, month_to = self._month_range(month_start)
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

  def _project_active_assigned_positions_for_month(self, conn, project_id, month_start, month_end):
    rows = conn.execute(
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
    return rows

  def _calculate_project_timesheet_status_for_month(self, conn, project_id, month_start, month_end):
    positions = self._project_active_assigned_positions_for_month(conn, project_id, month_start, month_end)
    expected_consultants = {int(row['consultant_id']) for row in positions if row['consultant_id'] is not None}
    if not expected_consultants:
      return 'Not Started'
    month_start_day = datetime.strptime(month_start, '%Y-%m-%d').date().replace(day=1).isoformat()
    hours_map = self._fetch_monthly_project_timesheet_hours_by_consultant(conn, project_id, month_start_day)
    submitted = sum(1 for consultant_id in expected_consultants if float(hours_map.get(consultant_id, 0.0)) > 0.0)
    if submitted == 0:
      return 'Not Started'
    if submitted >= len(expected_consultants):
      return 'Completed'
    return 'Incompleted'

  def _calculate_proposed_invoice_amount_for_month(self, conn, project_id, month_start, month_end):
    month_start_day = datetime.strptime(month_start, '%Y-%m-%d').date().replace(day=1).isoformat()
    positions = self._project_active_assigned_positions_for_month(conn, project_id, month_start, month_end)
    billable_positions = [row for row in positions if bool(row['billable']) and row['daily_rate'] is not None]
    if not billable_positions:
      return {'amount': 0.0, 'currency': 'EUR'}

    currency = next((str(row['daily_rate_currency'] or 'EUR') for row in billable_positions), 'EUR')
    hours_map = self._fetch_monthly_project_timesheet_hours_by_consultant(conn, project_id, month_start_day)
    has_timesheet_hours = any(float(hours_map.get(int(row['consultant_id']), 0.0)) > 0.0 for row in billable_positions if row['consultant_id'] is not None)

    total = 0.0
    if has_timesheet_hours:
      by_consultant = {}
      for row in billable_positions:
        consultant_id = int(row['consultant_id'])
        by_consultant.setdefault(consultant_id, []).append(row)
      for consultant_id, consultant_positions in by_consultant.items():
        hours = float(hours_map.get(consultant_id, 0.0))
        if hours <= 0:
          continue
        days = hours / 8.0
        split_days = days / max(len(consultant_positions), 1)
        for position in consultant_positions:
          total += split_days * float(position['daily_rate'])
    else:
      for position in billable_positions:
        overlap_start = max(month_start, position['start_date'] or month_start)
        overlap_end = min(month_end, position['end_date'] or month_end)
        if overlap_end < overlap_start:
          continue
        working_days = self._working_days_between(overlap_start, overlap_end)
        consultant_id = int(position['consultant_id']) if position['consultant_id'] is not None else None
        if consultant_id is not None:
          days_off = self._consultant_days_off_between(conn, consultant_id, overlap_start, overlap_end)
          working_days = max(working_days - days_off, 0)
        allocation = float(position['allocation'] if position['allocation'] is not None else 100.0)
        billable_days = working_days * max(allocation, 0.0) / 100.0
        total += billable_days * float(position['daily_rate'])
    return {'amount': total, 'currency': currency}

  def get_revenue_invoice_periods(self, conn, project_id):
    project = conn.execute('SELECT start_date, end_date, project_type FROM projects WHERE id = ?', (project_id,)).fetchone()
    if not project or not project['start_date']:
      return {'periods': []}
    start = datetime.strptime(project['start_date'], '%Y-%m-%d').date().replace(day=1)
    today = datetime.utcnow().date().replace(day=1)
    if project['end_date']:
      project_end = datetime.strptime(project['end_date'], '%Y-%m-%d').date().replace(day=1)
      end = min(today, project_end)
    else:
      end = today
    if end < start:
      return {'periods': []}

    rows = []
    cursor = end
    while cursor >= start:
      month_start = cursor
      if cursor.month == 12:
        next_month = cursor.replace(year=cursor.year + 1, month=1, day=1)
      else:
        next_month = cursor.replace(month=cursor.month + 1, day=1)
      month_end = next_month - timedelta(days=1)
      period_from = max(month_start.isoformat(), project['start_date'])
      period_to = min(month_end.isoformat(), project['end_date'] or month_end.isoformat())
      if period_to < period_from:
        if cursor.month == 1:
          cursor = cursor.replace(year=cursor.year - 1, month=12, day=1)
        else:
          cursor = cursor.replace(month=cursor.month - 1, day=1)
        continue
      status = self._calculate_project_timesheet_status_for_month(conn, project_id, period_from, period_to)
      proposal = self._calculate_proposed_invoice_amount_for_month(conn, project_id, period_from, period_to)
      invoice_summary = conn.execute(
        '''
        SELECT COUNT(*) AS invoice_count, COALESCE(SUM(amount), 0) AS billed_total
        FROM invoices
        WHERE project_id = ?
          AND period_from <= ?
          AND period_to >= ?
        ''',
        (project_id, period_to, period_from)
      ).fetchone()
      rows.append({
        'month': month_start.strftime('%Y-%m'),
        'monthLabel': month_start.strftime('%B %Y'),
        'periodFrom': period_from,
        'periodTo': period_to,
        'timesheetStatus': status,
        'proposedAmount': float(proposal['amount']),
        'currency': proposal['currency'],
        'invoiceCount': int(invoice_summary['invoice_count'] if invoice_summary else 0),
        'invoicedTotal': float(invoice_summary['billed_total'] if invoice_summary else 0.0)
      })
      if cursor.month == 1:
        cursor = cursor.replace(year=cursor.year - 1, month=12, day=1)
      else:
        cursor = cursor.replace(month=cursor.month - 1, day=1)
    return {'periods': rows}

  def get_revenue_timesheet_details(self, conn, project_id, month):
    if not re.fullmatch(r'\d{4}-\d{2}', str(month or '')):
      return {'details': []}
    month_start = datetime.strptime(f'{month}-01', '%Y-%m-%d').date()
    if month_start.month == 12:
      next_month = month_start.replace(year=month_start.year + 1, month=1, day=1)
    else:
      next_month = month_start.replace(month=month_start.month + 1, day=1)
    month_end = next_month - timedelta(days=1)
    month_start_iso = month_start.isoformat()
    month_end_iso = month_end.isoformat()

    positions = self._project_active_assigned_positions_for_month(conn, project_id, month_start_iso, month_end_iso)
    hours_map = self._fetch_monthly_project_timesheet_hours_by_consultant(conn, project_id, month_start_iso)
    details = []
    for row in positions:
      consultant_id = int(row['consultant_id']) if row['consultant_id'] is not None else None
      if consultant_id is None:
        continue
      total_hours = float(hours_map.get(consultant_id, 0.0))
      timesheet_row = conn.execute(
        'SELECT id FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?',
        (consultant_id, month_start_iso)
      ).fetchone()
      if total_hours > 0:
        status = 'Completed'
      elif timesheet_row:
        status = 'Pending'
      else:
        status = 'Not Started'
      details.append({
        'consultantId': consultant_id,
        'consultantName': row['consultant_name'] or 'Consultant',
        'projectRole': row['project_role'] or 'Project Position',
        'status': status,
        'totalHours': total_hours
      })
    return {'details': details}

  def calculate_time_material_profitability_forecast(self, conn, project_id):
    revenue_payload = self.calculate_time_material_revenue_forecast(conn, project_id)
    if not revenue_payload['rows']:
      return {'summary': {'totalForecastRevenue': 0.0, 'totalForecastCost': 0.0, 'totalForecastGrossMargin': 0.0, 'forecastMarginPercent': 0.0}, 'rows': []}
    rows = []
    total_revenue = 0.0
    total_cost = 0.0
    for row in revenue_payload['rows']:
      consultant = conn.execute('SELECT salary FROM consultants WHERE id = ?', (row['consultantId'],)).fetchone() if row['consultantId'] else None
      daily_internal_cost = float(consultant['salary'] if consultant and consultant['salary'] is not None else 0.0)
      internal_cost = daily_internal_cost * float(row['billableDays'])
      gross_margin = float(row['revenue']) - internal_cost
      margin_percent = (gross_margin / float(row['revenue']) * 100.0) if float(row['revenue']) else 0.0
      profitability_row = dict(row)
      profitability_row.update({'internalCost': internal_cost, 'grossMargin': gross_margin, 'marginPercent': margin_percent})
      rows.append(profitability_row)
      total_revenue += float(row['revenue'])
      total_cost += internal_cost
    total_margin = total_revenue - total_cost
    margin_percent_total = (total_margin / total_revenue * 100.0) if total_revenue else 0.0
    return {'summary': {'totalForecastRevenue': total_revenue, 'totalForecastCost': total_cost, 'totalForecastGrossMargin': total_margin, 'forecastMarginPercent': margin_percent_total}, 'rows': rows}

  def get_profitability_monthly(self, conn, project_id):
    profitability_payload = self.calculate_time_material_profitability_forecast(conn, project_id)
    monthly = {}
    for row in profitability_payload['rows']:
      month = row['month']
      entry = monthly.setdefault(month, {
        'month': month,
        'monthLabel': row['monthLabel'],
        'revenue': 0.0,
        'internalCost': 0.0,
        'grossMargin': 0.0,
        'marginPercent': 0.0
      })
      entry['revenue'] += float(row['revenue'] or 0.0)
      entry['internalCost'] += float(row['internalCost'] or 0.0)
      entry['grossMargin'] += float(row['grossMargin'] or 0.0)
    rows = []
    for month in sorted(monthly.keys()):
      entry = monthly[month]
      entry['marginPercent'] = (entry['grossMargin'] / entry['revenue'] * 100.0) if entry['revenue'] else 0.0
      rows.append(entry)
    return {'rows': rows}

  def get_profitability_month_details(self, conn, project_id, month):
    profitability_payload = self.calculate_time_material_profitability_forecast(conn, project_id)
    rows = [row for row in profitability_payload['rows'] if str(row.get('month', '')) == str(month or '')]
    return {'rows': rows}

  def _fetch_timesheet_detail(self, conn, consultant_id, month_start):
    row = self._ensure_monthly_timesheet(conn, consultant_id, month_start)
    if not row:
      return None
    lines = conn.execute('SELECT l.id, l.project_id, l.activity, l.is_manual, p.project_name FROM monthly_timesheet_lines l LEFT JOIN projects p ON p.id = l.project_id WHERE l.timesheet_id = ? ORDER BY l.is_manual, p.project_name, l.id', (row['id'],)).fetchall()
    line_ids = [line['id'] for line in lines]
    entry_rows = []
    if line_ids:
      placeholders = ','.join('?' for _ in line_ids)
      entry_rows = conn.execute(f'SELECT line_id, entry_date, hours FROM monthly_timesheet_entries WHERE line_id IN ({placeholders})', tuple(line_ids)).fetchall()
    entries_by_line = {}
    for entry in entry_rows:
      entries_by_line.setdefault(entry['line_id'], {})[entry['entry_date']] = entry['hours']

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

  def do_GET(self):
    path = self._path()
    query = self._query()
    if path == '/api/backup/export':
      try:
        with BACKUP_RESTORE_LOCK:
          payload = self._create_backup_zip_payload()
      except Exception as error:
        self._send_json({'error': f'Unable to create backup: {error}'}, HTTPStatus.INTERNAL_SERVER_ERROR)
        return
      filename = f'InhousePSA_backup_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.zip'
      self.send_response(HTTPStatus.OK)
      self.send_header('Content-Type', 'application/zip')
      self.send_header('Content-Length', str(len(payload)))
      self.send_header('Content-Disposition', f"attachment; filename*=UTF-8''{quote(filename)}")
      self.end_headers()
      self.wfile.write(payload)
      return

    print_invoice_match = re.fullmatch(r'/print/invoice/(\d+)', path)
    revenue_summary_match = re.fullmatch(r'/api/projects/(\d+)/revenue-summary', path)
    revenue_invoice_periods_match = re.fullmatch(r'/api/projects/(\d+)/revenue/invoice-periods', path)
    revenue_timesheet_details_match = re.fullmatch(r'/api/projects/(\d+)/revenue/timesheet-details', path)
    revenue_forecast_summary_match = re.fullmatch(r'/api/projects/(\d+)/revenue-forecast-summary', path)
    revenue_forecast_monthly_match = re.fullmatch(r'/api/projects/(\d+)/revenue-forecast-monthly', path)
    revenue_forecast_month_details_match = re.fullmatch(r'/api/projects/(\d+)/revenue-forecast-month-details', path)
    revenue_actuals_summary_match = re.fullmatch(r'/api/projects/(\d+)/revenue-actuals-summary', path)
    revenue_forecast_breakdown_match = re.fullmatch(r'/api/projects/(\d+)/revenue-forecast-breakdown', path)
    profitability_summary_match = re.fullmatch(r'/api/projects/(\d+)/profitability-summary', path)
    profitability_monthly_match = re.fullmatch(r'/api/projects/(\d+)/profitability-monthly', path)
    profitability_month_details_match = re.fullmatch(r'/api/projects/(\d+)/profitability-month-details', path)
    profitability_breakdown_match = re.fullmatch(r'/api/projects/(\d+)/profitability-breakdown', path)
    project_invoices_match = re.fullmatch(r'/api/projects/(\d+)/invoices', path)
    invoice_payments_match = re.fullmatch(r'/api/invoices/(\d+)/payments', path)
    allocation_simulation_id = self._allocation_simulation_id()
    files_project_id, file_id, files_action = self._project_files_route()
    with get_connection() as conn:
      if print_invoice_match:
        invoice_id = int(print_invoice_match.group(1))
        html_doc = self._invoice_print_html(conn, invoice_id)
        if not html_doc:
          self.send_error(HTTPStatus.NOT_FOUND, 'Invoice not found')
          return
        self._send_html(html_doc)
        return
      if files_project_id is not None and file_id is None:
        if not self._ids_exist(conn, 'projects', [files_project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json({'files': self._fetch_project_files(conn, files_project_id)})
        return
      if files_project_id is not None and files_action == 'download':
        row = conn.execute(
          '''
          SELECT id, original_filename, stored_filename
          FROM project_files
          WHERE id = ? AND project_id = ?
          ''',
          (file_id, files_project_id)
        ).fetchone()
        if not row:
          self._send_json({'error': 'Project file not found'}, HTTPStatus.NOT_FOUND)
          return
        file_path = PROJECT_FILES_DIR / row['stored_filename']
        if not file_path.exists() or not file_path.is_file():
          self._send_json({'error': 'Stored file is missing'}, HTTPStatus.NOT_FOUND)
          return
        data = file_path.read_bytes()
        content_type = mimetypes.guess_type(row['original_filename'])[0] or 'application/octet-stream'
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Content-Disposition', f"attachment; filename*=UTF-8''{quote(row['original_filename'])}")
        self.end_headers()
        self.wfile.write(data)
        return
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
      if revenue_summary_match:
        project_id = int(revenue_summary_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_project_revenue_summary(conn, project_id))
        return
      if revenue_invoice_periods_match:
        project_id = int(revenue_invoice_periods_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_revenue_invoice_periods(conn, project_id))
        return
      if revenue_timesheet_details_match:
        project_id = int(revenue_timesheet_details_match.group(1))
        month = str(query.get('month', [''])[0]).strip()
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        if not re.fullmatch(r'\d{4}-\d{2}', month):
          self._send_json({'error': 'month query parameter must be YYYY-MM'}, HTTPStatus.BAD_REQUEST)
          return
        self._send_json(self.get_revenue_timesheet_details(conn, project_id, month))
        return
      if revenue_forecast_summary_match:
        project_id = int(revenue_forecast_summary_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_revenue_forecast_summary(conn, project_id))
        return
      if revenue_forecast_monthly_match:
        project_id = int(revenue_forecast_monthly_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_revenue_forecast_monthly(conn, project_id))
        return
      if revenue_forecast_month_details_match:
        project_id = int(revenue_forecast_month_details_match.group(1))
        month = str(query.get('month', [''])[0]).strip()
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        if not re.fullmatch(r'\d{4}-\d{2}', month):
          self._send_json({'error': 'month query parameter must be YYYY-MM'}, HTTPStatus.BAD_REQUEST)
          return
        self._send_json(self.get_revenue_forecast_month_details(conn, project_id, month))
        return
      if revenue_actuals_summary_match:
        project_id = int(revenue_actuals_summary_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_revenue_actuals_summary(conn, project_id))
        return
      if revenue_forecast_breakdown_match:
        project_id = int(revenue_forecast_breakdown_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_revenue_forecast_monthly(conn, project_id))
        return
      if profitability_summary_match:
        project_id = int(profitability_summary_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        payload = self.calculate_time_material_profitability_forecast(conn, project_id)
        self._send_json(payload['summary'])
        return
      if profitability_monthly_match:
        project_id = int(profitability_monthly_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_profitability_monthly(conn, project_id))
        return
      if profitability_month_details_match:
        project_id = int(profitability_month_details_match.group(1))
        month = str(query.get('month', [''])[0]).strip()
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        if not re.fullmatch(r'\d{4}-\d{2}', month):
          self._send_json({'error': 'month query parameter must be YYYY-MM'}, HTTPStatus.BAD_REQUEST)
          return
        self._send_json(self.get_profitability_month_details(conn, project_id, month))
        return
      if profitability_breakdown_match:
        project_id = int(profitability_breakdown_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json(self.get_profitability_monthly(conn, project_id))
        return
      if project_invoices_match:
        project_id = int(project_invoices_match.group(1))
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        invoices = conn.execute(
          '''
          SELECT i.*
          FROM invoices i
          WHERE i.project_id = ?
          ORDER BY i.invoice_date DESC, i.id DESC
          ''',
          (project_id,)
        ).fetchall()
        payload = []
        for invoice in invoices:
          paid_amount = self.calculate_invoice_paid_amount(conn, invoice['id'])
          payload.append({
            'id': invoice['id'],
            'projectId': invoice['project_id'],
            'positionId': invoice['position_id'],
            'invoiceRef': invoice['invoice_ref'] or '',
            'periodFrom': invoice['period_from'],
            'periodTo': invoice['period_to'],
            'invoiceDate': invoice['invoice_date'],
            'dueDate': invoice['due_date'] or '',
            'amount': float(invoice['amount'] if invoice['amount'] is not None else 0.0),
            'paidAmount': paid_amount,
            'status': invoice['status'] or 'Draft',
            'notes': invoice['notes'] or ''
          })
        self._send_json({'invoices': payload})
        return
      if invoice_payments_match:
        invoice_id = int(invoice_payments_match.group(1))
        if not self._ids_exist(conn, 'invoices', [invoice_id]):
          self._send_json({'error': 'Invoice not found'}, HTTPStatus.NOT_FOUND)
          return
        rows = conn.execute(
          'SELECT id, invoice_id, payment_date, amount, notes, created_at, updated_at FROM invoice_payments WHERE invoice_id = ? ORDER BY payment_date DESC, id DESC',
          (invoice_id,)
        ).fetchall()
        self._send_json({'payments': [
          {
            'id': row['id'],
            'invoiceId': row['invoice_id'],
            'paymentDate': row['payment_date'],
            'amount': float(row['amount'] if row['amount'] is not None else 0.0),
            'notes': row['notes'] or '',
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at']
          }
          for row in rows
        ]})
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
      if path == '/api/business-partner-types':
        self._send_json({'businessPartnerTypes': self._fetch_simple_table(conn, 'business_partner_types')})
        return
      if path == '/api/project-types':
        self._send_json({'projectTypes': self._fetch_simple_table(conn, 'project_types')})
        return
      if path == '/api/company-branches':
        self._send_json({'companyBranches': self._fetch_company_branches(conn)})
        return
      if path == '/api/company-logo':
        self._send_json(self._company_logo_payload())
        return
      if path == '/api/company-logo/file':
        self._send_binary_file(self._company_logo_path())
        return
      if path == '/api/business-partners':
        self._send_json({'businessPartners': self._fetch_business_partners(conn)})
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

      if path == '/api/monthly-timesheets':
        consultant_raw = (query.get('consultantId') or [None])[0]
        month_raw = (query.get('month') or [None])[0]
        try:
          consultant_id = int(consultant_raw)
        except (TypeError, ValueError):
          self._send_json({'error': 'consultantId is required and must be numeric'}, HTTPStatus.BAD_REQUEST)
          return
        if month_raw:
          month_start = self._parse_month_start(month_raw)
          if not month_start:
            self._send_json({'error': 'month must be in YYYY-MM format'}, HTTPStatus.BAD_REQUEST)
            return
          detail = self._fetch_timesheet_detail(conn, consultant_id, month_start)
          if not detail:
            self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
            return
          self._send_json(detail)
          return
        months = self._fetch_timesheet_months(conn, consultant_id)
        if months is None:
          self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
          return
        self._send_json({'months': months})
        return

    super().do_GET()

  def do_POST(self):
    path = self._path()
    if path == '/api/backup/restore':
      try:
        original_filename, file_data = self._read_upload_file()
      except ValueError as error:
        self._send_json({'error': str(error)}, HTTPStatus.BAD_REQUEST)
        return
      if not str(original_filename or '').lower().endswith('.zip'):
        self._send_json({'error': 'Backup restore file must be a .zip archive'}, HTTPStatus.BAD_REQUEST)
        return
      try:
        with BACKUP_RESTORE_LOCK:
          safety_path = self._restore_backup_from_zip_bytes(file_data)
      except ValueError as error:
        self._send_json({'error': str(error)}, HTTPStatus.BAD_REQUEST)
        return
      except Exception as error:
        self._send_json({'error': f'Restore failed: {error}'}, HTTPStatus.INTERNAL_SERVER_ERROR)
        return
      self._send_json({
        'status': 'restored',
        'safetyBackup': str(safety_path.relative_to(BASE_DIR))
      })
      return

    project_invoices_match = re.fullmatch(r'/api/projects/(\d+)/invoices', path)
    invoice_payments_match = re.fullmatch(r'/api/invoices/(\d+)/payments', path)
    files_project_id, _, files_action = self._project_files_route()
    if files_project_id is not None and files_action is None:
      with get_connection() as conn:
        if not self._ids_exist(conn, 'projects', [files_project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
      try:
        original_filename, file_data = self._read_upload_file()
      except ValueError as error:
        self._send_json({'error': str(error)}, HTTPStatus.BAD_REQUEST)
        return
      suffix = Path(original_filename).suffix[:20]
      stored_filename = f'{files_project_id}-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}-{uuid.uuid4().hex}{suffix}'
      target_path = PROJECT_FILES_DIR / stored_filename
      target_path.write_bytes(file_data)
      with get_connection() as conn:
        cursor = conn.execute(
          '''
          INSERT INTO project_files (project_id, original_filename, stored_filename, file_size)
          VALUES (?, ?, ?, ?)
          ''',
          (files_project_id, original_filename, stored_filename, len(file_data))
        )
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/company-logo':
      try:
        original_filename, file_data = self._read_upload_file()
      except ValueError as error:
        self._send_json({'error': str(error)}, HTTPStatus.BAD_REQUEST)
        return
      if not file_data:
        self._send_json({'error': 'Uploaded logo file is empty'}, HTTPStatus.BAD_REQUEST)
        return
      ext = self._detect_company_logo_extension(original_filename, file_data)
      if ext not in {'.png', '.jpg', '.svg'}:
        self._send_json({'error': 'Company logo must be a PNG, JPG/JPEG, or SVG image'}, HTTPStatus.BAD_REQUEST)
        return
      self._replace_company_logo_file(ext, file_data)
      self._send_json(self._company_logo_payload(), HTTPStatus.CREATED)
      return

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    if project_invoices_match:
      project_id = int(project_invoices_match.group(1))
      invoice_ref = str(payload.get('invoiceRef', '')).strip()
      period_from = str(payload.get('periodFrom', '')).strip()
      period_to = str(payload.get('periodTo', '')).strip()
      invoice_date = str(payload.get('invoiceDate', '')).strip()
      due_date = str(payload.get('dueDate', '')).strip()
      status = str(payload.get('status', 'Draft')).strip() or 'Draft'
      notes = str(payload.get('notes', '')).strip()
      try:
        amount = float(payload.get('amount', 0) or 0)
      except (TypeError, ValueError):
        self._send_json({'error': 'amount must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      if amount < 0:
        self._send_json({'error': 'amount cannot be negative'}, HTTPStatus.BAD_REQUEST)
        return
      if status not in {'Draft', 'Issued', 'Partially Paid', 'Paid'}:
        self._send_json({'error': 'status must be one of: Draft, Issued, Partially Paid, Paid'}, HTTPStatus.BAD_REQUEST)
        return
      if not (self._valid_iso_date(period_from) and self._valid_iso_date(period_to) and self._valid_iso_date(invoice_date)):
        self._send_json({'error': 'periodFrom, periodTo and invoiceDate must be YYYY-MM-DD'}, HTTPStatus.BAD_REQUEST)
        return
      if due_date and not self._valid_iso_date(due_date):
        self._send_json({'error': 'dueDate must be YYYY-MM-DD when provided'}, HTTPStatus.BAD_REQUEST)
        return
      if period_from > period_to:
        self._send_json({'error': 'periodFrom cannot be after periodTo'}, HTTPStatus.BAD_REQUEST)
        return
      position_id = payload.get('positionId')
      if position_id not in (None, '', 0):
        try:
          position_id = int(position_id)
        except (TypeError, ValueError):
          self._send_json({'error': 'positionId must be numeric when provided'}, HTTPStatus.BAD_REQUEST)
          return
      else:
        position_id = None
      with get_connection() as conn:
        if not self._ids_exist(conn, 'projects', [project_id]):
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        if position_id is not None:
          row = conn.execute('SELECT 1 FROM project_positions WHERE id = ? AND project_id = ?', (position_id, project_id)).fetchone()
          if not row:
            self._send_json({'error': 'positionId is not part of this project'}, HTTPStatus.BAD_REQUEST)
            return
        cursor = conn.execute(
          '''
          INSERT INTO invoices (project_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date, amount, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ''',
          (project_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date or None, amount, status, notes)
        )
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if invoice_payments_match:
      invoice_id = int(invoice_payments_match.group(1))
      payment_date = str(payload.get('paymentDate', '')).strip()
      notes = str(payload.get('notes', '')).strip()
      try:
        amount = float(payload.get('amount', 0) or 0)
      except (TypeError, ValueError):
        self._send_json({'error': 'amount must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      if amount <= 0:
        self._send_json({'error': 'amount must be greater than zero'}, HTTPStatus.BAD_REQUEST)
        return
      if not self._valid_iso_date(payment_date):
        self._send_json({'error': 'paymentDate must be YYYY-MM-DD'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        if not self._ids_exist(conn, 'invoices', [invoice_id]):
          self._send_json({'error': 'Invoice not found'}, HTTPStatus.NOT_FOUND)
          return
        cursor = conn.execute(
          'INSERT INTO invoice_payments (invoice_id, payment_date, amount, notes) VALUES (?, ?, ?, ?)',
          (invoice_id, payment_date, amount, notes)
        )
        self.recalculate_invoice_status(conn, invoice_id)
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
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
      with get_connection() as conn:
        error = self._project_payload_error(conn, payload)
        if error:
          self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
          return
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
          INSERT INTO projects (project_name, client_name, project_lead, client_contact, start_date, end_date, manager_consultant_id, project_type, project_status, client_business_partner_id, delivery_partner_business_partner_id, contract_with_branch_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ''',
          (payload['projectName'], '', manager_name or 'Manager', '', payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], payload['projectStatus'], payload['clientBusinessPartnerId'], payload['deliveryPartnerBusinessPartnerId'], payload['contractWithBranchId'])
        )
        project_id = cursor.lastrowid
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date, billable) VALUES (?, ?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'], 1 if item.get('billable', True) else 0)
          )
        for item in payload.get('projectPositions', []):
          conn.execute(
            'INSERT INTO project_positions (project_id, consultant_id, area_id, project_role, start_date, end_date, allocation, billable, daily_rate, daily_rate_currency, comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (project_id, item.get('consultantId'), item.get('areaId'), item['projectRole'], item['startDate'], item['endDate'], item.get('allocation', 100), 1 if item.get('billable', True) else 0, item.get('dailyRate'), item.get('dailyRateCurrency'), item.get('comments', ''), item.get('status', 'Open'))
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
        for contact_id in payload['clientContactIds']:
          conn.execute('INSERT INTO project_client_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
        for contact_id in payload['deliveryPartnerContactIds']:
          conn.execute('INSERT INTO project_delivery_partner_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
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
        if payload['companyBranchId'] is not None and not self._ids_exist(conn, 'company_branches', [payload['companyBranchId']]):
          self._send_json({'error': 'Selected company branch does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        cursor = conn.execute(
          'INSERT INTO consultants (name, area, position, salary, holiday_location_id, company_branch_id, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['companyBranchId'], payload['startDate'])
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

    if path == '/api/business-partner-types':
      error = self._name_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute('INSERT INTO business_partner_types (name) VALUES (?)', (payload['name'],))
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Business partner type already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/project-types':
      error = self._name_payload_error(payload)
      if error:
        self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute('INSERT INTO project_types (name) VALUES (?)', (payload['name'],))
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Project type already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/company-branches':
      name = str(payload.get('name', '')).strip()
      if not name:
        self._send_json({'error': 'name is required'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute(
            '''
            INSERT INTO company_branches (name, tax_identification, street_name, street_number, postal_code, city, region, country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
              name,
              str(payload.get('taxIdentification', '')).strip(),
              str(payload.get('streetName', '')).strip(),
              str(payload.get('streetNumber', '')).strip(),
              str(payload.get('postalCode', '')).strip(),
              str(payload.get('city', '')).strip(),
              str(payload.get('region', '')).strip(),
              str(payload.get('country', '')).strip()
            )
          )
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Company branch already exists'}, HTTPStatus.BAD_REQUEST)
          return
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/business-partners':
      company_name = str(payload.get('companyName', '')).strip()
      if not company_name:
        self._send_json({'error': 'companyName is required'}, HTTPStatus.BAD_REQUEST)
        return
      contacts = payload.get('contacts', [])
      if not isinstance(contacts, list):
        self._send_json({'error': 'contacts must be a list'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        cursor = conn.execute(
          '''
          INSERT INTO business_partners (company_name, tax_identification, address_street, address_number, postal_code, city, region, country, business_partner_type_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ''',
          (
            company_name,
            str(payload.get('taxIdentification', '')).strip(),
            str(payload.get('addressStreet', '')).strip(),
            str(payload.get('addressNumber', '')).strip(),
            str(payload.get('postalCode', '')).strip(),
            str(payload.get('city', '')).strip(),
            str(payload.get('region', '')).strip(),
            str(payload.get('country', '')).strip(),
            int(payload['businessPartnerTypeId']) if payload.get('businessPartnerTypeId') not in (None, '') else None
          )
        )
        partner_id = cursor.lastrowid
        for contact in contacts:
          email_values = [str(email).strip() for email in (contact.get('emails') or []) if str(email).strip()]
          if not email_values and str(contact.get('email', '')).strip():
            email_values = [str(contact.get('email', '')).strip()]
          c = conn.execute(
            'INSERT INTO business_partner_contacts (business_partner_id, name, last_name, email) VALUES (?, ?, ?, ?)',
            (
              partner_id,
              str(contact.get('name', '')).strip(),
              str(contact.get('lastName', '')).strip(),
              email_values[0] if email_values else ''
            )
          )
          for email in email_values:
            conn.execute('INSERT INTO business_partner_contact_emails (contact_id, email) VALUES (?, ?)', (c.lastrowid, email))
          for phone in (contact.get('phoneNumbers') or []):
            phone_value = str(phone).strip()
            if phone_value:
              conn.execute('INSERT INTO business_partner_contact_phones (contact_id, phone_number) VALUES (?, ?)', (c.lastrowid, phone_value))
      self._send_json({'id': partner_id}, HTTPStatus.CREATED)
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

    if path == '/api/monthly-timesheets/open':
      try:
        consultant_id = int(payload.get('consultantId'))
      except (TypeError, ValueError):
        self._send_json({'error': 'consultantId must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      month_start = self._parse_month_start(payload.get('month'))
      if not month_start:
        self._send_json({'error': 'month must be in YYYY-MM format'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        detail = self._fetch_timesheet_detail(conn, consultant_id, month_start)
      if not detail:
        self._send_json({'error': 'Consultant not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json(detail, HTTPStatus.CREATED)
      return

    if path == '/api/monthly-timesheets/manual-line':
      try:
        timesheet_id = int(payload.get('timesheetId'))
      except (TypeError, ValueError):
        self._send_json({'error': 'timesheetId must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      activity = str(payload.get('activity', '')).strip()
      if not activity:
        self._send_json({'error': 'activity is required'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        timesheet_row = conn.execute('SELECT id, status FROM monthly_timesheets WHERE id = ?', (timesheet_id,)).fetchone()
        if not timesheet_row:
          self._send_json({'error': 'Timesheet not found'}, HTTPStatus.NOT_FOUND)
          return
        if str(timesheet_row['status'] or '').strip().lower() == 'completed':
          self._send_json({'error': 'Completed timesheets cannot be edited'}, HTTPStatus.BAD_REQUEST)
          return
        cursor = conn.execute('INSERT INTO monthly_timesheet_lines (timesheet_id, activity, is_manual) VALUES (?, ?, 1)', (timesheet_id, activity))
      self._send_json({'id': cursor.lastrowid}, HTTPStatus.CREATED)
      return

    if path == '/api/monthly-timesheets/entry':
      try:
        line_id = int(payload.get('lineId'))
      except (TypeError, ValueError):
        self._send_json({'error': 'lineId must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      entry_date = str(payload.get('date', '')).strip()
      if not self._valid_iso_date(entry_date):
        self._send_json({'error': 'date must be YYYY-MM-DD'}, HTTPStatus.BAD_REQUEST)
        return
      try:
        hours = float(payload.get('hours', 0))
      except (TypeError, ValueError):
        self._send_json({'error': 'hours must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      if hours < 0 or hours > 24:
        self._send_json({'error': 'hours must be between 0 and 24'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        row = conn.execute(
          '''
          SELECT l.id, t.status
          FROM monthly_timesheet_lines l
          JOIN monthly_timesheets t ON t.id = l.timesheet_id
          WHERE l.id = ?
          ''',
          (line_id,)
        ).fetchone()
        if not row:
          self._send_json({'error': 'Timesheet line not found'}, HTTPStatus.NOT_FOUND)
          return
        if str(row['status'] or '').strip().lower() == 'completed':
          self._send_json({'error': 'Completed timesheets cannot be edited'}, HTTPStatus.BAD_REQUEST)
          return
        conn.execute('INSERT INTO monthly_timesheet_entries (line_id, entry_date, hours, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(line_id, entry_date) DO UPDATE SET hours = excluded.hours, updated_at = CURRENT_TIMESTAMP', (line_id, entry_date, hours))
      self._send_json({'status': 'updated'})
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
    path = self._path()
    invoice_match = re.fullmatch(r'/api/invoices/(\d+)', path)
    payment_match = re.fullmatch(r'/api/payments/(\d+)', path)
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')
    company_branch_id = self._resource_id('company-branches')
    business_partner_id = self._resource_id('business-partners')
    holiday_location_id = self._holiday_location_id()
    allocation_simulation_id = self._allocation_simulation_id()

    try:
      payload = self._read_json()
    except json.JSONDecodeError:
      self._send_json({'error': 'Invalid JSON'}, HTTPStatus.BAD_REQUEST)
      return

    if path == '/api/monthly-timesheets/status':
      try:
        timesheet_id = int(payload.get('timesheetId'))
      except (TypeError, ValueError):
        self._send_json({'error': 'timesheetId must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      status = str(payload.get('status', '')).strip()
      allowed_statuses = {'In Progress', 'Completed'}
      if status not in allowed_statuses:
        self._send_json({'error': 'status must be one of: In Progress, Completed'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        cursor = conn.execute('UPDATE monthly_timesheets SET status = ? WHERE id = ?', (status, timesheet_id))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Monthly timesheet not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': status})
      return

    if invoice_match:
      invoice_id = int(invoice_match.group(1))
      invoice_ref = str(payload.get('invoiceRef', '')).strip()
      period_from = str(payload.get('periodFrom', '')).strip()
      period_to = str(payload.get('periodTo', '')).strip()
      invoice_date = str(payload.get('invoiceDate', '')).strip()
      due_date = str(payload.get('dueDate', '')).strip()
      status = str(payload.get('status', 'Draft')).strip() or 'Draft'
      notes = str(payload.get('notes', '')).strip()
      try:
        amount = float(payload.get('amount', 0) or 0)
      except (TypeError, ValueError):
        self._send_json({'error': 'amount must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      if amount < 0:
        self._send_json({'error': 'amount cannot be negative'}, HTTPStatus.BAD_REQUEST)
        return
      if status not in {'Draft', 'Issued', 'Partially Paid', 'Paid'}:
        self._send_json({'error': 'status must be one of: Draft, Issued, Partially Paid, Paid'}, HTTPStatus.BAD_REQUEST)
        return
      if not (self._valid_iso_date(period_from) and self._valid_iso_date(period_to) and self._valid_iso_date(invoice_date)):
        self._send_json({'error': 'periodFrom, periodTo and invoiceDate must be YYYY-MM-DD'}, HTTPStatus.BAD_REQUEST)
        return
      if due_date and not self._valid_iso_date(due_date):
        self._send_json({'error': 'dueDate must be YYYY-MM-DD when provided'}, HTTPStatus.BAD_REQUEST)
        return
      if period_from > period_to:
        self._send_json({'error': 'periodFrom cannot be after periodTo'}, HTTPStatus.BAD_REQUEST)
        return
      position_id = payload.get('positionId')
      if position_id not in (None, '', 0):
        try:
          position_id = int(position_id)
        except (TypeError, ValueError):
          self._send_json({'error': 'positionId must be numeric when provided'}, HTTPStatus.BAD_REQUEST)
          return
      else:
        position_id = None
      with get_connection() as conn:
        invoice = conn.execute('SELECT project_id FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
        if not invoice:
          self._send_json({'error': 'Invoice not found'}, HTTPStatus.NOT_FOUND)
          return
        if position_id is not None:
          row = conn.execute('SELECT 1 FROM project_positions WHERE id = ? AND project_id = ?', (position_id, invoice['project_id'])).fetchone()
          if not row:
            self._send_json({'error': 'positionId is not part of this project'}, HTTPStatus.BAD_REQUEST)
            return
        conn.execute(
          '''
          UPDATE invoices
          SET position_id = ?, invoice_ref = ?, period_from = ?, period_to = ?, invoice_date = ?, due_date = ?, amount = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          ''',
          (position_id, invoice_ref, period_from, period_to, invoice_date, due_date or None, amount, status, notes, invoice_id)
        )
        self.recalculate_invoice_status(conn, invoice_id)
      self._send_json({'status': 'updated'})
      return

    if payment_match:
      payment_id = int(payment_match.group(1))
      payment_date = str(payload.get('paymentDate', '')).strip()
      notes = str(payload.get('notes', '')).strip()
      try:
        amount = float(payload.get('amount', 0) or 0)
      except (TypeError, ValueError):
        self._send_json({'error': 'amount must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      if amount <= 0:
        self._send_json({'error': 'amount must be greater than zero'}, HTTPStatus.BAD_REQUEST)
        return
      if not self._valid_iso_date(payment_date):
        self._send_json({'error': 'paymentDate must be YYYY-MM-DD'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        payment = conn.execute('SELECT invoice_id FROM invoice_payments WHERE id = ?', (payment_id,)).fetchone()
        if not payment:
          self._send_json({'error': 'Payment not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute(
          'UPDATE invoice_payments SET payment_date = ?, amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          (payment_date, amount, notes, payment_id)
        )
        self.recalculate_invoice_status(conn, payment['invoice_id'])
      self._send_json({'status': 'updated'})
      return

    if project_id is not None:
      with get_connection() as conn:
        error = self._project_payload_error(conn, payload)
        if error:
          self._send_json({'error': error}, HTTPStatus.BAD_REQUEST)
          return
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
          SET project_name = ?, client_name = ?, project_lead = ?, client_contact = ?, start_date = ?, end_date = ?, manager_consultant_id = ?, project_type = ?, project_status = ?, client_business_partner_id = ?, delivery_partner_business_partner_id = ?, contract_with_branch_id = ?
          WHERE id = ?
          ''',
          (payload['projectName'], '', manager_name or 'Manager', '', payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], payload['projectStatus'], payload['clientBusinessPartnerId'], payload['deliveryPartnerBusinessPartnerId'], payload['contractWithBranchId'], project_id)
        )
        if cursor.rowcount == 0:
          self._send_json({'error': 'Project not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute('DELETE FROM project_consultants WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_positions WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_milestones WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_phases WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_client_contacts WHERE project_id = ?', (project_id,))
        conn.execute('DELETE FROM project_delivery_partner_contacts WHERE project_id = ?', (project_id,))
        for item in payload['consultantAssignments']:
          conn.execute(
            'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date, billable) VALUES (?, ?, ?, ?, ?, ?)',
            (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'], 1 if item.get('billable', True) else 0)
          )
        for item in payload.get('projectPositions', []):
          conn.execute(
            'INSERT INTO project_positions (project_id, consultant_id, area_id, project_role, start_date, end_date, allocation, billable, daily_rate, daily_rate_currency, comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (project_id, item.get('consultantId'), item.get('areaId'), item['projectRole'], item['startDate'], item['endDate'], item.get('allocation', 100), 1 if item.get('billable', True) else 0, item.get('dailyRate'), item.get('dailyRateCurrency'), item.get('comments', ''), item.get('status', 'Open'))
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
        for contact_id in payload['clientContactIds']:
          conn.execute('INSERT INTO project_client_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
        for contact_id in payload['deliveryPartnerContactIds']:
          conn.execute('INSERT INTO project_delivery_partner_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
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
        if payload['companyBranchId'] is not None and not self._ids_exist(conn, 'company_branches', [payload['companyBranchId']]):
          self._send_json({'error': 'Selected company branch does not exist'}, HTTPStatus.BAD_REQUEST)
          return
        first_area = conn.execute('SELECT name FROM areas WHERE id = ? LIMIT 1', (payload['areaIds'][0],)).fetchone()
        role_row = conn.execute('SELECT name FROM roles WHERE id = ? LIMIT 1', (payload['companyRoleId'],)).fetchone()
        cursor = conn.execute(
          'UPDATE consultants SET name = ?, area = ?, position = ?, salary = ?, holiday_location_id = ?, company_branch_id = ?, start_date = ? WHERE id = ?',
          (payload['name'], first_area['name'] if first_area else None, role_row['name'] if role_row else None, payload['salary'], payload['holidayLocationId'], payload['companyBranchId'], payload['startDate'], consultant_id)
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

    if company_branch_id is not None:
      name = str(payload.get('name', '')).strip()
      if not name:
        self._send_json({'error': 'name is required'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        try:
          cursor = conn.execute(
            '''
            UPDATE company_branches
            SET name = ?, tax_identification = ?, street_name = ?, street_number = ?, postal_code = ?, city = ?, region = ?, country = ?
            WHERE id = ?
            ''',
            (
              name,
              str(payload.get('taxIdentification', '')).strip(),
              str(payload.get('streetName', '')).strip(),
              str(payload.get('streetNumber', '')).strip(),
              str(payload.get('postalCode', '')).strip(),
              str(payload.get('city', '')).strip(),
              str(payload.get('region', '')).strip(),
              str(payload.get('country', '')).strip(),
              company_branch_id
            )
          )
        except sqlite3.IntegrityError:
          self._send_json({'error': 'Company branch already exists'}, HTTPStatus.BAD_REQUEST)
          return
      if cursor.rowcount == 0:
        self._send_json({'error': 'Company branch not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'updated'})
      return

    if business_partner_id is not None:
      company_name = str(payload.get('companyName', '')).strip()
      if not company_name:
        self._send_json({'error': 'companyName is required'}, HTTPStatus.BAD_REQUEST)
        return
      contacts = payload.get('contacts', [])
      if not isinstance(contacts, list):
        self._send_json({'error': 'contacts must be a list'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        cursor = conn.execute(
          '''
          UPDATE business_partners
          SET company_name = ?, tax_identification = ?, address_street = ?, address_number = ?, postal_code = ?, city = ?, region = ?, country = ?, business_partner_type_id = ?
          WHERE id = ?
          ''',
          (
            company_name,
            str(payload.get('taxIdentification', '')).strip(),
            str(payload.get('addressStreet', '')).strip(),
            str(payload.get('addressNumber', '')).strip(),
            str(payload.get('postalCode', '')).strip(),
            str(payload.get('city', '')).strip(),
            str(payload.get('region', '')).strip(),
            str(payload.get('country', '')).strip(),
            int(payload['businessPartnerTypeId']) if payload.get('businessPartnerTypeId') not in (None, '') else None,
            business_partner_id
          )
        )
        if cursor.rowcount == 0:
          self._send_json({'error': 'Business partner not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute('DELETE FROM business_partner_contact_emails WHERE contact_id IN (SELECT id FROM business_partner_contacts WHERE business_partner_id = ?)', (business_partner_id,))
        conn.execute('DELETE FROM business_partner_contact_phones WHERE contact_id IN (SELECT id FROM business_partner_contacts WHERE business_partner_id = ?)', (business_partner_id,))
        conn.execute('DELETE FROM business_partner_contacts WHERE business_partner_id = ?', (business_partner_id,))
        for contact in contacts:
          email_values = [str(email).strip() for email in (contact.get('emails') or []) if str(email).strip()]
          if not email_values and str(contact.get('email', '')).strip():
            email_values = [str(contact.get('email', '')).strip()]
          c = conn.execute(
            'INSERT INTO business_partner_contacts (business_partner_id, name, last_name, email) VALUES (?, ?, ?, ?)',
            (
              business_partner_id,
              str(contact.get('name', '')).strip(),
              str(contact.get('lastName', '')).strip(),
              email_values[0] if email_values else ''
            )
          )
          for email in email_values:
            conn.execute('INSERT INTO business_partner_contact_emails (contact_id, email) VALUES (?, ?)', (c.lastrowid, email))
          for phone in (contact.get('phoneNumbers') or []):
            phone_value = str(phone).strip()
            if phone_value:
              conn.execute('INSERT INTO business_partner_contact_phones (contact_id, phone_number) VALUES (?, ?)', (c.lastrowid, phone_value))
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
    path = self._path()
    query = self._query()
    invoice_match = re.fullmatch(r'/api/invoices/(\d+)', path)
    payment_match = re.fullmatch(r'/api/payments/(\d+)', path)
    project_id = self._resource_id('projects')
    consultant_id = self._resource_id('consultants')
    role_id = self._resource_id('roles')
    area_id = self._resource_id('areas')
    day_off_type_id = self._resource_id('day-off-types')
    business_partner_type_id = self._resource_id('business-partner-types')
    project_type_id = self._resource_id('project-types')
    company_branch_id = self._resource_id('company-branches')
    business_partner_id = self._resource_id('business-partners')
    availability_consultant_id, availability_id = self._availability_route()
    allocation_simulation_id = self._allocation_simulation_id()

    if path == '/api/company-logo':
      removed = False
      for candidate in COMPANY_LOGO_DIR.glob('current.*'):
        if candidate.is_file():
          candidate.unlink(missing_ok=True)
          removed = True
      if not removed:
        self._send_json({'error': 'Company logo not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if invoice_match:
      invoice_id = int(invoice_match.group(1))
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM invoices WHERE id = ?', (invoice_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Invoice not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if payment_match:
      payment_id = int(payment_match.group(1))
      with get_connection() as conn:
        payment = conn.execute('SELECT invoice_id FROM invoice_payments WHERE id = ?', (payment_id,)).fetchone()
        if not payment:
          self._send_json({'error': 'Payment not found'}, HTTPStatus.NOT_FOUND)
          return
        conn.execute('DELETE FROM invoice_payments WHERE id = ?', (payment_id,))
        self.recalculate_invoice_status(conn, payment['invoice_id'])
      self._send_json({'status': 'deleted'})
      return

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

    if business_partner_type_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM business_partner_types WHERE id = ?', (business_partner_type_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Business partner type not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if project_type_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM project_types WHERE id = ?', (project_type_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Project type not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if company_branch_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM company_branches WHERE id = ?', (company_branch_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Company branch not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if business_partner_id is not None:
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM business_partners WHERE id = ?', (business_partner_id,))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Business partner not found'}, HTTPStatus.NOT_FOUND)
        return
      self._send_json({'status': 'deleted'})
      return

    if path == '/api/monthly-timesheets':
      consultant_raw = (query.get('consultantId') or [None])[0]
      month_raw = (query.get('month') or [None])[0]
      try:
        consultant_id = int(consultant_raw)
      except (TypeError, ValueError):
        self._send_json({'error': 'consultantId is required and must be numeric'}, HTTPStatus.BAD_REQUEST)
        return
      month_start = self._parse_month_start(month_raw)
      if not month_start:
        self._send_json({'error': 'month must be in YYYY-MM format'}, HTTPStatus.BAD_REQUEST)
        return
      with get_connection() as conn:
        cursor = conn.execute('DELETE FROM monthly_timesheets WHERE consultant_id = ? AND month_start = ?', (consultant_id, month_start))
      if cursor.rowcount == 0:
        self._send_json({'error': 'Timesheet not found'}, HTTPStatus.NOT_FOUND)
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
