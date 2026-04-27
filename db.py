from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Iterable, Sequence

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = BASE_DIR / 'projects.db'

DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite').strip().lower()
if DATABASE_TYPE != 'sqlite':
  raise ValueError(f'Unsupported database type: {DATABASE_TYPE}')

DATABASE_PATH = Path(os.getenv('DATABASE_PATH') or DEFAULT_DATABASE_PATH)

Error = sqlite3.Error
IntegrityError = sqlite3.IntegrityError
Row = sqlite3.Row


def get_connection(database_path: str | Path | None = None, uri: bool = False) -> sqlite3.Connection:
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


def fetch_all(query: str, params: Sequence[Any] = ()) -> list[sqlite3.Row]:
  with get_connection() as conn:
    return conn.execute(query, params).fetchall()


def fetch_one(query: str, params: Sequence[Any] = ()) -> sqlite3.Row | None:
  with get_connection() as conn:
    return conn.execute(query, params).fetchone()


def execute(query: str, params: Sequence[Any] = ()) -> int:
  with get_connection() as conn:
    cursor = conn.execute(query, params)
    conn.commit()
    return cursor.lastrowid


def execute_many(query: str, params_list: Iterable[Sequence[Any]]) -> None:
  with get_connection() as conn:
    conn.executemany(query, params_list)
    conn.commit()
