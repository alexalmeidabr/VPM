const isBrowserRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';

if (!isBrowserRuntime) {
  console.warn('This script is intended for browser usage. Open index.html in a browser to run the app.');
} else {
  const defaultApiOrigin = window.location.origin?.startsWith('http')
    ? window.location.origin
    : 'http://localhost:8000';
  const apiOrigin = window.localStorage.getItem('vpmApiOrigin') || defaultApiOrigin;
  const apiBase = apiOrigin.replace(/\/$/, '');

  const sections = {
    projects: document.getElementById('projects-section'),
    consultants: document.getElementById('consultants-section')
  };

  const projectFormTitle = document.getElementById('project-form-title');
  const projectForm = document.getElementById('project-form');
  const projectCancelEditBtn = document.getElementById('project-cancel-edit-btn');
  const projectCount = document.getElementById('project-count');
  const projectBody = document.getElementById('projects-body');
  const projectsEmptyState = document.getElementById('projects-empty-state');
  const consultantMultiSelect = document.getElementById('consultant-ids');

  const consultantFormTitle = document.getElementById('consultant-form-title');
  const consultantForm = document.getElementById('consultant-form');
  const consultantCancelEditBtn = document.getElementById('consultant-cancel-edit-btn');
  const consultantCount = document.getElementById('consultant-count');
  const consultantBody = document.getElementById('consultants-body');
  const consultantsEmptyState = document.getElementById('consultants-empty-state');

  const projectFields = {
    id: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
    projectLead: document.getElementById('project-lead'),
    clientContact: document.getElementById('client-contact'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date')
  };

  const consultantFields = {
    id: document.getElementById('consultant-id'),
    name: document.getElementById('consultant-name'),
    area: document.getElementById('consultant-area'),
    position: document.getElementById('consultant-position'),
    salary: document.getElementById('consultant-salary')
  };

  let projects = [];
  let consultants = [];
  let consultantSelectInstance = null;

  const showToast = (message, classes = 'blue-grey darken-2') => {
    if (window.M && typeof M.toast === 'function') {
      M.toast({ html: message, classes });
    }
  };

  const refreshTextFields = () => {
    if (window.M && typeof M.updateTextFields === 'function') {
      M.updateTextFields();
    }
  };

  const toFriendlyError = (error, fallback) => {
    if (error instanceof TypeError) {
      return 'Unable to reach project API. Start server.py and check API origin.';
    }

    return error?.message || fallback;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatSalary = (value) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) {
      return value;
    }

    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const getConsultantNames = (consultantIds = []) => {
    if (!consultantIds.length) {
      return '—';
    }

    const names = consultantIds
      .map((id) => consultants.find((item) => Number(item.id) === Number(id))?.name)
      .filter(Boolean);

    return names.length ? names.join(', ') : '—';
  };

  const rebuildConsultantSelect = (selectedIds = []) => {
    consultantMultiSelect.innerHTML = '';

    consultants.forEach((consultant) => {
      const option = document.createElement('option');
      option.value = consultant.id;
      option.textContent = `${consultant.name} • ${consultant.area}`;
      option.selected = selectedIds.includes(Number(consultant.id));
      consultantMultiSelect.appendChild(option);
    });

    if (consultantSelectInstance) {
      consultantSelectInstance.destroy();
    }

    if (window.M && M.FormSelect) {
      consultantSelectInstance = M.FormSelect.init(consultantMultiSelect);
    }
  };

  const refreshProjectView = () => {
    projectBody.innerHTML = '';

    projects.forEach((project) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${project.clientName}</td>
        <td>${project.projectLead}</td>
        <td>${project.clientContact}</td>
        <td><span class="chip">${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span></td>
        <td>${getConsultantNames(project.consultantIds)}</td>
        <td>
          <button class="btn-flat blue-text text-darken-2" data-action="edit-project" data-id="${project.id}">
            <i class="material-icons tiny">edit</i>
          </button>
          <button class="btn-flat red-text text-darken-2" data-action="delete-project" data-id="${project.id}">
            <i class="material-icons tiny">delete</i>
          </button>
        </td>
      `;
      projectBody.appendChild(row);
    });

    projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'} tracked`;
    projectsEmptyState.hidden = projects.length > 0;
  };

  const refreshConsultantView = () => {
    consultantBody.innerHTML = '';

    consultants.forEach((consultant) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consultant.name}</td>
        <td>${consultant.area}</td>
        <td>${consultant.position}</td>
        <td>${formatSalary(consultant.salary)}</td>
        <td>
          <button class="btn-flat blue-text text-darken-2" data-action="edit-consultant" data-id="${consultant.id}">
            <i class="material-icons tiny">edit</i>
          </button>
          <button class="btn-flat red-text text-darken-2" data-action="delete-consultant" data-id="${consultant.id}">
            <i class="material-icons tiny">delete</i>
          </button>
        </td>
      `;
      consultantBody.appendChild(row);
    });

    consultantCount.textContent = `${consultants.length} consultant${consultants.length === 1 ? '' : 's'} tracked`;
    consultantsEmptyState.hidden = consultants.length > 0;
  };

  const setSection = (section) => {
    sections.projects.hidden = section !== 'projects';
    sections.consultants.hidden = section !== 'consultants';

    document.querySelectorAll('#nav-menu .collection-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });
  };

  const resetProjectForm = () => {
    projectForm.reset();
    projectFields.id.value = '';
    projectFormTitle.textContent = 'Manage Project';
    projectCancelEditBtn.hidden = true;
    rebuildConsultantSelect();
    refreshTextFields();
  };

  const resetConsultantForm = () => {
    consultantForm.reset();
    consultantFields.id.value = '';
    consultantFormTitle.textContent = 'Manage Consultants';
    consultantCancelEditBtn.hidden = true;
    refreshTextFields();
  };

  const validateDates = (startDate, endDate) => {
    if (startDate > endDate) {
      showToast('Start date cannot be after end date', 'red darken-1');
      return false;
    }
    return true;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: 'Unexpected error' }));
      throw new Error(body.error || 'Request failed');
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const loadConsultants = async () => {
    const data = await request('/api/consultants');
    consultants = data.consultants || [];
    refreshConsultantView();
    rebuildConsultantSelect();
  };

  const loadProjects = async () => {
    const data = await request('/api/projects');
    projects = data.projects || [];
    refreshProjectView();
  };

  const loadAll = async () => {
    await loadConsultants();
    await loadProjects();
  };

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      projectName: projectFields.projectName.value.trim(),
      clientName: projectFields.clientName.value.trim(),
      projectLead: projectFields.projectLead.value.trim(),
      clientContact: projectFields.clientContact.value.trim(),
      startDate: projectFields.startDate.value,
      endDate: projectFields.endDate.value,
      consultantIds: Array.from(consultantMultiSelect.selectedOptions).map((option) => Number(option.value))
    };

    if (!validateDates(payload.startDate, payload.endDate)) {
      return;
    }

    const projectId = projectFields.id.value;
    const isEdit = Boolean(projectId);

    try {
      await request(isEdit ? `/api/projects/${projectId}` : '/api/projects', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadProjects();
      resetProjectForm();
      showToast(isEdit ? 'Project updated' : 'Project added', 'teal darken-1');
    } catch (error) {
      showToast(toFriendlyError(error, 'Failed to save project'), 'red darken-1');
    }
  });

  consultantForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: consultantFields.name.value.trim(),
      area: consultantFields.area.value.trim(),
      position: consultantFields.position.value.trim(),
      salary: consultantFields.salary.value
    };

    const consultantId = consultantFields.id.value;
    const isEdit = Boolean(consultantId);

    try {
      await request(isEdit ? `/api/consultants/${consultantId}` : '/api/consultants', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll();
      resetConsultantForm();
      showToast(isEdit ? 'Consultant updated' : 'Consultant added', 'teal darken-1');
    } catch (error) {
      showToast(toFriendlyError(error, 'Failed to save consultant'), 'red darken-1');
    }
  });

  projectCancelEditBtn.addEventListener('click', resetProjectForm);
  consultantCancelEditBtn.addEventListener('click', resetConsultantForm);

  projectBody.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) {
      return;
    }

    const id = Number(actionButton.dataset.id);
    const project = projects.find((item) => Number(item.id) === id);
    if (!project) {
      return;
    }

    if (actionButton.dataset.action === 'delete-project') {
      try {
        await request(`/api/projects/${id}`, { method: 'DELETE' });
        await loadProjects();
        resetProjectForm();
        showToast('Project removed', 'orange darken-2');
      } catch (error) {
        showToast(toFriendlyError(error, 'Failed to delete project'), 'red darken-1');
      }
      return;
    }

    projectFields.id.value = project.id;
    projectFields.projectName.value = project.projectName;
    projectFields.clientName.value = project.clientName;
    projectFields.projectLead.value = project.projectLead;
    projectFields.clientContact.value = project.clientContact;
    projectFields.startDate.value = project.startDate;
    projectFields.endDate.value = project.endDate;
    projectFormTitle.textContent = 'Manage Project';
    projectCancelEditBtn.hidden = false;
    rebuildConsultantSelect((project.consultantIds || []).map(Number));
    refreshTextFields();
  });

  consultantBody.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) {
      return;
    }

    const id = Number(actionButton.dataset.id);
    const consultant = consultants.find((item) => Number(item.id) === id);
    if (!consultant) {
      return;
    }

    if (actionButton.dataset.action === 'delete-consultant') {
      try {
        await request(`/api/consultants/${id}`, { method: 'DELETE' });
        await loadAll();
        resetConsultantForm();
        showToast('Consultant removed', 'orange darken-2');
      } catch (error) {
        showToast(toFriendlyError(error, 'Failed to delete consultant'), 'red darken-1');
      }
      return;
    }

    consultantFields.id.value = consultant.id;
    consultantFields.name.value = consultant.name;
    consultantFields.area.value = consultant.area;
    consultantFields.position.value = consultant.position;
    consultantFields.salary.value = consultant.salary;
    consultantFormTitle.textContent = 'Manage Consultants';
    consultantCancelEditBtn.hidden = false;
    refreshTextFields();
  });

  document.getElementById('nav-menu').addEventListener('click', (event) => {
    const menuItem = event.target.closest('li[data-section]');
    if (!menuItem) {
      return;
    }
    setSection(menuItem.dataset.section);
  });

  setSection('projects');
  loadAll().catch((error) => {
    showToast(toFriendlyError(error, 'Unable to load data from server'), 'red darken-1');
  });
}
