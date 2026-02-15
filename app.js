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
    projectsEmptyState: document.getElementById('projects-empty-state'),
    projectsPanelCard: document.getElementById('projects-panel-card'),
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

    consultantAssignmentModal: document.getElementById('consultant-assignment-modal'),
    consultantAreaFilterModal: document.getElementById('consultant-area-filter-modal'),
    projectRoleModal: document.getElementById('project-role-modal'),
    memberStartDateModal: document.getElementById('member-start-date-modal'),
    memberEndDateModal: document.getElementById('member-end-date-modal'),
    consultantPickerList: document.getElementById('consultant-picker-list'),
    saveConsultantAssignmentsBtn: document.getElementById('save-consultant-assignments-btn'),

    memberDetailsModal: document.getElementById('member-details-modal'),
    memberModalTitle: document.getElementById('member-modal-title'),
    memberEditConsultantId: document.getElementById('member-edit-consultant-id'),
    memberNameModal: document.getElementById('member-name-modal'),
    memberProjectRoleModal: document.getElementById('member-project-role-modal'),
    memberStartDateEdit: document.getElementById('member-start-date-edit'),
    memberEndDateEdit: document.getElementById('member-end-date-edit'),
    saveMemberDetailsBtn: document.getElementById('save-member-details-btn'),

    consultantsPanelCard: document.getElementById('consultants-panel-card'),
    consultantsBody: document.getElementById('consultants-body'),
    consultantCount: document.getElementById('consultant-count'),
    consultantsEmptyState: document.getElementById('consultants-empty-state'),
    availabilityChart: document.getElementById('availability-chart'),
    centerCurrentWeekToggle: document.getElementById('center-current-week-toggle'),

    showConsultantFormBtn: document.getElementById('show-consultant-form-btn'),
    consultantFormCard: document.getElementById('consultant-form-card'),
    consultantForm: document.getElementById('consultant-form'),
    consultantFormTitle: document.getElementById('consultant-form-title'),
    consultantModeLabel: document.getElementById('consultant-mode-label'),
    consultantSaveBtn: document.getElementById('consultant-save-btn'),
    consultantCancelEditBtn: document.getElementById('consultant-cancel-edit-btn'),
    backToConsultantsBtn: document.getElementById('back-to-consultants-btn'),
    openDaysOffModalBtn: document.getElementById('open-days-off-modal-btn'),
    consultantAvailabilityChart: document.getElementById('consultant-availability-chart'),
    consultantDaysOffList: document.getElementById('consultant-days-off-list'),

    daysOffModal: document.getElementById('days-off-modal'),
    availabilityType: document.getElementById('availability-type'),
    availabilityStartDate: document.getElementById('availability-start-date'),
    availabilityEndDate: document.getElementById('availability-end-date'),
    saveAvailabilityBtn: document.getElementById('save-availability-btn'),

    roleForm: document.getElementById('role-form'),
    areaForm: document.getElementById('area-form'),
    dayOffTypeForm: document.getElementById('day-off-type-form'),
    rolesList: document.getElementById('roles-list'),
    areasList: document.getElementById('areas-list'),
    dayOffTypesList: document.getElementById('day-off-types-list'),

    weekTooltip: document.getElementById('week-tooltip')
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
    consultantCompanyRoleId: document.getElementById('consultant-company-role-id'),
    consultantSalary: document.getElementById('consultant-salary'),

    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name'),
    dayOffTypeName: document.getElementById('day-off-type-name')
  };

  const selectInstances = {};
  const modals = {};

  let projects = [];
  let consultants = [];
  let roles = [];
  let areas = [];
  let dayOffTypes = [];
  let projectViewMode = 'edit';
  let consultantViewMode = 'edit';
  let selectedProjectAssignments = [];
  let modalSelectedAreaId = '';
  let modalTempConsultantIds = [];

  const toast = (message, classes = 'blue-grey darken-2') => window.M?.toast && M.toast({ html: message, classes });
  const updateTextFields = () => window.M?.updateTextFields && M.updateTextFields();
  const selectedIds = (selectEl) => Array.from(selectEl.selectedOptions).map((opt) => Number(opt.value));

  const request = async (path, options = {}) => {
    const call = async (baseUrl) => fetch(`${baseUrl}${path}`, options);
    let response;
    try {
      response = await call(primaryApiBase);
    } catch (error) {
      if (!(error instanceof TypeError) || primaryApiBase === fallbackApiBase) throw error;
      response = await call(fallbackApiBase);
      window.localStorage.setItem('vpmApiOrigin', fallbackApiBase);
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(payload.error || 'Request failed');
    }
    return response.status === 204 ? null : response.json();
  };

  const resetSelect = (key, element) => {
    if (selectInstances[key]) selectInstances[key].destroy();
    if (window.M?.FormSelect) selectInstances[key] = M.FormSelect.init(element);
  };

  const managerCandidates = () => consultants.filter((consultant) => consultant.companyRole === 'Project Manager');
  const findConsultantById = (id) => consultants.find((consultant) => Number(consultant.id) === Number(id));
  const consultantNameById = (id) => findConsultantById(id)?.name || '—';
  const areaNameById = (id) => areas.find((area) => Number(area.id) === Number(id))?.name || '—';
  const roleNameById = (id) => roles.find((role) => Number(role.id) === Number(id))?.name || '—';
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const formatSalary = (value) => Number(value).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });

  const mondayForWeek = (year, weekNumber) => {
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - jan4Day + 1);
    const monday = new Date(week1Monday);
    monday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
    return monday;
  };

  const startOfWeekMonday = (date) => {
    const day = date.getDay() || 7;
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(date.getDate() - day + 1);
    return monday;
  };

  const buildTimelineWeeks = (centered) => {
    if (!centered) {
      const year = new Date().getFullYear();
      return Array.from({ length: 52 }, (_, index) => {
        const week = index + 1;
        return { weekNumber: week, monday: mondayForWeek(year, week) };
      });
    }

    const currentMonday = startOfWeekMonday(new Date());
    const weeks = [];
    for (let offset = -26; offset <= 26; offset += 1) {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() + offset * 7);
      const jan4 = new Date(monday.getFullYear(), 0, 4);
      const jan4Day = jan4.getDay() || 7;
      const week1Monday = new Date(jan4);
      week1Monday.setDate(jan4.getDate() - jan4Day + 1);
      const weekNumber = Math.floor((monday - week1Monday) / (7 * 24 * 60 * 60 * 1000)) + 1;
      weeks.push({ weekNumber, monday });
    }
    return weeks;
  };

  const drawTimeline = (container, consultantsToRender, options = {}) => {
    const centered = Boolean(options.centerOnCurrentWeek);
    const weeks = buildTimelineWeeks(centered);
    container.innerHTML = '';

    const yearLabel = document.createElement('div');
    yearLabel.className = 'timeline-year-label';
    if (centered) {
      yearLabel.textContent = `Window: ${weeks[0].monday.getFullYear()}-${String(weeks[0].monday.getMonth() + 1).padStart(2, '0')} to ${weeks[weeks.length - 1].monday.getFullYear()}-${String(weeks[weeks.length - 1].monday.getMonth() + 1).padStart(2, '0')}`;
    } else {
      yearLabel.textContent = `Year: ${weeks[0].monday.getFullYear()}`;
    }
    container.appendChild(yearLabel);

    const legend = document.createElement('div');
    legend.className = 'legend';
    const usedTypes = [...new Set(consultantsToRender.flatMap((consultant) => (consultant.availability || []).map((entry) => entry.type)))];
    usedTypes.forEach((type) => {
      const span = document.createElement('span');
      span.className = 'legend-item';
      span.textContent = type;
      span.style.color = type === 'Vacation' ? '#ef6c00' : type === 'PTO' ? '#00695c' : '#5e35b1';
      legend.appendChild(span);
    });
    if (!usedTypes.length) {
      const span = document.createElement('span');
      span.textContent = 'No days off recorded yet.';
      legend.appendChild(span);
    }
    container.appendChild(legend);

    const columns = `170px repeat(${weeks.length}, 18px)`;

    const monthHeader = document.createElement('div');
    monthHeader.className = 'availability-month-header';
    monthHeader.style.gridTemplateColumns = columns;
    monthHeader.appendChild(document.createElement('div'));
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    weeks.forEach(({ monday }) => {
      const monthCell = document.createElement('div');
      monthCell.textContent = monday.getDate() <= 7 ? `${monthNames[monday.getMonth()]}` : '';
      monthHeader.appendChild(monthCell);
    });
    container.appendChild(monthHeader);

    const weekHeader = document.createElement('div');
    weekHeader.className = 'availability-week-header';
    weekHeader.style.gridTemplateColumns = columns;
    weekHeader.appendChild(document.createElement('div'));
    weeks.forEach(({ weekNumber }) => {
      const cell = document.createElement('div');
      cell.textContent = weekNumber;
      weekHeader.appendChild(cell);
    });
    container.appendChild(weekHeader);

    consultantsToRender.forEach((consultant) => {
      const row = document.createElement('div');
      row.className = 'availability-row';
      row.style.gridTemplateColumns = columns;
      const name = document.createElement('div');
      name.className = 'availability-name';
      name.textContent = consultant.name;
      row.appendChild(name);

      weeks.forEach(({ monday }) => {
        const weekStart = new Date(monday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.dataset.monday = weekStart.toISOString().slice(0, 10);

        (consultant.availability || []).forEach((entry) => {
          const entryStart = new Date(entry.startDate);
          const entryEnd = new Date(entry.endDate);
          if (entryStart <= weekEnd && entryEnd >= weekStart) {
            if (entry.type === 'Vacation') cell.classList.add('vacation');
            else if (entry.type === 'PTO') cell.classList.add('pto');
            else cell.classList.add('other');
          }
        });

        row.appendChild(cell);
      });
      container.appendChild(row);
    });
  };

  const bindWeekTooltip = (container) => {
    container.addEventListener('mousemove', (event) => {
      const weekCell = event.target.closest('.week-cell');
      if (!weekCell) {
        ui.weekTooltip.hidden = true;
        return;
      }
      ui.weekTooltip.hidden = false;
      ui.weekTooltip.textContent = `Week Monday: ${weekCell.dataset.monday}`;
      ui.weekTooltip.style.left = `${event.clientX + 12}px`;
      ui.weekTooltip.style.top = `${event.clientY + 12}px`;
    });
    container.addEventListener('mouseleave', () => {
      ui.weekTooltip.hidden = true;
    });
  };

  bindWeekTooltip(ui.availabilityChart);
  bindWeekTooltip(ui.consultantAvailabilityChart);

  const renderConsultantDaysOffList = (consultant) => {
    ui.consultantDaysOffList.innerHTML = '';
    if (!consultant || !(consultant.availability || []).length) {
      const li = document.createElement('li');
      li.className = 'collection-item grey-text';
      li.textContent = 'No days off recorded.';
      ui.consultantDaysOffList.appendChild(li);
      return;
    }
    consultant.availability.forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.textContent = `${entry.type}: ${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}`;
      ui.consultantDaysOffList.appendChild(li);
    });
  };

  const updateAssignedConsultantsSummary = () => {
    ui.assignedConsultantsSummary.textContent = selectedProjectAssignments.length
      ? `${selectedProjectAssignments.length} consultant${selectedProjectAssignments.length === 1 ? '' : 's'} assigned`
      : 'No consultants assigned yet.';
  };

  const rebuildProjectSelects = ({ managerId = '' } = {}) => {
    fields.managerId.innerHTML = '<option value="" disabled selected>Select a manager</option>';
    managerCandidates().forEach((consultant) => fields.managerId.add(new Option(consultant.name, consultant.id, false, Number(managerId) === Number(consultant.id))));
    resetSelect('manager', fields.managerId);
    resetSelect('projectType', fields.projectType);
  };

  const rebuildConsultantSelects = ({ areaIds = [], companyRoleId = '' } = {}) => {
    fields.consultantAreaIds.innerHTML = '';
    areas.forEach((area) => fields.consultantAreaIds.add(new Option(area.name, area.id, false, areaIds.map(Number).includes(Number(area.id)))));
    fields.consultantCompanyRoleId.innerHTML = '<option value="" disabled selected>Select company role</option>';
    roles.forEach((role) => fields.consultantCompanyRoleId.add(new Option(role.name, role.id, false, Number(companyRoleId) === Number(role.id))));
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
  };

  const rebuildDayOffTypeSelect = () => {
    ui.availabilityType.innerHTML = '<option value="" selected disabled>Select type</option>';
    dayOffTypes.forEach((type) => ui.availabilityType.add(new Option(type.name, type.id)));
    resetSelect('dayOffType', ui.availabilityType);
  };

  const rebuildAssignmentModalSelects = () => {
    ui.consultantAreaFilterModal.innerHTML = '<option value="" selected disabled>Select area</option>';
    areas.forEach((area) => ui.consultantAreaFilterModal.add(new Option(area.name, area.id, false, Number(modalSelectedAreaId) === Number(area.id))));
    ui.projectRoleModal.innerHTML = '<option value="" selected disabled>Select project role</option>';
    roles.forEach((role) => ui.projectRoleModal.add(new Option(role.name, role.name)));
    resetSelect('assignmentArea', ui.consultantAreaFilterModal);
    resetSelect('assignmentRole', ui.projectRoleModal);
  };

  const rebuildMemberRoleSelect = (roleName) => {
    ui.memberProjectRoleModal.innerHTML = '';
    roles.forEach((role) => ui.memberProjectRoleModal.add(new Option(role.name, role.name, false, role.name === roleName)));
    resetSelect('memberRole', ui.memberProjectRoleModal);
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
      const item = document.createElement('p');
      item.className = 'consultant-picker-item';
      item.innerHTML = `<label><input type="checkbox" data-consultant-id="${consultant.id}" ${modalTempConsultantIds.includes(Number(consultant.id)) ? 'checked' : ''} /><span>${consultant.name}</span></label>`;
      ui.consultantPickerList.appendChild(item);
    });
  };

  const updateProjectMembersPanel = () => {
    ui.projectMembersList.innerHTML = '';
    const managerId = Number(fields.managerId.value);
    const allMembers = [...selectedProjectAssignments];
    if (managerId && !allMembers.find((m) => Number(m.consultantId) === managerId)) {
      allMembers.unshift({ consultantId: managerId, projectRole: 'Project Manager', startDate: fields.startDate.value, endDate: fields.endDate.value, fromManager: true });
    }

    if (!allMembers.length) {
      ui.projectMembersList.innerHTML = '<p class="grey-text">No consultants assigned yet.</p>';
      return;
    }

    allMembers.forEach((member) => {
      const consultant = findConsultantById(member.consultantId);
      const readOnlyManager = Boolean(member.fromManager);
      const wrapper = document.createElement('div');
      wrapper.className = 'member-card';
      wrapper.innerHTML = `
        <div class="member-header">
          <div>
            <strong>${consultant?.name || 'Unknown Consultant'}</strong>
            <div class="member-meta">Project Role: ${member.projectRole || '—'}</div>
            <div class="member-meta">Dates: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}</div>
          </div>
          <div>
            <button class="btn-flat teal-text" data-action="view-member" data-id="${member.consultantId}"><i class="material-icons tiny">visibility</i></button>
            ${readOnlyManager ? '' : `<button class="btn-flat blue-text" data-action="edit-member" data-id="${member.consultantId}"><i class="material-icons tiny">edit</i></button><button class="btn-flat red-text" data-action="remove-member" data-id="${member.consultantId}"><i class="material-icons tiny">delete</i></button>`}
          </div>
        </div>
      `;
      ui.projectMembersList.appendChild(wrapper);
    });
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
          <button class="btn-flat teal-text" data-action="view-project" data-id="${project.id}"><i class="material-icons tiny">visibility</i></button>
          <button class="btn-flat blue-text" data-action="edit-project" data-id="${project.id}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-project" data-id="${project.id}"><i class="material-icons tiny">delete</i></button>
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
        <td>${consultant.companyRole || roleNameById(consultant.companyRoleId) || '—'}</td>
        <td>${formatSalary(consultant.salary)}</td>
        <td>
          <button class="btn-flat teal-text" data-action="view-consultant" data-id="${consultant.id}"><i class="material-icons tiny">visibility</i></button>
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

    ui.dayOffTypesList.innerHTML = '';
    dayOffTypes.forEach((type) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${type.name}<button class="btn-flat secondary-content red-text" data-action="delete-day-off-type" data-id="${type.id}"><i class="material-icons tiny">delete</i></button>`;
      ui.dayOffTypesList.appendChild(li);
    });
  };

  const showProjectsPanel = () => { ui.projectsPanelCard.hidden = false; ui.projectFormCard.hidden = true; ui.projectMembersCard.hidden = true; };
  const showManageProjectPanel = () => { ui.projectsPanelCard.hidden = true; ui.projectFormCard.hidden = false; ui.projectMembersCard.hidden = false; };
  const showConsultantsPanel = () => { ui.consultantsPanelCard.hidden = false; ui.consultantFormCard.hidden = true; };
  const showManageConsultantsPanel = () => { ui.consultantsPanelCard.hidden = true; ui.consultantFormCard.hidden = false; };

  const setProjectFormMode = (mode) => {
    projectViewMode = mode;
    const readOnly = mode === 'view';
    ui.projectFormTitle.textContent = readOnly ? 'Manage Project (View)' : 'Manage Project';
    ui.projectSaveBtn.hidden = readOnly;
    ui.openConsultantModalBtn.disabled = readOnly;
    [fields.projectName, fields.clientName, fields.projectType, fields.managerId, fields.clientContact, fields.startDate, fields.endDate].forEach((el) => { el.disabled = readOnly; });
    ui.projectCancelEditBtn.textContent = readOnly ? 'Close' : 'Cancel';
    updateProjectMembersPanel();
  };

  const setConsultantFormMode = (mode) => {
    consultantViewMode = mode;
    const readOnly = mode === 'view';
    ui.consultantFormTitle.textContent = readOnly ? 'Manage Consultants (View)' : 'Manage Consultants';
    ui.consultantModeLabel.textContent = readOnly ? 'Read-only mode' : 'Edit mode';
    ui.consultantSaveBtn.hidden = readOnly;
    ui.openDaysOffModalBtn.disabled = readOnly;
    [fields.consultantName, fields.consultantAreaIds, fields.consultantCompanyRoleId, fields.consultantSalary].forEach((el) => {
      el.disabled = readOnly;
    });
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
  };

  const setSection = (section) => {
    Object.entries(sections).forEach(([key, element]) => { element.hidden = key !== section; });
    document.querySelectorAll('#nav-menu .collection-item').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
    if (section === 'projects') showProjectsPanel();
    if (section === 'consultants') showConsultantsPanel();
  };

  const resetProjectForm = () => {
    ui.projectForm.reset();
    fields.projectId.value = '';
    selectedProjectAssignments = [];
    modalSelectedAreaId = '';
    modalTempConsultantIds = [];
    updateAssignedConsultantsSummary();
    rebuildProjectSelects();
    setProjectFormMode('edit');
    updateProjectMembersPanel();
    showProjectsPanel();
    updateTextFields();
  };

  const resetConsultantForm = () => {
    ui.consultantForm.reset();
    fields.consultantId.value = '';
    rebuildConsultantSelects();
    setConsultantFormMode('edit');
    drawTimeline(ui.consultantAvailabilityChart, [], { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
    renderConsultantDaysOffList(null);
    showConsultantsPanel();
    updateTextFields();
  };

  const loadAll = async () => {
    const [projectsRes, consultantsRes, rolesRes, areasRes, dayOffTypesRes] = await Promise.all([
      request('/api/projects'),
      request('/api/consultants'),
      request('/api/roles'),
      request('/api/areas'),
      request('/api/day-off-types')
    ]);

    projects = projectsRes.projects || [];
    consultants = consultantsRes.consultants || [];
    roles = rolesRes.roles || [];
    areas = areasRes.areas || [];
    dayOffTypes = dayOffTypesRes.dayOffTypes || [];

    renderProjects();
    renderConsultants();
    renderAdminLists();
    drawTimeline(ui.availabilityChart, consultants, { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
    rebuildProjectSelects({ managerId: fields.managerId.value });
    rebuildConsultantSelects({ areaIds: selectedIds(fields.consultantAreaIds), companyRoleId: fields.consultantCompanyRoleId.value });
    rebuildAssignmentModalSelects();
    rebuildDayOffTypeSelect();
  };

  ui.showProjectFormBtn.addEventListener('click', () => { resetProjectForm(); showManageProjectPanel(); });
  ui.backToProjectsBtn.addEventListener('click', showProjectsPanel);
  ui.projectCancelEditBtn.addEventListener('click', resetProjectForm);
  fields.managerId.addEventListener('change', updateProjectMembersPanel);

  ui.showConsultantFormBtn.addEventListener('click', () => { resetConsultantForm(); showManageConsultantsPanel(); });
  ui.backToConsultantsBtn.addEventListener('click', showConsultantsPanel);
  ui.consultantCancelEditBtn.addEventListener('click', resetConsultantForm);

  ui.openConsultantModalBtn.addEventListener('click', () => {
    modalTempConsultantIds = selectedProjectAssignments.map((item) => Number(item.consultantId));
    modalSelectedAreaId = '';
    ui.projectRoleModal.value = '';
    ui.memberStartDateModal.value = fields.startDate.value;
    ui.memberEndDateModal.value = fields.endDate.value;
    rebuildAssignmentModalSelects();
    renderConsultantPickerList();
    modals.consultantAssignment?.open();
  });

  ui.consultantAreaFilterModal.addEventListener('change', () => {
    modalSelectedAreaId = ui.consultantAreaFilterModal.value;
    renderConsultantPickerList();
  });

  ui.consultantPickerList.addEventListener('change', (event) => {
    const box = event.target.closest('input[type="checkbox"][data-consultant-id]');
    if (!box) return;
    const id = Number(box.dataset.consultantId);
    modalTempConsultantIds = box.checked ? [...new Set([...modalTempConsultantIds, id])] : modalTempConsultantIds.filter((value) => Number(value) !== id);
  });

  ui.saveConsultantAssignmentsBtn.addEventListener('click', () => {
    const role = ui.projectRoleModal.value;
    if (!role) { toast('Project Role is required', 'red darken-1'); return; }
    if (!modalTempConsultantIds.length) { toast('Select at least one consultant', 'red darken-1'); return; }
    const start = ui.memberStartDateModal.value;
    const end = ui.memberEndDateModal.value;
    if (start && end && start > end) { toast('Start date cannot be after end date', 'red darken-1'); return; }

    selectedProjectAssignments = selectedProjectAssignments.filter((item) => !modalTempConsultantIds.includes(Number(item.consultantId)));
    modalTempConsultantIds.forEach((consultantId) => selectedProjectAssignments.push({ consultantId, projectRole: role, startDate: start, endDate: end }));
    updateAssignedConsultantsSummary();
    updateProjectMembersPanel();
    modals.consultantAssignment?.close();
  });

  ui.projectMembersList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const consultantId = Number(button.dataset.id);
    const member = selectedProjectAssignments.find((item) => Number(item.consultantId) === consultantId) || {
      consultantId,
      projectRole: 'Project Manager',
      startDate: fields.startDate.value,
      endDate: fields.endDate.value
    };

    if (button.dataset.action === 'remove-member') {
      selectedProjectAssignments = selectedProjectAssignments.filter((item) => Number(item.consultantId) !== consultantId);
      updateAssignedConsultantsSummary();
      updateProjectMembersPanel();
      return;
    }

    const readOnly = button.dataset.action === 'view-member';
    ui.memberModalTitle.textContent = readOnly ? 'View Project Member' : 'Edit Project Member';
    ui.memberEditConsultantId.value = consultantId;
    ui.memberNameModal.value = consultantNameById(consultantId);
    ui.memberStartDateEdit.value = member.startDate || '';
    ui.memberEndDateEdit.value = member.endDate || '';
    rebuildMemberRoleSelect(member.projectRole || 'Project Member');

    ui.memberProjectRoleModal.disabled = readOnly;
    ui.memberStartDateEdit.disabled = readOnly;
    ui.memberEndDateEdit.disabled = readOnly;
    ui.saveMemberDetailsBtn.hidden = readOnly;
    resetSelect('memberRole', ui.memberProjectRoleModal);
    updateTextFields();
    modals.memberDetails?.open();
  });

  ui.saveMemberDetailsBtn.addEventListener('click', () => {
    const consultantId = Number(ui.memberEditConsultantId.value);
    const item = selectedProjectAssignments.find((member) => Number(member.consultantId) === consultantId);
    if (!item) { modals.memberDetails?.close(); return; }
    if (ui.memberStartDateEdit.value && ui.memberEndDateEdit.value && ui.memberStartDateEdit.value > ui.memberEndDateEdit.value) {
      toast('Start date cannot be after end date', 'red darken-1');
      return;
    }
    item.projectRole = ui.memberProjectRoleModal.value;
    item.startDate = ui.memberStartDateEdit.value;
    item.endDate = ui.memberEndDateEdit.value;
    updateProjectMembersPanel();
    modals.memberDetails?.close();
  });

  ui.projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (projectViewMode === 'view') return;

    const payload = {
      projectName: fields.projectName.value.trim(),
      clientName: fields.clientName.value.trim(),
      projectType: fields.projectType.value,
      managerConsultantId: Number(fields.managerId.value),
      clientContact: fields.clientContact.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      consultantAssignments: selectedProjectAssignments
    };

    if (payload.startDate > payload.endDate) { toast('Start date cannot be after end date', 'red darken-1'); return; }

    try {
      const editing = Boolean(fields.projectId.value);
      await request(editing ? `/api/projects/${fields.projectId.value}` : '/api/projects', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      await loadAll();
      resetProjectForm();
      toast(editing ? 'Project updated' : 'Project added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save project', 'red darken-1');
    }
  });

  ui.consultantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (consultantViewMode === 'view') return;

    const payload = {
      name: fields.consultantName.value.trim(),
      areaIds: selectedIds(fields.consultantAreaIds),
      companyRoleId: Number(fields.consultantCompanyRoleId.value),
      salary: fields.consultantSalary.value
    };

    try {
      const editing = Boolean(fields.consultantId.value);
      await request(editing ? `/api/consultants/${fields.consultantId.value}` : '/api/consultants', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      await loadAll();
      resetConsultantForm();
      toast(editing ? 'Consultant updated' : 'Consultant added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save consultant', 'red darken-1');
    }
  });

  ui.openDaysOffModalBtn.addEventListener('click', () => {
    if (!fields.consultantId.value) {
      toast('Save consultant first before adding days off', 'orange darken-2');
      return;
    }
    ui.availabilityType.value = '';
    ui.availabilityStartDate.value = '';
    ui.availabilityEndDate.value = '';
    rebuildDayOffTypeSelect();
    modals.daysOff?.open();
  });

  ui.saveAvailabilityBtn.addEventListener('click', async () => {
    const consultantId = Number(fields.consultantId.value);
    if (!consultantId) { toast('No consultant selected', 'red darken-1'); return; }
    const payload = {
      dayOffTypeId: Number(ui.availabilityType.value),
      startDate: ui.availabilityStartDate.value,
      endDate: ui.availabilityEndDate.value
    };
    if (!payload.dayOffTypeId || !payload.startDate || !payload.endDate) {
      toast('All Days Off fields are required', 'red darken-1');
      return;
    }
    try {
      await request(`/api/consultants/${consultantId}/availability`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      await loadAll();
      const consultant = findConsultantById(consultantId);
      drawTimeline(ui.consultantAvailabilityChart, consultant ? [consultant] : [], { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
      renderConsultantDaysOffList(consultant);
      modals.daysOff?.close();
      toast('Days off added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add days off', 'red darken-1');
    }
  });

  ui.projectsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const project = projects.find((item) => Number(item.id) === id);
    if (!project) return;

    if (button.dataset.action === 'delete-project') {
      try {
        await request(`/api/projects/${id}`, { method: 'DELETE' });
        await loadAll();
        toast('Project removed', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to delete project', 'red darken-1');
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
    selectedProjectAssignments = (project.consultantAssignments || []).map((item) => ({
      consultantId: Number(item.consultantId),
      projectRole: item.projectRole || 'Project Member',
      startDate: item.startDate || '',
      endDate: item.endDate || ''
    }));

    updateAssignedConsultantsSummary();
    rebuildProjectSelects({ managerId: project.managerConsultantId });
    setProjectFormMode(button.dataset.action === 'view-project' ? 'view' : 'edit');
    showManageProjectPanel();
    updateProjectMembersPanel();
    updateTextFields();
  });

  ui.consultantsBody.addEventListener('click', async (event) => {
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
        toast(error.message || 'Failed to delete consultant', 'red darken-1');
      }
      return;
    }

    fields.consultantId.value = consultant.id;
    fields.consultantName.value = consultant.name;
    fields.consultantSalary.value = consultant.salary;
    rebuildConsultantSelects({ areaIds: consultant.areaIds || [], companyRoleId: consultant.companyRoleId || '' });
    setConsultantFormMode(button.dataset.action === 'view-consultant' ? 'view' : 'edit');
    drawTimeline(ui.consultantAvailabilityChart, [consultant], { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
    renderConsultantDaysOffList(consultant);
    showManageConsultantsPanel();
    updateTextFields();
  });

  ui.roleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.roleName.value.trim() }) });
      ui.roleForm.reset();
      await loadAll();
      toast('Role added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add role', 'red darken-1');
    }
  });

  ui.areaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/areas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.areaName.value.trim() }) });
      ui.areaForm.reset();
      await loadAll();
      toast('Area added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add area', 'red darken-1');
    }
  });

  ui.dayOffTypeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/day-off-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.dayOffTypeName.value.trim() }) });
      ui.dayOffTypeForm.reset();
      await loadAll();
      toast('Day off type added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add day off type', 'red darken-1');
    }
  });

  ui.rolesList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-role"]');
    if (!button) return;
    try {
      await request(`/api/roles/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Role removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to delete role', 'red darken-1');
    }
  });

  ui.areasList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-area"]');
    if (!button) return;
    try {
      await request(`/api/areas/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Area removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to delete area', 'red darken-1');
    }
  });

  ui.dayOffTypesList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-day-off-type"]');
    if (!button) return;
    try {
      await request(`/api/day-off-types/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Day off type removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to delete day off type', 'red darken-1');
    }
  });


  ui.centerCurrentWeekToggle.addEventListener('change', () => {
    drawTimeline(ui.availabilityChart, consultants, { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
    const consultantId = Number(fields.consultantId.value);
    const consultant = consultantId ? findConsultantById(consultantId) : null;
    drawTimeline(ui.consultantAvailabilityChart, consultant ? [consultant] : [], { centerOnCurrentWeek: ui.centerCurrentWeekToggle.checked });
  });

  ui.navMenu.addEventListener('click', (event) => {
    const item = event.target.closest('li[data-section]');
    if (!item) return;
    setSection(item.dataset.section);
  });

  if (window.M?.Modal) {
    modals.consultantAssignment = M.Modal.init(ui.consultantAssignmentModal);
    modals.memberDetails = M.Modal.init(ui.memberDetailsModal);
    modals.daysOff = M.Modal.init(ui.daysOffModal);
  }

  setSection('projects');
  resetProjectForm();
  resetConsultantForm();
  loadAll().catch((error) => toast(error.message || 'Unable to load data', 'red darken-1'));
}
