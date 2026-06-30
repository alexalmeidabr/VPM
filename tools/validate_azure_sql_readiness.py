#!/usr/bin/env python3
"""Local and optional Azure SQL readiness checks for VPM / Inhouse PSA.

Default mode runs local SQLite checks and static SQL-script checks without Azure credentials.
The optional --azure mode is read-only and intended for a future dev/test Azure SQL database.
"""

from __future__ import annotations

import argparse
import importlib
import importlib.util
import os
import sqlite3
import sys
from pathlib import Path
from typing import Iterable

try:
  import pyodbc  # type: ignore
except ImportError:  # pragma: no cover - pyodbc is optional unless --azure is used.
  pyodbc = None

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT_DIR / 'projects.db'
SQL_DIR = ROOT_DIR / 'sql' / 'azure'
SCHEMA_SCRIPT = SQL_DIR / '001_schema.sql'
SEED_SCRIPT = SQL_DIR / '002_seed_reference_data.sql'
README = SQL_DIR / 'README.md'
MIGRATION_DOC = SQL_DIR / 'MIGRATION.md'


def load_project_dotenv() -> None:
  """Load project-root .env settings when python-dotenv is installed."""
  if importlib.util.find_spec('dotenv') is None:
    return
  dotenv = importlib.import_module('dotenv')
  dotenv.load_dotenv(ROOT_DIR / '.env')

# Keep this validation helper independent from runtime server imports. The table metadata mirrors
# tools/migrate_sqlite_to_azure_sql.py so it can validate the source before a migration dry-run.
TABLE_ORDER = [
  'roles', 'areas', 'day_off_types', 'business_partner_types', 'project_types', 'company_branches',
  'holiday_locations', 'business_partners', 'business_partner_contacts', 'business_partner_contact_phones',
  'business_partner_contact_emails', 'consultants', 'holidays', 'holiday_cache', 'consultant_holiday_loads',
  'consultant_roles', 'consultant_areas', 'consultant_availability', 'projects', 'project_client_contacts',
  'project_delivery_partner_contacts', 'project_phases', 'project_milestones', 'project_consultants',
  'project_positions', 'allocation_simulations', 'project_files', 'project_budgets', 'invoices',
  'invoice_payments', 'monthly_timesheets', 'monthly_timesheet_lines', 'monthly_timesheet_entries',
]

IDENTITY_TABLES = {
  'roles', 'areas', 'day_off_types', 'business_partner_types', 'project_types', 'company_branches',
  'holiday_locations', 'business_partners', 'business_partner_contacts', 'business_partner_contact_phones',
  'business_partner_contact_emails', 'consultants', 'holidays', 'holiday_cache', 'consultant_holiday_loads',
  'consultant_availability', 'projects', 'project_phases', 'project_milestones', 'project_positions',
  'allocation_simulations', 'project_files', 'project_budgets', 'invoices', 'invoice_payments',
  'monthly_timesheets', 'monthly_timesheet_lines', 'monthly_timesheet_entries',
}

TABLE_COLUMNS = {
  'roles': ['id', 'name', 'created_at'],
  'areas': ['id', 'name', 'created_at'],
  'day_off_types': ['id', 'name', 'created_at'],
  'business_partner_types': ['id', 'name', 'created_at'],
  'project_types': ['id', 'name', 'created_at'],
  'company_branches': ['id', 'name', 'created_at', 'tax_identification', 'street_name', 'street_number', 'postal_code', 'city', 'region', 'country'],
  'holiday_locations': ['id', 'label', 'country_code', 'region_code', 'created_at'],
  'business_partners': ['id', 'company_name', 'address_street', 'address_number', 'postal_code', 'city', 'region', 'country', 'business_partner_type_id', 'created_at', 'tax_identification'],
  'business_partner_contacts': ['id', 'business_partner_id', 'name', 'last_name', 'email', 'created_at'],
  'business_partner_contact_phones': ['id', 'contact_id', 'phone_number', 'created_at'],
  'business_partner_contact_emails': ['id', 'contact_id', 'email', 'created_at'],
  'consultants': ['id', 'name', 'area', 'position', 'holiday_location_id', 'company_branch_id', 'salary', 'start_date', 'created_at'],
  'holidays': ['id', 'date', 'name', 'country_code', 'region_code', 'scope', 'year', 'source'],
  'holiday_cache': ['id', 'country_code', 'region_code', 'year', 'fetched_at'],
  'consultant_holiday_loads': ['id', 'consultant_id', 'year', 'country_code', 'region_code', 'loaded_at'],
  'consultant_roles': ['consultant_id', 'role_id'],
  'consultant_areas': ['consultant_id', 'area_id'],
  'consultant_availability': ['id', 'consultant_id', 'day_off_type_id', 'type', 'start_date', 'end_date', 'created_at'],
  'projects': ['id', 'project_name', 'client_name', 'project_lead', 'client_contact', 'start_date', 'end_date', 'manager_consultant_id', 'project_type', 'created_at', 'project_status', 'client_business_partner_id', 'delivery_partner_business_partner_id', 'contract_with_branch_id'],
  'project_client_contacts': ['project_id', 'contact_id'],
  'project_delivery_partner_contacts': ['project_id', 'contact_id'],
  'project_phases': ['id', 'project_id', 'name', 'start_date', 'end_date'],
  'project_milestones': ['id', 'project_id', 'phase_id', 'name', 'start_date', 'end_date'],
  'project_consultants': ['project_id', 'consultant_id', 'project_role', 'start_date', 'end_date', 'billable'],
  'project_positions': ['id', 'project_id', 'consultant_id', 'area_id', 'project_role', 'start_date', 'end_date', 'allocation', 'billable', 'daily_rate', 'daily_rate_currency', 'comments', 'status'],
  'allocation_simulations': ['id', 'name', 'state_json', 'created_at', 'updated_at'],
  'project_files': ['id', 'project_id', 'original_filename', 'stored_filename', 'file_size', 'uploaded_at'],
  'project_budgets': ['id', 'project_id', 'budget_name', 'budget_type', 'status', 'start_date', 'end_date', 'amount', 'currency', 'notes', 'created_at', 'updated_at'],
  'invoices': ['id', 'project_id', 'position_id', 'invoice_ref', 'period_from', 'period_to', 'invoice_date', 'due_date', 'amount', 'status', 'notes', 'created_at', 'updated_at'],
  'invoice_payments': ['id', 'invoice_id', 'payment_date', 'amount', 'notes', 'created_at', 'updated_at'],
  'monthly_timesheets': ['id', 'consultant_id', 'month_start', 'status', 'created_at'],
  'monthly_timesheet_lines': ['id', 'timesheet_id', 'project_id', 'activity', 'is_manual', 'created_at'],
  'monthly_timesheet_entries': ['id', 'line_id', 'entry_date', 'hours', 'created_at', 'updated_at'],
}

FOREIGN_KEY_CHECKS = [
  ('business_partners', 'business_partner_type_id', 'business_partner_types', 'id'),
  ('business_partner_contacts', 'business_partner_id', 'business_partners', 'id'),
  ('business_partner_contact_phones', 'contact_id', 'business_partner_contacts', 'id'),
  ('business_partner_contact_emails', 'contact_id', 'business_partner_contacts', 'id'),
  ('consultants', 'holiday_location_id', 'holiday_locations', 'id'),
  ('consultants', 'company_branch_id', 'company_branches', 'id'),
  ('consultant_roles', 'consultant_id', 'consultants', 'id'),
  ('consultant_roles', 'role_id', 'roles', 'id'),
  ('consultant_areas', 'consultant_id', 'consultants', 'id'),
  ('consultant_areas', 'area_id', 'areas', 'id'),
  ('consultant_availability', 'consultant_id', 'consultants', 'id'),
  ('consultant_availability', 'day_off_type_id', 'day_off_types', 'id'),
  ('projects', 'manager_consultant_id', 'consultants', 'id'),
  ('projects', 'client_business_partner_id', 'business_partners', 'id'),
  ('project_phases', 'project_id', 'projects', 'id'),
  ('project_milestones', 'project_id', 'projects', 'id'),
  ('project_milestones', 'phase_id', 'project_phases', 'id'),
  ('project_positions', 'project_id', 'projects', 'id'),
  ('invoices', 'project_id', 'projects', 'id'),
  ('invoices', 'position_id', 'project_positions', 'id'),
  ('monthly_timesheets', 'consultant_id', 'consultants', 'id'),
  ('monthly_timesheet_lines', 'timesheet_id', 'monthly_timesheets', 'id'),
  ('monthly_timesheet_entries', 'line_id', 'monthly_timesheet_lines', 'id'),
]

SQLITE_ONLY_PATTERNS = ['PRAGMA', 'AUTOINCREMENT', 'sqlite_master', 'ON CONFLICT']


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description='Validate local and future Azure SQL migration readiness.')
  parser.add_argument('--source', default=str(DEFAULT_SOURCE), help='Path to source SQLite projects.db (default: %(default)s).')
  parser.add_argument('--local', action='store_true', help='Run local SQLite source validation.')
  parser.add_argument('--check-sql-scripts', action='store_true', help='Run static Azure SQL script validation.')
  parser.add_argument('--azure', action='store_true', help='Run read-only Azure SQL count/orphan validation using Azure env vars.')
  return parser.parse_args()


def quote_name(name: str) -> str:
  if name not in TABLE_COLUMNS:
    raise ValueError(f'Unknown table: {name}')
  return f'[{name}]'


def quote_column(table: str, column: str) -> str:
  if column not in TABLE_COLUMNS[table]:
    raise ValueError(f'Unknown column: {table}.{column}')
  return f'[{column}]'


def table_name(table: str) -> str:
  return f'dbo.{quote_name(table)}'


def pass_line(message: str) -> None:
  print(f'PASS: {message}')


def fail_line(message: str) -> None:
  print(f'FAIL: {message}')


def warn_line(message: str) -> None:
  print(f'WARN: {message}')


def sqlite_connect(source: Path) -> sqlite3.Connection:
  conn = sqlite3.connect(source)
  conn.row_factory = sqlite3.Row
  return conn


def sqlite_tables(conn: sqlite3.Connection) -> set[str]:
  return {row['name'] for row in conn.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}


def sqlite_columns(conn: sqlite3.Connection, table: str) -> set[str]:
  return {row['name'] for row in conn.execute(f'PRAGMA table_info({quote_name(table)})')}


def sqlite_count(conn: sqlite3.Connection, table: str) -> int:
  return int(conn.execute(f'SELECT COUNT(*) AS total FROM {quote_name(table)}').fetchone()['total'])


def validate_sqlite_orphans(conn: sqlite3.Connection, found_tables: set[str]) -> list[str]:
  problems = []
  for child_table, child_column, parent_table, parent_column in FOREIGN_KEY_CHECKS:
    if child_table not in found_tables or parent_table not in found_tables:
      continue
    query = (
      f'SELECT COUNT(*) AS total FROM {quote_name(child_table)} child '
      f'LEFT JOIN {quote_name(parent_table)} parent '
      f'ON child.{quote_column(child_table, child_column)} = parent.{quote_column(parent_table, parent_column)} '
      f'WHERE child.{quote_column(child_table, child_column)} IS NOT NULL '
      f'AND parent.{quote_column(parent_table, parent_column)} IS NULL'
    )
    count = int(conn.execute(query).fetchone()['total'])
    if count:
      problems.append(f'{child_table}.{child_column} -> {parent_table}.{parent_column}: {count} orphan(s)')
  return problems


def validate_local(source: Path) -> bool:
  print('Local SQLite validation')
  print('-----------------------')
  ok = True
  if not source.exists():
    fail_line(f'Source database does not exist: {source}')
    return False
  pass_line(f'Source database exists: {source}')

  with sqlite_connect(source) as conn:
    integrity = conn.execute('PRAGMA integrity_check').fetchone()[0]
    if str(integrity).lower() == 'ok':
      pass_line('PRAGMA integrity_check returned ok')
    else:
      fail_line(f'PRAGMA integrity_check returned {integrity!r}')
      ok = False

    fk_rows = conn.execute('PRAGMA foreign_key_check').fetchall()
    if not fk_rows:
      pass_line('PRAGMA foreign_key_check returned no rows')
    else:
      fail_line(f'PRAGMA foreign_key_check returned {len(fk_rows)} row(s)')
      ok = False

    found = sqlite_tables(conn)
    missing_tables = [table for table in TABLE_ORDER if table not in found]
    if missing_tables:
      fail_line(f'Missing expected tables: {", ".join(missing_tables)}')
      ok = False
    else:
      pass_line('All expected application tables exist')

    total_rows = 0
    print('\nRow counts:')
    for table in TABLE_ORDER:
      if table not in found:
        continue
      columns = sqlite_columns(conn, table)
      missing_columns = [column for column in TABLE_COLUMNS[table] if column not in columns]
      if missing_columns:
        fail_line(f'{table} missing columns: {", ".join(missing_columns)}')
        ok = False
      count = sqlite_count(conn, table)
      total_rows += count
      print(f'- {table}: {count}')
    print(f'Total rows across migration tables: {total_rows}')

    orphan_problems = validate_sqlite_orphans(conn, found)
    if orphan_problems:
      for problem in orphan_problems:
        fail_line(problem)
      ok = False
    else:
      pass_line('Basic orphan checks passed')

    if 'project_files' in found:
      file_count = sqlite_count(conn, 'project_files')
      if file_count:
        warn_line(f'project_files has {file_count} row(s); database migration does not move file bytes from project-files/')
      else:
        pass_line('project_files has no rows requiring separate file handling')
  return ok


def contains_sqlite_only_syntax(path: Path) -> list[str]:
  text = path.read_text(encoding='utf-8')
  found = []
  upper_text = text.upper()
  for pattern in SQLITE_ONLY_PATTERNS:
    if pattern.upper() in upper_text:
      found.append(pattern)
  return found


def validate_sql_scripts() -> bool:
  print('Azure SQL script static validation')
  print('----------------------------------')
  ok = True
  for path in [SCHEMA_SCRIPT, SEED_SCRIPT, README, MIGRATION_DOC]:
    if path.exists():
      pass_line(f'{path.relative_to(ROOT_DIR)} exists')
    else:
      fail_line(f'{path.relative_to(ROOT_DIR)} is missing')
      ok = False

  if SCHEMA_SCRIPT.exists():
    schema = SCHEMA_SCRIPT.read_text(encoding='utf-8')
    for table in TABLE_ORDER:
      if f'CREATE TABLE dbo.{table}' in schema:
        pass_line(f'Schema contains CREATE TABLE for {table}')
      else:
        fail_line(f'Schema missing CREATE TABLE for {table}')
        ok = False
    for table in sorted(IDENTITY_TABLES):
      expected = f'CREATE TABLE dbo.{table}'
      if expected in schema and 'IDENTITY(1,1)' in schema[schema.index(expected):schema.index(expected) + 400]:
        continue
      fail_line(f'Schema missing expected IDENTITY column near {table}')
      ok = False
    sqlite_patterns = contains_sqlite_only_syntax(SCHEMA_SCRIPT)
    if sqlite_patterns:
      fail_line(f'Schema contains SQLite-only syntax: {", ".join(sqlite_patterns)}')
      ok = False
    else:
      pass_line('Schema contains no blocked SQLite-only syntax')
    region_unique_constraints = [
      'CONSTRAINT UQ_holiday_locations_country_region UNIQUE',
      'CONSTRAINT UQ_holidays_date_country_region_scope UNIQUE',
      'CONSTRAINT UQ_holiday_cache_country_region_year UNIQUE',
      'CONSTRAINT UQ_consultant_holiday_loads_consultant_year_country_region UNIQUE',
    ]
    remaining_region_constraints = [constraint for constraint in region_unique_constraints if constraint in schema]
    if remaining_region_constraints:
      fail_line(f'Schema still has table-level nullable region_code UNIQUE constraints: {", ".join(remaining_region_constraints)}')
      ok = False
    else:
      pass_line('Schema uses no table-level UNIQUE constraints for nullable region_code rules')
    for index_name in [
      'UQ_holiday_locations_country_region',
      'UQ_holidays_date_country_region_scope',
      'UQ_holiday_cache_country_region_year',
      'UQ_consultant_holiday_loads_consultant_year_country_region',
    ]:
      if f'CREATE UNIQUE INDEX {index_name}' in schema and 'WHERE region_code IS NOT NULL' in schema[schema.index(index_name):schema.index(index_name) + 300]:
        pass_line(f'Schema contains filtered unique index {index_name}')
      else:
        fail_line(f'Schema missing filtered unique index {index_name}')
        ok = False

  if SEED_SCRIPT.exists():
    seed_patterns = contains_sqlite_only_syntax(SEED_SCRIPT)
    if seed_patterns:
      fail_line(f'Seed script contains SQLite-only syntax: {", ".join(seed_patterns)}')
      ok = False
    else:
      pass_line('Seed script contains no blocked SQLite-only syntax')
  return ok


def azure_settings() -> dict[str, str]:
  settings = {
    'server': (os.getenv('AZURE_SQL_SERVER') or '').strip(),
    'database': (os.getenv('AZURE_SQL_DATABASE') or '').strip(),
    'username': (os.getenv('AZURE_SQL_USERNAME') or '').strip(),
    'password': (os.getenv('AZURE_SQL_PASSWORD') or '').strip(),
    'driver': (os.getenv('AZURE_SQL_DRIVER') or 'ODBC Driver 18 for SQL Server').strip(),
  }
  missing = [key for key in ('server', 'database', 'username', 'password') if not settings[key]]
  if missing:
    raise RuntimeError(f'Missing Azure SQL settings: {", ".join(missing)}')
  return settings


def azure_connection_string(settings: dict[str, str]) -> str:
  return ';'.join([
    f"DRIVER={{{settings['driver']}}}",
    f"SERVER={settings['server']}",
    f"DATABASE={settings['database']}",
    f"UID={settings['username']}",
    f"PWD={settings['password']}",
    'Encrypt=yes',
    'TrustServerCertificate=no',
  ])


def azure_count(cursor, table: str) -> int:
  cursor.execute(f'SELECT COUNT(*) FROM {table_name(table)}')
  return int(cursor.fetchone()[0])


def sqlite_counts(source: Path) -> dict[str, int]:
  with sqlite_connect(source) as conn:
    return {table: sqlite_count(conn, table) for table in TABLE_ORDER if table in sqlite_tables(conn)}


def validate_azure(source: Path) -> bool:
  print('Azure SQL read-only validation')
  print('------------------------------')
  if pyodbc is None:
    fail_line('pyodbc is not installed')
    return False
  if not source.exists():
    fail_line(f'Source database does not exist: {source}')
    return False

  settings = azure_settings()
  sqlite_row_counts = sqlite_counts(source)
  ok = True
  with pyodbc.connect(azure_connection_string(settings), autocommit=True) as conn:
    cursor = conn.cursor()
    for table in TABLE_ORDER:
      sqlite_total = sqlite_row_counts.get(table, 0)
      azure_total = azure_count(cursor, table)
      if sqlite_total == azure_total:
        pass_line(f'{table}: SQLite={sqlite_total}, Azure={azure_total}')
      else:
        fail_line(f'{table}: SQLite={sqlite_total}, Azure={azure_total}')
        ok = False
  return ok


def main() -> int:
  load_project_dotenv()
  args = parse_args()
  if not (args.local or args.check_sql_scripts or args.azure):
    args.local = True
    args.check_sql_scripts = True

  source = Path(args.source).expanduser().resolve()
  results = []
  if args.local:
    results.append(validate_local(source))
  if args.check_sql_scripts:
    results.append(validate_sql_scripts())
  if args.azure:
    try:
      results.append(validate_azure(source))
    except Exception as error:
      fail_line(str(error))
      results.append(False)

  if all(results):
    print('\nValidation summary: PASS')
    return 0
  print('\nValidation summary: FAIL')
  return 1


if __name__ == '__main__':
  raise SystemExit(main())
