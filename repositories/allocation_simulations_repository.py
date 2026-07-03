import db

import json


def list_allocation_simulations(conn):
  rows = conn.execute(
    'SELECT id, name, state_json, created_at, updated_at FROM allocation_simulations ORDER BY updated_at DESC, created_at DESC, id DESC'
  ).fetchall()
  simulations = []
  for row in rows:
    try:
      state = json.loads(row['state_json'])
    except json.JSONDecodeError:
      state = {}
    simulations.append({
      'id': row['id'],
      'name': row['name'],
      'createdAt': row['created_at'],
      'updatedAt': row['updated_at'],
      'projectCount': len(state.get('projects') or []) if isinstance(state, dict) else 0
    })
  return simulations


def get_allocation_simulation(conn, simulation_id):
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


def create_allocation_simulation(conn, simulation_name, state):
  return db.execute_insert_and_get_id(
    conn,
    'INSERT INTO allocation_simulations (name, state_json) VALUES (?, ?)',
    'INSERT INTO allocation_simulations (name, state_json) OUTPUT INSERTED.id VALUES (?, ?)',
    (simulation_name, json.dumps(state))
  )


def update_allocation_simulation(conn, simulation_id, simulation_name, state):
  cursor = conn.execute(
    '''
    UPDATE allocation_simulations
    SET name = ?, state_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''',
    (simulation_name, json.dumps(state), simulation_id)
  )
  return cursor.rowcount


def rename_allocation_simulation(conn, simulation_id, simulation_name):
  cursor = conn.execute(
    '''
    UPDATE allocation_simulations
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''',
    (simulation_name, simulation_id)
  )
  return cursor.rowcount


def duplicate_allocation_simulation(conn, simulation_id, simulation_name):
  simulation = get_allocation_simulation(conn, simulation_id)
  if not simulation:
    return None
  new_id = create_allocation_simulation(conn, simulation_name, simulation.get('state') or {})
  return {'id': new_id, 'name': simulation_name}


def delete_allocation_simulation(conn, simulation_id):
  cursor = conn.execute('DELETE FROM allocation_simulations WHERE id = ?', (simulation_id,))
  return cursor.rowcount
