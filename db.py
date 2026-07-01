from __future__ import annotations

import os
import sqlite3
from datetime import date, datetime, time
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable, Sequence

try:
  import pyodbc  # type: ignore
except ImportError:
  pyodbc = None

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = BASE_DIR / 'projects.db'


def _get_database_type() -> str:
  db_type = os.getenv('DATABASE_TYPE', 'sqlite').strip().lower()
  if db_type not in {'sqlite', 'azure_sql'}:
    raise ValueError(f'Unsupported database type: {db_type}')
  return db_type


def _validate_azure_sql_settings() -> dict[str, str]:
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


def _build_azure_sql_connection_string(settings: dict[str, str]) -> str:
  return ';'.join([
    f"DRIVER={{{settings['driver']}}}",
    f"SERVER={settings['server']}",
    f"DATABASE={settings['database']}",
    f"UID={settings['username']}",
    f"PWD={settings['password']}",
    'Encrypt=yes',
    'TrustServerCertificate=no'
  ])


DATABASE_TYPE = _get_database_type()
DATABASE_PATH = Path(os.getenv('DATABASE_PATH') or DEFAULT_DATABASE_PATH)


class AzureSqlRow(dict[str, Any]):
  """Dict-like row for Azure SQL results that also preserves index access."""

  def __init__(self, column_names: Sequence[str], values: Sequence[Any]):
    super().__init__(zip(column_names, values))
    self._values = tuple(values)

  def __getitem__(self, key):
    if isinstance(key, int):
      return self._values[key]
    return super().__getitem__(key)


class AzureSqlCursor:
  """Small pyodbc cursor wrapper that normalizes fetched rows to dict-like rows."""

  def __init__(self, cursor):
    self._cursor = cursor

  def execute(self, query: str, params: Sequence[Any] = ()):
    self._cursor.execute(query, params)
    return self

  def fetchone(self):
    row = self._cursor.fetchone()
    return row_to_dict(self._cursor, row)

  def fetchall(self):
    return rows_to_dicts(self._cursor, self._cursor.fetchall())

  def __iter__(self):
    for row in self._cursor:
      yield row_to_dict(self._cursor, row)

  def __getattr__(self, name: str):
    return getattr(self._cursor, name)


class AzureSqlConnection:
  """Small pyodbc connection wrapper that returns AzureSqlCursor from execute()."""

  def __init__(self, conn):
    self._conn = conn

  def execute(self, query: str, params: Sequence[Any] = ()):
    cursor = self._conn.cursor()
    cursor.execute(query, params)
    return AzureSqlCursor(cursor)

  def executemany(self, query: str, params_list: Iterable[Sequence[Any]]):
    cursor = self._conn.cursor()
    cursor.executemany(query, params_list)
    return AzureSqlCursor(cursor)

  def cursor(self):
    return AzureSqlCursor(self._conn.cursor())

  def __enter__(self):
    self._conn.__enter__()
    return self

  def __exit__(self, exc_type, exc_value, traceback):
    return self._conn.__exit__(exc_type, exc_value, traceback)

  def __getattr__(self, name: str):
    return getattr(self._conn, name)


def is_sqlite() -> bool:
  return DATABASE_TYPE == 'sqlite'


def is_azure_sql() -> bool:
  return DATABASE_TYPE == 'azure_sql'

if DATABASE_TYPE == 'azure_sql' and pyodbc is not None:
  Error = pyodbc.Error
  IntegrityError = pyodbc.IntegrityError
  Row = AzureSqlRow
else:
  Error = sqlite3.Error
  IntegrityError = sqlite3.IntegrityError
  Row = sqlite3.Row


def row_to_dict(cursor, row):
  if row is None:
    return None
  if is_sqlite():
    return row
  column_names = [column[0] for column in cursor.description]
  values = [normalize_azure_value(value) for value in row]
  return AzureSqlRow(column_names, values)


def normalize_azure_value(value):
  """Normalize pyodbc scalar values into JSON-safe application values."""
  if value is None or isinstance(value, (str, int, float, bool)):
    return value
  if isinstance(value, Decimal):
    return float(value)
  if isinstance(value, (datetime, date, time)):
    return value.isoformat()
  return value


def rows_to_dicts(cursor, rows):
  if is_sqlite():
    return rows
  return [row_to_dict(cursor, row) for row in rows]


def get_connection(database_path: str | Path | None = None, uri: bool = False):
  if is_sqlite():
    if database_path is None:
      db_target: str | Path = DATABASE_PATH
    elif uri:
      db_target = str(database_path)
    else:
      db_target = Path(database_path)
    conn = sqlite3.connect(db_target, uri=uri)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

  # Azure SQL mode does not support sqlite-specific connection overrides.
  if database_path is not None or uri:
    raise ValueError('database_path/uri overrides are sqlite-only and not supported for DATABASE_TYPE=azure_sql')
  settings = _validate_azure_sql_settings()
  if pyodbc is None:
    raise ValueError('DATABASE_TYPE=azure_sql requires pyodbc to be installed')
  conn_str = _build_azure_sql_connection_string(settings)
  return AzureSqlConnection(pyodbc.connect(conn_str))


def fetch_all(query: str, params: Sequence[Any] = ()) -> list[Row]:
  with get_connection() as conn:
    return conn.execute(query, params).fetchall()


def fetch_one(query: str, params: Sequence[Any] = ()) -> Row | None:
  with get_connection() as conn:
    return conn.execute(query, params).fetchone()


def execute(query: str, params: Sequence[Any] = ()) -> int:
  with get_connection() as conn:
    cursor = conn.execute(query, params)
    conn.commit()
    return int(getattr(cursor, 'lastrowid', 0) or 0)


def execute_many(query: str, params_list: Iterable[Sequence[Any]]) -> None:
  with get_connection() as conn:
    conn.executemany(query, params_list)
    conn.commit()


def get_last_insert_id(cursor, conn=None) -> int:
  lastrowid = getattr(cursor, 'lastrowid', None)
  if lastrowid is not None:
    return int(lastrowid)
  # Azure SQL insert-id retrieval should be explicit in SQL (e.g. OUTPUT INSERTED.id).
  raise ValueError('Insert id is unavailable on this backend/cursor; use backend-specific insert-id retrieval.')


def execute_insert_and_get_id(conn, sqlite_query: str, azure_query: str, params: Sequence[Any]) -> int:
  if is_sqlite():
    cursor = conn.execute(sqlite_query, params)
    return get_last_insert_id(cursor, conn)
  row = conn.execute(azure_query, params).fetchone()
  if not row:
    raise ValueError('Insert id was not returned by Azure SQL insert query.')
  return int(row[0])
