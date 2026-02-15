const isBrowserRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';

if (!isBrowserRuntime) {
  console.warn('This script is intended for browser usage. Open index.html in a browser to run the app.');
} else {
  const apiBase = (window.localStorage.getItem('vpmApiOrigin') || window.location.origin || 'http://localhost:8000').replace(/\/$/, '');

  const sections = {
    projects: document.getElementById('projects-section'),
    consultants: document.getElementById('consultants-section')
  };

  const navMenu = document.getElementById('nav-menu');

  const projectFormCard = document.getElementById('project-form-card');
  const projectFormTitle = document.getElementById('project-form-title');
  const showProjectFormBtn = document.getElementById('show-project-form-btn');
  const projectForm = document.getElementById('project-form');
  const projectCancelEditBtn = document.getElementById('project-cancel-edit-btn');
  const projectCount = document.getElementById('project-count');
  const projectsBody = document.getElementById('projects-body');
  const projectsEmptyState = document.getElementById('projects-empty-state');
  const consultantMultiSelect = document.getElementById('consultant-ids');
  const managerSelect = document.getElementById('manager-consultant-id');
  const projectMembersList = document.getElementById('project-members-list');

  const consultantForm = document.getElementById('consultant-form');
  const consultantFormTitle = document.getElementById('consultant-form-title');
  const consultantCancelEditBtn = document.getElementById('consultant-cancel-edit-btn');
  const consultantCount = document.getElementById('consultant-count');
  const consultantsBody = document.getElementById('consultants-body');
  const consultantsEmptyState = document.getElementById('consultants-empty-state');

  const projectFields = {
    id: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
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
  let managerSelectInstance = null;
  let membersSelectInstance = null;

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

  const toFriendlyError = (error, fallback) => {
    if (error instanceof TypeError) {
      return 'Unable to reach API. Start server.py and refresh the page.';
    }

    return error?.message || fallback;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, options);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Unexpected error' }));
      throw new Error(payload.error || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const findConsultantName = (id) => consultants.find((item) => Number(item.id) === Number(id))?.name || '—';

  const selectedMemberIds = () => Array.from(consultantMultiSelect.selectedOptions).map((option) => Number(option.value));

  const updateProjectMembersPanel = () => {
    const ids = selectedMemberIds();
    projectMembersList.innerHTML = '';

    if (!ids.length) {
      const li = document.createElement('li');
      li.textContent = 'No consultants assigned yet.';
      projectMembersList.appendChild(li);
      return;
    }

    ids.forEach((id) => {
      const li = document.createElement('li');
      li.textContent = findConsultantName(id);
      projectMembersList.appendChild(li);
    });
  };

  const rebuildConsultantSelectors = (selectedManagerId = '', selectedMemberIdList = []) => {
    managerSelect.innerHTML = '<option value="" disabled selected>Select a manager</option>';
    consultantMultiSelect.innerHTML = '';

    consultants.forEach((consultant) => {
      const managerOption = document.createElement('option');
      managerOption.value = consultant.id;
      managerOption.textContent = consultant.name;
      if (Number(selectedManagerId) === Number(consultant.id)) {
        managerOption.selected = true;
      }
      managerSelect.appendChild(managerOption);

      const memberOption = document.createElement('option');
      memberOption.value = consultant.id;
      memberOption.textContent = `${consultant.name} • ${consultant.area}`;
      memberOption.selected = selectedMemberIdList.map(Number).includes(Number(consultant.id));
      consultantMultiSelect.appendChild(memberOption);
    });

    if (managerSelectInstance) {
      managerSelectInstance.destroy();
    }

    if (membersSelectInstance) {
      membersSelectInstance.destroy();
    }

    if (window.M && M.FormSelect) {
      managerSelectInstance = M.FormSelect.init(managerSelect);
      membersSelectInstance = M.FormSelect.init(consultantMultiSelect);
    }

    updateProjectMembersPanel();
  };

  const showProjectForm = () => {
    projectFormCard.hidden = false;
  };

  const hideProjectForm = () => {
    projectFormCard.hidden = true;
  };

  const resetProjectForm = () => {
    projectForm.reset();
    projectFields.id.value = '';
    projectFormTitle.textContent = 'Manage Project';
    rebuildConsultantSelectors();
    hideProjectForm();
    refreshTextFields();
  };

  const resetConsultantForm = () => {
    consultantForm.reset();
    consultantFields.id.value = '';
    consultantFormTitle.textContent = 'Manage Consultants';
    consultantCancelEditBtn.hidden = true;
    refreshTextFields();
  };

  const refreshProjectsView = () => {
    projectsBody.innerHTML = '';

    projects.forEach((project) => {
      const row = document.createElement('tr');
      const memberNames = (project.consultantIds || []).map(findConsultantName).filter((name) => name !== '—');
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${project.clientName}</td>
        <td>${findConsultantName(project.managerConsultantId)}</td>
        <td>${project.clientContact}</td>
        <td><span class="chip">${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span></td>
        <td>${memberNames.length ? memberNames.join(', ') : '—'}</td>
        <td>
          <button class="btn-flat blue-text text-darken-2" data-action="edit-project" data-id="${project.id}">
            <i class="material-icons tiny">edit</i>
          </button>
          <button class="btn-flat red-text text-darken-2" data-action="delete-project" data-id="${project.id}">
            <i class="material-icons tiny">delete</i>
          </button>
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
      consultantsBody.appendChild(row);
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

    if (section === 'projects') {
      hideProjectForm();
    }
  };

  const loadConsultants = async () => {
    const data = await request('/api/consultants');
    consultants = data.consultants || [];
    refreshConsultantsView();
    rebuildConsultantSelectors();
  };

  const loadProjects = async () => {
    const data = await request('/api/projects');
    projects = data.projects || [];
    refreshProjectsView();
  };

  const loadAll = async () => {
    await loadConsultants();
    await loadProjects();
  };

  showProjectFormBtn.addEventListener('click', () => {
    resetProjectForm();
    showProjectForm();
  });

  consultantMultiSelect.addEventListener('change', updateProjectMembersPanel);

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      projectName: projectFields.projectName.value.trim(),
      clientName: projectFields.clientName.value.trim(),
      managerConsultantId: Number(managerSelect.value),
      clientContact: projectFields.clientContact.value.trim(),
      startDate: projectFields.startDate.value,
      endDate: projectFields.endDate.value,
      consultantIds: selectedMemberIds()
    };

    if (payload.startDate > payload.endDate) {
      showToast('Start date cannot be after end date', 'red darken-1');
      return;
    }

    if (!payload.managerConsultantId) {
      showToast('Manager is required', 'red darken-1');
      return;
    }

    const isEdit = Boolean(projectFields.id.value);
    const endpoint = isEdit ? `/api/projects/${projectFields.id.value}` : '/api/projects';

    try {
      await request(endpoint, {
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

    const isEdit = Boolean(consultantFields.id.value);
    const endpoint = isEdit ? `/api/consultants/${consultantFields.id.value}` : '/api/consultants';

    try {
      await request(endpoint, {
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

  projectsBody.addEventListener('click', async (event) => {
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
        showToast('Project removed', 'orange darken-2');
      } catch (error) {
        showToast(toFriendlyError(error, 'Failed to delete project'), 'red darken-1');
      }
      return;
    }

    projectFields.id.value = project.id;
    projectFields.projectName.value = project.projectName;
    projectFields.clientName.value = project.clientName;
    projectFields.clientContact.value = project.clientContact;
    projectFields.startDate.value = project.startDate;
    projectFields.endDate.value = project.endDate;
    projectFormTitle.textContent = 'Manage Project';
    rebuildConsultantSelectors(project.managerConsultantId, project.consultantIds || []);
    refreshTextFields();
    showProjectForm();
  });

  consultantsBody.addEventListener('click', async (event) => {
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

  navMenu.addEventListener('click', (event) => {
    const item = event.target.closest('li[data-section]');
    if (!item) {
      return;
    }

    setSection(item.dataset.section);
  });

  setSection('projects');
  resetProjectForm();
  loadAll().catch((error) => showToast(toFriendlyError(error, 'Unable to load data'), 'red darken-1'));
}
