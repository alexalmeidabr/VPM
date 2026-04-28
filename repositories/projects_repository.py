import db


def list_projects(conn=None):
  if conn is None:
    with db.get_connection() as db_conn:
      return list_projects(db_conn)
  rows = conn.execute(
    '''
    SELECT p.id, p.project_name, p.client_name, p.client_contact, p.start_date, p.end_date,
           p.project_type, p.project_status, p.manager_consultant_id, p.client_business_partner_id, p.delivery_partner_business_partner_id,
           p.contract_with_branch_id, c.name AS manager_name, cb.name AS contract_with_branch_name
    FROM projects p
    LEFT JOIN consultants c ON c.id = p.manager_consultant_id
    LEFT JOIN company_branches cb ON cb.id = p.contract_with_branch_id
    ORDER BY p.created_at DESC, p.id DESC
    '''
  ).fetchall()

  projects = []
  for row in rows:
    positions = conn.execute(
      '''
      SELECT pp.id, pp.consultant_id, pp.area_id, pp.project_role, pp.start_date, pp.end_date, pp.allocation, pp.billable, pp.daily_rate, pp.daily_rate_currency, pp.comments, pp.status, c.name AS consultant_name
      FROM project_positions pp
      LEFT JOIN consultants c ON c.id = pp.consultant_id
      WHERE pp.project_id = ?
      ORDER BY pp.id
      ''',
      (row['id'],)
    ).fetchall()
    phases = conn.execute(
      'SELECT id, name, start_date, end_date FROM project_phases WHERE project_id = ? ORDER BY start_date, id',
      (row['id'],)
    ).fetchall()
    milestones = conn.execute(
      'SELECT id, phase_id, name, start_date, end_date FROM project_milestones WHERE project_id = ? ORDER BY start_date, id',
      (row['id'],)
    ).fetchall()
    client_contacts = conn.execute(
      '''
      SELECT bc.id, bc.name, bc.last_name, bc.email
      FROM project_client_contacts pcc
      JOIN business_partner_contacts bc ON bc.id = pcc.contact_id
      WHERE pcc.project_id = ?
      ORDER BY bc.id
      ''',
      (row['id'],)
    ).fetchall()
    delivery_contacts = conn.execute(
      '''
      SELECT bc.id, bc.name, bc.last_name, bc.email
      FROM project_delivery_partner_contacts pdc
      JOIN business_partner_contacts bc ON bc.id = pdc.contact_id
      WHERE pdc.project_id = ?
      ORDER BY bc.id
      ''',
      (row['id'],)
    ).fetchall()
    projects.append({
      'id': row['id'],
      'projectName': row['project_name'],
      'clientName': row['client_name'],
      'clientContact': row['client_contact'],
      'clientBusinessPartnerId': row['client_business_partner_id'],
      'deliveryPartnerBusinessPartnerId': row['delivery_partner_business_partner_id'],
      'contractWithBranchId': row['contract_with_branch_id'],
      'contractWithBranchName': row['contract_with_branch_name'],
      'clientContacts': [{'id': c['id'], 'name': c['name'], 'lastName': c['last_name'], 'email': c['email']} for c in client_contacts],
      'deliveryPartnerContacts': [{'id': c['id'], 'name': c['name'], 'lastName': c['last_name'], 'email': c['email']} for c in delivery_contacts],
      'startDate': row['start_date'],
      'endDate': row['end_date'],
      'projectType': row['project_type'],
      'projectStatus': row['project_status'],
      'managerConsultantId': row['manager_consultant_id'],
      'managerName': row['manager_name'],
      'projectPhases': [
        {'id': str(p['id']), 'name': p['name'], 'startDate': p['start_date'], 'endDate': p['end_date']}
        for p in phases
      ],
      'projectMilestones': [
        {'id': str(m['id']), 'phaseId': str(m['phase_id']) if m['phase_id'] is not None else '', 'name': m['name'], 'startDate': m['start_date'], 'endDate': m['end_date']}
        for m in milestones
      ],
      'projectPositions': [
        {
          'id': m['id'],
          'consultantId': m['consultant_id'],
          'consultantName': m['consultant_name'],
          'areaId': m['area_id'],
          'projectRole': m['project_role'] or 'Project Position',
          'startDate': m['start_date'] or '',
          'endDate': m['end_date'] or '',
          'allocation': m['allocation'] if m['allocation'] is not None else 100,
          'billable': bool(m['billable']) if m['billable'] is not None else True,
          'dailyRate': m['daily_rate'],
          'dailyRateCurrency': m['daily_rate_currency'],
          'comments': m['comments'] or '',
          'status': m['status'] or ('Assigned' if m['consultant_id'] else 'Open')
        }
        for m in positions
      ],
      'consultantAssignments': [
        {
          'consultantId': m['consultant_id'],
          'consultantName': m['consultant_name'],
          'projectRole': m['project_role'] or 'Project Position',
          'startDate': m['start_date'] or '',
          'endDate': m['end_date'] or '',
          'allocation': m['allocation'] if m['allocation'] is not None else 100,
          'billable': bool(m['billable']) if m['billable'] is not None else True,
          'comments': m['comments'] or ''
        }
        for m in positions if m['consultant_id'] is not None
      ]
    })
  return projects


def create_project(conn, payload, manager_name):
  cursor = conn.execute(
    '''
    INSERT INTO projects (project_name, client_name, project_lead, client_contact, start_date, end_date, manager_consultant_id, project_type, project_status, client_business_partner_id, delivery_partner_business_partner_id, contract_with_branch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (payload['projectName'], '', manager_name or 'Manager', '', payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], payload['projectStatus'], payload['clientBusinessPartnerId'], payload['deliveryPartnerBusinessPartnerId'], payload['contractWithBranchId'])
  )
  project_id = cursor.lastrowid
  for item in payload['consultantAssignments']:
    conn.execute(
      'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date, billable) VALUES (?, ?, ?, ?, ?, ?)',
      (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'], 1 if item.get('billable', True) else 0)
    )
  for item in payload.get('projectPositions', []):
    conn.execute(
      'INSERT INTO project_positions (project_id, consultant_id, area_id, project_role, start_date, end_date, allocation, billable, daily_rate, daily_rate_currency, comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      (project_id, item.get('consultantId'), item.get('areaId'), item['projectRole'], item['startDate'], item['endDate'], item.get('allocation', 100), 1 if item.get('billable', True) else 0, item.get('dailyRate'), item.get('dailyRateCurrency'), item.get('comments', ''), item.get('status', 'Open'))
    )
  phase_id_map = {}
  for phase in payload['projectPhases']:
    cursor_phase = conn.execute(
      'INSERT INTO project_phases (project_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
      (project_id, phase['name'], phase['startDate'], phase['endDate'])
    )
    phase_id_map[phase['id']] = cursor_phase.lastrowid
  for milestone in payload['projectMilestones']:
    conn.execute(
      'INSERT INTO project_milestones (project_id, phase_id, name, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      (project_id, phase_id_map.get(milestone['phaseId']), milestone['name'], milestone['startDate'], milestone['endDate'])
    )
  for contact_id in payload['clientContactIds']:
    conn.execute('INSERT INTO project_client_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
  for contact_id in payload['deliveryPartnerContactIds']:
    conn.execute('INSERT INTO project_delivery_partner_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
  return project_id


def update_project(conn, project_id, payload, manager_name):
  cursor = conn.execute(
    '''
    UPDATE projects
    SET project_name = ?, client_name = ?, project_lead = ?, client_contact = ?, start_date = ?, end_date = ?, manager_consultant_id = ?, project_type = ?, project_status = ?, client_business_partner_id = ?, delivery_partner_business_partner_id = ?, contract_with_branch_id = ?
    WHERE id = ?
    ''',
    (payload['projectName'], '', manager_name or 'Manager', '', payload['startDate'], payload['endDate'], payload['managerConsultantId'], payload['projectType'], payload['projectStatus'], payload['clientBusinessPartnerId'], payload['deliveryPartnerBusinessPartnerId'], payload['contractWithBranchId'], project_id)
  )
  if cursor.rowcount == 0:
    return 0
  conn.execute('DELETE FROM project_consultants WHERE project_id = ?', (project_id,))
  conn.execute('DELETE FROM project_positions WHERE project_id = ?', (project_id,))
  conn.execute('DELETE FROM project_milestones WHERE project_id = ?', (project_id,))
  conn.execute('DELETE FROM project_phases WHERE project_id = ?', (project_id,))
  conn.execute('DELETE FROM project_client_contacts WHERE project_id = ?', (project_id,))
  conn.execute('DELETE FROM project_delivery_partner_contacts WHERE project_id = ?', (project_id,))
  for item in payload['consultantAssignments']:
    conn.execute(
      'INSERT INTO project_consultants (project_id, consultant_id, project_role, start_date, end_date, billable) VALUES (?, ?, ?, ?, ?, ?)',
      (project_id, item['consultantId'], item['projectRole'], item['startDate'], item['endDate'], 1 if item.get('billable', True) else 0)
    )
  for item in payload.get('projectPositions', []):
    conn.execute(
      'INSERT INTO project_positions (project_id, consultant_id, area_id, project_role, start_date, end_date, allocation, billable, daily_rate, daily_rate_currency, comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      (project_id, item.get('consultantId'), item.get('areaId'), item['projectRole'], item['startDate'], item['endDate'], item.get('allocation', 100), 1 if item.get('billable', True) else 0, item.get('dailyRate'), item.get('dailyRateCurrency'), item.get('comments', ''), item.get('status', 'Open'))
    )
  phase_id_map = {}
  for phase in payload['projectPhases']:
    cursor_phase = conn.execute(
      'INSERT INTO project_phases (project_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
      (project_id, phase['name'], phase['startDate'], phase['endDate'])
    )
    phase_id_map[phase['id']] = cursor_phase.lastrowid
  for milestone in payload['projectMilestones']:
    conn.execute(
      'INSERT INTO project_milestones (project_id, phase_id, name, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      (project_id, phase_id_map.get(milestone['phaseId']), milestone['name'], milestone['startDate'], milestone['endDate'])
    )
  for contact_id in payload['clientContactIds']:
    conn.execute('INSERT INTO project_client_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
  for contact_id in payload['deliveryPartnerContactIds']:
    conn.execute('INSERT INTO project_delivery_partner_contacts (project_id, contact_id) VALUES (?, ?)', (project_id, contact_id))
  return cursor.rowcount


def delete_project(conn, project_id):
  cursor = conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
  return cursor.rowcount
