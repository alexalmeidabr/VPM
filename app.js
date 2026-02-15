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

  const navMenu = document.getElementById('nav-menu');
  const projectFormCard = document.getElementById('project-form-card');
  const projectForm = document.getElementById('project-form');
  const showProjectFormBtn = document.getElementById('show-project-form-btn');
  const projectCancelEditBtn = document.getElementById('project-cancel-edit-btn');
  const projectsBody = document.getElementById('projects-body');
  const projectCount = document.getElementById('project-count');
  const projectsEmptyState = document.getElementById('projects-empty-state');
  const managerSelect = document.getElementById('manager-consultant-id');
  const membersSelect = document.getElementById('consultant-ids');
  const projectMembersList = document.getElementById('project-members-list');

  const consultantForm = document.getElementById('consultant-form');
  const consultantCancelEditBtn = document.getElementById('consultant-cancel-edit-btn');
  const consultantsBody = document.getElementById('consultants-body');
  const consultantCount = document.getElementById('consultant-count');
  const consultantsEmptyState = document.getElementById('consultants-empty-state');
  const consultantAreaSelect = document.getElementById('consultant-area-id');
  const consultantRolesSelect = document.getElementById('consultant-role-ids');

  const roleForm = document.getElementById('role-form');
  const areaForm = document.getElementById('area-form');
  const rolesList = document.getElementById('roles-list');
  const areasList = document.getElementById('areas-list');

  const fields = {
    projectId: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
    clientContact: document.getElementById('client-contact'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),
    consultantId: document.getElementById('consultant-id'),
    consultantName: document.getElementById('consultant-name'),
    consultantSalary: document.getElementById('consultant-salary'),
    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name')
  };

  let projects = [];
  let consultants = [];
  let roles = [];
  let areas = [];

  let managerSelectInstance;
  let memberSelectInstance;
  let consultantAreaSelectInstance;
  let consultantRolesSelectInstance;

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
    const call = async (base) => fetch(`${base}${path}`, options);
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

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const consultantNameById = (id) => consultants.find((c) => Number(c.id) === Number(id))?.name || '—';
  const areaNameById = (id) => areas.find((a) => Number(a.id) === Number(id))?.name || '—';
  const roleNameById = (id) => roles.find((r) => Number(r.id) === Number(id))?.name || '—';

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatSalary = (value) => Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

  const selectedIds = (selectEl) => Array.from(selectEl.selectedOptions).map((option) => Number(option.value));

  const updateProjectMembersPanel = () => {
    const ids = selectedIds(membersSelect);
    projectMembersList.innerHTML = '';
    if (!ids.length) {
      projectMembersList.innerHTML = '<li>No consultants assigned yet.</li>';
      return;
    }
    ids.forEach((id) => {
      const li = document.createElement('li');
      li.textContent = consultantNameById(id);
      projectMembersList.appendChild(li);
    });
  };

  const resetSelectInstances = () => {
    [managerSelectInstance, memberSelectInstance, consultantAreaSelectInstance, consultantRolesSelectInstance].forEach((instance) => {
      if (instance) {
        instance.destroy();
      }
    });
  };

  const rebuildSelects = (selected = {}) => {
    managerSelect.innerHTML = '<option value="" disabled selected>Select a manager</option>';
    membersSelect.innerHTML = '';
    consultantAreaSelect.innerHTML = '<option value="" disabled selected>Select an area</option>';
    consultantRolesSelect.innerHTML = '';

    consultants.forEach((c) => {
      const managerOption = new Option(c.name, c.id, false, Number(selected.managerId) === Number(c.id));
      managerSelect.add(managerOption);

      const memberOption = new Option(`${c.name} • ${c.areaName || ''}`.trim(), c.id, false, (selected.memberIds || []).map(Number).includes(Number(c.id)));
      membersSelect.add(memberOption);
    });

    areas.forEach((a) => {
      const areaOption = new Option(a.name, a.id, false, Number(selected.areaId) === Number(a.id));
      consultantAreaSelect.add(areaOption);
    });

    roles.forEach((r) => {
      const roleOption = new Option(r.name, r.id, false, (selected.roleIds || []).map(Number).includes(Number(r.id)));
      consultantRolesSelect.add(roleOption);
    });

    resetSelectInstances();
    if (window.M?.FormSelect) {
      managerSelectInstance = M.FormSelect.init(managerSelect);
      memberSelectInstance = M.FormSelect.init(membersSelect);
      consultantAreaSelectInstance = M.FormSelect.init(consultantAreaSelect);
      consultantRolesSelectInstance = M.FormSelect.init(consultantRolesSelect);
    }

    updateProjectMembersPanel();
  };

  const refreshProjectsView = () => {
    projectsBody.innerHTML = '';
    projects.forEach((project) => {
      const memberNames = (project.consultantIds || []).map(consultantNameById).filter((n) => n !== '—');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${project.clientName}</td>
        <td>${consultantNameById(project.managerConsultantId)}</td>
        <td>${project.clientContact}</td>
        <td><span class="chip">${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span></td>
        <td>${memberNames.length ? memberNames.join(', ') : '—'}</td>
        <td>
          <button class="btn-flat blue-text" data-action="edit-project" data-id="${project.id}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-project" data-id="${project.id}"><i class="material-icons tiny">delete</i></button>
        </td>
      `;
      projectsBody.appendChild(row);
    });
    projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'} tracked`;
    projectsEmptyState.hidden = projects.length > 0;
  };

  const refreshConsultantsView = () => {
    consultantsBody.innerHTML = '';
    consultants.forEach((consultant) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consultant.name}</td>
        <td>${consultant.areaName || areaNameById(consultant.areaId)}</td>
        <td>${(consultant.roles || []).join(', ') || (consultant.roleIds || []).map(roleNameById).join(', ') || '—'}</td>
        <td>${formatSalary(consultant.salary)}</td>
        <td>
          <button class="btn-flat blue-text" data-action="edit-consultant" data-id="${consultant.id}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-consultant" data-id="${consultant.id}"><i class="material-icons tiny">delete</i></button>
        </td>
      `;
      consultantsBody.appendChild(row);
    });
    consultantCount.textContent = `${consultants.length} consultant${consultants.length === 1 ? '' : 's'} tracked`;
    consultantsEmptyState.hidden = consultants.length > 0;
  };

  const refreshAdminLists = () => {
    rolesList.innerHTML = '';
    roles.forEach((role) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${role.name}<button class="btn-flat secondary-content red-text" data-action="delete-role" data-id="${role.id}"><i class="material-icons tiny">delete</i></button>`;
      rolesList.appendChild(li);
    });

    areasList.innerHTML = '';
    areas.forEach((area) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${area.name}<button class="btn-flat secondary-content red-text" data-action="delete-area" data-id="${area.id}"><i class="material-icons tiny">delete</i></button>`;
      areasList.appendChild(li);
    });
  };

  const setSection = (section) => {
    Object.entries(sections).forEach(([key, element]) => {
      element.hidden = key !== section;
    });

    document.querySelectorAll('#nav-menu .collection-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    if (section === 'projects') {
      projectFormCard.hidden = true;
    }
  };

  const resetProjectForm = () => {
    projectForm.reset();
    fields.projectId.value = '';
    rebuildSelects();
    projectFormCard.hidden = true;
    updateTextFields();
  };

  const resetConsultantForm = () => {
    consultantForm.reset();
    fields.consultantId.value = '';
    consultantCancelEditBtn.hidden = true;
    rebuildSelects();
    updateTextFields();
  };

  const loadMeta = async () => {
    const [rolesRes, areasRes] = await Promise.all([request('/api/roles'), request('/api/areas')]);
    roles = rolesRes.roles || [];
    areas = areasRes.areas || [];
    refreshAdminLists();
  };

  const loadConsultants = async () => {
    const response = await request('/api/consultants');
    consultants = response.consultants || [];
    refreshConsultantsView();
  };

  const loadProjects = async () => {
    const response = await request('/api/projects');
    projects = response.projects || [];
    refreshProjectsView();
  };

  const loadAll = async () => {
    await loadMeta();
    await loadConsultants();
    await loadProjects();
    rebuildSelects();
  };

  showProjectFormBtn.addEventListener('click', () => {
    projectFormCard.hidden = false;
    updateTextFields();
  });

  projectCancelEditBtn.addEventListener('click', resetProjectForm);
  consultantCancelEditBtn.addEventListener('click', resetConsultantForm);
  membersSelect.addEventListener('change', updateProjectMembersPanel);

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      projectName: fields.projectName.value.trim(),
      clientName: fields.clientName.value.trim(),
      managerConsultantId: Number(managerSelect.value),
      clientContact: fields.clientContact.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      consultantIds: selectedIds(membersSelect)
    };

    if (payload.startDate > payload.endDate) {
      toast('Start date cannot be after end date', 'red darken-1');
      return;
    }

    const editing = Boolean(fields.projectId.value);
    try {
      await request(editing ? `/api/projects/${fields.projectId.value}` : '/api/projects', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadProjects();
      resetProjectForm();
      toast(editing ? 'Project updated' : 'Project added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to save project'), 'red darken-1');
    }
  });

  consultantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      name: fields.consultantName.value.trim(),
      areaId: Number(consultantAreaSelect.value),
      roleIds: selectedIds(consultantRolesSelect),
      salary: fields.consultantSalary.value
    };

    const editing = Boolean(fields.consultantId.value);
    try {
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

  roleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.roleName.value.trim() })
      });
      roleForm.reset();
      await loadAll();
      toast('Role added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to add role'), 'red darken-1');
    }
  });

  areaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.areaName.value.trim() })
      });
      areaForm.reset();
      await loadAll();
      toast('Area added', 'teal darken-1');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to add area'), 'red darken-1');
    }
  });

  projectsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const project = projects.find((item) => Number(item.id) === id);
    if (!project) return;

    if (button.dataset.action === 'delete-project') {
      try {
        await request(`/api/projects/${id}`, { method: 'DELETE' });
        await loadProjects();
        toast('Project removed', 'orange darken-2');
      } catch (error) {
        toast(toFriendlyError(error, 'Failed to delete project'), 'red darken-1');
      }
      return;
    }

    fields.projectId.value = project.id;
    fields.projectName.value = project.projectName;
    fields.clientName.value = project.clientName;
    fields.clientContact.value = project.clientContact;
    fields.startDate.value = project.startDate;
    fields.endDate.value = project.endDate;
    rebuildSelects({ managerId: project.managerConsultantId, memberIds: project.consultantIds || [] });
    projectFormCard.hidden = false;
    updateTextFields();
  });

  consultantsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const consultant = consultants.find((item) => Number(item.id) === id);
    if (!consultant) return;

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
    rebuildSelects({ areaId: consultant.areaId, roleIds: consultant.roleIds || [] });
    consultantCancelEditBtn.hidden = false;
    updateTextFields();
  });

  rolesList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-role"]');
    if (!button) return;
    try {
      await request(`/api/roles/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Role removed', 'orange darken-2');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to delete role'), 'red darken-1');
    }
  });

  areasList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-area"]');
    if (!button) return;
    try {
      await request(`/api/areas/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Area removed', 'orange darken-2');
    } catch (error) {
      toast(toFriendlyError(error, 'Failed to delete area'), 'red darken-1');
    }
  });

  navMenu.addEventListener('click', (event) => {
    const menuItem = event.target.closest('li[data-section]');
    if (!menuItem) return;
    setSection(menuItem.dataset.section);
  });

  setSection('projects');
  resetProjectForm();
  loadAll().catch((error) => toast(toFriendlyError(error, 'Unable to load data'), 'red darken-1'));
}
