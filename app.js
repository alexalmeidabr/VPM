const isBrowserRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';

if (!isBrowserRuntime) {
  console.warn('This script is intended for browser usage. Open index.html in a browser to run the app.');
} else {
  const configuredApiOrigin = (window.localStorage.getItem('vpmApiOrigin') || '').trim();
  const defaultApiOrigin = /^https?:\/\//.test(window.location.origin) ? window.location.origin : 'http://localhost:8000';
  const primaryApiBase = (configuredApiOrigin || defaultApiOrigin).replace(/\/$/, '');
  const fallbackApiBase = 'http://localhost:8000';

  const sections = {
    projects: document.getElementById('projects-section'),
    consultants: document.getElementById('consultants-section'),
    'mass-update': document.getElementById('mass-update-section'),
    authorization: document.getElementById('authorization-section'),
    administration: document.getElementById('administration-section')
  };

  const ui = {
    navMenu: document.getElementById('nav-menu'),
    projectsBody: document.getElementById('projects-body'),
    projectCount: document.getElementById('project-count'),
    projectsPanelCard: document.getElementById('projects-panel-card'),
    projectsEmptyState: document.getElementById('projects-empty-state'),
    showProjectFormBtn: document.getElementById('show-project-form-btn'),
    projectFormCard: document.getElementById('project-form-card'),
    projectForm: document.getElementById('project-form'),
    projectFormTitle: document.getElementById('project-form-title'),
    projectSaveBtn: document.getElementById('project-save-btn'),
    projectCancelEditBtn: document.getElementById('project-cancel-edit-btn'),
    backToProjectsBtn: document.getElementById('back-to-projects-btn'),
    openConsultantModalBtn: document.getElementById('open-consultant-modal-btn'),
    assignedConsultantsSummary: document.getElementById('assigned-consultants-summary'),
    projectMembersList: document.getElementById('project-members-list'),
    projectMembersCard: document.getElementById('project-members-card'),

    consultantModal: document.getElementById('consultant-assignment-modal'),
    consultantPickerList: document.getElementById('consultant-picker-list'),
    consultantAreaFilterModal: document.getElementById('consultant-area-filter-modal'),
    saveConsultantAssignmentsBtn: document.getElementById('save-consultant-assignments-btn'),

    consultantsBody: document.getElementById('consultants-body'),
    consultantCount: document.getElementById('consultant-count'),
    consultantsEmptyState: document.getElementById('consultants-empty-state'),
    showConsultantFormBtn: document.getElementById('show-consultant-form-btn'),
    consultantFormCard: document.getElementById('consultant-form-card'),
    consultantForm: document.getElementById('consultant-form'),
    consultantFormTitle: document.getElementById('consultant-form-title'),
    consultantCancelEditBtn: document.getElementById('consultant-cancel-edit-btn'),

    roleForm: document.getElementById('role-form'),
    areaForm: document.getElementById('area-form'),
    rolesList: document.getElementById('roles-list'),
    areasList: document.getElementById('areas-list')
  };

  const fields = {
    projectId: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
    projectType: document.getElementById('project-type'),
    managerId: document.getElementById('manager-consultant-id'),
    clientContact: document.getElementById('client-contact'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),

    consultantId: document.getElementById('consultant-id'),
    consultantName: document.getElementById('consultant-name'),
    consultantAreaIds: document.getElementById('consultant-area-ids'),
    consultantRoleIds: document.getElementById('consultant-role-ids'),
    consultantSalary: document.getElementById('consultant-salary'),

    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name')
  };

  const selectInstances = {};
  let consultantModalInstance;

  let projects = [];
  let consultants = [];
  let roles = [];
  let areas = [];
  let projectViewMode = 'edit';
  let selectedProjectMemberIds = [];
  let modalSelectedAreaId = '';
  let modalTempMemberIds = [];

  const toast = (message, classes = 'blue-grey darken-2') => {
    if (window.M?.toast) {
      M.toast({ html: message, classes });
    }
  };

  const updateTextFields = () => {
    if (window.M?.updateTextFields) {
      M.updateTextFields();
    }
  };

  const toFriendlyError = (error, fallback) => {
    if (error instanceof TypeError) {
      return 'Unable to reach API. Check that server.py is running on port 8000.';
    }
    return error?.message || fallback;
  };

  const request = async (path, options = {}) => {
    const call = async (baseUrl) => fetch(`${baseUrl}${path}`, options);
    let response;

    try {
      response = await call(primaryApiBase);
    } catch (error) {
      if (!(error instanceof TypeError) || primaryApiBase === fallbackApiBase) {
        throw error;
      }
      response = await call(fallbackApiBase);
      window.localStorage.setItem('vpmApiOrigin', fallbackApiBase);
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(payload.error || 'Request failed');
    }

    return response.status === 204 ? null : response.json();
  };

  const findConsultantById = (id) => consultants.find((consultant) => Number(consultant.id) === Number(id));
  const consultantNameById = (id) => findConsultantById(id)?.name || '—';
  const areaNameById = (id) => areas.find((area) => Number(area.id) === Number(id))?.name || '—';
  const roleNameById = (id) => roles.find((role) => Number(role.id) === Number(id))?.name || '—';

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatSalary = (value) => Number(value).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });

  const resetSelect = (key, element) => {
    if (selectInstances[key]) {
      selectInstances[key].destroy();
    }
    if (window.M?.FormSelect) {
      selectInstances[key] = M.FormSelect.init(element);
    }
  };

  const managerCandidates = () => consultants.filter((consultant) => (consultant.roles || []).includes('Project Manager'));

  const memberIdsIncludingManager = () => {
    const managerId = Number(fields.managerId.value);
    const combined = managerId ? [managerId, ...selectedProjectMemberIds] : [...selectedProjectMemberIds];
    return [...new Set(combined.map(Number))];
  };

  const updateAssignedConsultantsSummary = () => {
    if (!selectedProjectMemberIds.length) {
      ui.assignedConsultantsSummary.textContent = 'No consultants assigned yet.';
      return;
    }
    ui.assignedConsultantsSummary.textContent = `${selectedProjectMemberIds.length} consultant${selectedProjectMemberIds.length === 1 ? '' : 's'} assigned`;
  };

  const updateProjectMembersPanel = () => {
    const ids = memberIdsIncludingManager();
    ui.projectMembersList.innerHTML = '';

    if (!ids.length) {
      ui.projectMembersList.innerHTML = '<li>No consultants assigned yet.</li>';
      return;
    }

    ids.forEach((id) => {
      const consultant = findConsultantById(id);
      if (!consultant) {
        return;
      }
      const li = document.createElement('li');
      const rolesText = (consultant.roles || []).length ? consultant.roles.join(', ') : 'No role';
      li.textContent = `${consultant.name} — ${rolesText}`;
      ui.projectMembersList.appendChild(li);
    });
  };

  const renderConsultantPickerList = () => {
    if (!modalSelectedAreaId) {
      ui.consultantPickerList.innerHTML = '<p class="grey-text">Select an area to view consultants.</p>';
      return;
    }

    const areaId = Number(modalSelectedAreaId);
    const candidates = consultants.filter((consultant) => (consultant.areaIds || []).map(Number).includes(areaId));

    if (!candidates.length) {
      ui.consultantPickerList.innerHTML = '<p class="grey-text">No consultants available in this area.</p>';
      return;
    }

    ui.consultantPickerList.innerHTML = '';
    candidates.forEach((consultant) => {
      const wrapper = document.createElement('p');
      wrapper.className = 'consultant-picker-item';
      wrapper.innerHTML = `
        <label>
          <input type="checkbox" data-consultant-id="${consultant.id}" ${modalTempMemberIds.includes(Number(consultant.id)) ? 'checked' : ''} />
          <span>${consultant.name}</span>
        </label>
      `;
      ui.consultantPickerList.appendChild(wrapper);
    });
  };

  const rebuildProjectSelects = ({ managerId = '' } = {}) => {
    fields.managerId.innerHTML = '<option value="" disabled selected>Select a manager</option>';
    managerCandidates().forEach((consultant) => {
      const option = new Option(consultant.name, consultant.id, false, Number(managerId) === Number(consultant.id));
      fields.managerId.add(option);
    });
    resetSelect('manager', fields.managerId);
    resetSelect('projectType', fields.projectType);
    updateProjectMembersPanel();
  };

  const rebuildConsultantSelects = ({ areaIds = [], roleIds = [] } = {}) => {
    fields.consultantAreaIds.innerHTML = '';
    areas.forEach((area) => fields.consultantAreaIds.add(new Option(area.name, area.id, false, areaIds.map(Number).includes(Number(area.id)))));

    fields.consultantRoleIds.innerHTML = '';
    roles.forEach((role) => fields.consultantRoleIds.add(new Option(role.name, role.id, false, roleIds.map(Number).includes(Number(role.id)))));

    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantRoles', fields.consultantRoleIds);
  };

  const rebuildConsultantAreaModal = () => {
    ui.consultantAreaFilterModal.innerHTML = '<option value="" selected disabled>Select area</option>';
    areas.forEach((area) => {
      ui.consultantAreaFilterModal.add(new Option(area.name, area.id, false, Number(modalSelectedAreaId) === Number(area.id)));
    });
    resetSelect('consultantAreaModal', ui.consultantAreaFilterModal);
  };

  const renderProjects = () => {
    ui.projectsBody.innerHTML = '';

    projects.forEach((project) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${project.clientName}</td>
        <td>${consultantNameById(project.managerConsultantId)}</td>
        <td>${project.projectType || '—'}</td>
        <td>${project.clientContact}</td>
        <td><span class="chip date-chip">${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span></td>
        <td class="actions-cell">
          <button class="btn-flat teal-text" data-action="view-project" data-id="${project.id}" title="View"><i class="material-icons tiny">visibility</i></button>
          <button class="btn-flat blue-text" data-action="edit-project" data-id="${project.id}" title="Edit"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-project" data-id="${project.id}" title="Delete"><i class="material-icons tiny">delete</i></button>
        </td>
      `;
      ui.projectsBody.appendChild(row);
    });

    ui.projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'} tracked`;
    ui.projectsEmptyState.hidden = projects.length > 0;
  };

  const renderConsultants = () => {
    ui.consultantsBody.innerHTML = '';

    consultants.forEach((consultant) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consultant.name}</td>
        <td>${(consultant.areaNames || []).join(', ') || (consultant.areaIds || []).map(areaNameById).join(', ') || '—'}</td>
        <td>${(consultant.roles || []).join(', ') || (consultant.roleIds || []).map(roleNameById).join(', ') || '—'}</td>
        <td>${formatSalary(consultant.salary)}</td>
        <td>
          <button class="btn-flat blue-text" data-action="edit-consultant" data-id="${consultant.id}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-consultant" data-id="${consultant.id}"><i class="material-icons tiny">delete</i></button>
        </td>
      `;
      ui.consultantsBody.appendChild(row);
    });

    ui.consultantCount.textContent = `${consultants.length} consultant${consultants.length === 1 ? '' : 's'} tracked`;
    ui.consultantsEmptyState.hidden = consultants.length > 0;
  };

  const renderAdminLists = () => {
    ui.rolesList.innerHTML = '';
    roles.forEach((role) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${role.name}<button class="btn-flat secondary-content red-text" data-action="delete-role" data-id="${role.id}"><i class="material-icons tiny">delete</i></button>`;
      ui.rolesList.appendChild(li);
    });

    ui.areasList.innerHTML = '';
    areas.forEach((area) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${area.name}<button class="btn-flat secondary-content red-text" data-action="delete-area" data-id="${area.id}"><i class="material-icons tiny">delete</i></button>`;
      ui.areasList.appendChild(li);
    });
  };

  const showProjectsPanel = () => {
    ui.projectsPanelCard.hidden = false;
    ui.projectFormCard.hidden = true;
    ui.projectMembersCard.hidden = true;
  };

  const showManageProjectPanel = () => {
    ui.projectsPanelCard.hidden = true;
    ui.projectFormCard.hidden = false;
    ui.projectMembersCard.hidden = false;
  };

  const setProjectFormMode = (mode) => {
    projectViewMode = mode;
    const readOnly = mode === 'view';

    ui.projectFormTitle.textContent = readOnly ? 'Manage Project (View)' : 'Manage Project';
    ui.projectSaveBtn.hidden = readOnly;
    ui.openConsultantModalBtn.disabled = readOnly;

    [fields.projectName, fields.clientName, fields.projectType, fields.managerId, fields.clientContact, fields.startDate, fields.endDate].forEach((el) => {
      el.disabled = readOnly;
    });

    ui.projectCancelEditBtn.textContent = readOnly ? 'Close' : 'Cancel';
    rebuildProjectSelects({ managerId: fields.managerId.value });
    updateProjectMembersPanel();
  };

  const setSection = (section) => {
    Object.entries(sections).forEach(([key, element]) => {
      element.hidden = key !== section;
    });

    document.querySelectorAll('#nav-menu .collection-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    if (section === 'projects') {
      showProjectsPanel();
    }

    if (section === 'consultants') {
      ui.consultantFormCard.hidden = true;
    }
  };

  const resetProjectForm = () => {
    ui.projectForm.reset();
    fields.projectId.value = '';
    selectedProjectMemberIds = [];
    modalSelectedAreaId = '';
    modalTempMemberIds = [];
    updateAssignedConsultantsSummary();
    rebuildProjectSelects();
    setProjectFormMode('edit');
    showProjectsPanel();
    updateTextFields();
  };

  const resetConsultantForm = () => {
    ui.consultantForm.reset();
    fields.consultantId.value = '';
    rebuildConsultantSelects();
    ui.consultantFormTitle.textContent = 'Manage Consultants';
    ui.consultantFormCard.hidden = true;
    updateTextFields();
  };

  const loadAll = async () => {
    const [projectsRes, consultantsRes, rolesRes, areasRes] = await Promise.all([
      request('/api/projects'),
      request('/api/consultants'),
      request('/api/roles'),
      request('/api/areas')
    ]);

    projects = projectsRes.projects || [];
    consultants = consultantsRes.consultants || [];
    roles = rolesRes.roles || [];
    areas = areasRes.areas || [];

    renderProjects();
    renderConsultants();
    renderAdminLists();
    rebuildProjectSelects({ managerId: fields.managerId.value });
    rebuildConsultantSelects();
    rebuildConsultantAreaModal();
  };

  ui.showProjectFormBtn.addEventListener('click', () => {
    resetProjectForm();
    showManageProjectPanel();
  });

  ui.backToProjectsBtn.addEventListener('click', () => {
    showProjectsPanel();
    ui.projectFormCard.hidden = true;
  });

  ui.showConsultantFormBtn.addEventListener('click', () => {
    resetConsultantForm();
    ui.consultantFormCard.hidden = false;
  });

  ui.projectCancelEditBtn.addEventListener('click', resetProjectForm);
  ui.consultantCancelEditBtn.addEventListener('click', resetConsultantForm);

  fields.managerId.addEventListener('change', updateProjectMembersPanel);

  ui.openConsultantModalBtn.addEventListener('click', () => {
    if (!consultantModalInstance) {
      return;
    }
    modalTempMemberIds = [...selectedProjectMemberIds];
    modalSelectedAreaId = '';
    rebuildConsultantAreaModal();
    renderConsultantPickerList();
    consultantModalInstance.open();
  });

  ui.consultantAreaFilterModal.addEventListener('change', () => {
    modalSelectedAreaId = ui.consultantAreaFilterModal.value;
    renderConsultantPickerList();
  });

  ui.consultantPickerList.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-consultant-id]');
    if (!checkbox) {
      return;
    }
    const consultantId = Number(checkbox.dataset.consultantId);
    if (checkbox.checked) {
      modalTempMemberIds = [...new Set([...modalTempMemberIds, consultantId])];
    } else {
      modalTempMemberIds = modalTempMemberIds.filter((id) => Number(id) !== consultantId);
    }
  });

  ui.saveConsultantAssignmentsBtn.addEventListener('click', () => {
    selectedProjectMemberIds = [...new Set(modalTempMemberIds.map(Number))];
    updateAssignedConsultantsSummary();
    updateProjectMembersPanel();
    if (consultantModalInstance) {
      consultantModalInstance.close();
    }
  });

  ui.projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (projectViewMode === 'view') {
      return;
    }

    const payload = {
      projectName: fields.projectName.value.trim(),
      clientName: fields.clientName.value.trim(),
      projectType: fields.projectType.value,
      managerConsultantId: Number(fields.managerId.value),
      clientContact: fields.clientContact.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      consultantIds: selectedProjectMemberIds
    };

    if (payload.startDate > payload.endDate) {
      toast('Start date cannot be after end date', 'red darken-1');
      return;
    }

    try {
      const editing = Boolean(fields.projectId.value);
      await request(editing ? `/api/projects/${fields.projectId.value}` : '/api/projects', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll();
      resetProjectForm();
      toast(editing ? 'Project updated' : 'Project added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to save project'), 'red darken-1');
    }
  });

  ui.consultantForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: fields.consultantName.value.trim(),
      areaIds: Array.from(fields.consultantAreaIds.selectedOptions).map((opt) => Number(opt.value)),
      roleIds: Array.from(fields.consultantRoleIds.selectedOptions).map((opt) => Number(opt.value)),
      salary: fields.consultantSalary.value
    };

    try {
      const editing = Boolean(fields.consultantId.value);
      await request(editing ? `/api/consultants/${fields.consultantId.value}` : '/api/consultants', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll();
      resetConsultantForm();
      toast(editing ? 'Consultant updated' : 'Consultant added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to save consultant'), 'red darken-1');
    }
  });

  ui.projectsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const id = Number(button.dataset.id);
    const project = projects.find((item) => Number(item.id) === id);
    if (!project) {
      return;
    }

    if (button.dataset.action === 'delete-project') {
      try {
        await request(`/api/projects/${id}`, { method: 'DELETE' });
        await loadAll();
        toast('Project removed', 'orange darken-2');
      } catch (error) {
        toast(toFriendlyError(error, 'Failed to delete project'), 'red darken-1');
      }
      return;
    }

    fields.projectId.value = project.id;
    fields.projectName.value = project.projectName;
    fields.clientName.value = project.clientName;
    fields.projectType.value = project.projectType || '';
    fields.managerId.value = project.managerConsultantId || '';
    fields.clientContact.value = project.clientContact;
    fields.startDate.value = project.startDate;
    fields.endDate.value = project.endDate;
    selectedProjectMemberIds = (project.consultantIds || []).map(Number);

    updateAssignedConsultantsSummary();
    rebuildProjectSelects({ managerId: project.managerConsultantId });

    setProjectFormMode(button.dataset.action === 'view-project' ? 'view' : 'edit');
    showManageProjectPanel();
    updateTextFields();
  });

  ui.consultantsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const id = Number(button.dataset.id);
    const consultant = consultants.find((item) => Number(item.id) === id);
    if (!consultant) {
      return;
    }

    if (button.dataset.action === 'delete-consultant') {
      try {
        await request(`/api/consultants/${id}`, { method: 'DELETE' });
        await loadAll();
        toast('Consultant removed', 'orange darken-2');
      } catch (error) {
        toast(toFriendlyError(error, 'Failed to delete consultant'), 'red darken-1');
      }
      return;
    }

    fields.consultantId.value = consultant.id;
    fields.consultantName.value = consultant.name;
    fields.consultantSalary.value = consultant.salary;
    rebuildConsultantSelects({ areaIds: consultant.areaIds || [], roleIds: consultant.roleIds || [] });
    ui.consultantFormTitle.textContent = 'Manage Consultants';
    ui.consultantFormCard.hidden = false;
    updateTextFields();
  });

  ui.roleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.roleName.value.trim() })
      });
      ui.roleForm.reset();
      await loadAll();
      toast('Role added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to add role'), 'red darken-1');
    }
  });

  ui.areaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.areaName.value.trim() })
      });
      ui.areaForm.reset();
      await loadAll();
      toast('Area added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to add area'), 'red darken-1');
    }
  });

  ui.rolesList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-role"]');
    if (!button) {
      return;
    }
    try {
      await request(`/api/roles/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Role removed', 'orange darken-2');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to delete role'), 'red darken-1');
    }
  });

  ui.areasList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-area"]');
    if (!button) {
      return;
    }
    try {
      await request(`/api/areas/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Area removed', 'orange darken-2');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to delete area'), 'red darken-1');
    }
  });

  ui.navMenu.addEventListener('click', (event) => {
    const item = event.target.closest('li[data-section]');
    if (!item) {
      return;
    }
    setSection(item.dataset.section);
  });

  if (window.M?.Modal) {
    consultantModalInstance = M.Modal.init(ui.consultantModal);
  }

  setSection('projects');
  resetProjectForm();
  resetConsultantForm();
  loadAll().catch((error) => toast(toFriendlyError(error, 'Unable to load data'), 'red darken-1'));
}
