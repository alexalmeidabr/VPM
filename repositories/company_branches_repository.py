def list_company_branches(conn):
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


def create_company_branch(conn, payload):
  cursor = conn.execute(
    '''
    INSERT INTO company_branches (name, tax_identification, street_name, street_number, postal_code, city, region, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
      payload['name'],
      str(payload.get('taxIdentification', '')).strip(),
      str(payload.get('streetName', '')).strip(),
      str(payload.get('streetNumber', '')).strip(),
      str(payload.get('postalCode', '')).strip(),
      str(payload.get('city', '')).strip(),
      str(payload.get('region', '')).strip(),
      str(payload.get('country', '')).strip()
    )
  )
  return cursor.lastrowid


def update_company_branch(conn, company_branch_id, payload):
  cursor = conn.execute(
    '''
    UPDATE company_branches
    SET name = ?, tax_identification = ?, street_name = ?, street_number = ?, postal_code = ?, city = ?, region = ?, country = ?
    WHERE id = ?
    ''',
    (
      payload['name'],
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
  return cursor.rowcount


def delete_company_branch(conn, company_branch_id):
  cursor = conn.execute('DELETE FROM company_branches WHERE id = ?', (company_branch_id,))
  return cursor.rowcount
