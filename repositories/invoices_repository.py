import db


def calculate_invoice_paid_amount(conn, invoice_id):
  row = conn.execute('SELECT COALESCE(SUM(amount), 0) AS total FROM invoice_payments WHERE invoice_id = ?', (invoice_id,)).fetchone()
  return float(row['total'] if row and row['total'] is not None else 0.0)


def recalculate_invoice_status(conn, invoice_id):
  invoice = conn.execute('SELECT id, amount, status FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
  if not invoice:
    return None
  paid_amount = calculate_invoice_paid_amount(conn, invoice_id)
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


def list_project_invoices(conn, project_id):
  invoices = conn.execute(
    '''
    SELECT i.*
    FROM invoices i
    WHERE i.project_id = ?
    ORDER BY i.invoice_date DESC, i.id DESC
    ''',
    (project_id,)
  ).fetchall()
  return [
    {
      'id': invoice['id'],
      'projectId': invoice['project_id'],
      'positionId': invoice['position_id'],
      'invoiceRef': invoice['invoice_ref'] or '',
      'periodFrom': invoice['period_from'],
      'periodTo': invoice['period_to'],
      'invoiceDate': invoice['invoice_date'],
      'dueDate': invoice['due_date'] or '',
      'amount': float(invoice['amount'] if invoice['amount'] is not None else 0.0),
      'paidAmount': calculate_invoice_paid_amount(conn, invoice['id']),
      'status': invoice['status'] or 'Draft',
      'notes': invoice['notes'] or ''
    }
    for invoice in invoices
  ]


def list_invoice_payments(conn, invoice_id):
  rows = conn.execute(
    'SELECT id, invoice_id, payment_date, amount, notes, created_at, updated_at FROM invoice_payments WHERE invoice_id = ? ORDER BY payment_date DESC, id DESC',
    (invoice_id,)
  ).fetchall()
  return [
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
  ]


def get_invoice(conn, invoice_id):
  return conn.execute('SELECT * FROM invoices WHERE id = ?', (invoice_id,)).fetchone()


def create_invoice(conn, project_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date, amount, status, notes):
  cursor = conn.execute(
    '''
    INSERT INTO invoices (project_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date, amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (project_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date or None, amount, status, notes)
  )
  return cursor.lastrowid


def update_invoice(conn, invoice_id, position_id, invoice_ref, period_from, period_to, invoice_date, due_date, amount, status, notes):
  conn.execute(
    '''
    UPDATE invoices
    SET position_id = ?, invoice_ref = ?, period_from = ?, period_to = ?, invoice_date = ?, due_date = ?, amount = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''',
    (position_id, invoice_ref, period_from, period_to, invoice_date, due_date or None, amount, status, notes, invoice_id)
  )
  recalculate_invoice_status(conn, invoice_id)


def delete_invoice(conn, invoice_id):
  cursor = conn.execute('DELETE FROM invoices WHERE id = ?', (invoice_id,))
  return cursor.rowcount


def create_invoice_payment(conn, invoice_id, payment_date, amount, notes):
  cursor = conn.execute('INSERT INTO invoice_payments (invoice_id, payment_date, amount, notes) VALUES (?, ?, ?, ?)', (invoice_id, payment_date, amount, notes))
  recalculate_invoice_status(conn, invoice_id)
  return cursor.lastrowid


def get_payment(conn, payment_id):
  return conn.execute('SELECT invoice_id FROM invoice_payments WHERE id = ?', (payment_id,)).fetchone()


def update_invoice_payment(conn, payment_id, payment_date, amount, notes):
  payment = get_payment(conn, payment_id)
  if not payment:
    return None
  conn.execute(
    'UPDATE invoice_payments SET payment_date = ?, amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    (payment_date, amount, notes, payment_id)
  )
  recalculate_invoice_status(conn, payment['invoice_id'])
  return payment['invoice_id']


def delete_invoice_payment(conn, payment_id):
  payment = get_payment(conn, payment_id)
  if not payment:
    return None
  conn.execute('DELETE FROM invoice_payments WHERE id = ?', (payment_id,))
  recalculate_invoice_status(conn, payment['invoice_id'])
  return payment['invoice_id']
