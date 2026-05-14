import db


def _load_contacts_for_partner_ids(conn, partner_ids):
  if not partner_ids:
    return {}
  placeholders = ','.join('?' for _ in partner_ids)
  contacts = conn.execute(
    f'''
    SELECT id, business_partner_id, name, last_name, email
    FROM business_partner_contacts
    WHERE business_partner_id IN ({placeholders})
    ORDER BY business_partner_id, id
    ''',
    tuple(partner_ids)
  ).fetchall()
  if not contacts:
    return {partner_id: [] for partner_id in partner_ids}

  contact_ids = [row['id'] for row in contacts]
  placeholders = ','.join('?' for _ in contact_ids)
  email_rows = conn.execute(
    f'SELECT contact_id, email FROM business_partner_contact_emails WHERE contact_id IN ({placeholders}) ORDER BY id',
    tuple(contact_ids)
  ).fetchall()
  phone_rows = conn.execute(
    f'SELECT contact_id, phone_number FROM business_partner_contact_phones WHERE contact_id IN ({placeholders}) ORDER BY id',
    tuple(contact_ids)
  ).fetchall()

  emails_by_contact = {}
  for row in email_rows:
    emails_by_contact.setdefault(row['contact_id'], []).append(row['email'])
  phones_by_contact = {}
  for row in phone_rows:
    phones_by_contact.setdefault(row['contact_id'], []).append(row['phone_number'])

  result = {partner_id: [] for partner_id in partner_ids}
  for contact in contacts:
    normalized_emails = [item for item in emails_by_contact.get(contact['id'], []) if str(item or '').strip()]
    if not normalized_emails and str(contact['email'] or '').strip():
      normalized_emails = [str(contact['email']).strip()]
    result.setdefault(contact['business_partner_id'], []).append({
      'id': contact['id'],
      'name': contact['name'],
      'lastName': contact['last_name'],
      'email': normalized_emails[0] if normalized_emails else '',
      'emails': normalized_emails,
      'phoneNumbers': phones_by_contact.get(contact['id'], [])
    })
  return result


def list_business_partners(conn=None):
  if conn is None:
    with db.get_connection() as db_conn:
      return list_business_partners(db_conn)
  partners = conn.execute(
    '''
    SELECT id, company_name, tax_identification, address_street, address_number, postal_code, city, region, country, business_partner_type_id
    FROM business_partners
    ORDER BY company_name
    '''
  ).fetchall()
  partner_ids = [row['id'] for row in partners]
  contacts_by_partner = _load_contacts_for_partner_ids(conn, partner_ids)
  return [
    {
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
      'contacts': contacts_by_partner.get(partner['id'], [])
    }
    for partner in partners
  ]


def _replace_contacts(conn, business_partner_id, contacts):
  conn.execute('DELETE FROM business_partner_contact_emails WHERE contact_id IN (SELECT id FROM business_partner_contacts WHERE business_partner_id = ?)', (business_partner_id,))
  conn.execute('DELETE FROM business_partner_contact_phones WHERE contact_id IN (SELECT id FROM business_partner_contacts WHERE business_partner_id = ?)', (business_partner_id,))
  conn.execute('DELETE FROM business_partner_contacts WHERE business_partner_id = ?', (business_partner_id,))
  for contact in contacts:
    email_values = [str(email).strip() for email in (contact.get('emails') or []) if str(email).strip()]
    if not email_values and str(contact.get('email', '')).strip():
      email_values = [str(contact.get('email', '')).strip()]
    contact_id = db.execute_insert_and_get_id(
      conn,
      'INSERT INTO business_partner_contacts (business_partner_id, name, last_name, email) VALUES (?, ?, ?, ?)',
      'INSERT INTO business_partner_contacts (business_partner_id, name, last_name, email) OUTPUT INSERTED.id VALUES (?, ?, ?, ?)',
      (
        business_partner_id,
        str(contact.get('name', '')).strip(),
        str(contact.get('lastName', '')).strip(),
        email_values[0] if email_values else ''
      )
    )
    for email in email_values:
      conn.execute('INSERT INTO business_partner_contact_emails (contact_id, email) VALUES (?, ?)', (contact_id, email))
    for phone in (contact.get('phoneNumbers') or []):
      phone_value = str(phone).strip()
      if phone_value:
        conn.execute('INSERT INTO business_partner_contact_phones (contact_id, phone_number) VALUES (?, ?)', (contact_id, phone_value))


def create_business_partner(conn, payload):
  partner_id = db.execute_insert_and_get_id(
    conn,
    '''
    INSERT INTO business_partners (company_name, tax_identification, address_street, address_number, postal_code, city, region, country, business_partner_type_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    '''
    INSERT INTO business_partners (company_name, tax_identification, address_street, address_number, postal_code, city, region, country, business_partner_type_id)
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
      payload['companyName'],
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
  _replace_contacts(conn, partner_id, payload.get('contacts', []))
  return partner_id


def update_business_partner(conn, business_partner_id, payload):
  cursor = conn.execute(
    '''
    UPDATE business_partners
    SET company_name = ?, tax_identification = ?, address_street = ?, address_number = ?, postal_code = ?, city = ?, region = ?, country = ?, business_partner_type_id = ?
    WHERE id = ?
    ''',
    (
      payload['companyName'],
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
    return 0
  _replace_contacts(conn, business_partner_id, payload.get('contacts', []))
  return cursor.rowcount


def delete_business_partner(conn, business_partner_id):
  cursor = conn.execute('DELETE FROM business_partners WHERE id = ?', (business_partner_id,))
  return cursor.rowcount
