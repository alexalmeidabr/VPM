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
    M.updateTextFields();
  };

  const validateDates = (startDate, endDate) => {
    if (new Date(startDate) > new Date(endDate)) {
      M.toast({ html: 'Start date cannot be after end date', classes: 'red darken-1' });
      return false;
    }

    return true;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      id: fields.id.value || crypto.randomUUID(),
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

    const editIndex = projects.findIndex((item) => item.id === payload.id);

    if (editIndex >= 0) {
      projects[editIndex] = payload;
      M.toast({ html: 'Project updated', classes: 'teal darken-1' });
    } else {
      projects.push(payload);
      M.toast({ html: 'Project added', classes: 'teal darken-1' });
    }

    refreshView();
    resetForm();
  });

  cancelEditBtn.addEventListener('click', resetForm);

  projectBody.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');

    if (!actionButton) {
      return;
    }

    const { action, id } = actionButton.dataset;
    const selected = projects.find((project) => project.id === id);

    if (!selected) {
      return;
    }

    if (action === 'delete') {
      projects = projects.filter((project) => project.id !== id);
      refreshView();
      resetForm();
      M.toast({ html: 'Project removed', classes: 'orange darken-2' });
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
    M.updateTextFields();
  });

  refreshView();
}
