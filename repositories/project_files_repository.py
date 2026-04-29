import db

def list_project_files(conn, project_id):
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


def get_project_file(conn, project_id, file_id):
  return conn.execute(
    '''
    SELECT id, project_id, original_filename, stored_filename, file_size, uploaded_at
    FROM project_files
    WHERE id = ? AND project_id = ?
    ''',
    (file_id, project_id)
  ).fetchone()


def create_project_file(conn, project_id, original_filename, stored_filename, file_size):
  cursor = conn.execute(
    '''
    INSERT INTO project_files (project_id, original_filename, stored_filename, file_size)
    VALUES (?, ?, ?, ?)
    ''',
    (project_id, original_filename, stored_filename, file_size)
  )
  return db.get_last_insert_id(cursor, conn)
