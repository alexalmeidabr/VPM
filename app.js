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
    'time-tracking': document.getElementById('time-tracking-section'),
    'allocation-forecast': document.getElementById('allocation-forecast-section'),
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
    projectSwitchEditBtn: document.getElementById('project-switch-edit-btn'),
    backToProjectsBtn: document.getElementById('back-to-projects-btn'),
    openConsultantModalBtn: document.getElementById('open-consultant-modal-btn'),
    assignedConsultantsSummary: document.getElementById('assigned-consultants-summary'),
    projectMembersList: document.getElementById('project-members-list'),
    projectMembersCard: document.getElementById('project-members-card'),
    projectTimelinePanel: document.getElementById('project-timeline-panel'),
    projectTimelineChart: document.getElementById('project-timeline-chart'),
    projectTimelineProjectName: document.getElementById('project-timeline-project-name'),
    toggleProjectTimelineExpandBtn: document.getElementById('toggle-project-timeline-expand-btn'),
    projectExpandedPlanning: document.getElementById('project-expanded-planning'),
    showProjectPhaseFormBtn: document.getElementById('show-project-phase-form-btn'),
    showProjectMilestoneFormBtn: document.getElementById('show-project-milestone-form-btn'),
    projectPhaseFormRow: document.getElementById('project-phase-form-row'),
    projectMilestoneFormRow: document.getElementById('project-milestone-form-row'),
    projectPhaseName: document.getElementById('project-phase-name'),
    projectPhaseStartDate: document.getElementById('project-phase-start-date'),
    projectPhaseEndDate: document.getElementById('project-phase-end-date'),
    addProjectPhaseBtn: document.getElementById('add-project-phase-btn'),
    projectMilestonePhaseId: document.getElementById('project-milestone-phase-id'),
    projectMilestoneName: document.getElementById('project-milestone-name'),
    projectMilestoneStartDate: document.getElementById('project-milestone-start-date'),
    projectMilestoneEndDate: document.getElementById('project-milestone-end-date'),
    addProjectMilestoneBtn: document.getElementById('add-project-milestone-btn'),
    projectWeekDetailCard: document.getElementById('project-week-detail-card'),
    projectWeekDetailTitle: document.getElementById('project-week-detail-title'),
    projectWeekDetailTimeline: document.getElementById('project-week-detail-timeline'),

    consultantAssignmentModal: document.getElementById('consultant-assignment-modal'),
    consultantAreaFilterModal: document.getElementById('consultant-area-filter-modal'),
    projectRoleModal: document.getElementById('project-role-modal'),
    memberStartDateModal: document.getElementById('member-start-date-modal'),
    memberEndDateModal: document.getElementById('member-end-date-modal'),
    memberAllocationModal: document.getElementById('member-allocation-modal'),
    consultantPickerList: document.getElementById('consultant-picker-list'),
    saveConsultantAssignmentsBtn: document.getElementById('save-consultant-assignments-btn'),

    memberDetailsModal: document.getElementById('member-details-modal'),
    memberModalTitle: document.getElementById('member-modal-title'),
    memberEditConsultantId: document.getElementById('member-edit-consultant-id'),
    memberNameModal: document.getElementById('member-name-modal'),
    memberProjectRoleModal: document.getElementById('member-project-role-modal'),
    memberAllocationEdit: document.getElementById('member-allocation-edit'),
    memberCommentsEdit: document.getElementById('member-comments-edit'),
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
    consultantSwitchEditBtn: document.getElementById('consultant-switch-edit-btn'),
    backToConsultantsBtn: document.getElementById('back-to-consultants-btn'),
    openDaysOffModalBtn: document.getElementById('open-days-off-modal-btn'),
    openHolidaysModalBtn: document.getElementById('open-holidays-modal-btn'),
    consultantAvailabilityChart: document.getElementById('consultant-availability-chart'),
    holidayCountryCode: document.getElementById('holiday-country-code'),
    holidayRegionCode: document.getElementById('holiday-region-code'),
    loadHolidaysBtn: document.getElementById('load-holidays-btn'),
    consultantDaysOffList: document.getElementById('consultant-days-off-list'),
    weekDetailCard: document.getElementById('week-detail-card'),
    weekDetailTitle: document.getElementById('week-detail-title'),
    weekDetailTimeline: document.getElementById('week-detail-timeline'),
    monthDetailCard: document.getElementById('month-detail-card'),
    monthDetailTitle: document.getElementById('month-detail-title'),
    monthDetailTimeline: document.getElementById('month-detail-timeline'),

    daysOffModal: document.getElementById('days-off-modal'),
    holidayLoadModal: document.getElementById('holiday-load-modal'),
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
    consultantStartDate: document.getElementById('consultant-start-date'),
    consultantAreaIds: document.getElementById('consultant-area-ids'),
    consultantCompanyRoleId: document.getElementById('consultant-company-role-id'),
    consultantSalary: document.getElementById('consultant-salary'),
    consultantHolidayLocationId: document.getElementById('consultant-holiday-location-id'),

    timeTrackingConsultantSelect: document.getElementById('time-tracking-consultant-select'),
    timesheetMonthCount: document.getElementById('timesheet-month-count'),
    timesheetsEmptyState: document.getElementById('timesheets-empty-state'),
    timesheetMonthList: document.getElementById('timesheet-month-list'),
    timesheetDetailCard: document.getElementById('timesheet-detail-card'),
    timeTrackingListCard: document.getElementById('time-tracking-list-card'),
    timesheetDetailTitle: document.getElementById('timesheet-detail-title'),
    backToTimesheetsBtn: document.getElementById('back-to-timesheets-btn'),
    timesheetPrevWeekBtn: document.getElementById('timesheet-prev-week-btn'),
    timesheetNextWeekBtn: document.getElementById('timesheet-next-week-btn'),
    timesheetWeekLabel: document.getElementById('timesheet-week-label'),
    addManualTimesheetLineBtn: document.getElementById('add-manual-timesheet-line-btn'),
    timesheetTableWrap: document.getElementById('timesheet-table-wrap'),

    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name'),
    dayOffTypeName: document.getElementById('day-off-type-name')
  };

  Object.assign(ui, {
    createAllocationSimulationBtn: document.getElementById('create-allocation-simulation-btn'),
    loadAllocationSimulationBtn: document.getElementById('load-allocation-simulation-btn'),
    allocationForecastEmptyActions: document.getElementById('allocation-forecast-empty-actions'),
    allocationSimulationList: document.getElementById('allocation-simulation-list'),
    allocationForecastWorkspace: document.getElementById('allocation-forecast-workspace'),
    allocationSimulationTitle: document.getElementById('allocation-simulation-title'),
    allocationLoadProjectsBtn: document.getElementById('allocation-load-projects-btn'),
    allocationLoadPipelineBtn: document.getElementById('allocation-load-pipeline-btn'),
    allocationAddProjectBtn: document.getElementById('allocation-add-project-btn'),
    allocationSaveBtn: document.getElementById('allocation-save-btn'),
    allocationCanvas: document.getElementById('allocation-canvas'),
    allocationConsultantsList: document.getElementById('allocation-consultants-list')
  });

  const selectInstances = {};
  const modals = {};

  let projects = [];
  let consultants = [];
  let roles = [];
  let areas = [];
  let dayOffTypes = [];
  let holidayLocations = [];
  let loadedHolidays = [];
  let projectViewMode = 'edit';
  let consultantViewMode = 'edit';
  let selectedProjectAssignments = [];
  let modalSelectedAreaId = '';
  let modalTempConsultantIds = [];
  let selectedTimelineYear = new Date().getFullYear();
  let selectedProjectTimelineYear = new Date().getFullYear();
  let isProjectTimelineExpanded = false;
  let selectedProjectWeekDetail = null;
  let selectedProjectPhases = [];
  let selectedProjectMilestones = [];
  let showProjectPhaseForm = false;
  let showProjectMilestoneForm = false;
  let editingProjectPhaseId = null;
  let allocationSimulations = [];
  let allocationState = null;
  let timesheetMonths = [];
  let activeTimesheet = null;
  let activeTimesheetConsultantId = 0;
  let activeTimesheetWeekIndex = 0;

  const fallbackHolidayCountries = ['AD', 'AT', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'MX', 'NL', 'NO', 'PL', 'PT', 'SE', 'US'];
  const fallbackHolidayRegionsByCountry = {
    DE: ['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'],
    ES: ['AN', 'AR', 'AS', 'CB', 'CE', 'CL', 'CM', 'CN', 'CT', 'EX', 'GA', 'IB', 'MC', 'MD', 'ML', 'NC', 'PV', 'RI', 'VC'],
    CA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    US: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY', 'DC']
  };

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
  const managerConsultantIdFromAssignments = () => {
    const managerMember = selectedProjectAssignments.find((item) => item.projectRole === 'Project Manager');
    return managerMember ? Number(managerMember.consultantId) : 0;
  };
  const syncManagerFieldWithAssignments = () => {
    const managerId = managerConsultantIdFromAssignments();
    fields.managerId.value = managerId ? String(managerId) : '';
    resetSelect('manager', fields.managerId);
    return managerId;
  };

  const rebuildProjectPlanningSelects = () => {
    if (!ui.projectMilestonePhaseId) return;
    ui.projectMilestonePhaseId.innerHTML = '<option value="" selected>Project-level</option>';
    selectedProjectPhases.forEach((phase) => ui.projectMilestonePhaseId.add(new Option(phase.name, phase.id)));
    resetSelect('projectMilestonePhase', ui.projectMilestonePhaseId);
  };

  const buildProjectPayload = () => ({
    projectName: fields.projectName.value.trim(),
    clientName: fields.clientName.value.trim(),
    projectType: fields.projectType.value,
    managerConsultantId: managerConsultantIdFromAssignments(),
    clientContact: fields.clientContact.value.trim(),
    startDate: fields.startDate.value,
    endDate: fields.endDate.value,
    consultantAssignments: selectedProjectAssignments,
    projectPhases: selectedProjectPhases,
    projectMilestones: selectedProjectMilestones
  });

  const persistProjectPlanningIfEditing = async () => {
    if (!fields.projectId.value) return;
    const payload = buildProjectPayload();
    await request(`/api/projects/${fields.projectId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  const updateProjectPlanningUi = () => {
    const isEdit = projectViewMode !== 'view';
    const showPlanning = Boolean(isProjectTimelineExpanded && isEdit);
    if (ui.projectExpandedPlanning) ui.projectExpandedPlanning.hidden = !showPlanning;
    if (ui.showProjectPhaseFormBtn) ui.showProjectPhaseFormBtn.hidden = !showPlanning;
    if (ui.showProjectMilestoneFormBtn) ui.showProjectMilestoneFormBtn.hidden = !showPlanning;
    if (ui.projectPhaseFormRow) ui.projectPhaseFormRow.hidden = !showPlanning || !showProjectPhaseForm;
    if (ui.projectMilestoneFormRow) ui.projectMilestoneFormRow.hidden = !showPlanning || !showProjectMilestoneForm;
  };

  const findConsultantById = (id) => consultants.find((consultant) => Number(consultant.id) === Number(id));
  const consultantNameById = (id) => findConsultantById(id)?.name || '—';
  const areaNameById = (id) => areas.find((area) => Number(area.id) === Number(id))?.name || '—';
  const roleNameById = (id) => roles.find((role) => Number(role.id) === Number(id))?.name || '—';
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const formatSalary = (value) => Number(value).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });

  const parseIsoDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const phaseColorClassById = (phaseId) => {
    const index = selectedProjectPhases.findIndex((phase) => String(phase.id) === String(phaseId || ''));
    return index >= 0 ? `phase-color-${index % 6}` : '';
  };

  const isWeekendDate = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const dateRangeHasWorkingDayOverlap = (start, end, rangeStart, rangeEnd) => {
    const overlapStart = new Date(Math.max(start.getTime(), rangeStart.getTime()));
    const overlapEnd = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
    if (overlapStart > overlapEnd) return false;
    const cursor = new Date(overlapStart);
    while (cursor <= overlapEnd) {
      if (!isWeekendDate(cursor)) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  const holidayLocationById = (id) => holidayLocations.find((item) => Number(item.id) === Number(id));
  const holidayKey = (countryCode, regionCode) => `${String(countryCode || '').toUpperCase()}::${String(regionCode || '').toUpperCase()}`;

  const mergeLoadedHolidaysForLocation = ({ countryCode, regionCode, holidays }) => {
    const key = holidayKey(countryCode, regionCode || '');
    loadedHolidays = (loadedHolidays || []).filter((item) => holidayKey(item.countryCode, item.regionCode || '') !== key);
    loadedHolidays.push(...(holidays || []));
  };

  const holidayByDateForConsultant = (consultant, date) => {
    if (!consultant) return null;
    const location = holidayLocationById(consultant.holidayLocationId);
    if (!location) return null;
    const dayIso = formatIsoDate(date);
    const key = holidayKey(location.countryCode, location.regionCode || '');
    const matches = loadedHolidays.filter((item) => holidayKey(item.countryCode, item.regionCode || '') === key && item.date === dayIso);
    if (!matches.length) return null;
    return matches.find((item) => item.scope === 'company_override') || matches[0];
  };

  const loadHolidaysForLocation = async ({ year, countryCode, regionCode, consultantId = null }) => {
    if (!countryCode) return [];
    const normalizedCountry = String(countryCode).toUpperCase();
    const normalizedRegion = regionCode ? String(regionCode).toUpperCase() : '';
    const res = await request('/api/holidays/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, countryCode: normalizedCountry, regionCode: normalizedRegion, consultantId })
    });
    mergeLoadedHolidaysForLocation({ countryCode: normalizedCountry, regionCode: normalizedRegion, holidays: res.holidays || [] });
    return res;
  };

  const preloadHolidayDataForConsultants = async (year) => {
    const uniqueLocationIds = [...new Set((consultants || []).map((item) => item.holidayLocationId).filter(Boolean).map(Number))];
    for (const locationId of uniqueLocationIds) {
      const location = holidayLocationById(locationId);
      if (!location) continue;
      try {
        await loadHolidaysForLocation({ year, countryCode: location.countryCode, regionCode: location.regionCode || '' });
      } catch (error) {
        // Keep rendering resilient when a location fails to fetch
      }
    }
  };

  const monthLabel = (monthStart) => {
    const d = parseIsoDate(monthStart);
    return d ? d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : monthStart;
  };

  const firstMondayForMonth = (year, monthIndex) => {
    const first = new Date(year, monthIndex, 1);
    const day = first.getDay();
    const shift = day === 0 ? 6 : day - 1;
    first.setDate(first.getDate() - shift);
    return first;
  };

  const buildMonthWeeks = (monthStartIso) => {
    const start = parseIsoDate(monthStartIso);
    if (!start) return [];
    const year = start.getFullYear();
    const monthIndex = start.getMonth();
    const end = new Date(year, monthIndex + 1, 0);
    const monday = firstMondayForMonth(year, monthIndex);
    const weeks = [];
    while (monday <= end || monday.getMonth() === monthIndex) {
      const weekStart = new Date(monday);
      const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return day;
      });
      weeks.push(days);
      monday.setDate(monday.getDate() + 7);
      if (weeks.length > 7) break;
    }
    return weeks;
  };

  const dayContextForConsultant = (consultant, day) => {
    if (isWeekendDate(day)) return { label: 'Weekend', className: 'context-weekend' };
    const dayIso = formatIsoDate(day);
    const overlap = (consultant?.availability || []).find((entry) => entry.startDate <= dayIso && entry.endDate >= dayIso);
    if (overlap) return { label: overlap.type, className: 'context-dayoff' };
    const holiday = holidayByDateForConsultant(consultant, day);
    if (holiday) return { label: holiday.name, className: 'context-holiday' };
    return { label: 'Working day', className: '' };
  };

  const rebuildTimeTrackingConsultantSelect = () => {
    if (!ui.timeTrackingConsultantSelect) return;
    const current = Number(activeTimesheetConsultantId || 0);
    ui.timeTrackingConsultantSelect.innerHTML = '<option value="">Select consultant...</option>';
    [...(consultants || [])]
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      .forEach((consultant) => {
        const option = new Option(consultant.name || `Consultant ${consultant.id}`, String(consultant.id));
        ui.timeTrackingConsultantSelect.add(option);
      });

    const exists = (consultants || []).some((item) => Number(item.id) === current);
    if (exists) {
      ui.timeTrackingConsultantSelect.value = String(current);
      activeTimesheetConsultantId = current;
    } else {
      ui.timeTrackingConsultantSelect.value = '';
      activeTimesheetConsultantId = 0;
      timesheetMonths = [];
      activeTimesheet = null;
    }
  };

  const refreshTimeTrackingConsultantSelectFromApi = async () => {
    if (!ui.timeTrackingConsultantSelect) return;
    try {
      const data = await request('/api/consultants');
      const loadedConsultants = Array.isArray(data?.consultants) ? data.consultants : [];
      consultants = loadedConsultants;
      rebuildTimeTrackingConsultantSelect();
    } catch (error) {
      // Keep selector functional with already-loaded consultant cache
      rebuildTimeTrackingConsultantSelect();
    }
  };

  const renderTimesheetMonths = () => {
    if (!ui.timesheetMonthList) return;
    ui.timesheetMonthList.innerHTML = '';
    const hasConsultantSelected = Boolean(activeTimesheetConsultantId);
    if (!hasConsultantSelected) {
      ui.timesheetMonthCount.textContent = '';
      ui.timesheetsEmptyState.hidden = false;
      ui.timesheetsEmptyState.textContent = 'Select a consultant to load monthly timesheets.';
      return;
    }
    ui.timesheetMonthCount.textContent = timesheetMonths.length ? `${timesheetMonths.length} month(s)` : '';
    ui.timesheetsEmptyState.hidden = Boolean(timesheetMonths.length);
    ui.timesheetsEmptyState.textContent = 'No monthly timesheets found for the selected consultant.';
    timesheetMonths.forEach((month) => {
      const row = document.createElement('div');
      row.className = 'timesheet-month-row';
      row.innerHTML = `<div class="timesheet-month-meta"><div class="timesheet-month-title">${month.label}</div><div class="grey-text">Status: ${month.status || 'Draft'}</div></div><div class="timesheet-actions"><button class="btn" type="button" data-action="open">Open</button><button class="btn-flat red-text" type="button" data-action="delete">Delete</button></div>`;
      row.querySelector('[data-action="open"]').addEventListener('click', async () => {
        await openMonthlyTimesheet(month.monthStart);
      });
      row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!window.confirm(`Delete timesheet ${month.label}? This removes all lines and entries.`)) return;
        try {
          await request(`/api/monthly-timesheets?consultantId=${activeTimesheetConsultantId}&month=${month.monthStart.slice(0, 7)}`, { method: 'DELETE' });
          toast('Timesheet deleted', 'teal darken-1');
          await loadTimesheetMonths(activeTimesheetConsultantId);
          if (activeTimesheet && activeTimesheet.monthStart === month.monthStart) {
            activeTimesheet = null;
            ui.timesheetDetailCard.hidden = true;
            ui.timeTrackingListCard.hidden = false;
          }
        } catch (error) {
          toast(error.message || 'Failed to delete timesheet', 'red darken-1');
        }
      });
      ui.timesheetMonthList.appendChild(row);
    });
  };

  const loadTimesheetMonths = async (consultantId) => {
    if (!consultantId) {
      timesheetMonths = [];
      renderTimesheetMonths();
      return;
    }
    const res = await request(`/api/monthly-timesheets?consultantId=${consultantId}`);
    timesheetMonths = res.months || [];
    renderTimesheetMonths();
  };

  const renderTimesheetWeek = () => {
    if (!activeTimesheet || !ui.timesheetTableWrap) return;
    const consultant = findConsultantById(activeTimesheet.consultantId);
    const monthWeeks = buildMonthWeeks(activeTimesheet.monthStart);
    const currentWeek = monthWeeks[activeTimesheetWeekIndex] || [];
    const weekStart = currentWeek[0];
    const weekEnd = currentWeek[6];
    ui.timesheetWeekLabel.textContent = weekStart && weekEnd ? `${formatDate(weekStart)} - ${formatDate(weekEnd)}` : '';
    ui.timesheetPrevWeekBtn.disabled = activeTimesheetWeekIndex <= 0;
    ui.timesheetNextWeekBtn.disabled = activeTimesheetWeekIndex >= monthWeeks.length - 1;

    const table = document.createElement('table');
    table.className = 'striped responsive-table timesheet-entry-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Project / Activity</th>' + currentWeek.map((d) => `<th>${d.toLocaleDateString(undefined, { weekday: 'short' })}<br/>${d.getDate()}</th>`).join('') + '<th>Total</th>';
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    (activeTimesheet.lines || []).forEach((line) => {
      const tr = document.createElement('tr');
      const lineLabel = line.projectName || 'Manual';
      const activityInput = line.isManual ? `<input class="line-activity-input" type="text" value="${(line.activity || '').replace(/"/g, '&quot;')}" disabled/>` : (line.activity || '');
      tr.innerHTML = `<td><strong>${lineLabel}</strong>${line.isManual ? `<div>${activityInput}</div>` : ''}</td>`;
      let total = 0;
      currentWeek.forEach((day) => {
        const dayIso = formatIsoDate(day);
        const td = document.createElement('td');
        const context = dayContextForConsultant(consultant, day);
        if (context.className) td.classList.add(context.className);
        const value = Number(line.entries?.[dayIso] || 0);
        total += value;
        const inMonth = day.getMonth() === parseIsoDate(activeTimesheet.monthStart).getMonth();
        td.innerHTML = inMonth
          ? `<input type="number" min="0" max="24" step="0.5" value="${value || ''}" /><div class="day-context">${context.label}</div>`
          : '<span class="grey-text">—</span>';
        const input = td.querySelector('input');
        if (input) {
          input.addEventListener('change', async () => {
            const hours = Number(input.value || 0);
            if (Number.isNaN(hours) || hours < 0 || hours > 24) {
              toast('Hours must be between 0 and 24', 'red darken-1');
              input.value = String(value || '');
              return;
            }
            try {
              await request('/api/monthly-timesheets/entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineId: line.id, date: dayIso, hours })
              });
              line.entries = { ...(line.entries || {}), [dayIso]: hours };
            } catch (error) {
              toast(error.message || 'Failed to save hours', 'red darken-1');
            }
          });
        }
        tr.appendChild(td);
      });
      const totalCell = document.createElement('td');
      totalCell.textContent = total.toFixed(1);
      tr.appendChild(totalCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    ui.timesheetTableWrap.innerHTML = '';
    ui.timesheetTableWrap.appendChild(table);
  };

  const openMonthlyTimesheet = async (monthStartIso) => {
    if (!activeTimesheetConsultantId) return;
    try {
      const consultant = findConsultantById(activeTimesheetConsultantId);
      const y = Number(monthStartIso.slice(0, 4));
      const location = consultant ? holidayLocationById(consultant.holidayLocationId) : null;
      if (location) {
        try { await loadHolidaysForLocation({ year: y, countryCode: location.countryCode, regionCode: location.regionCode || '' }); } catch (_) {}
      }
      const detail = await request(`/api/monthly-timesheets?consultantId=${activeTimesheetConsultantId}&month=${monthStartIso.slice(0, 7)}`);
      activeTimesheet = detail;
      activeTimesheetWeekIndex = 0;
      ui.timesheetDetailTitle.textContent = `${consultant?.name || 'Consultant'} • ${monthLabel(monthStartIso)}`;
      ui.timeTrackingListCard.hidden = true;
      ui.timesheetDetailCard.hidden = false;
      renderTimesheetWeek();
      await loadTimesheetMonths(activeTimesheetConsultantId);
    } catch (error) {
      toast(error.message || 'Failed to open timesheet', 'red darken-1');
    }
  };

  const assignmentWindowForProject = (project, assignment) => {
    const projectStart = parseIsoDate(project.startDate);
    const projectEnd = parseIsoDate(project.endDate);
    const start = parseIsoDate(assignment?.startDate) || projectStart;
    const end = parseIsoDate(assignment?.endDate) || projectEnd;
    if (!start || !end) return null;
    return { start, end };
  };

  const consultantProjectNamesInWeek = (consultantId, weekStart, weekEnd) => {
    const id = Number(consultantId);
    const names = projects
      .filter((project) => {
        const assignments = (project.consultantAssignments || []).filter((assignment) => Number(assignment.consultantId) === id);
        const hasManager = Number(project.managerConsultantId) === id;

        const windows = assignments
          .map((assignment) => assignmentWindowForProject(project, assignment))
          .filter(Boolean);

        if (hasManager && !windows.length) {
          const managerWindow = assignmentWindowForProject(project, { startDate: project.startDate, endDate: project.endDate });
          if (managerWindow) windows.push(managerWindow);
        }

        return windows.some(({ start, end }) => dateRangeHasWorkingDayOverlap(start, end, weekStart, weekEnd));
      })
      .map((project) => project.projectName)
      .filter(Boolean);

    return [...new Set(names)];
  };

  const consultantProjectNamesOnDate = (consultantId, date) => {
    if (isWeekendDate(date)) return [];
    const id = Number(consultantId);
    const names = projects
      .filter((project) => {
        const assignments = (project.consultantAssignments || []).filter((assignment) => Number(assignment.consultantId) === id);
        const hasManager = Number(project.managerConsultantId) === id;

        const windows = assignments
          .map((assignment) => assignmentWindowForProject(project, assignment))
          .filter(Boolean);

        if (hasManager && !windows.length) {
          const managerWindow = assignmentWindowForProject(project, { startDate: project.startDate, endDate: project.endDate });
          if (managerWindow) windows.push(managerWindow);
        }

        return windows.some(({ start, end }) => start <= date && end >= date);
      })
      .map((project) => project.projectName)
      .filter(Boolean);

    return [...new Set(names)];
  };

  const consultantDayStatus = (consultant, day) => {
    const dayIndex = day.getDay();
    const mondayBasedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const overlaps = (consultant?.availability || []).filter((entry) => {
      const entryStart = parseIsoDate(entry.startDate);
      const entryEnd = parseIsoDate(entry.endDate);
      return entryStart && entryEnd && entryStart <= day && entryEnd >= day;
    });
    const projectNames = consultant ? consultantProjectNamesOnDate(consultant.id, day) : [];
    const holiday = holidayByDateForConsultant(consultant, day);
    const details = [];

    if (projectNames.length) details.push(`Project: ${projectNames.join(', ')}`);
    if (holiday) details.push(`Holiday: ${holiday.name}`);

    if (overlaps.some((entry) => entry.type === 'Vacation')) {
      const dayOffText = overlaps.map((entry) => entry.type).join(', ');
      details.unshift(`Days Off: ${dayOffText}`);
      return { className: 'vacation', text: details.join(' • ') || dayOffText };
    }
    if (overlaps.some((entry) => entry.type === 'PTO')) {
      const dayOffText = overlaps.map((entry) => entry.type).join(', ');
      details.unshift(`Days Off: ${dayOffText}`);
      return { className: 'pto', text: details.join(' • ') || dayOffText };
    }
    if (overlaps.length) {
      const dayOffText = overlaps.map((entry) => entry.type).join(', ');
      details.unshift(`Days Off: ${dayOffText}`);
      return { className: 'other', text: details.join(' • ') || dayOffText };
    }

    if (mondayBasedIndex >= 5) {
      return { className: 'weekend-default-off', text: details.join(' • ') || 'Not Available' };
    }

    if (holiday) {
      return { className: 'public-holiday', text: details.join(' • ') };
    }

    if (projectNames.length) {
      return { className: 'allocated', text: details.join(' • ') };
    }

    return { className: '', text: details.join(' • ') || 'Available' };
  };

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

  const isoWeekNumber = (date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + 4 - (target.getDay() || 7));
    const yearStart = new Date(target.getFullYear(), 0, 1);
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  };

  const isoWeeksInYear = (year) => isoWeekNumber(new Date(year, 11, 28));

  const buildTimelineWeeks = ({ year, centered }) => {
    if (centered) {
      const currentMonday = startOfWeekMonday(new Date());
      return Array.from({ length: 53 }, (_, index) => {
        const monday = new Date(currentMonday);
        monday.setDate(currentMonday.getDate() + (index - 26) * 7);
        return { weekNumber: isoWeekNumber(monday), monday };
      });
    }

    const totalWeeks = isoWeeksInYear(year);
    return Array.from({ length: totalWeeks }, (_, index) => {
      const week = index + 1;
      return { weekNumber: week, monday: mondayForWeek(year, week) };
    });
  };

  const timelineTitle = ({ year, centered, weeks }) => {
    if (!centered) return `${year}`;
    const startYear = weeks[0]?.monday.getFullYear();
    const endYear = weeks[weeks.length - 1]?.monday.getFullYear();
    return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
  };

  const drawTimeline = (container, consultantsToRender, options = {}) => {
    let year = options.year || new Date().getFullYear();
    const centered = Boolean(options.centerOnCurrentWeek);
    const consultantStartDates = (consultantsToRender || [])
      .map((consultant) => parseIsoDate(consultant.startDate))
      .filter(Boolean)
      .sort((a, b) => a - b);
    const earliestConsultantStartDate = consultantStartDates[0] || null;
    const minimumTimelineYear = earliestConsultantStartDate ? earliestConsultantStartDate.getFullYear() : null;
    if (!centered && minimumTimelineYear !== null && year < minimumTimelineYear) {
      year = minimumTimelineYear;
    }
    const timelineWeeks = buildTimelineWeeks({ year, centered });
    const weeks = earliestConsultantStartDate && !centered
      ? timelineWeeks.filter(({ monday }) => {
        const weekEnd = new Date(monday);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return weekEnd >= earliestConsultantStartDate;
      })
      : timelineWeeks;
    container.innerHTML = '';

    const legend = document.createElement('div');
    legend.className = 'legend';
    if (options.showAllocationStatus) {
      const projectNames = [...new Set(projects.map((project) => project.projectName).filter(Boolean))];
      projectNames.forEach((projectName) => {
        const projectSpan = document.createElement('span');
        projectSpan.className = 'legend-item allocated-legend';
        projectSpan.textContent = projectName;
        legend.appendChild(projectSpan);
      });

      const available = document.createElement('span');
      available.className = 'legend-item available-legend';
      available.textContent = 'Available';
      legend.appendChild(available);
    }

    const usedTypes = [...new Set(consultantsToRender.flatMap((consultant) => (consultant.availability || []).map((entry) => entry.type)))];
    usedTypes.forEach((type) => {
      const span = document.createElement('span');
      span.className = 'legend-item';
      span.textContent = type;
      span.style.color = type === 'Vacation' ? '#ef6c00' : type === 'PTO' ? '#00695c' : '#5e35b1';
      legend.appendChild(span);
    });
    const holidayLegend = document.createElement('span');
    holidayLegend.className = 'legend-item public-holiday-legend';
    holidayLegend.textContent = 'Public Holiday';
    legend.appendChild(holidayLegend);

    if (!usedTypes.length) {
      const span = document.createElement('span');
      span.textContent = 'No days off recorded yet.';
      legend.appendChild(span);
    }
    container.appendChild(legend);

    const columns = `170px repeat(${weeks.length}, 18px)`;

    if (options.showYearNavigation) {
      const yearRow = document.createElement('div');
      yearRow.className = 'timeline-year-row';
      yearRow.style.gridTemplateColumns = columns;

      const spacer = document.createElement('div');
      yearRow.appendChild(spacer);

      const yearControls = document.createElement('div');
      yearControls.className = 'timeline-year-controls-row';

      const prevButton = document.createElement('button');
      prevButton.className = 'btn-flat timeline-nav-btn';
      prevButton.type = 'button';
      prevButton.dataset.action = 'prev-year';
      prevButton.disabled = centered || (minimumTimelineYear !== null && year <= minimumTimelineYear);
      prevButton.setAttribute('aria-label', 'Previous year');
      prevButton.innerHTML = '<i class="material-icons">chevron_left</i>';
      yearControls.appendChild(prevButton);

      const yearLabel = document.createElement('div');
      yearLabel.className = 'timeline-year-label';
      yearLabel.textContent = timelineTitle({ year, centered, weeks });
      yearControls.appendChild(yearLabel);

      const nextButton = document.createElement('button');
      nextButton.className = 'btn-flat timeline-nav-btn';
      nextButton.type = 'button';
      nextButton.dataset.action = 'next-year';
      nextButton.disabled = centered;
      nextButton.setAttribute('aria-label', 'Next year');
      nextButton.innerHTML = '<i class="material-icons">chevron_right</i>';
      yearControls.appendChild(nextButton);

      yearRow.appendChild(yearControls);
      container.appendChild(yearRow);
    }

    const monthHeader = document.createElement('div');
    monthHeader.className = 'availability-month-header';
    monthHeader.style.gridTemplateColumns = columns;
    monthHeader.appendChild(document.createElement('div'));
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    weeks.forEach(({ monday }) => {
      const monthCell = document.createElement('div');
      if (monday.getDate() <= 7) {
        monthCell.textContent = `${monthNames[monday.getMonth()]}`;
        if (options.enableMonthClick) {
          monthCell.classList.add('month-click-target');
          monthCell.dataset.month = String(monday.getMonth());
          monthCell.dataset.year = String(monday.getFullYear());
        }
      } else {
        monthCell.textContent = '';
      }
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
      const consultantStartDate = parseIsoDate(consultant.startDate);

      weeks.forEach(({ monday }) => {
        const weekStart = new Date(monday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.dataset.monday = formatIsoDate(weekStart);

        if (consultantStartDate && weekEnd < consultantStartDate) {
          row.appendChild(cell);
          return;
        }

        const overlappingDaysOff = (consultant.availability || []).filter((entry) => {
          const entryStart = new Date(entry.startDate);
          const entryEnd = new Date(entry.endDate);
          return entryStart <= weekEnd && entryEnd >= weekStart;
        });

        if (overlappingDaysOff.some((entry) => entry.type === 'Vacation')) cell.classList.add('vacation');
        else if (overlappingDaysOff.some((entry) => entry.type === 'PTO')) cell.classList.add('pto');
        else if (overlappingDaysOff.length) cell.classList.add('other');

        if (options.showAllocationStatus) {
          const projectNames = consultantProjectNamesInWeek(consultant.id, weekStart, weekEnd);
          const holidayNames = [];
          for (let i = 0; i < 7; i += 1) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            if (isWeekendDate(day)) continue;
            const holiday = holidayByDateForConsultant(consultant, day);
            if (holiday) holidayNames.push(holiday.name);
          }
          const uniqueHolidayNames = [...new Set(holidayNames)];
          if (overlappingDaysOff.length) {
            cell.dataset.status = `Days Off: ${overlappingDaysOff.map((entry) => entry.type).join(', ')}`;
          } else if (uniqueHolidayNames.length) {
            cell.classList.add('public-holiday');
            cell.dataset.status = `Holiday: ${uniqueHolidayNames.join(', ')}`;
            if (projectNames.length) {
              cell.dataset.status = `${cell.dataset.status} • Project: ${projectNames.join(', ')}`;
            }
          } else if (projectNames.length) {
            cell.classList.add('allocated');
            cell.dataset.status = `Project: ${projectNames.join(', ')}`;
          } else {
            cell.classList.add('available');
            cell.dataset.status = 'Available';
          }
        }

        row.appendChild(cell);
      });
      container.appendChild(row);
    });
  };


  const drawProjectTimeline = (container, options = {}) => {
    if (!container) return;
    const year = options.year || new Date().getFullYear();
    const centered = Boolean(options.centerOnCurrentWeek);
    const weeks = buildTimelineWeeks({ year, centered });
    container.innerHTML = '';

    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = '<span class="legend-item project-legend">Project Duration</span><span class="legend-item member-legend">Member Assignment</span><span class="legend-item public-holiday-legend">Public Holiday</span>';
    container.appendChild(legend);

    const columns = `170px repeat(${weeks.length}, 18px)`;

    const yearRow = document.createElement('div');
    yearRow.className = 'timeline-year-row';
    yearRow.style.gridTemplateColumns = columns;
    yearRow.appendChild(document.createElement('div'));

    const yearControls = document.createElement('div');
    yearControls.className = 'timeline-year-controls-row';

    const prevButton = document.createElement('button');
    prevButton.className = 'btn-flat timeline-nav-btn';
    prevButton.type = 'button';
    prevButton.dataset.action = 'prev-project-year';
    prevButton.disabled = centered;
    prevButton.setAttribute('aria-label', 'Previous year');
    prevButton.innerHTML = '<i class="material-icons">chevron_left</i>';

    const yearLabel = document.createElement('div');
    yearLabel.className = 'timeline-year-label';
    yearLabel.textContent = timelineTitle({ year, centered, weeks });

    const nextButton = document.createElement('button');
    nextButton.className = 'btn-flat timeline-nav-btn';
    nextButton.type = 'button';
    nextButton.dataset.action = 'next-project-year';
    nextButton.disabled = centered;
    nextButton.setAttribute('aria-label', 'Next year');
    nextButton.innerHTML = '<i class="material-icons">chevron_right</i>';

    yearControls.append(prevButton, yearLabel, nextButton);
    yearRow.appendChild(yearControls);
    container.appendChild(yearRow);

    const monthHeader = document.createElement('div');
    monthHeader.className = 'availability-month-header';
    monthHeader.style.gridTemplateColumns = columns;
    monthHeader.appendChild(document.createElement('div'));
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    weeks.forEach(({ monday }) => {
      const monthCell = document.createElement('div');
      monthCell.textContent = monday.getDate() <= 7 ? monthNames[monday.getMonth()] : '';
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

    const projectStart = parseIsoDate(fields.startDate.value);
    const projectEnd = parseIsoDate(fields.endDate.value);
    const merged = [...selectedProjectAssignments];

    const createTimelineRow = (item) => {
      const row = document.createElement('div');
      row.className = 'availability-row';
      row.style.gridTemplateColumns = columns;

      const name = document.createElement('div');
      name.className = 'availability-name';
      name.textContent = item.label;
      if (item.phaseId) {
        name.classList.add('phase-click-target');
        name.dataset.phaseId = String(item.phaseId);
      }
      row.appendChild(name);

      weeks.forEach(({ monday }) => {
        const weekStart = new Date(monday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.dataset.monday = formatIsoDate(weekStart);
        cell.dataset.rowType = item.type;
        if (item.consultantId) cell.dataset.consultantId = String(item.consultantId);
        if (item.phaseId) cell.dataset.phaseId = String(item.phaseId);
        if (item.startDate) cell.dataset.assignmentStart = formatIsoDate(item.startDate);
        if (item.endDate) cell.dataset.assignmentEnd = formatIsoDate(item.endDate);
        const inAssignmentRange = item.startDate && item.endDate && item.startDate <= weekEnd && item.endDate >= weekStart;
        const milestoneNames = (item.milestones || []).filter((m) => {
          const ms = parseIsoDate(m.startDate);
          const me = parseIsoDate(m.endDate);
          return ms && me && ms <= weekEnd && me >= weekStart;
        }).map((m) => m.name);
        if (inAssignmentRange) {
          if (item.type === 'project') {
            cell.classList.add('project-range');
          } else if (item.type === 'phase') {
            cell.classList.add('phase-range');
            if (item.phaseColorClass) cell.classList.add(item.phaseColorClass);
          } else {
            const overlaps = (item.consultant?.availability || []).filter((entry) => {
              const entryStart = parseIsoDate(entry.startDate);
              const entryEnd = parseIsoDate(entry.endDate);
              return entryStart && entryEnd && entryStart <= weekEnd && entryEnd >= weekStart;
            });

            const holidayNames = [];
            for (let i = 0; i < 7; i += 1) {
              const day = new Date(weekStart);
              day.setDate(weekStart.getDate() + i);
              if (isWeekendDate(day)) continue;
              const holiday = holidayByDateForConsultant(item.consultant, day);
              if (holiday) holidayNames.push(holiday.name);
            }
            const uniqueHolidayNames = [...new Set(holidayNames)];

            if (overlaps.some((entry) => entry.type === 'Vacation')) {
              cell.classList.add('member-dayoff-vacation');
              cell.dataset.status = overlaps.map((entry) => entry.type).join(', ');
            } else if (overlaps.some((entry) => entry.type === 'PTO')) {
              cell.classList.add('member-dayoff-pto');
              cell.dataset.status = overlaps.map((entry) => entry.type).join(', ');
            } else if (overlaps.length) {
              cell.classList.add('member-dayoff-other');
              cell.dataset.status = overlaps.map((entry) => entry.type).join(', ');
            } else if (uniqueHolidayNames.length) {
              cell.classList.add('member-holiday');
              cell.dataset.status = `Holiday: ${uniqueHolidayNames.join(', ')}`;
            } else {
              cell.classList.add('member-range');
            }
          }
        }
        if (milestoneNames.length) { cell.classList.add('milestone-range'); cell.dataset.status = `${cell.dataset.status ? `${cell.dataset.status} • ` : ''}Milestone: ${milestoneNames.join(', ')}`; }
        row.appendChild(cell);
      });

      return row;
    };

    const buildAreaGroups = (members) => {
      const tmAreaName = 'TM (Transport Management)';
      const managementLabel = 'Management';
      const buckets = {
        management: { label: managementLabel, members: [], ids: new Set() },
        tm: { label: tmAreaName, members: [], ids: new Set() }
      };
      const dynamicBuckets = new Map();
      const pushUnique = (bucket, member, consultant) => {
        const id = Number(member.consultantId);
        if (bucket.ids.has(id)) return;
        bucket.ids.add(id);
        bucket.members.push({ member, consultant });
      };

      members.forEach((member) => {
        const consultant = findConsultantById(member.consultantId);
        const areaNames = (consultant?.areaNames || []).length ? consultant.areaNames : (consultant?.areaIds || []).map(areaNameById).filter(Boolean);
        const lowerAreas = areaNames.map((name) => String(name).trim().toLowerCase());

        if (member.projectRole === 'Project Manager' || lowerAreas.includes(managementLabel.toLowerCase())) {
          pushUnique(buckets.management, member, consultant);
        }
        if (areaNames.includes(tmAreaName)) {
          pushUnique(buckets.tm, member, consultant);
        }
        areaNames.forEach((name) => {
          const normalized = String(name).trim().toLowerCase();
          if (!normalized || normalized == tmAreaName.toLowerCase() || normalized === managementLabel.toLowerCase()) return;
          if (!dynamicBuckets.has(name)) dynamicBuckets.set(name, { label: name, members: [], ids: new Set() });
          pushUnique(dynamicBuckets.get(name), member, consultant);
        });
      });

      return [buckets.management, buckets.tm, ...Array.from(dynamicBuckets.values()).sort((a, b) => a.label.localeCompare(b.label))]
        .filter((group) => group.members.length);
    };

    if (!isProjectTimelineExpanded) {
      const projectRow = createTimelineRow({ label: 'Project', startDate: projectStart, endDate: projectEnd, type: 'project' });
      container.appendChild(projectRow);
      merged.forEach((member) => {
        const consultant = findConsultantById(member.consultantId);
        container.appendChild(createTimelineRow({
          label: consultant ? consultant.name : `Consultant ${member.consultantId}`,
          startDate: parseIsoDate(member.startDate) || projectStart,
          endDate: parseIsoDate(member.endDate) || projectEnd,
          consultant,
          consultantId: member.consultantId,
          type: 'member'
        }));
      });
      return;
    }

    const projectPanel = document.createElement('div');
    projectPanel.className = 'timeline-area-panel';
    const projectTitle = document.createElement('h6');
    projectTitle.className = 'timeline-area-title';
    projectTitle.textContent = 'Project';
    projectPanel.appendChild(projectTitle);
    const projectMilestones = selectedProjectMilestones;
    projectPanel.appendChild(createTimelineRow({ label: fields.projectName.value.trim() || 'Project', startDate: projectStart, endDate: projectEnd, type: 'project', milestones: projectMilestones }));
    selectedProjectPhases.forEach((phase, index) => {
      const phaseMilestones = selectedProjectMilestones.filter((m) => String(m.phaseId || '') === String(phase.id));
      projectPanel.appendChild(createTimelineRow({
        label: `Phase: ${phase.name}`,
        startDate: parseIsoDate(phase.startDate) || projectStart,
        endDate: parseIsoDate(phase.endDate) || projectEnd,
        type: 'phase',
        phaseId: phase.id,
        phaseColorClass: phaseColorClassById(phase.id) || `phase-color-${index % 6}`,
        milestones: phaseMilestones
      }));
    });
    container.appendChild(projectPanel);

    const groups = buildAreaGroups(merged);
    groups.forEach((group) => {
      const panel = document.createElement('div');
      panel.className = 'timeline-area-panel';

      const title = document.createElement('h6');
      title.className = 'timeline-area-title';
      title.textContent = group.label;
      panel.appendChild(title);

      group.members.forEach(({ member, consultant }) => {
        panel.appendChild(createTimelineRow({
          label: consultant ? consultant.name : `Consultant ${member.consultantId}`,
          startDate: parseIsoDate(member.startDate) || projectStart,
          endDate: parseIsoDate(member.endDate) || projectEnd,
          consultant,
          consultantId: member.consultantId,
          type: 'member'
        }));
      });

      container.appendChild(panel);
    });
  };

  const refreshProjectTimeline = async () => {
    const centerOnCurrentWeek = Boolean(ui.centerCurrentWeekToggle?.checked);
    await preloadHolidayDataForConsultants(selectedProjectTimelineYear);
    drawProjectTimeline(ui.projectTimelineChart, { year: selectedProjectTimelineYear, centerOnCurrentWeek });
    if (selectedProjectWeekDetail) {
      renderProjectWeekDetail(selectedProjectWeekDetail.weekMondayIso, selectedProjectWeekDetail.consultantId, selectedProjectWeekDetail.rowType, selectedProjectWeekDetail.phaseId);
    }
  };

  const bindWeekTooltip = (container) => {
    container.addEventListener('mousemove', (event) => {
      const weekCell = event.target.closest('.week-cell');
      if (!weekCell) {
        ui.weekTooltip.hidden = true;
        return;
      }
      ui.weekTooltip.hidden = false;
      const status = weekCell.dataset.status ? ` • ${weekCell.dataset.status}` : '';
      ui.weekTooltip.textContent = `Week Monday: ${weekCell.dataset.monday}${status}`;
      ui.weekTooltip.style.left = `${event.clientX + 12}px`;
      ui.weekTooltip.style.top = `${event.clientY + 12}px`;
    });
    container.addEventListener('mouseleave', () => {
      ui.weekTooltip.hidden = true;
    });
  };

  bindWeekTooltip(ui.availabilityChart);
  bindWeekTooltip(ui.consultantAvailabilityChart);
  bindWeekTooltip(ui.projectTimelineChart);

  const renderWeekDetail = (consultant, weekMondayIso) => {
    if (!ui.weekDetailCard || !ui.weekDetailTimeline || !ui.weekDetailTitle) return;
    if (!consultant || !weekMondayIso) {
      ui.weekDetailCard.hidden = true;
      ui.weekDetailTimeline.innerHTML = '';
      return;
    }

    const start = parseIsoDate(weekMondayIso);
    if (!start) {
      ui.weekDetailCard.hidden = true;
      ui.weekDetailTimeline.innerHTML = '';
      return;
    }

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    ui.weekDetailTitle.textContent = `Week Timeline (${formatDate(start)} - ${formatDate(end)})`;

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ui.weekDetailTimeline.innerHTML = '';

    dayNames.forEach((dayName, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const dayIso = formatIsoDate(day);
      const cell = document.createElement('div');
      cell.className = 'week-day-cell';

      const overlaps = (consultant.availability || []).filter((entry) => {
        const entryStart = parseIsoDate(entry.startDate);
        const entryEnd = parseIsoDate(entry.endDate);
        return entryStart && entryEnd && entryStart <= day && entryEnd >= day;
      });

      if (overlaps.length) {
        const primary = overlaps[0];
        if (primary.type === 'Vacation') cell.classList.add('vacation');
        else if (primary.type === 'PTO') cell.classList.add('pto');
        else cell.classList.add('other');
      }

      const name = document.createElement('div');
      name.className = 'week-day-name';
      name.textContent = dayName;

      const date = document.createElement('div');
      date.className = 'week-day-date';
      date.textContent = dayIso;

      const status = document.createElement('div');
      status.className = 'week-day-status';
      const dayStatus = consultantDayStatus(consultant, day);
      if (dayStatus.className) cell.classList.add(dayStatus.className);
      status.textContent = dayStatus.text;

      cell.appendChild(name);
      cell.appendChild(date);
      cell.appendChild(status);
      ui.weekDetailTimeline.appendChild(cell);
    });

    ui.weekDetailCard.hidden = false;
    if (ui.monthDetailCard) ui.monthDetailCard.hidden = true;
  };

  const renderMonthDetail = (consultant, year, monthIndex) => {
    if (!ui.monthDetailCard || !ui.monthDetailTimeline || !ui.monthDetailTitle) return;
    if (!consultant || Number.isNaN(Number(monthIndex)) || Number.isNaN(Number(year))) {
      ui.monthDetailCard.hidden = true;
      ui.monthDetailTimeline.innerHTML = '';
      return;
    }

    const y = Number(year);
    const m = Number(monthIndex);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    ui.monthDetailTitle.textContent = `${monthNames[m]} ${y} – Daily Detail`;
    ui.monthDetailTimeline.innerHTML = '';

    const firstDay = new Date(y, m, 1);
    const mondayIndex = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < mondayIndex; i += 1) {
      const spacer = document.createElement('div');
      spacer.className = 'week-day-cell month-day-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      ui.monthDetailTimeline.appendChild(spacer);
    }

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
      const day = new Date(y, m, dayNum);
      const dayIso = formatIsoDate(day);
      const cell = document.createElement('div');
      cell.className = 'week-day-cell';

      const dayName = document.createElement('div');
      dayName.className = 'week-day-name';
      dayName.textContent = day.toLocaleDateString(undefined, { weekday: 'long' });

      const date = document.createElement('div');
      date.className = 'week-day-date';
      date.textContent = dayIso;

      const status = document.createElement('div');
      status.className = 'week-day-status';
      const dayStatus = consultantDayStatus(consultant, day);
      if (dayStatus.className) cell.classList.add(dayStatus.className);
      status.textContent = dayStatus.text;

      cell.append(dayName, date, status);
      ui.monthDetailTimeline.appendChild(cell);
    }

    ui.monthDetailCard.hidden = false;
    if (ui.weekDetailCard) ui.weekDetailCard.hidden = true;
  };

  const renderProjectWeekDetail = (weekMondayIso, consultantId, rowType, phaseId = '') => {
    if (!ui.projectWeekDetailCard || !ui.projectWeekDetailTimeline || !ui.projectWeekDetailTitle) return;
    if (!weekMondayIso) {
      selectedProjectWeekDetail = null;
      ui.projectWeekDetailCard.hidden = true;
      ui.projectWeekDetailTimeline.innerHTML = '';
      return;
    }

    const start = parseIsoDate(weekMondayIso);
    if (!start) return;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    selectedProjectWeekDetail = { weekMondayIso, consultantId, rowType, phaseId };
    ui.projectWeekDetailTitle.textContent = `Project Week Detail (${formatDate(start)} - ${formatDate(end)})`;
    ui.projectWeekDetailTimeline.innerHTML = '';

    const consultant = consultantId ? findConsultantById(Number(consultantId)) : null;
    const selectedMember = consultantId ? selectedProjectAssignments.find((item) => Number(item.consultantId) === Number(consultantId)) : null;
    const assignmentStart = parseIsoDate(selectedMember?.startDate || '');
    const assignmentEnd = parseIsoDate(selectedMember?.endDate || '');
    const milestonesForRow = rowType === 'phase'
      ? selectedProjectMilestones.filter((item) => String(item.phaseId || '') === String(phaseId || ''))
      : selectedProjectMilestones;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    dayNames.forEach((dayName, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const dayIso = formatIsoDate(day);
      const cell = document.createElement('div');
      cell.className = 'week-day-cell';

      const name = document.createElement('div');
      name.className = 'week-day-name';
      name.textContent = dayName;

      const date = document.createElement('div');
      date.className = 'week-day-date';
      date.textContent = dayIso;

      const status = document.createElement('div');
      status.className = 'week-day-status';

      const isWeekend = index >= 5;
      const dayMilestones = milestonesForRow.filter((item) => {
        const startDate = parseIsoDate(item.startDate);
        const endDate = parseIsoDate(item.endDate);
        return startDate && endDate && startDate <= day && endDate >= day;
      });
      if (rowType === 'member' && consultant) {
        const inMemberRange = assignmentStart && assignmentEnd && day >= assignmentStart && day <= assignmentEnd;
        const overlaps = (consultant.availability || []).filter((entry) => {
          const entryStart = parseIsoDate(entry.startDate);
          const entryEnd = parseIsoDate(entry.endDate);
          return entryStart && entryEnd && entryStart <= day && entryEnd >= day;
        });
        const holiday = !isWeekend ? holidayByDateForConsultant(consultant, day) : null;
        if (!isWeekend) {
          if (overlaps.some((entry) => entry.type === 'Vacation')) cell.classList.add('vacation');
          else if (overlaps.some((entry) => entry.type === 'PTO')) cell.classList.add('pto');
          else if (overlaps.length) cell.classList.add('other');
        }

        const statusParts = [];
        if (isWeekend) {
          cell.classList.add('weekend-default-off');
          statusParts.push('Not Available');
        } else if (!inMemberRange) {
          cell.classList.add('not-assigned');
          statusParts.push('Not Assigned');
        } else if (!overlaps.length) {
          cell.classList.add('allocated');
          statusParts.push('Assigned');
        } else {
          statusParts.push(overlaps.map((entry) => entry.type).join(', '));
        }
        if (holiday) {
          if (!overlaps.length && inMemberRange && !isWeekend) {
            cell.classList.add('public-holiday');
          }
          statusParts.push(`Holiday: ${holiday.name}`);
        }
        if (dayMilestones.length) {
          cell.classList.add('milestone-range');
          statusParts.push(`Milestone: ${dayMilestones.map((item) => item.name).join(', ')}`);
        }
        status.textContent = statusParts.join(' • ');
      } else if (isWeekend) {
        cell.classList.add('weekend-default-off');
        status.textContent = 'Not Available';
      } else {
        status.textContent = 'Project Active';
      }
      if (rowType !== 'member' && dayMilestones.length) {
        cell.classList.add('milestone-range');
        const milestoneColorClass = phaseColorClassById(dayMilestones[0]?.phaseId || phaseId);
        if (milestoneColorClass) cell.classList.add(`week-day-${milestoneColorClass}`);
        status.textContent = `${status.textContent} • Milestone: ${dayMilestones.map((item) => item.name).join(', ')}`;
      }

      cell.append(name, date, status);
      ui.projectWeekDetailTimeline.appendChild(cell);
    });

    ui.projectWeekDetailCard.hidden = false;
    if (isProjectTimelineExpanded) {
      ui.projectWeekDetailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const renderConsultantDaysOffList = (consultant) => {
    ui.consultantDaysOffList.innerHTML = '';
    const dayOffEntries = consultant?.availability || [];
    const holidayLoad = consultant?.holidayCalendarLoad || null;

    if (!dayOffEntries.length && !holidayLoad) {
      const li = document.createElement('li');
      li.className = 'collection-item grey-text';
      li.textContent = 'No days off recorded.';
      ui.consultantDaysOffList.appendChild(li);
      return;
    }

    if (holidayLoad) {
      const li = document.createElement('li');
      li.className = 'collection-item';
      const regionSuffix = holidayLoad.regionCode ? `-${holidayLoad.regionCode}` : '';
      li.textContent = `Holiday Calendar ${holidayLoad.year}: ${holidayLoad.countryCode}${regionSuffix}`;
      ui.consultantDaysOffList.appendChild(li);
    }

    dayOffEntries.forEach((entry) => {
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

  const rebuildConsultantSelects = ({ areaIds = [], companyRoleId = '', holidayLocationId = '' } = {}) => {
    fields.consultantAreaIds.innerHTML = '';
    areas.forEach((area) => fields.consultantAreaIds.add(new Option(area.name, area.id, false, areaIds.map(Number).includes(Number(area.id)))));
    fields.consultantCompanyRoleId.innerHTML = '<option value="" disabled selected>Select company role</option>';
    roles.forEach((role) => fields.consultantCompanyRoleId.add(new Option(role.name, role.id, false, Number(companyRoleId) === Number(role.id))));
    fields.consultantHolidayLocationId.innerHTML = '<option value="" selected>No holiday location</option>';
    holidayLocations.forEach((location) => fields.consultantHolidayLocationId.add(new Option(location.label, location.id, false, Number(holidayLocationId) === Number(location.id))));
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
    resetSelect('consultantHolidayLocation', fields.consultantHolidayLocationId);
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
    const assignedIds = new Set(selectedProjectAssignments.map((item) => Number(item.consultantId)));
    const candidates = consultants.filter((consultant) => {
      const matchesArea = (consultant.areaIds || []).map(Number).includes(areaId);
      return matchesArea && !assignedIds.has(Number(consultant.id));
    });
    if (!candidates.length) {
      ui.consultantPickerList.innerHTML = '<p class="grey-text">No unassigned consultants available in this area.</p>';
      return;
    }
    ui.consultantPickerList.innerHTML = '';
    candidates.forEach((consultant) => {
      const item = document.createElement('p');
      item.className = 'consultant-picker-item';
      item.innerHTML = `<label><input type="radio" name="project-consultant-choice" data-consultant-id="${consultant.id}" ${modalTempConsultantIds.includes(Number(consultant.id)) ? 'checked' : ''} /><span>${consultant.name}</span></label>`;
      ui.consultantPickerList.appendChild(item);
    });
  };

  const updateProjectMembersPanel = () => {
    ui.projectMembersList.innerHTML = '';
    syncManagerFieldWithAssignments();
    const allMembers = [...selectedProjectAssignments];

    if (!allMembers.length) {
      ui.projectMembersList.innerHTML = '<p class="grey-text">No consultants assigned yet.</p>';
      refreshProjectTimeline();
      return;
    }

    const createMemberCard = (member, consultant) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'member-card';
      wrapper.innerHTML = `
        <div class="member-header">
          <div>
            <strong>${consultant?.name || 'Unknown Consultant'}</strong>
            <div class="member-meta">Project Role: ${member.projectRole || '—'}</div>
            <div class="member-meta">Dates: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}</div>
            <div class="member-meta">Allocation: ${Number(member.allocation ?? 100)}%</div>
          </div>
          <div>
            <button class="btn-flat teal-text" data-action="view-member" data-id="${member.consultantId}"><i class="material-icons tiny">visibility</i></button>
            <button class="btn-flat blue-text" data-action="edit-member" data-id="${member.consultantId}"><i class="material-icons tiny">edit</i></button><button class="btn-flat red-text" data-action="remove-member" data-id="${member.consultantId}"><i class="material-icons tiny">delete</i></button>
          </div>
        </div>
      `;
      return wrapper;
    };

    const tmAreaName = 'TM (Transport Management)';
    const managementLabel = 'Management';
    const buckets = {
      management: { label: managementLabel, members: [], ids: new Set() },
      tm: { label: tmAreaName, members: [], ids: new Set() }
    };
    const dynamicBuckets = new Map();
    const pushUnique = (bucket, member, consultant) => {
      const id = Number(member.consultantId);
      if (bucket.ids.has(id)) return;
      bucket.ids.add(id);
      bucket.members.push({ member, consultant });
    };

    allMembers.forEach((member) => {
      const consultant = findConsultantById(member.consultantId);
      const areaNames = (consultant?.areaNames || []).length ? consultant.areaNames : (consultant?.areaIds || []).map(areaNameById).filter(Boolean);
      const lowerAreas = areaNames.map((name) => String(name).trim().toLowerCase());

      if (member.projectRole === 'Project Manager' || lowerAreas.includes(managementLabel.toLowerCase())) {
        pushUnique(buckets.management, member, consultant);
      }
      if (areaNames.includes(tmAreaName)) {
        pushUnique(buckets.tm, member, consultant);
      }
      areaNames.forEach((name) => {
        const normalized = String(name).trim().toLowerCase();
        if (!normalized || normalized === tmAreaName.toLowerCase() || normalized === managementLabel.toLowerCase()) return;
        if (!dynamicBuckets.has(name)) dynamicBuckets.set(name, { label: name, members: [], ids: new Set() });
        pushUnique(dynamicBuckets.get(name), member, consultant);
      });
    });

    const orderedGroups = [buckets.management, buckets.tm, ...Array.from(dynamicBuckets.values()).sort((a, b) => a.label.localeCompare(b.label))]
      .filter((group) => group.members.length);

    orderedGroups.forEach((group) => {
      const panel = document.createElement('div');
      panel.className = 'member-area-panel';

      const title = document.createElement('h6');
      title.className = 'member-area-title';
      title.textContent = group.label;
      panel.appendChild(title);

      group.members.forEach(({ member, consultant }) => panel.appendChild(createMemberCard(member, consultant)));
      ui.projectMembersList.appendChild(panel);
    });

    refreshProjectTimeline();
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

  const rebuildHolidayCountryRegionControls = ({ consultantHolidayLocationId = '' } = {}) => {
    const countriesFromLocations = holidayLocations.map((item) => String(item.countryCode || '').toUpperCase()).filter(Boolean);
    const countries = [...new Set([...countriesFromLocations, ...fallbackHolidayCountries])].sort();
    ui.holidayCountryCode.innerHTML = '<option value="" selected disabled>Select country</option>';
    countries.forEach((country) => ui.holidayCountryCode.add(new Option(country, country)));

    const selectedLocation = holidayLocationById(consultantHolidayLocationId);
    if (selectedLocation?.countryCode) ui.holidayCountryCode.value = selectedLocation.countryCode;

    const selectedCountry = ui.holidayCountryCode.value;
    const regionsFromLocations = holidayLocations.filter((item) => item.countryCode === selectedCountry && item.regionCode).map((item) => item.regionCode);
    const regionsFromFallback = fallbackHolidayRegionsByCountry[selectedCountry] || [];
    const uniqueRegions = [...new Set([...regionsFromLocations, ...regionsFromFallback])].sort();
    ui.holidayRegionCode.innerHTML = '<option value="" selected>No region</option>';
    uniqueRegions.forEach((region) => ui.holidayRegionCode.add(new Option(region, region)));
    if (selectedLocation?.regionCode) ui.holidayRegionCode.value = selectedLocation.regionCode;

    resetSelect('holidayCountryCode', ui.holidayCountryCode);
    resetSelect('holidayRegionCode', ui.holidayRegionCode);
  };

  const renderConsultants = () => {
    ui.consultantsBody.innerHTML = '';
    consultants.forEach((consultant) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consultant.name}</td>
        <td>${(consultant.areaNames || []).join(', ') || (consultant.areaIds || []).map(areaNameById).join(', ') || '—'}</td>
        <td>${consultant.companyRole || roleNameById(consultant.companyRoleId) || '—'}</td>
        <td>${holidayLocationById(consultant.holidayLocationId)?.label || '—'}</td>
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

  const updateProjectTimelineExpandUi = () => {
    if (!ui.toggleProjectTimelineExpandBtn) return;
    document.body.classList.toggle('project-timeline-expanded', isProjectTimelineExpanded);
    const icon = ui.toggleProjectTimelineExpandBtn.querySelector('.material-icons');
    if (icon) icon.textContent = isProjectTimelineExpanded ? 'close_fullscreen' : 'open_in_full';
    ui.toggleProjectTimelineExpandBtn.setAttribute('aria-label', isProjectTimelineExpanded ? 'Collapse timeline' : 'Expand timeline');
    if (ui.projectTimelineProjectName) {
      ui.projectTimelineProjectName.hidden = !isProjectTimelineExpanded;
      ui.projectTimelineProjectName.textContent = fields.projectName.value ? `Project: ${fields.projectName.value}` : 'Project Timeline';
    }
    updateProjectPlanningUi();
  };

  const collapseProjectTimeline = () => {
    if (!isProjectTimelineExpanded) return;
    isProjectTimelineExpanded = false;
    updateProjectTimelineExpandUi();
  };

  const showProjectsPanel = () => { collapseProjectTimeline(); ui.projectsPanelCard.hidden = false; ui.projectFormCard.hidden = true; ui.projectMembersCard.hidden = true; };
  const showManageProjectPanel = () => { ui.projectsPanelCard.hidden = true; ui.projectFormCard.hidden = false; ui.projectMembersCard.hidden = false; };
  const showConsultantsPanel = () => { ui.consultantsPanelCard.hidden = false; ui.consultantFormCard.hidden = true; };
  const showManageConsultantsPanel = () => { ui.consultantsPanelCard.hidden = true; ui.consultantFormCard.hidden = false; };

  const setProjectFormMode = (mode) => {
    projectViewMode = mode;
    const readOnly = mode === 'view';
    ui.projectFormTitle.textContent = readOnly ? 'Manage Project (View)' : 'Manage Project';
    ui.projectSaveBtn.hidden = readOnly;
    ui.projectSaveBtn.style.display = readOnly ? 'none' : '';
    if (ui.projectSwitchEditBtn) ui.projectSwitchEditBtn.hidden = !readOnly;
    ui.openConsultantModalBtn.disabled = readOnly;
    ui.openConsultantModalBtn.hidden = readOnly;
    if (ui.addProjectPhaseBtn) ui.addProjectPhaseBtn.disabled = readOnly;
    if (ui.addProjectMilestoneBtn) ui.addProjectMilestoneBtn.disabled = readOnly;
    if (ui.showProjectPhaseFormBtn) ui.showProjectPhaseFormBtn.disabled = readOnly;
    if (ui.showProjectMilestoneFormBtn) ui.showProjectMilestoneFormBtn.disabled = readOnly;
    if (readOnly) {
      showProjectPhaseForm = false;
      showProjectMilestoneForm = false;
    }
    updateProjectPlanningUi();
    [fields.projectName, fields.clientName, fields.projectType, fields.clientContact, fields.startDate, fields.endDate].forEach((el) => { el.disabled = readOnly; });
    fields.managerId.disabled = true;
    resetSelect('manager', fields.managerId);
    resetSelect('projectType', fields.projectType);
    updateProjectMembersPanel();
  };

  const setConsultantFormMode = (mode) => {
    consultantViewMode = mode;
    const readOnly = mode === 'view';
    ui.consultantFormTitle.textContent = readOnly ? 'Manage Consultant (View)' : 'Manage Consultant';
    ui.consultantModeLabel.textContent = readOnly ? 'Read-only mode' : 'Edit mode';
    ui.consultantSaveBtn.hidden = readOnly;
    ui.consultantSaveBtn.style.display = readOnly ? 'none' : '';
    if (ui.consultantSwitchEditBtn) ui.consultantSwitchEditBtn.hidden = !readOnly;
    ui.openDaysOffModalBtn.disabled = readOnly;
    if (ui.openHolidaysModalBtn) ui.openHolidaysModalBtn.disabled = readOnly;
    [fields.consultantName, fields.consultantStartDate, fields.consultantAreaIds, fields.consultantCompanyRoleId, fields.consultantSalary].forEach((el) => {
      el.disabled = readOnly;
    });
    fields.consultantHolidayLocationId.disabled = true;
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
    resetSelect('consultantHolidayLocation', fields.consultantHolidayLocationId);
  };

  const setSection = (section) => {
    Object.entries(sections).forEach(([key, element]) => { element.hidden = key !== section; });
    document.querySelectorAll('#nav-menu .collection-item').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
    if (section === 'projects') showProjectsPanel();
    if (section === 'consultants') showConsultantsPanel();
    if (section === 'time-tracking') {
      ui.timeTrackingListCard.hidden = false;
      ui.timesheetDetailCard.hidden = true;
      rebuildTimeTrackingConsultantSelect();
      if (!activeTimesheetConsultantId) timesheetMonths = [];
      renderTimesheetMonths();
    }
    if (section === 'allocation-forecast' && !allocationState) {
      ui.allocationForecastEmptyActions.hidden = false;
      ui.allocationSimulationList.hidden = true;
      ui.allocationForecastWorkspace.hidden = true;
    }
  };

  const allocationDraggedPayload = (event) => {
    try { return JSON.parse(event.dataTransfer.getData('application/json')); } catch { return null; }
  };

  const renderAllocationSimulationList = () => {
    if (!ui.allocationSimulationList) return;
    ui.allocationSimulationList.innerHTML = '';
    if (!allocationSimulations.length) {
      ui.allocationSimulationList.innerHTML = '<p class="grey-text">No saved simulations yet.</p>';
      return;
    }
    allocationSimulations.forEach((simulation) => {
      const item = document.createElement('div');
      item.className = 'allocation-simulation-item';
      item.innerHTML = `<div><strong>${simulation.name}</strong><div class="grey-text">Created: ${simulation.createdAt || '—'}</div></div><button class="btn" type="button">Load</button>`;
      item.querySelector('button').addEventListener('click', async () => {
        const loaded = await request(`/api/allocation-simulations/${simulation.id}`);
        allocationState = { ...(loaded.state || {}), id: loaded.id, name: loaded.name };
        ui.allocationSimulationTitle.textContent = loaded.name;
        ui.allocationForecastWorkspace.hidden = false;
        ui.allocationSimulationList.hidden = true;
        ui.allocationForecastEmptyActions.hidden = true;
        renderAllocationWorkspace();
      });
      ui.allocationSimulationList.appendChild(item);
    });
  };

  const ensureAllocationStateShape = () => {
    if (!allocationState) return;
    allocationState.projects = Array.isArray(allocationState.projects) ? allocationState.projects : [];
    allocationState.unassignedConsultantIds = Array.isArray(allocationState.unassignedConsultantIds) ? allocationState.unassignedConsultantIds : [];
  };

  const renderAllocationWorkspace = () => {
    ensureAllocationStateShape();
    if (!allocationState) return;
    ui.allocationCanvas.innerHTML = '';
    const assigned = new Set();
    allocationState.projects.forEach((project) => (project.consultantIds || []).forEach((id) => assigned.add(Number(id))));
    const unassignedIds = allocationState.unassignedConsultantIds.filter((id) => !assigned.has(Number(id)));
    ui.allocationConsultantsList.innerHTML = '';
    consultants.filter((c) => unassignedIds.includes(Number(c.id))).forEach((consultant) => {
      const item = document.createElement('div');
      item.className = 'allocation-consultant-item';
      item.draggable = true;
      item.textContent = consultant.name;
      item.dataset.consultantId = String(consultant.id);
      item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('application/json', JSON.stringify({ type: 'consultant', consultantId: Number(consultant.id), source: 'list' }));
      });
      ui.allocationConsultantsList.appendChild(item);
    });

    allocationState.projects.forEach((project) => {
      const panel = document.createElement('div');
      panel.className = 'allocation-project-panel';
      panel.style.left = `${Number(project.x || 20)}px`;
      panel.style.top = `${Number(project.y || 20)}px`;
      panel.dataset.projectId = String(project.id);
      panel.innerHTML = `<div class="allocation-panel-header">${project.name}</div><div class="allocation-panel-body"><strong>Consultants</strong><div class="allocation-drop-zone" data-zone="consultants"></div><strong>Vacancies</strong><div class="allocation-drop-zone" data-zone="vacancies"></div><button class="btn-flat" data-action="add-vacancy" type="button">Add Vacancy</button></div>`;
      const header = panel.querySelector('.allocation-panel-header');
      const consultantsZone = panel.querySelector('[data-zone="consultants"]');
      const vacanciesZone = panel.querySelector('[data-zone="vacancies"]');

      (project.consultantIds || []).forEach((consultantId) => {
        const consultant = findConsultantById(consultantId);
        if (!consultant) return;
        const c = document.createElement('div');
        c.className = 'allocation-consultant-item';
        c.draggable = true;
        c.textContent = consultant.name;
        c.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('application/json', JSON.stringify({ type: 'consultant', consultantId: Number(consultantId), source: 'project', projectId: project.id }));
        });
        consultantsZone.appendChild(c);
      });

      (project.vacancies || []).forEach((vacancy) => {
        const v = document.createElement('div');
        v.className = 'allocation-vacancy-item';
        v.draggable = true;
        v.textContent = `SAP Area: ${vacancy.sapArea}`;
        v.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('application/json', JSON.stringify({ type: 'vacancy', vacancyId: vacancy.id, projectId: project.id }));
        });
        vacanciesZone.appendChild(v);
      });

      [consultantsZone, vacanciesZone].forEach((zone) => {
        zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      });
      consultantsZone.addEventListener('drop', (event) => {
        event.preventDefault(); consultantsZone.classList.remove('drag-over');
        const data = allocationDraggedPayload(event); if (!data) return;
        if (data.type === 'consultant') {
          allocationState.projects.forEach((p) => { p.consultantIds = (p.consultantIds || []).filter((id) => Number(id) !== Number(data.consultantId)); });
          allocationState.unassignedConsultantIds = (allocationState.unassignedConsultantIds || []).filter((id) => Number(id) !== Number(data.consultantId));
          project.consultantIds = [...new Set([...(project.consultantIds || []), Number(data.consultantId)])];
        }
        if (data.type === 'vacancy') {
          const from = allocationState.projects.find((p) => String(p.id) === String(data.projectId));
          if (!from) return;
          const moved = (from.vacancies || []).find((v) => String(v.id) === String(data.vacancyId));
          from.vacancies = (from.vacancies || []).filter((v) => String(v.id) !== String(data.vacancyId));
          if (moved) project.vacancies = [...(project.vacancies || []), moved];
        }
        renderAllocationWorkspace();
      });
      vacanciesZone.addEventListener('drop', (event) => {
        event.preventDefault(); vacanciesZone.classList.remove('drag-over');
        const data = allocationDraggedPayload(event); if (!data) return;
        if (data.type === 'vacancy') {
          const from = allocationState.projects.find((p) => String(p.id) === String(data.projectId));
          if (!from) return;
          const moved = (from.vacancies || []).find((v) => String(v.id) === String(data.vacancyId));
          from.vacancies = (from.vacancies || []).filter((v) => String(v.id) !== String(data.vacancyId));
          if (moved) project.vacancies = [...(project.vacancies || []), moved];
        }
        if (data.type === 'consultant') {
          const sapArea = window.prompt('Required SAP Area for vacancy assignment record:', '')?.trim();
          allocationState.projects.forEach((p) => { p.consultantIds = (p.consultantIds || []).filter((id) => Number(id) !== Number(data.consultantId)); });
          allocationState.unassignedConsultantIds = (allocationState.unassignedConsultantIds || []).filter((id) => Number(id) !== Number(data.consultantId));
          project.consultantIds = [...new Set([...(project.consultantIds || []), Number(data.consultantId)])];
          if (sapArea) {
            project.vacancies = (project.vacancies || []).slice(1);
          }
        }
        renderAllocationWorkspace();
      });

      panel.querySelector('[data-action="add-vacancy"]').addEventListener('click', () => {
        const sapArea = window.prompt('Required SAP Area');
        if (!sapArea || !sapArea.trim()) return;
        project.vacancies = [...(project.vacancies || []), { id: `${Date.now()}-${Math.random()}`, sapArea: sapArea.trim() }];
        renderAllocationWorkspace();
      });

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let panelX = Number(project.x || 20);
      let panelY = Number(project.y || 20);
      header.addEventListener('mousedown', (event) => {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
      });
      window.addEventListener('mousemove', (event) => {
        if (!dragging) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        project.x = Math.max(0, panelX + dx);
        project.y = Math.max(0, panelY + dy);
        panel.style.left = `${project.x}px`;
        panel.style.top = `${project.y}px`;
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        panelX = Number(project.x || 20);
        panelY = Number(project.y || 20);
      });

      ui.allocationCanvas.appendChild(panel);
    });

    ui.allocationConsultantsList.addEventListener('dragover', (event) => { event.preventDefault(); ui.allocationConsultantsList.classList.add('drag-over'); });
    ui.allocationConsultantsList.addEventListener('dragleave', () => ui.allocationConsultantsList.classList.remove('drag-over'));
    ui.allocationConsultantsList.addEventListener('drop', (event) => {
      event.preventDefault(); ui.allocationConsultantsList.classList.remove('drag-over');
      const data = allocationDraggedPayload(event); if (!data || data.type !== 'consultant') return;
      allocationState.projects.forEach((p) => { p.consultantIds = (p.consultantIds || []).filter((id) => Number(id) !== Number(data.consultantId)); });
      allocationState.unassignedConsultantIds = [...new Set([...(allocationState.unassignedConsultantIds || []), Number(data.consultantId)])];
      renderAllocationWorkspace();
    });
  };

  const resetProjectForm = () => {
    ui.projectForm.reset();
    fields.projectId.value = '';
    selectedProjectAssignments = [];
    selectedProjectPhases = [];
    selectedProjectMilestones = [];
    showProjectPhaseForm = false;
    showProjectMilestoneForm = false;
    editingProjectPhaseId = null;
    modalSelectedAreaId = '';
    modalTempConsultantIds = [];
    updateAssignedConsultantsSummary();
    rebuildProjectSelects();
    rebuildProjectPlanningSelects();
    setProjectFormMode('edit');
    updateProjectMembersPanel();
    selectedProjectTimelineYear = new Date().getFullYear();
    refreshProjectTimeline();
    renderProjectWeekDetail('', '', '');
    collapseProjectTimeline();
    showProjectsPanel();
    updateTextFields();
  };

  const resetConsultantForm = () => {
    ui.consultantForm.reset();
    fields.consultantId.value = '';
    rebuildConsultantSelects();
    rebuildHolidayCountryRegionControls();
    setConsultantFormMode('edit');
    drawTimeline(ui.consultantAvailabilityChart, [], { year: selectedTimelineYear, centerOnCurrentWeek: Boolean(ui.centerCurrentWeekToggle?.checked), showYearNavigation: true, showAllocationStatus: true, enableMonthClick: true });
    renderConsultantDaysOffList(null);
    renderWeekDetail(null, '');
    renderMonthDetail(null, NaN, NaN);
    showConsultantsPanel();
    updateTextFields();
  };


  const refreshTimelines = async () => {
    const centerOnCurrentWeek = Boolean(ui.centerCurrentWeekToggle?.checked);
    loadedHolidays = [];
    await preloadHolidayDataForConsultants(selectedTimelineYear);
    drawTimeline(ui.availabilityChart, consultants, { year: selectedTimelineYear, centerOnCurrentWeek, showYearNavigation: true, showAllocationStatus: true, enableMonthClick: true });
    const consultantId = Number(fields.consultantId.value);
    const consultant = consultantId ? findConsultantById(consultantId) : null;
    drawTimeline(ui.consultantAvailabilityChart, consultant ? [consultant] : [], { year: selectedTimelineYear, centerOnCurrentWeek, showYearNavigation: true, showAllocationStatus: true, enableMonthClick: true });
  };

  const loadAll = async () => {
    const endpoints = [
      { key: 'projects', path: '/api/projects', prop: 'projects', fallback: [] },
      { key: 'consultants', path: '/api/consultants', prop: 'consultants', fallback: [] },
      { key: 'roles', path: '/api/roles', prop: 'roles', fallback: [] },
      { key: 'areas', path: '/api/areas', prop: 'areas', fallback: [] },
      { key: 'dayOffTypes', path: '/api/day-off-types', prop: 'dayOffTypes', fallback: [] },
      { key: 'holidayLocations', path: '/api/holiday-locations', prop: 'holidayLocations', fallback: [] },
      { key: 'allocationSimulations', path: '/api/allocation-simulations', prop: 'simulations', fallback: [] }
    ];

    const results = await Promise.allSettled(endpoints.map((item) => request(item.path)));
    const loaded = {};
    const failed = [];

    results.forEach((result, index) => {
      const endpoint = endpoints[index];
      if (result.status === 'fulfilled') loaded[endpoint.key] = result.value?.[endpoint.prop] || endpoint.fallback;
      else {
        loaded[endpoint.key] = endpoint.fallback;
        failed.push(endpoint.path);
      }
    });

    projects = loaded.projects;
    consultants = loaded.consultants;
    roles = loaded.roles;
    areas = loaded.areas;
    dayOffTypes = loaded.dayOffTypes;
    holidayLocations = loaded.holidayLocations;
    allocationSimulations = loaded.allocationSimulations;

    renderProjects();
    renderConsultants();
    renderAdminLists();
    await refreshTimelines();
    rebuildProjectSelects({ managerId: fields.managerId.value });
    rebuildConsultantSelects({ areaIds: selectedIds(fields.consultantAreaIds), companyRoleId: fields.consultantCompanyRoleId.value, holidayLocationId: fields.consultantHolidayLocationId.value });
    rebuildHolidayCountryRegionControls({ consultantHolidayLocationId: fields.consultantHolidayLocationId.value });
    rebuildAssignmentModalSelects();
    rebuildDayOffTypeSelect();
    rebuildTimeTrackingConsultantSelect();
    renderAllocationSimulationList();

    if (failed.length) {
      toast(`Some data failed to load (${failed.join(', ')})`, 'orange darken-2');
    }
  };

  ui.showProjectFormBtn.addEventListener('click', () => { resetProjectForm(); showManageProjectPanel(); });
  ui.backToProjectsBtn.addEventListener('click', showProjectsPanel);
  fields.startDate.addEventListener('change', updateProjectMembersPanel);
  fields.endDate.addEventListener('change', updateProjectMembersPanel);
  fields.projectName.addEventListener('input', updateProjectTimelineExpandUi);
  ui.toggleProjectTimelineExpandBtn?.addEventListener('click', () => {
    isProjectTimelineExpanded = !isProjectTimelineExpanded;
    showProjectPhaseForm = false;
    showProjectMilestoneForm = false;
    updateProjectTimelineExpandUi();
    refreshProjectTimeline();
  });


  ui.showProjectPhaseFormBtn?.addEventListener('click', () => {
    editingProjectPhaseId = null;
    ui.projectPhaseName.value = '';
    ui.projectPhaseStartDate.value = '';
    ui.projectPhaseEndDate.value = '';
    if (ui.addProjectPhaseBtn) ui.addProjectPhaseBtn.textContent = 'Save Phase';
    showProjectPhaseForm = !showProjectPhaseForm;
    updateProjectPlanningUi();
  });

  ui.showProjectMilestoneFormBtn?.addEventListener('click', () => {
    showProjectMilestoneForm = !showProjectMilestoneForm;
    updateProjectPlanningUi();
  });

  ui.addProjectPhaseBtn?.addEventListener('click', async () => {
    const name = ui.projectPhaseName.value.trim();
    const startDate = ui.projectPhaseStartDate.value;
    const endDate = ui.projectPhaseEndDate.value;
    if (!name || !startDate || !endDate || startDate > endDate) {
      toast('Provide valid phase name and dates', 'orange darken-2');
      return;
    }
    const previousPhases = [...selectedProjectPhases];
    const previousEditId = editingProjectPhaseId;
    if (editingProjectPhaseId) {
      selectedProjectPhases = selectedProjectPhases.map((item) => (String(item.id) === String(editingProjectPhaseId) ? { ...item, name, startDate, endDate } : item));
    } else {
      selectedProjectPhases.push({ id: `${Date.now()}-${Math.random()}`, name, startDate, endDate });
    }

    try {
      await persistProjectPlanningIfEditing();
      ui.projectPhaseName.value = '';
      ui.projectPhaseStartDate.value = '';
      ui.projectPhaseEndDate.value = '';
      rebuildProjectPlanningSelects();
      editingProjectPhaseId = null;
      if (ui.addProjectPhaseBtn) ui.addProjectPhaseBtn.textContent = 'Save Phase';
      showProjectPhaseForm = false;
      updateProjectPlanningUi();
      refreshProjectTimeline();
      toast(previousEditId ? 'Project phase updated' : 'Project phase added', 'teal darken-1');
    } catch (error) {
      selectedProjectPhases = previousPhases;
      rebuildProjectPlanningSelects();
      toast(error.message || 'Failed to save project phase', 'red darken-1');
    }
  });

  ui.addProjectMilestoneBtn?.addEventListener('click', async () => {
    const name = ui.projectMilestoneName.value.trim();
    const startDate = ui.projectMilestoneStartDate.value;
    const endDate = ui.projectMilestoneEndDate.value;
    if (!name || !startDate || !endDate || startDate > endDate) {
      toast('Provide valid milestone name and dates', 'orange darken-2');
      return;
    }
    const previousMilestones = [...selectedProjectMilestones];
    selectedProjectMilestones.push({ id: `${Date.now()}-${Math.random()}`, phaseId: ui.projectMilestonePhaseId.value || '', name, startDate, endDate });

    try {
      await persistProjectPlanningIfEditing();
      ui.projectMilestoneName.value = '';
      ui.projectMilestoneStartDate.value = '';
      ui.projectMilestoneEndDate.value = '';
      showProjectMilestoneForm = false;
      updateProjectPlanningUi();
      refreshProjectTimeline();
      toast('Project milestone added', 'teal darken-1');
    } catch (error) {
      selectedProjectMilestones = previousMilestones;
      toast(error.message || 'Failed to save project milestone', 'red darken-1');
    }
  });

  ui.showConsultantFormBtn.addEventListener('click', () => { resetConsultantForm(); showManageConsultantsPanel(); });
  ui.backToConsultantsBtn.addEventListener('click', showConsultantsPanel);

  ui.openConsultantModalBtn.addEventListener('click', () => {
    modalTempConsultantIds = [];
    modalSelectedAreaId = '';
    ui.projectRoleModal.value = '';
    ui.memberStartDateModal.value = fields.startDate.value;
    ui.memberEndDateModal.value = fields.endDate.value;
    ui.memberAllocationModal.value = '100';
    rebuildAssignmentModalSelects();
    renderConsultantPickerList();
    modals.consultantAssignment?.open();
  });

  ui.consultantAreaFilterModal.addEventListener('change', () => {
    modalSelectedAreaId = ui.consultantAreaFilterModal.value;
    renderConsultantPickerList();
  });

  ui.consultantPickerList.addEventListener('change', (event) => {
    const option = event.target.closest('input[type="radio"][data-consultant-id]');
    if (!option) return;
    const id = Number(option.dataset.consultantId);
    modalTempConsultantIds = Number.isNaN(id) ? [] : [id];
  });

  ui.saveConsultantAssignmentsBtn.addEventListener('click', async () => {
    const role = ui.projectRoleModal.value;
    if (!role) { toast('Project Role is required', 'red darken-1'); return; }
    if (modalTempConsultantIds.length !== 1) { toast('Select exactly one consultant', 'red darken-1'); return; }
    const start = ui.memberStartDateModal.value;
    const end = ui.memberEndDateModal.value;
    if (start && end && start > end) { toast('Start date cannot be after end date', 'red darken-1'); return; }
    const allocation = Number(ui.memberAllocationModal.value || 100);
    if (Number.isNaN(allocation) || allocation < 0 || allocation > 100) {
      toast('Allocation must be between 0 and 100', 'red darken-1');
      return;
    }

    const selectedConsultantId = Number(modalTempConsultantIds[0]);
    selectedProjectAssignments.push({ consultantId: selectedConsultantId, projectRole: role, startDate: start, endDate: end, allocation, comments: '' });

    try {
      if (fields.projectId.value) {
        const payload = buildProjectPayload();
        await request(`/api/projects/${fields.projectId.value}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        await loadAll();
      }
      updateAssignedConsultantsSummary();
      updateProjectMembersPanel();
      modals.consultantAssignment?.close();
      toast(fields.projectId.value ? 'Project member saved' : 'Project member added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save project member', 'red darken-1');
    }
  });

  ui.projectMembersList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const consultantId = Number(button.dataset.id);
    const member = selectedProjectAssignments.find((item) => Number(item.consultantId) === consultantId) || {
      consultantId,
      projectRole: 'Project Manager',
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      allocation: 100,
      comments: ''
    };

    if (button.dataset.action === 'remove-member') {
      selectedProjectAssignments = selectedProjectAssignments.filter((item) => Number(item.consultantId) !== consultantId);
      try {
        if (fields.projectId.value) {
          const payload = buildProjectPayload();
          await request(`/api/projects/${fields.projectId.value}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
          await loadAll();
        }
        updateAssignedConsultantsSummary();
        updateProjectMembersPanel();
        toast('Project member removed', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to remove project member', 'red darken-1');
      }
      return;
    }

    const readOnly = button.dataset.action === 'view-member';
    ui.memberModalTitle.textContent = readOnly ? 'View Project Member' : 'Edit Project Member';
    ui.memberEditConsultantId.value = consultantId;
    ui.memberNameModal.value = consultantNameById(consultantId);
    ui.memberAllocationEdit.value = Number(member.allocation ?? 100);
    ui.memberCommentsEdit.value = member.comments || '';
    ui.memberStartDateEdit.value = member.startDate || '';
    ui.memberEndDateEdit.value = member.endDate || '';
    rebuildMemberRoleSelect(member.projectRole || 'Project Member');

    ui.memberProjectRoleModal.disabled = readOnly;
    ui.memberAllocationEdit.disabled = readOnly;
    ui.memberCommentsEdit.disabled = readOnly;
    ui.memberStartDateEdit.disabled = readOnly;
    ui.memberEndDateEdit.disabled = readOnly;
    ui.saveMemberDetailsBtn.hidden = readOnly;
    resetSelect('memberRole', ui.memberProjectRoleModal);
    updateTextFields();
    modals.memberDetails?.open();
  });

  ui.saveMemberDetailsBtn.addEventListener('click', async () => {
    const consultantId = Number(ui.memberEditConsultantId.value);
    const item = selectedProjectAssignments.find((member) => Number(member.consultantId) === consultantId);
    if (!item) { modals.memberDetails?.close(); return; }
    if (ui.memberStartDateEdit.value && ui.memberEndDateEdit.value && ui.memberStartDateEdit.value > ui.memberEndDateEdit.value) {
      toast('Start date cannot be after end date', 'red darken-1');
      return;
    }
    const allocation = Number(ui.memberAllocationEdit.value);
    if (Number.isNaN(allocation) || allocation < 0 || allocation > 100) {
      toast('Allocation must be between 0 and 100', 'red darken-1');
      return;
    }

    item.projectRole = ui.memberProjectRoleModal.value;
    item.allocation = allocation;
    item.comments = ui.memberCommentsEdit.value.trim();
    item.startDate = ui.memberStartDateEdit.value;
    item.endDate = ui.memberEndDateEdit.value;

    try {
      if (fields.projectId.value) {
        const payload = buildProjectPayload();
        await request(`/api/projects/${fields.projectId.value}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        await loadAll();
      }
      updateProjectMembersPanel();
      modals.memberDetails?.close();
      toast('Project member updated', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save project member', 'red darken-1');
    }
  });

  ui.projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (projectViewMode === 'view') return;

    const payload = buildProjectPayload();

    if (payload.startDate > payload.endDate) { toast('Start date cannot be after end date', 'red darken-1'); return; }
    if (!payload.managerConsultantId) { toast('Assign a Project Manager from Project Members before saving', 'red darken-1'); return; }

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
      startDate: fields.consultantStartDate.value,
      areaIds: selectedIds(fields.consultantAreaIds),
      companyRoleId: Number(fields.consultantCompanyRoleId.value),
      salary: fields.consultantSalary.value || 0,
      holidayLocationId: fields.consultantHolidayLocationId.value ? Number(fields.consultantHolidayLocationId.value) : null
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

  ui.openHolidaysModalBtn?.addEventListener('click', () => {
    if (!fields.consultantId.value) {
      toast('Open a consultant first to load holidays', 'orange darken-2');
      return;
    }
    const consultant = findConsultantById(Number(fields.consultantId.value));
    rebuildHolidayCountryRegionControls({ consultantHolidayLocationId: consultant?.holidayLocationId || fields.consultantHolidayLocationId.value });
    modals.holidayLoad?.open();
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
      await refreshTimelines();
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
      const confirmed = window.confirm(`Delete project "${project.projectName}"?`);
      if (!confirmed) return;
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
      endDate: item.endDate || '',
      allocation: Number(item.allocation ?? 100),
      comments: item.comments || ''
    }));
    selectedProjectPhases = (project.projectPhases || []).map((item) => ({ id: String(item.id || Date.now() + Math.random()), name: item.name || '', startDate: item.startDate || '', endDate: item.endDate || '' }));
    selectedProjectMilestones = (project.projectMilestones || []).map((item) => ({ id: String(item.id || Date.now() + Math.random()), phaseId: item.phaseId ? String(item.phaseId) : '', name: item.name || '', startDate: item.startDate || '', endDate: item.endDate || '' }));
    rebuildProjectPlanningSelects();

    if (project.managerConsultantId && !selectedProjectAssignments.some((item) => item.projectRole === 'Project Manager')) {
      selectedProjectAssignments.unshift({
        consultantId: Number(project.managerConsultantId),
        projectRole: 'Project Manager',
        startDate: project.startDate,
        endDate: project.endDate,
        allocation: 100,
        comments: ''
      });
    }

    selectedProjectTimelineYear = new Date().getFullYear();
    updateAssignedConsultantsSummary();
    rebuildProjectSelects({ managerId: project.managerConsultantId });
    setProjectFormMode(button.dataset.action === 'view-project' ? 'view' : 'edit');
    showProjectPhaseForm = false;
    showProjectMilestoneForm = false;
    showManageProjectPanel();
    collapseProjectTimeline();
    updateProjectTimelineExpandUi();
    updateProjectMembersPanel();
    renderProjectWeekDetail('', '', '');
    updateTextFields();
  });

  ui.consultantsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const consultant = consultants.find((item) => Number(item.id) === id);
    if (!consultant) return;

    if (button.dataset.action === 'delete-consultant') {
      const confirmed = window.confirm(`Delete consultant "${consultant.name}"?`);
      if (!confirmed) return;
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
    fields.consultantStartDate.value = consultant.startDate || '';
    rebuildConsultantSelects({ areaIds: consultant.areaIds || [], companyRoleId: consultant.companyRoleId || '', holidayLocationId: consultant.holidayLocationId || '' });
    rebuildHolidayCountryRegionControls({ consultantHolidayLocationId: consultant.holidayLocationId || '' });
    setConsultantFormMode(button.dataset.action === 'view-consultant' ? 'view' : 'edit');
    await refreshTimelines();
    renderConsultantDaysOffList(consultant);
    renderWeekDetail(null, '');
    renderMonthDetail(null, NaN, NaN);
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


  ui.holidayCountryCode?.addEventListener('change', () => {
    const selectedCountry = ui.holidayCountryCode.value;
    const regionsFromLocations = holidayLocations.filter((item) => item.countryCode === selectedCountry && item.regionCode).map((item) => item.regionCode);
    const regionsFromFallback = fallbackHolidayRegionsByCountry[selectedCountry] || [];
    const uniqueRegions = [...new Set([...regionsFromLocations, ...regionsFromFallback])].sort();
    ui.holidayRegionCode.innerHTML = '<option value="" selected>No region</option>';
    uniqueRegions.forEach((region) => ui.holidayRegionCode.add(new Option(region, region)));
    resetSelect('holidayRegionCode', ui.holidayRegionCode);
  });

  ui.loadHolidaysBtn?.addEventListener('click', async () => {
    const countryCode = ui.holidayCountryCode.value;
    const regionCode = ui.holidayRegionCode.value;
    if (!countryCode) {
      toast('Select a holiday country first', 'orange darken-2');
      return;
    }
    try {
      const consultantId = Number(fields.consultantId.value);
      const result = await loadHolidaysForLocation({ year: selectedTimelineYear, countryCode, regionCode, consultantId });
      const consultant = consultantId ? findConsultantById(consultantId) : null;
      if (consultant) {
        if (result.holidayLocationId) {
          consultant.holidayLocationId = result.holidayLocationId;
          fields.consultantHolidayLocationId.value = String(result.holidayLocationId);
        }
        if (result.holidayCalendarLoad) {
          consultant.holidayCalendarLoad = result.holidayCalendarLoad;
        }
      }
      await loadAll();
      if (consultant) {
        const refreshed = findConsultantById(consultantId);
        renderConsultantDaysOffList(refreshed || consultant);
      }
      modals.holidayLoad?.close();
      toast('Holidays loaded', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to load holidays', 'red darken-1');
    }
  });


  const minimumConsultantStartYear = (consultantsToInspect) => {
    const years = (consultantsToInspect || [])
      .map((consultant) => parseIsoDate(consultant.startDate))
      .filter(Boolean)
      .map((date) => date.getFullYear());
    if (!years.length) return null;
    return Math.min(...years);
  };

  ui.availabilityChart.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (ui.centerCurrentWeekToggle?.checked) return;

    const minYear = minimumConsultantStartYear(consultants);
    if (button.dataset.action === 'prev-year' && (minYear === null || selectedTimelineYear > minYear)) selectedTimelineYear -= 1;
    if (button.dataset.action === 'next-year') selectedTimelineYear += 1;
    await refreshTimelines();
  });

  ui.centerCurrentWeekToggle?.addEventListener('change', () => { refreshTimelines(); refreshProjectTimeline(); });



  ui.consultantAvailabilityChart.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (button) {
      if (ui.centerCurrentWeekToggle?.checked) return;
      const consultantId = Number(fields.consultantId.value);
      const consultant = consultantId ? findConsultantById(consultantId) : null;
      const minYear = minimumConsultantStartYear(consultant ? [consultant] : []);
      if (button.dataset.action === 'prev-year' && (minYear === null || selectedTimelineYear > minYear)) selectedTimelineYear -= 1;
      if (button.dataset.action === 'next-year') selectedTimelineYear += 1;
      await refreshTimelines();
      return;
    }

    const consultantId = Number(fields.consultantId.value);
    const consultant = consultantId ? findConsultantById(consultantId) : null;
    if (!consultant) {
      toast('Open a consultant to view timeline details', 'orange darken-2');
      return;
    }

    const monthCell = event.target.closest('.month-click-target');
    if (monthCell) {
      renderMonthDetail(consultant, Number(monthCell.dataset.year), Number(monthCell.dataset.month));
      return;
    }

    const weekCell = event.target.closest('.week-cell');
    if (!weekCell) return;
    renderWeekDetail(consultant, weekCell.dataset.monday);
  });



  ui.projectTimelineChart?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (button) {
      if (ui.centerCurrentWeekToggle?.checked) return;
      if (button.dataset.action === 'prev-project-year') selectedProjectTimelineYear -= 1;
      if (button.dataset.action === 'next-project-year') selectedProjectTimelineYear += 1;
      refreshProjectTimeline();
      return;
    }

    const phaseName = event.target.closest('.phase-click-target');
    if (phaseName && projectViewMode !== 'view') {
      const phase = selectedProjectPhases.find((item) => String(item.id) === String(phaseName.dataset.phaseId || ''));
      if (phase) {
        editingProjectPhaseId = phase.id;
        ui.projectPhaseName.value = phase.name || '';
        ui.projectPhaseStartDate.value = phase.startDate || '';
        ui.projectPhaseEndDate.value = phase.endDate || '';
        if (ui.addProjectPhaseBtn) ui.addProjectPhaseBtn.textContent = 'Update Phase';
        showProjectPhaseForm = true;
        updateProjectPlanningUi();
      }
      return;
    }

    const weekCell = event.target.closest('.week-cell');
    if (!weekCell) return;
    renderProjectWeekDetail(weekCell.dataset.monday, weekCell.dataset.consultantId, weekCell.dataset.rowType, weekCell.dataset.phaseId || '');
  });


  ui.projectSwitchEditBtn?.addEventListener('click', () => {
    setProjectFormMode('edit');
  });

  ui.consultantSwitchEditBtn?.addEventListener('click', () => {
    setConsultantFormMode('edit');
  });

  ui.timeTrackingConsultantSelect?.addEventListener('change', async () => {
    const selectedId = Number(ui.timeTrackingConsultantSelect.value || 0);
    activeTimesheetConsultantId = selectedId;
    activeTimesheet = null;
    ui.timeTrackingListCard.hidden = false;
    ui.timesheetDetailCard.hidden = true;
    await loadTimesheetMonths(activeTimesheetConsultantId);
  });

  ui.timeTrackingConsultantSelect?.addEventListener('focus', () => {
    refreshTimeTrackingConsultantSelectFromApi();
  });

  ui.timeTrackingConsultantSelect?.addEventListener('mousedown', () => {
    refreshTimeTrackingConsultantSelectFromApi();
  });

  ui.backToTimesheetsBtn?.addEventListener('click', async () => {
    ui.timeTrackingListCard.hidden = false;
    ui.timesheetDetailCard.hidden = true;
    await loadTimesheetMonths(activeTimesheetConsultantId);
  });

  ui.timesheetPrevWeekBtn?.addEventListener('click', () => {
    if (activeTimesheetWeekIndex <= 0) return;
    activeTimesheetWeekIndex -= 1;
    renderTimesheetWeek();
  });

  ui.timesheetNextWeekBtn?.addEventListener('click', () => {
    const totalWeeks = buildMonthWeeks(activeTimesheet?.monthStart || '').length;
    if (activeTimesheetWeekIndex >= totalWeeks - 1) return;
    activeTimesheetWeekIndex += 1;
    renderTimesheetWeek();
  });

  ui.addManualTimesheetLineBtn?.addEventListener('click', async () => {
    if (!activeTimesheet?.timesheetId) return;
    const activity = window.prompt('Activity description');
    if (!activity || !activity.trim()) {
      toast('Activity is required for manual line', 'orange darken-2');
      return;
    }
    try {
      await request('/api/monthly-timesheets/manual-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timesheetId: activeTimesheet.timesheetId, activity: activity.trim() })
      });
      await openMonthlyTimesheet(activeTimesheet.monthStart);
    } catch (error) {
      toast(error.message || 'Failed to add manual line', 'red darken-1');
    }
  });

  ui.navMenu.addEventListener('click', (event) => {
    const item = event.target.closest('li[data-section]');
    if (!item) return;
    setSection(item.dataset.section);
  });

  ui.createAllocationSimulationBtn?.addEventListener('click', async () => {
    const customName = window.prompt('Simulation name (optional)')?.trim();
    const created = await request('/api/allocation-simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customName ? { name: customName } : {})
    });
    allocationState = { id: created.id, name: created.name, projects: [], unassignedConsultantIds: consultants.map((c) => Number(c.id)) };
    ui.allocationSimulationTitle.textContent = created.name;
    ui.allocationForecastWorkspace.hidden = false;
    ui.allocationSimulationList.hidden = true;
    ui.allocationForecastEmptyActions.hidden = true;
    await loadAll();
    renderAllocationWorkspace();
  });

  ui.loadAllocationSimulationBtn?.addEventListener('click', async () => {
    await loadAll();
    ui.allocationSimulationList.hidden = false;
    ui.allocationForecastWorkspace.hidden = true;
  });

  ui.allocationLoadProjectsBtn?.addEventListener('click', () => {
    if (!allocationState) return;
    const existingById = new Set(allocationState.projects.filter((p) => p.sourceProjectId).map((p) => Number(p.sourceProjectId)));
    projects.forEach((project, index) => {
      if (existingById.has(Number(project.id))) return;
      allocationState.projects.push({
        id: `p-${project.id}`,
        sourceProjectId: Number(project.id),
        name: project.projectName,
        x: 20 + (index % 4) * 320,
        y: 20 + Math.floor(index / 4) * 240,
        consultantIds: (project.consultantAssignments || []).map((item) => Number(item.consultantId)),
        vacancies: []
      });
    });
    const assigned = new Set(allocationState.projects.flatMap((p) => p.consultantIds || []).map(Number));
    allocationState.unassignedConsultantIds = consultants.map((c) => Number(c.id)).filter((id) => !assigned.has(id));
    renderAllocationWorkspace();
  });

  ui.allocationAddProjectBtn?.addEventListener('click', () => {
    if (!allocationState) return;
    const name = window.prompt('Project Name');
    if (!name || !name.trim()) return;
    allocationState.projects.push({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      x: 30,
      y: 30,
      consultantIds: [],
      vacancies: []
    });
    renderAllocationWorkspace();
  });

  ui.allocationSaveBtn?.addEventListener('click', async () => {
    if (!allocationState?.id) return;
    await request(`/api/allocation-simulations/${allocationState.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: allocationState.name, state: { projects: allocationState.projects, unassignedConsultantIds: allocationState.unassignedConsultantIds } })
    });
    toast('Simulation saved', 'teal darken-1');
    await loadAll();
  });

  if (window.M?.Modal) {
    modals.consultantAssignment = M.Modal.init(ui.consultantAssignmentModal);
    modals.memberDetails = M.Modal.init(ui.memberDetailsModal);
    modals.daysOff = M.Modal.init(ui.daysOffModal);
    modals.holidayLoad = M.Modal.init(ui.holidayLoadModal);
  }

  setSection('projects');
  updateProjectTimelineExpandUi();
  resetProjectForm();
  resetConsultantForm();
  loadAll().catch((error) => toast(error.message || 'Unable to load data', 'red darken-1'));
}
