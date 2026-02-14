const isBrowserRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';

if (!isBrowserRuntime) {
  console.warn('This script is intended for browser usage. Open index.html in a browser to run the app.');
} else {
  const form = document.getElementById('project-form');
  const formTitle = document.getElementById('form-title');
  const projectCount = document.getElementById('project-count');
  const projectBody = document.getElementById('projects-body');
  const emptyState = document.getElementById('empty-state');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  const defaultApiOrigin = window.location.origin?.startsWith('http')
    ? window.location.origin
    : 'http://localhost:8000';
  const apiOrigin = window.localStorage.getItem('vpmApiOrigin') || defaultApiOrigin;
  const apiBase = `${apiOrigin.replace(/\/$/, '')}/api/projects`;

  const fields = {
    id: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
    projectLead: document.getElementById('project-lead'),
    clientContact: document.getElementById('client-contact'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date')
  };

  let projects = [];

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const showToast = (message, classes = 'blue-grey darken-2') => {
    if (window.M && typeof M.toast === 'function') {
      M.toast({ html: message, classes });
    }
  };

  const toFriendlyError = (error, fallback) => {
    if (error instanceof TypeError) {
      return 'Unable to reach project API. Start server.py and check API origin.';
    }

    return error?.message || fallback;
  };

  const refreshView = () => {
    projectBody.innerHTML = '';

    projects.forEach((project) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${project.clientName}</td>
        <td>${project.projectLead}</td>
        <td>${project.clientContact}</td>
        <td>
          <span class="chip">${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span>
        </td>
        <td>
          <button class="btn-flat blue-text text-darken-2" data-action="edit" data-id="${project.id}">
            <i class="material-icons tiny">edit</i>
          </button>
          <button class="btn-flat red-text text-darken-2" data-action="delete" data-id="${project.id}">
            <i class="material-icons tiny">delete</i>
          </button>
        </td>
      `;

      projectBody.appendChild(row);
    });

    projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'} tracked`;
    emptyState.hidden = projects.length > 0;
  };

  const resetForm = () => {
    form.reset();
    fields.id.value = '';
    formTitle.textContent = 'Add Project';
    cancelEditBtn.hidden = true;
    if (window.M && typeof M.updateTextFields === 'function') {
      M.updateTextFields();
    }
  };

  const validateDates = (startDate, endDate) => {
    if (startDate > endDate) {
      showToast('Start date cannot be after end date', 'red darken-1');
      return false;
    }

    return true;
  };

  const loadProjects = async () => {
    const response = await fetch(apiBase);
    if (!response.ok) {
      throw new Error('Failed to load projects');
    }

    const data = await response.json();
    projects = data.projects || [];
    refreshView();
  };

  const upsertProject = async (payload) => {
    const isEdit = Boolean(payload.id);
    const endpoint = isEdit ? `${apiBase}/${payload.id}` : apiBase;
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Unexpected error' }));
      throw new Error(errorBody.error || 'Failed to save project');
    }

    await loadProjects();
    showToast(isEdit ? 'Project updated' : 'Project added', 'teal darken-1');
  };

  const deleteProject = async (id) => {
    const response = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    await loadProjects();
    showToast('Project removed', 'orange darken-2');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      id: fields.id.value ? Number(fields.id.value) : null,
      projectName: fields.projectName.value.trim(),
      clientName: fields.clientName.value.trim(),
      projectLead: fields.projectLead.value.trim(),
      clientContact: fields.clientContact.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value
    };

    if (!validateDates(payload.startDate, payload.endDate)) {
      return;
    }

    try {
      await upsertProject(payload);
      resetForm();
    } catch (error) {
      showToast(toFriendlyError(error, 'Failed to save project'), 'red darken-1');
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  projectBody.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) {
      return;
    }

    const { action } = actionButton.dataset;
    const id = Number(actionButton.dataset.id);
    const selected = projects.find((project) => Number(project.id) === id);
    if (!selected) {
      return;
    }

    if (action === 'delete') {
      try {
        await deleteProject(id);
        resetForm();
      } catch (error) {
        showToast(toFriendlyError(error, 'Failed to delete project'), 'red darken-1');
      }
      return;
    }

    fields.id.value = selected.id;
    fields.projectName.value = selected.projectName;
    fields.clientName.value = selected.clientName;
    fields.projectLead.value = selected.projectLead;
    fields.clientContact.value = selected.clientContact;
    fields.startDate.value = selected.startDate;
    fields.endDate.value = selected.endDate;
    formTitle.textContent = 'Edit Project';
    cancelEditBtn.hidden = false;
    if (window.M && typeof M.updateTextFields === 'function') {
      M.updateTextFields();
    }
  });

  loadProjects().catch((error) => showToast(toFriendlyError(error, 'Unable to load projects from server'), 'red darken-1'));
}
