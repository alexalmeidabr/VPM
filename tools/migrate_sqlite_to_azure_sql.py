#!/usr/bin/env python3
"""One-time SQLite to Azure SQL data migration helper for VPM / Inhouse PSA.

This script is prepared for a future Azure SQL cutover. It is safe to run locally in
--dry-run mode without Azure credentials. Actual migration requires pyodbc, Azure SQL
environment variables, --migrate, and --yes.
"""

from __future__ import annotations

import argparse
import importlib
import importlib.util
import os
import sqlite3
import sys
from pathlib import Path
from typing import Any, Iterable

try:
  import pyodbc  # type: ignore
except ImportError:  # pragma: no cover - pyodbc is optional for local dry-runs.
  pyodbc = None

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT_DIR / 'projects.db'


def load_project_dotenv() -> None:
  """Load project-root .env settings when python-dotenv is installed."""
  if importlib.util.find_spec('dotenv') is None:
    return
  dotenv = importlib.import_module('dotenv')
  dotenv.load_dotenv(ROOT_DIR / '.env')

TABLE_ORDER = [
  'roles',
  'areas',
  'day_off_types',
  'business_partner_types',
  'project_types',
  'company_branches',
  'holiday_locations',
  'business_partners',
  'business_partner_contacts',
  'business_partner_contact_phones',
  'business_partner_contact_emails',
  'consultants',
  'holidays',
  'holiday_cache',
  'consultant_holiday_loads',
  'consultant_roles',
  'consultant_areas',
  'consultant_availability',
  'projects',
  'project_client_contacts',
  'project_delivery_partner_contacts',
  'project_phases',
  'project_milestones',
  'project_consultants',
  'project_positions',
  'allocation_simulations',
  'project_files',
  'project_budgets',
  'invoices',
  'invoice_payments',
  'monthly_timesheets',
  'monthly_timesheet_lines',
  'monthly_timesheet_entries',
]

IDENTITY_TABLES = {
  'roles',
  'areas',
  'day_off_types',
  'business_partner_types',
  'project_types',
  'company_branches',
  'holiday_locations',
  'business_partners',
  'business_partner_contacts',
  'business_partner_contact_phones',
  'business_partner_contact_emails',
  'consultants',
  'holidays',
  'holiday_cache',
  'consultant_holiday_loads',
  'consultant_availability',
  'projects',
  'project_phases',
  'project_milestones',
  'project_positions',
  'allocation_simulations',
  'project_files',
  'project_budgets',
  'invoices',
  'invoice_payments',
  'monthly_timesheets',
  'monthly_timesheet_lines',
  'monthly_timesheet_entries',
}

BIT_COLUMNS = {
  ('project_consultants', 'billable'),
  ('project_positions', 'billable'),
  ('monthly_timesheet_lines', 'is_manual'),
}

REFERENCE_TABLES = {
  'roles',
  'areas',
  'day_off_types',
  'business_partner_types',
  'project_types',
  'company_branches',
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
  ('consultant_holiday_loads', 'consultant_id', 'consultants', 'id'),
  ('consultant_roles', 'consultant_id', 'consultants', 'id'),
  ('consultant_roles', 'role_id', 'roles', 'id'),
  ('consultant_areas', 'consultant_id', 'consultants', 'id'),
  ('consultant_areas', 'area_id', 'areas', 'id'),
  ('consultant_availability', 'consultant_id', 'consultants', 'id'),
  ('consultant_availability', 'day_off_type_id', 'day_off_types', 'id'),
  ('projects', 'manager_consultant_id', 'consultants', 'id'),
  ('projects', 'client_business_partner_id', 'business_partners', 'id'),
  ('projects', 'delivery_partner_business_partner_id', 'business_partners', 'id'),
  ('projects', 'contract_with_branch_id', 'company_branches', 'id'),
  ('project_client_contacts', 'project_id', 'projects', 'id'),
  ('project_client_contacts', 'contact_id', 'business_partner_contacts', 'id'),
  ('project_delivery_partner_contacts', 'project_id', 'projects', 'id'),
  ('project_delivery_partner_contacts', 'contact_id', 'business_partner_contacts', 'id'),
  ('project_phases', 'project_id', 'projects', 'id'),
  ('project_milestones', 'project_id', 'projects', 'id'),
  ('project_milestones', 'phase_id', 'project_phases', 'id'),
  ('project_consultants', 'project_id', 'projects', 'id'),
  ('project_consultants', 'consultant_id', 'consultants', 'id'),
  ('project_positions', 'project_id', 'projects', 'id'),
  ('project_positions', 'consultant_id', 'consultants', 'id'),
  ('project_positions', 'area_id', 'areas', 'id'),
  ('project_files', 'project_id', 'projects', 'id'),
  ('project_budgets', 'project_id', 'projects', 'id'),
  ('invoices', 'project_id', 'projects', 'id'),
  ('invoices', 'position_id', 'project_positions', 'id'),
  ('invoice_payments', 'invoice_id', 'invoices', 'id'),
  ('monthly_timesheets', 'consultant_id', 'consultants', 'id'),
  ('monthly_timesheet_lines', 'timesheet_id', 'monthly_timesheets', 'id'),
  ('monthly_timesheet_lines', 'project_id', 'projects', 'id'),
  ('monthly_timesheet_entries', 'line_id', 'monthly_timesheet_lines', 'id'),
]


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description='Prepare or run a one-time SQLite to Azure SQL data migration.')
  parser.add_argument('--source', default=str(DEFAULT_SOURCE), help='Path to source SQLite projects.db (default: %(default)s).')
  mode = parser.add_mutually_exclusive_group()
  mode.add_argument('--dry-run', action='store_true', help='Inspect SQLite source only; does not require Azure credentials.')
  mode.add_argument('--migrate', action='store_true', help='Copy SQLite data to Azure SQL. Requires --yes and Azure env vars.')
  mode.add_argument('--validate-only', action='store_true', help='Compare SQLite and Azure row counts without inserting data.')
  parser.add_argument('--yes', action='store_true', help='Required confirmation flag for --migrate.')
  return parser.parse_args()


def quote_identifier(name: str) -> str:
  if name not in TABLE_COLUMNS and name != 'dbo':
    raise ValueError(f'Unsafe or unknown identifier: {name}')
  return f'[{name}]'


def quote_column(name: str, table: str) -> str:
  if name not in TABLE_COLUMNS[table]:
    raise ValueError(f'Unsafe or unknown column {table}.{name}')
  return f'[{name}]'


def table_name(table: str) -> str:
  if table not in TABLE_COLUMNS:
    raise ValueError(f'Unknown table: {table}')
  return f'dbo.{quote_identifier(table)}'


def open_sqlite(source: Path) -> sqlite3.Connection:
  if not source.exists():
    raise FileNotFoundError(f'Source SQLite database not found: {source}')
  conn = sqlite3.connect(source)
  conn.row_factory = sqlite3.Row
  return conn


def sqlite_tables(conn: sqlite3.Connection) -> set[str]:
  rows = conn.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall()
  return {row['name'] for row in rows}


def sqlite_table_columns(conn: sqlite3.Connection, table: str) -> set[str]:
  return {row['name'] for row in conn.execute(f'PRAGMA table_info({quote_identifier(table)})').fetchall()}


def table_count_sqlite(conn: sqlite3.Connection, table: str) -> int:
  return int(conn.execute(f'SELECT COUNT(*) AS total FROM {quote_identifier(table)}').fetchone()['total'])


def inspect_source(conn: sqlite3.Connection) -> tuple[set[str], dict[str, int], list[str]]:
  found = sqlite_tables(conn)
  counts: dict[str, int] = {}
  warnings: list[str] = []
  for table in TABLE_ORDER:
    if table not in found:
      warnings.append(f'Missing expected table: {table}')
      counts[table] = 0
      continue
    columns = sqlite_table_columns(conn, table)
    missing_columns = [column for column in TABLE_COLUMNS[table] if column not in columns]
    if missing_columns:
      warnings.append(f"Table {table} is missing expected columns: {', '.join(missing_columns)}")
    counts[table] = table_count_sqlite(conn, table)
  return found, counts, warnings


def print_source_report(found: set[str], counts: dict[str, int], warnings: Iterable[str]) -> None:
  print('SQLite source inspection')
  print('------------------------')
  print(f'Tables found ({len(found)}): {", ".join(sorted(found))}')
  print('\nMigration order and row counts:')
  for index, table in enumerate(TABLE_ORDER, start=1):
    print(f'{index:02d}. {table}: {counts.get(table, 0)} row(s)')
  warning_list = list(warnings)
  if warning_list:
    print('\nWarnings:')
    for warning in warning_list:
      print(f'- {warning}')
  else:
    print('\nWarnings: none')


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
    raise ValueError(f"Missing required Azure SQL settings: {', '.join(missing)}")
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


def open_azure_connection():
  if pyodbc is None:
    raise RuntimeError('pyodbc is required for --migrate and --validate-only modes')
  return pyodbc.connect(azure_connection_string(azure_settings()), autocommit=False)


def table_count_azure(cursor, table: str) -> int:
  cursor.execute(f'SELECT COUNT(*) FROM {table_name(table)}')
  return int(cursor.fetchone()[0])


def azure_counts(cursor) -> dict[str, int]:
  return {table: table_count_azure(cursor, table) for table in TABLE_ORDER}


def preflight_target(cursor) -> None:
  counts = azure_counts(cursor)
  non_empty = {table: count for table, count in counts.items() if count}
  if not non_empty:
    print('Azure target preflight: all migration tables are empty.')
    return

  seeded_only = all(table in REFERENCE_TABLES for table in non_empty)
  if seeded_only:
    raise RuntimeError(
      'Azure target contains seeded reference data. To preserve SQLite IDs safely, run the migration '
      'against an empty schema or truncate the seed data first. Non-empty tables: '
      + ', '.join(f'{table}={count}' for table, count in sorted(non_empty.items()))
    )
  raise RuntimeError(
    'Azure target is not empty. Refusing to migrate to avoid overwriting or duplicating data. Non-empty tables: '
    + ', '.join(f'{table}={count}' for table, count in sorted(non_empty.items()))
  )


def normalize_value(table: str, column: str, value: Any) -> Any:
  if value is None:
    return None
  if (table, column) in BIT_COLUMNS:
    return bool(value)
  return value


def fetch_rows(conn: sqlite3.Connection, table: str) -> list[sqlite3.Row]:
  columns = ', '.join(quote_column(column, table) for column in TABLE_COLUMNS[table])
  return conn.execute(f'SELECT {columns} FROM {quote_identifier(table)}').fetchall()


def insert_rows(cursor, table: str, rows: list[sqlite3.Row]) -> None:
  if not rows:
    print(f'- {table}: 0 row(s), skipped')
    return

  columns = TABLE_COLUMNS[table]
  column_sql = ', '.join(quote_column(column, table) for column in columns)
  placeholders = ', '.join('?' for _ in columns)
  insert_sql = f'INSERT INTO {table_name(table)} ({column_sql}) VALUES ({placeholders})'
  values = [tuple(normalize_value(table, column, row[column]) for column in columns) for row in rows]

  identity_enabled = False
  try:
    if table in IDENTITY_TABLES:
      cursor.execute(f'SET IDENTITY_INSERT {table_name(table)} ON')
      identity_enabled = True
    cursor.executemany(insert_sql, values)
  except Exception as error:
    raise RuntimeError(f'Failed while inserting table {table}: {error}') from error
  finally:
    if identity_enabled:
      cursor.execute(f'SET IDENTITY_INSERT {table_name(table)} OFF')
  print(f'- {table}: inserted {len(rows)} row(s)')


def migrate(sqlite_conn: sqlite3.Connection, azure_conn) -> None:
  cursor = azure_conn.cursor()
  print('Checking Azure target state...')
  preflight_target(cursor)
  print('Starting migration transaction...')
  try:
    for table in TABLE_ORDER:
      insert_rows(cursor, table, fetch_rows(sqlite_conn, table))
    validate_counts(sqlite_conn, cursor)
    azure_conn.commit()
  except Exception:
    azure_conn.rollback()
    raise


def validate_counts(sqlite_conn: sqlite3.Connection, azure_cursor) -> None:
  print('\nValidating row counts...')
  mismatches = []
  for table in TABLE_ORDER:
    sqlite_count = table_count_sqlite(sqlite_conn, table)
    azure_count = table_count_azure(azure_cursor, table)
    print(f'- {table}: SQLite={sqlite_count}, Azure={azure_count}')
    if sqlite_count != azure_count:
      mismatches.append((table, sqlite_count, azure_count))
  if mismatches:
    detail = ', '.join(f'{table} SQLite={sqlite_count} Azure={azure_count}' for table, sqlite_count, azure_count in mismatches)
    raise RuntimeError(f'Row count validation failed: {detail}')


def validate_orphans_sqlite(conn: sqlite3.Connection) -> list[str]:
  problems = []
  for child_table, child_column, parent_table, parent_column in FOREIGN_KEY_CHECKS:
    if table_count_sqlite(conn, child_table) == 0:
      continue
    query = (
      f'SELECT COUNT(*) AS total FROM {quote_identifier(child_table)} child '
      f'LEFT JOIN {quote_identifier(parent_table)} parent '
      f'ON child.{quote_column(child_column, child_table)} = parent.{quote_column(parent_column, parent_table)} '
      f'WHERE child.{quote_column(child_column, child_table)} IS NOT NULL '
      f'AND parent.{quote_column(parent_column, parent_table)} IS NULL'
    )
    count = int(conn.execute(query).fetchone()['total'])
    if count:
      problems.append(f'{child_table}.{child_column} -> {parent_table}.{parent_column}: {count} orphan(s)')
  return problems


def main() -> int:
  load_project_dotenv()
  args = parse_args()
  if not (args.dry_run or args.migrate or args.validate_only):
    args.dry_run = True

  source = Path(args.source).expanduser().resolve()
  with open_sqlite(source) as sqlite_conn:
    found, counts, warnings = inspect_source(sqlite_conn)
    print_source_report(found, counts, warnings)
    orphan_warnings = validate_orphans_sqlite(sqlite_conn)
    if orphan_warnings:
      print('\nSQLite source foreign-key warnings:')
      for warning in orphan_warnings:
        print(f'- {warning}')

    if args.dry_run:
      print('\nDry-run complete. No Azure SQL connection was opened and no data was written.')
      return 0

    if args.migrate and not args.yes:
      raise SystemExit('Refusing to run migration without --yes. Re-run with --migrate --yes after verifying the dry-run output.')

    with open_azure_connection() as azure_conn:
      if args.validate_only:
        validate_counts(sqlite_conn, azure_conn.cursor())
        return 0
      migrate(sqlite_conn, azure_conn)
      print('\nMigration completed successfully.')
      return 0


if __name__ == '__main__':
  try:
    raise SystemExit(main())
  except Exception as error:
    print(f'ERROR: {error}', file=sys.stderr)
    raise SystemExit(1)
