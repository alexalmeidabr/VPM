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
    backToProjectsBtn: document.getElementById('back-to-projects-btn'),
    openConsultantModalBtn: document.getElementById('open-consultant-modal-btn'),
    assignedConsultantsSummary: document.getElementById('assigned-consultants-summary'),
    projectMembersList: document.getElementById('project-members-list'),
    projectMembersCard: document.getElementById('project-members-card'),
    projectTimelineChart: document.getElementById('project-timeline-chart'),
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
    consultantAreaIds: document.getElementById('consultant-area-ids'),
    consultantCompanyRoleId: document.getElementById('consultant-company-role-id'),
    consultantSalary: document.getElementById('consultant-salary'),
    consultantHolidayLocationId: document.getElementById('consultant-holiday-location-id'),

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
  let holidayLocations = [];
  let loadedHolidays = [];
  let projectViewMode = 'edit';
  let consultantViewMode = 'edit';
  let selectedProjectAssignments = [];
  let modalSelectedAreaId = '';
  let modalTempConsultantIds = [];
  let selectedTimelineYear = new Date().getFullYear();
  let selectedProjectTimelineYear = new Date().getFullYear();

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
    const year = options.year || new Date().getFullYear();
    const centered = Boolean(options.centerOnCurrentWeek);
    const weeks = buildTimelineWeeks({ year, centered });
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
      prevButton.disabled = centered;
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

      weeks.forEach(({ monday }) => {
        const weekStart = new Date(monday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.dataset.monday = formatIsoDate(weekStart);

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

    const rows = [];
    rows.push({ label: 'Project', startDate: projectStart, endDate: projectEnd, type: 'project' });

    const merged = [...selectedProjectAssignments];

    merged.forEach((member) => {
      const consultant = findConsultantById(member.consultantId);
      rows.push({
        label: consultant ? `${consultant.name} (${member.projectRole || 'Member'})` : `Consultant ${member.consultantId}`,
        startDate: parseIsoDate(member.startDate) || projectStart,
        endDate: parseIsoDate(member.endDate) || projectEnd,
        consultant,
        consultantId: member.consultantId,
        type: 'member'
      });
    });

    rows.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'availability-row';
      row.style.gridTemplateColumns = columns;

      const name = document.createElement('div');
      name.className = 'availability-name';
      name.textContent = item.label;
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
        if (item.startDate) cell.dataset.assignmentStart = formatIsoDate(item.startDate);
        if (item.endDate) cell.dataset.assignmentEnd = formatIsoDate(item.endDate);
        const inAssignmentRange = item.startDate && item.endDate && item.startDate <= weekEnd && item.endDate >= weekStart;
        if (inAssignmentRange) {
          if (item.type === 'project') {
            cell.classList.add('project-range');
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
        row.appendChild(cell);
      });

      container.appendChild(row);
    });
  };

  const refreshProjectTimeline = async () => {
    const centerOnCurrentWeek = Boolean(ui.centerCurrentWeekToggle?.checked);
    await preloadHolidayDataForConsultants(selectedProjectTimelineYear);
    drawProjectTimeline(ui.projectTimelineChart, { year: selectedProjectTimelineYear, centerOnCurrentWeek });
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

  const renderProjectWeekDetail = (weekMondayIso, consultantId, rowType) => {
    if (!ui.projectWeekDetailCard || !ui.projectWeekDetailTimeline || !ui.projectWeekDetailTitle) return;
    if (!weekMondayIso) {
      ui.projectWeekDetailCard.hidden = true;
      ui.projectWeekDetailTimeline.innerHTML = '';
      return;
    }

    const start = parseIsoDate(weekMondayIso);
    if (!start) return;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    ui.projectWeekDetailTitle.textContent = `Project Week Detail (${formatDate(start)} - ${formatDate(end)})`;
    ui.projectWeekDetailTimeline.innerHTML = '';

    const consultant = consultantId ? findConsultantById(Number(consultantId)) : null;
    const selectedMember = consultantId ? selectedProjectAssignments.find((item) => Number(item.consultantId) === Number(consultantId)) : null;
    const assignmentStart = parseIsoDate(selectedMember?.startDate || '');
    const assignmentEnd = parseIsoDate(selectedMember?.endDate || '');
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
        status.textContent = statusParts.join(' • ');
      } else if (isWeekend) {
        cell.classList.add('weekend-default-off');
        status.textContent = 'Not Available';
      } else {
        status.textContent = 'Project Active';
      }

      cell.append(name, date, status);
      ui.projectWeekDetailTimeline.appendChild(cell);
    });

    ui.projectWeekDetailCard.hidden = false;
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

    allMembers.forEach((member) => {
      const consultant = findConsultantById(member.consultantId);
      const wrapper = document.createElement('div');
      wrapper.className = 'member-card';
      wrapper.innerHTML = `
        <div class="member-header">
          <div>
            <strong>${consultant?.name || 'Unknown Consultant'}</strong>
            <div class="member-meta">Project Role: ${member.projectRole || '—'}</div>
            <div class="member-meta">Dates: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}</div>
            <div class="member-meta">Allocation: ${Number(member.allocation ?? 100)}%</div>
            <div class="member-meta">Comments: ${member.comments || '—'}</div>
          </div>
          <div>
            <button class="btn-flat teal-text" data-action="view-member" data-id="${member.consultantId}"><i class="material-icons tiny">visibility</i></button>
            <button class="btn-flat blue-text" data-action="edit-member" data-id="${member.consultantId}"><i class="material-icons tiny">edit</i></button><button class="btn-flat red-text" data-action="remove-member" data-id="${member.consultantId}"><i class="material-icons tiny">delete</i></button>
          </div>
        </div>
      `;
      ui.projectMembersList.appendChild(wrapper);
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
        <td>${formatSalary(consultant.salary)}</td>
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
    ui.openDaysOffModalBtn.disabled = readOnly;
    if (ui.openHolidaysModalBtn) ui.openHolidaysModalBtn.disabled = readOnly;
    [fields.consultantName, fields.consultantAreaIds, fields.consultantCompanyRoleId, fields.consultantSalary].forEach((el) => {
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
    selectedProjectTimelineYear = new Date().getFullYear();
    refreshProjectTimeline();
    renderProjectWeekDetail('', '', '');
    showProjectsPanel();
    updateTextFields();
  };

  const resetConsultantForm = () => {
    ui.consultantForm.reset();
    fields.consultantId.value = '';
    rebuildConsultantSelects();
    rebuildHolidayCountryRegionControls();
    setConsultantFormMode('edit');
    drawTimeline(ui.consultantAvailabilityChart, [], { year: selectedTimelineYear, centerOnCurrentWeek: Boolean(ui.centerCurrentWeekToggle?.checked), showAllocationStatus: true, enableMonthClick: true });
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
    drawTimeline(ui.consultantAvailabilityChart, consultant ? [consultant] : [], { year: selectedTimelineYear, centerOnCurrentWeek, showAllocationStatus: true, enableMonthClick: true });
  };

  const loadAll = async () => {
    const [projectsRes, consultantsRes, rolesRes, areasRes, dayOffTypesRes, holidayLocationsRes] = await Promise.all([
      request('/api/projects'),
      request('/api/consultants'),
      request('/api/roles'),
      request('/api/areas'),
      request('/api/day-off-types'),
      request('/api/holiday-locations')
    ]);

    projects = projectsRes.projects || [];
    consultants = consultantsRes.consultants || [];
    roles = rolesRes.roles || [];
    areas = areasRes.areas || [];
    dayOffTypes = dayOffTypesRes.dayOffTypes || [];
    holidayLocations = holidayLocationsRes.holidayLocations || [];

    renderProjects();
    renderConsultants();
    renderAdminLists();
    await refreshTimelines();
    rebuildProjectSelects({ managerId: fields.managerId.value });
    rebuildConsultantSelects({ areaIds: selectedIds(fields.consultantAreaIds), companyRoleId: fields.consultantCompanyRoleId.value, holidayLocationId: fields.consultantHolidayLocationId.value });
    rebuildHolidayCountryRegionControls({ consultantHolidayLocationId: fields.consultantHolidayLocationId.value });
    rebuildAssignmentModalSelects();
    rebuildDayOffTypeSelect();
  };

  ui.showProjectFormBtn.addEventListener('click', () => { resetProjectForm(); showManageProjectPanel(); });
  ui.backToProjectsBtn.addEventListener('click', showProjectsPanel);
  fields.startDate.addEventListener('change', updateProjectMembersPanel);
  fields.endDate.addEventListener('change', updateProjectMembersPanel);

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
        const payload = {
          projectName: fields.projectName.value.trim(),
          clientName: fields.clientName.value.trim(),
          projectType: fields.projectType.value,
          managerConsultantId: managerConsultantIdFromAssignments(),
          clientContact: fields.clientContact.value.trim(),
          startDate: fields.startDate.value,
          endDate: fields.endDate.value,
          consultantAssignments: selectedProjectAssignments
        };
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
          const payload = {
            projectName: fields.projectName.value.trim(),
            clientName: fields.clientName.value.trim(),
            projectType: fields.projectType.value,
            managerConsultantId: managerConsultantIdFromAssignments(),
            clientContact: fields.clientContact.value.trim(),
            startDate: fields.startDate.value,
            endDate: fields.endDate.value,
            consultantAssignments: selectedProjectAssignments
          };
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
        const payload = {
          projectName: fields.projectName.value.trim(),
          clientName: fields.clientName.value.trim(),
          projectType: fields.projectType.value,
          managerConsultantId: managerConsultantIdFromAssignments(),
          clientContact: fields.clientContact.value.trim(),
          startDate: fields.startDate.value,
          endDate: fields.endDate.value,
          consultantAssignments: selectedProjectAssignments
        };
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

    const payload = {
      projectName: fields.projectName.value.trim(),
      clientName: fields.clientName.value.trim(),
      projectType: fields.projectType.value,
      managerConsultantId: managerConsultantIdFromAssignments(),
      clientContact: fields.clientContact.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      consultantAssignments: selectedProjectAssignments
    };

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
      areaIds: selectedIds(fields.consultantAreaIds),
      companyRoleId: Number(fields.consultantCompanyRoleId.value),
      salary: fields.consultantSalary.value,
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

    selectedProjectTimelineYear = (parseIsoDate(project.startDate)?.getFullYear()) || new Date().getFullYear();
    updateAssignedConsultantsSummary();
    rebuildProjectSelects({ managerId: project.managerConsultantId });
    setProjectFormMode(button.dataset.action === 'view-project' ? 'view' : 'edit');
    showManageProjectPanel();
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

  ui.availabilityChart.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (ui.centerCurrentWeekToggle?.checked) return;

    if (button.dataset.action === 'prev-year') selectedTimelineYear -= 1;
    if (button.dataset.action === 'next-year') selectedTimelineYear += 1;
    await refreshTimelines();
  });

  ui.centerCurrentWeekToggle?.addEventListener('change', () => { refreshTimelines(); refreshProjectTimeline(); });



  ui.consultantAvailabilityChart.addEventListener('click', (event) => {
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

    const weekCell = event.target.closest('.week-cell');
    if (!weekCell) return;
    renderProjectWeekDetail(weekCell.dataset.monday, weekCell.dataset.consultantId, weekCell.dataset.rowType);
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
    modals.holidayLoad = M.Modal.init(ui.holidayLoadModal);
  }

  setSection('projects');
  resetProjectForm();
  resetConsultantForm();
  loadAll().catch((error) => toast(error.message || 'Unable to load data', 'red darken-1'));
}
