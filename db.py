from __future__ import annotations

import os
import sqlite3
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

if DATABASE_TYPE == 'azure_sql' and pyodbc is not None:
  Error = pyodbc.Error
  IntegrityError = pyodbc.IntegrityError
  Row = Any
else:
  Error = sqlite3.Error
  IntegrityError = sqlite3.IntegrityError
  Row = sqlite3.Row


def get_connection(database_path: str | Path | None = None, uri: bool = False):
  if DATABASE_TYPE == 'sqlite':
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
  return pyodbc.connect(conn_str)


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
