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
    'business-partners': document.getElementById('business-partners-section'),
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
    projectMainColumn: document.getElementById('project-main-column'),
    showProjectFormBtn: document.getElementById('show-project-form-btn'),
    projectFormCard: document.getElementById('project-form-card'),
    projectForm: document.getElementById('project-form'),
    projectFormTitle: document.getElementById('project-form-title'),
    projectFormBasicHeader: document.getElementById('project-form-basic-header'),
    projectSummaryHeader: document.getElementById('project-summary-header'),
    projectSummaryName: document.getElementById('project-summary-name'),
    projectSummaryClient: document.getElementById('project-summary-client'),
    projectSummaryStatus: document.getElementById('project-summary-status'),
    projectWorkspaceTabs: document.getElementById('project-workspace-tabs'),
    projectWorkspaceContent: document.getElementById('project-workspace-content'),
    projectWorkspacePanels: document.querySelectorAll('[data-workspace-panel]'),
    projectMembersColumn: document.getElementById('project-members-column'),
    projectTeamTabHost: document.getElementById('project-team-tab-host'),
    projectTimelineTabHost: document.getElementById('project-timeline-tab-host'),
    projectUploadFileBtn: document.getElementById('project-upload-file-btn'),
    projectFileUploadInput: document.getElementById('project-file-upload-input'),
    projectFilesBody: document.getElementById('project-files-body'),
    projectFilesEmptyState: document.getElementById('project-files-empty-state'),
    projectSaveBtnHeader: document.getElementById('project-save-btn-header'),
    projectSwitchEditBtnHeader: document.getElementById('project-switch-edit-btn-header'),
    projectSwitchViewBtnHeader: document.getElementById('project-switch-view-btn-header'),
    projectSaveBtn: document.getElementById('project-save-btn'),
    projectSwitchEditBtn: document.getElementById('project-switch-edit-btn'),
    backToProjectsBtn: document.getElementById('back-to-projects-btn'),
    projectSummaryBackBtn: document.getElementById('project-summary-back-btn'),
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
    memberBillableModal: document.getElementById('member-billable-modal'),
    consultantPickerList: document.getElementById('consultant-picker-list'),
    saveConsultantAssignmentsBtn: document.getElementById('save-consultant-assignments-btn'),

    memberDetailsModal: document.getElementById('member-details-modal'),
    memberModalTitle: document.getElementById('member-modal-title'),
    memberEditConsultantId: document.getElementById('member-edit-consultant-id'),
    memberNameModal: document.getElementById('member-name-modal'),
    memberProjectRoleModal: document.getElementById('member-project-role-modal'),
    memberAllocationEdit: document.getElementById('member-allocation-edit'),
    memberBillableEdit: document.getElementById('member-billable-edit'),
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
    businessPartnersPanelCard: document.getElementById('business-partners-panel-card'),
    businessPartnersBody: document.getElementById('business-partners-body'),
    businessPartnersEmptyState: document.getElementById('business-partners-empty-state'),
    showBusinessPartnerFormBtn: document.getElementById('show-business-partner-form-btn'),
    businessPartnerFormCard: document.getElementById('business-partner-form-card'),
    businessPartnerForm: document.getElementById('business-partner-form'),
    businessPartnerFormTitle: document.getElementById('business-partner-form-title'),
    backToBusinessPartnersBtn: document.getElementById('back-to-business-partners-btn'),
    businessPartnerSaveBtn: document.getElementById('business-partner-save-btn'),
    addBusinessPartnerContactBtn: document.getElementById('add-business-partner-contact-btn'),
    businessPartnerContactsList: document.getElementById('business-partner-contacts-list'),
    bpAddressToggleBtn: document.getElementById('bp-address-toggle-btn'),
    bpContactsToggleBtn: document.getElementById('bp-contacts-toggle-btn'),
    bpProjectsToggleBtn: document.getElementById('bp-projects-toggle-btn'),
    bpAddressToggleIcon: document.getElementById('bp-address-toggle-icon'),
    bpContactsToggleIcon: document.getElementById('bp-contacts-toggle-icon'),
    bpProjectsToggleIcon: document.getElementById('bp-projects-toggle-icon'),
    bpAddressContent: document.getElementById('bp-address-content'),
    bpContactsContent: document.getElementById('bp-contacts-content'),
    bpProjectsContent: document.getElementById('bp-projects-content'),
    businessPartnerProjectsBody: document.getElementById('business-partner-projects-body'),
    businessPartnerProjectsEmptyState: document.getElementById('business-partner-projects-empty-state'),
    businessPartnerCommunicationModal: document.getElementById('business-partner-communication-modal'),
    communicationModalContactName: document.getElementById('communication-modal-contact-name'),
    communicationEmailsList: document.getElementById('communication-emails-list'),
    communicationPhonesList: document.getElementById('communication-phones-list'),
    addCommunicationEmailBtn: document.getElementById('add-communication-email-btn'),
    addCommunicationPhoneBtn: document.getElementById('add-communication-phone-btn'),
    saveCommunicationBtn: document.getElementById('save-communication-btn'),

    daysOffModal: document.getElementById('days-off-modal'),
    holidayLoadModal: document.getElementById('holiday-load-modal'),
    manualLineModal: document.getElementById('manual-line-modal'),
    availabilityType: document.getElementById('availability-type'),
    availabilityStartDate: document.getElementById('availability-start-date'),
    availabilityEndDate: document.getElementById('availability-end-date'),
    saveAvailabilityBtn: document.getElementById('save-availability-btn'),

    roleForm: document.getElementById('role-form'),
    areaForm: document.getElementById('area-form'),
    dayOffTypeForm: document.getElementById('day-off-type-form'),
    businessPartnerTypeForm: document.getElementById('business-partner-type-form'),
    projectTypeForm: document.getElementById('project-type-form'),
    rolesList: document.getElementById('roles-list'),
    areasList: document.getElementById('areas-list'),
    dayOffTypesList: document.getElementById('day-off-types-list'),
    businessPartnerTypesList: document.getElementById('business-partner-types-list'),
    projectTypesList: document.getElementById('project-types-list'),
    timeTrackingListCard: document.getElementById('time-tracking-list-card'),
    timeTrackingConsultantSelect: document.getElementById('time-tracking-consultant-select'),
    loadTimesheetsBtn: document.getElementById('load-timesheets-btn'),
    timesheetMonthCount: document.getElementById('timesheet-month-count'),
    timesheetToggleOlderBtn: document.getElementById('timesheet-toggle-older-btn'),
    timesheetsEmptyState: document.getElementById('timesheets-empty-state'),
    timesheetMonthList: document.getElementById('timesheet-month-list'),
    timesheetDetailCard: document.getElementById('timesheet-detail-card'),
    timesheetDetailTitle: document.getElementById('timesheet-detail-title'),
    backToTimesheetsBtn: document.getElementById('back-to-timesheets-btn'),
    timesheetPrevWeekBtn: document.getElementById('timesheet-prev-week-btn'),
    timesheetNextWeekBtn: document.getElementById('timesheet-next-week-btn'),
    timesheetWeekLabel: document.getElementById('timesheet-week-label'),
    addManualTimesheetLineBtn: document.getElementById('add-manual-timesheet-line-btn'),
    timesheetSummaryWrap: document.getElementById('timesheet-summary-wrap'),
    timesheetSummaryStatus: document.getElementById('timesheet-summary-status'),
    timesheetPrintBtn: document.getElementById('timesheet-print-btn'),
    manualLineDayOffTypeSelect: document.getElementById('manual-line-day-off-type-select'),
    confirmManualLineBtn: document.getElementById('confirm-manual-line-btn'),
    timesheetSaveDraftBtn: document.getElementById('timesheet-save-draft-btn'),
    timesheetSaveCompletedBtn: document.getElementById('timesheet-save-completed-btn'),
    timesheetReopenBtn: document.getElementById('timesheet-reopen-btn'),
    timesheetTableWrap: document.getElementById('timesheet-table-wrap'),

    weekTooltip: document.getElementById('week-tooltip')
  };

  const fields = {
    projectId: document.getElementById('project-id'),
    projectName: document.getElementById('project-name'),
    clientName: document.getElementById('client-name'),
    projectType: document.getElementById('project-type'),
    managerId: document.getElementById('manager-consultant-id'),
    projectStatus: document.getElementById('project-status'),
    clientBusinessPartnerId: document.getElementById('client-business-partner-id'),
    clientContactIds: document.getElementById('client-contact-ids'),
    deliveryPartnerBusinessPartnerId: document.getElementById('delivery-partner-business-partner-id'),
    deliveryPartnerContactIds: document.getElementById('delivery-partner-contact-ids'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),

    consultantId: document.getElementById('consultant-id'),
    consultantName: document.getElementById('consultant-name'),
    consultantStartDate: document.getElementById('consultant-start-date'),
    consultantAreaIds: document.getElementById('consultant-area-ids'),
    consultantCompanyRoleId: document.getElementById('consultant-company-role-id'),
    consultantSalary: document.getElementById('consultant-salary'),
    consultantHolidayLocationId: document.getElementById('consultant-holiday-location-id'),

    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name'),
    dayOffTypeName: document.getElementById('day-off-type-name'),
    businessPartnerTypeName: document.getElementById('business-partner-type-name'),
    projectTypeName: document.getElementById('project-type-name'),
    businessPartnerId: document.getElementById('business-partner-id'),
    businessPartnerCompanyName: document.getElementById('business-partner-company-name'),
    businessPartnerTypeId: document.getElementById('business-partner-type-id'),
    businessPartnerAddressStreet: document.getElementById('business-partner-address-street'),
    businessPartnerAddressNumber: document.getElementById('business-partner-address-number'),
    businessPartnerPostalCode: document.getElementById('business-partner-postal-code'),
    businessPartnerCity: document.getElementById('business-partner-city'),
    businessPartnerRegion: document.getElementById('business-partner-region'),
    businessPartnerCountry: document.getElementById('business-partner-country')
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
  let businessPartnerTypes = [];
  let projectTypes = [];
  let businessPartners = [];
  let editingBusinessPartnerContacts = [];
  let editingCommunicationContactIndex = -1;
  let editingCommunicationDraft = { emails: [], phoneNumbers: [] };
  let businessPartnerAddressExpanded = false;
  let businessPartnerContactsExpanded = false;
  let businessPartnerProjectsExpanded = false;
  let businessPartnerViewMode = 'edit';
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
  let activeProjectWorkspaceTab = 'overview';
  let projectFiles = [];
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
  let timeTrackingConsultants = [];
  let hasRequestedTimesheetLoad = false;
  let visibleOlderTimesheetCount = 0;
  const projectMembersDefaultParent = ui.projectMembersCard?.parentElement;
  const projectTimelineDefaultParent = ui.projectTimelinePanel?.parentElement;

  const fallbackHolidayCountries = ['AD', 'AT', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'MX', 'NL', 'NO', 'PL', 'PT', 'SE', 'US'];
  const countryNamesByCode = {
    AD: 'Andorra', AT: 'Austria', BE: 'Belgium', CA: 'Canada', CH: 'Switzerland', DE: 'Germany', DK: 'Denmark',
    ES: 'Spain', FI: 'Finland', FR: 'France', GB: 'United Kingdom', IE: 'Ireland', IT: 'Italy', MX: 'Mexico',
    NL: 'Netherlands', NO: 'Norway', PL: 'Poland', PT: 'Portugal', SE: 'Sweden', US: 'United States'
  };
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

  const uploadProjectFile = async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const upload = async (baseUrl) => fetch(`${baseUrl}/api/projects/${projectId}/files`, { method: 'POST', body: formData });
    let response;
    try {
      response = await upload(primaryApiBase);
    } catch (error) {
      if (!(error instanceof TypeError) || primaryApiBase === fallbackApiBase) throw error;
      response = await upload(fallbackApiBase);
      window.localStorage.setItem('vpmApiOrigin', fallbackApiBase);
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(payload.error || 'Upload failed');
    }
    return response.json();
  };

  const formatFileSize = (sizeBytes) => {
    const value = Number(sizeBytes || 0);
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    if (value < 1024) return `${value} B`;
    const kb = value / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
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
    clientBusinessPartnerId: fields.clientBusinessPartnerId.value ? Number(fields.clientBusinessPartnerId.value) : null,
    clientContactIds: selectedIds(fields.clientContactIds),
    deliveryPartnerBusinessPartnerId: fields.deliveryPartnerBusinessPartnerId.value ? Number(fields.deliveryPartnerBusinessPartnerId.value) : null,
    deliveryPartnerContactIds: selectedIds(fields.deliveryPartnerContactIds),
    projectType: fields.projectType.value,
    projectStatus: fields.projectStatus?.value || 'Not Started',
    managerConsultantId: managerConsultantIdFromAssignments(),
    startDate: fields.startDate.value,
    endDate: fields.endDate.value,
    consultantAssignments: selectedProjectAssignments,
    projectPhases: selectedProjectPhases,
    projectMilestones: selectedProjectMilestones
  });

  const movePanelToHost = (element, host) => {
    if (!element || !host || element.parentElement === host) return;
    host.appendChild(element);
  };

  const renderProjectFiles = () => {
    if (!ui.projectFilesBody) return;
    ui.projectFilesBody.innerHTML = '';
    if (!projectFiles.length) {
      if (ui.projectFilesEmptyState) ui.projectFilesEmptyState.hidden = false;
      return;
    }
    if (ui.projectFilesEmptyState) ui.projectFilesEmptyState.hidden = true;
    projectFiles.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.originalFilename}</td>
        <td>${formatFileSize(item.fileSize)}</td>
        <td>${formatDate(item.uploadedAt)}</td>
        <td><button class="btn-flat blue-text" type="button" data-action="download-project-file" data-id="${item.id}"><i class="material-icons tiny">download</i></button></td>
      `;
      ui.projectFilesBody.appendChild(row);
    });
  };

  const loadProjectFiles = async (projectId) => {
    if (!projectId) {
      projectFiles = [];
      renderProjectFiles();
      return;
    }
    const payload = await request(`/api/projects/${projectId}/files`);
    projectFiles = payload?.files || [];
    renderProjectFiles();
  };

  const updateProjectWorkspaceUi = (context = 'updateProjectWorkspaceUi') => {
    const isSavedProject = Boolean(fields.projectId.value);
    const manageProjectOpen = !ui.projectFormCard.hidden;
    if (!isSavedProject) activeProjectWorkspaceTab = 'overview';
    if (ui.projectWorkspaceTabs) ui.projectWorkspaceTabs.hidden = !isSavedProject || !manageProjectOpen;

    const activeTab = isSavedProject ? activeProjectWorkspaceTab : 'overview';
    const isOverviewTab = activeTab === 'overview';
    const isTeamTab = isSavedProject && activeTab === 'team';
    const isTimelineTab = isSavedProject && activeTab === 'timeline';
    const showProjectsList = !ui.projectsPanelCard.hidden;
    const useWideMainColumn = showProjectsList || isTimelineTab;
    document.body.classList.toggle('workspace-timeline-wide', isTimelineTab);
    if (ui.projectMainColumn) {
      ui.projectMainColumn.classList.toggle('l8', !useWideMainColumn);
      ui.projectMainColumn.classList.toggle('l12', useWideMainColumn);
    }
    ui.projectWorkspaceTabs?.querySelectorAll('[data-workspace-tab]').forEach((tabButton) => {
      tabButton.classList.toggle('active', tabButton.dataset.workspaceTab === activeTab);
    });
    ui.projectWorkspacePanels?.forEach((panel) => {
      const panelTab = panel.dataset.workspacePanel;
      const shouldShow = isSavedProject ? panelTab === activeTab : panelTab === 'overview';
      panel.hidden = !shouldShow;
    });

    document.body.classList.toggle('workspace-timeline-tab-active', isTimelineTab);
    if (isTeamTab) movePanelToHost(ui.projectMembersCard, ui.projectTeamTabHost);
    else movePanelToHost(ui.projectMembersCard, projectMembersDefaultParent);

    if (isTimelineTab) {
      movePanelToHost(ui.projectTimelinePanel, ui.projectTimelineTabHost);
      if (!isProjectTimelineExpanded) {
        isProjectTimelineExpanded = true;
        updateProjectTimelineExpandUi();
      }
      refreshProjectTimeline();
    } else {
      movePanelToHost(ui.projectTimelinePanel, projectTimelineDefaultParent);
      if (isProjectTimelineExpanded) collapseProjectTimeline();
    }

    if (ui.projectMembersColumn) ui.projectMembersColumn.hidden = !manageProjectOpen || !isOverviewTab;
    if (ui.projectMembersCard) ui.projectMembersCard.hidden = !manageProjectOpen || (!isOverviewTab && !isTeamTab);
    console.debug(`[projectWorkspace] context=${context} saved=${isSavedProject} activeTab=${activeTab} overviewTab=${isOverviewTab} teamMain=${isTeamTab} timelineMain=${isTimelineTab}`);
  };

  const statusClassByValue = (status) => ({
    'Not Started': 'status-not-started',
    'In Progress': 'status-in-progress',
    Delayed: 'status-delayed',
    Completed: 'status-completed'
  }[status] || 'status-not-started');

  const deriveProjectDisplayStatus = () => {
    const today = new Date();
    const projectStart = fields.startDate.value ? new Date(`${fields.startDate.value}T00:00:00`) : null;
    if (projectStart && projectStart > today) return 'Not Started';
    const phases = (selectedProjectPhases || []).filter((item) => item.startDate && item.endDate);
    if (phases.length) {
      const parsed = phases.map((phase) => ({
        start: new Date(`${phase.startDate}T00:00:00`),
        end: new Date(`${phase.endDate}T00:00:00`)
      }));
      if (parsed.every((phase) => phase.end < today)) return 'Completed';
      if (parsed.some((phase) => phase.start <= today && phase.end >= today)) return 'In Progress';
      return 'Not Started';
    }
    return fields.projectStatus?.value || 'Not Started';
  };

  const updateProjectStatusUi = () => {
    const hasPhases = (selectedProjectPhases || []).length > 0;
    const statusWrap = document.getElementById('project-status-field-wrap');
    if (statusWrap) statusWrap.hidden = hasPhases;
    if (fields.projectStatus) fields.projectStatus.disabled = hasPhases || projectViewMode === 'view';
    if (fields.projectStatus) resetSelect('projectStatus', fields.projectStatus);
    const displayStatus = deriveProjectDisplayStatus();
    if (ui.projectSummaryStatus) {
      ui.projectSummaryStatus.textContent = displayStatus;
      ui.projectSummaryStatus.className = `status-badge ${statusClassByValue(displayStatus)}`;
    }
  };

  const updateProjectSummaryHeader = () => {
    const isSavedProject = Boolean(fields.projectId.value);
    console.debug(`[updateProjectSummaryHeader] re-render header saved=${isSavedProject} mode=${projectViewMode}`);
    if (ui.projectFormCard) ui.projectFormCard.classList.toggle('saved-project-mode', isSavedProject);
    if (ui.projectFormBasicHeader) ui.projectFormBasicHeader.hidden = isSavedProject;
    if (ui.projectSummaryHeader) ui.projectSummaryHeader.hidden = !isSavedProject;
    if (ui.projectFormTitle) ui.projectFormTitle.hidden = isSavedProject;
    if (!isSavedProject) return;
    const client = findBusinessPartnerById(fields.clientBusinessPartnerId.value);
    if (ui.projectSummaryName) ui.projectSummaryName.textContent = fields.projectName.value || 'Project';
    if (ui.projectSummaryClient) ui.projectSummaryClient.textContent = client?.companyName || '—';
    updateProjectStatusUi();
  };

  const applyProjectModeUi = (context = 'applyProjectModeUi') => {
    const readOnly = projectViewMode === 'view';
    const isSavedProject = Boolean(fields.projectId.value);
    const summaryHeader = document.getElementById('project-summary-header');
    const headerSaveBtn = summaryHeader?.querySelector('#project-save-btn-header');
    const headerPenBtn = summaryHeader?.querySelector('#project-switch-edit-btn-header');
    const headerEyeBtn = summaryHeader?.querySelector('#project-switch-view-btn-header');
    const applyButtonVisibility = (el, visible) => {
      if (!el) return;
      el.hidden = !visible;
      el.style.display = visible ? '' : 'none';
    };
    ui.projectFormCard?.classList.toggle('form-mode-view', readOnly);
    ui.projectFormCard?.classList.toggle('form-mode-edit', !readOnly);

    ui.projectSaveBtn.hidden = readOnly;
    ui.projectSaveBtn.style.display = readOnly ? 'none' : '';
    if (ui.projectSwitchEditBtn) ui.projectSwitchEditBtn.hidden = !readOnly;
    applyButtonVisibility(headerSaveBtn, isSavedProject && !readOnly);
    applyButtonVisibility(headerPenBtn, isSavedProject && readOnly);
    applyButtonVisibility(headerEyeBtn, isSavedProject && !readOnly);

    [fields.projectName, fields.clientBusinessPartnerId, fields.clientContactIds, fields.projectType, fields.projectStatus, fields.deliveryPartnerBusinessPartnerId, fields.deliveryPartnerContactIds, fields.startDate, fields.endDate]
      .forEach((el) => { if (el) el.disabled = readOnly; });
    fields.managerId.disabled = true;

    resetSelect('manager', fields.managerId);
    resetSelect('clientBusinessPartner', fields.clientBusinessPartnerId);
    resetSelect('clientContacts', fields.clientContactIds);
    resetSelect('deliveryPartnerBusinessPartner', fields.deliveryPartnerBusinessPartnerId);
    resetSelect('deliveryPartnerContacts', fields.deliveryPartnerContactIds);
    resetSelect('projectType', fields.projectType);
    resetSelect('projectStatus', fields.projectStatus);

    console.debug(`[applyProjectModeUi] context=${context} mode=${projectViewMode} saved=${isSavedProject} refs(save=${Boolean(headerSaveBtn)} pen=${Boolean(headerPenBtn)} eye=${Boolean(headerEyeBtn)}) counts(save=${document.querySelectorAll('#project-save-btn-header').length} pen=${document.querySelectorAll('#project-switch-edit-btn-header').length} eye=${document.querySelectorAll('#project-switch-view-btn-header').length}) saveHidden=${headerSaveBtn?.hidden} saveDisplay=${headerSaveBtn?.style.display} penHidden=${headerPenBtn?.hidden} penDisplay=${headerPenBtn?.style.display} eyeHidden=${headerEyeBtn?.hidden} eyeDisplay=${headerEyeBtn?.style.display} nameDisabled=${fields.projectName.disabled} clientDisabled=${fields.clientBusinessPartnerId.disabled}`);
    updateProjectWorkspaceUi(`applyProjectModeUi:${context}`);
  };

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
    updateProjectStatusUi();
  };

  const findConsultantById = (id) => consultants.find((consultant) => Number(consultant.id) === Number(id));
  const findBusinessPartnerById = (id) => businessPartners.find((partner) => Number(partner.id) === Number(id));
  const businessPartnerTypeById = (id) => businessPartnerTypes.find((type) => Number(type.id) === Number(id));
  const businessPartnerTypeName = (id) => businessPartnerTypeById(id)?.name || '—';
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

  const weekOfMonthLabel = (monthStart, weekIndex) => {
    const monthWeeks = buildMonthWeeks(monthStart);
    if (!monthWeeks.length) return '';
    const safeIndex = Math.max(0, Math.min(weekIndex, monthWeeks.length - 1));
    return `Week ${safeIndex + 1}`;
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

  async function refreshTimeTrackingConsultantSelectFromApi() {
    const select = ui.timeTrackingConsultantSelect;
    if (!select) return;

    const candidateBases = [
      '',
      primaryApiBase,
      fallbackApiBase
    ].filter((value, index, arr) => arr.indexOf(value) === index);

    try {
      let data = null;
      let lastError = null;
      for (const base of candidateBases) {
        try {
          const url = base ? `${base}/api/consultants` : '/api/consultants';
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
          data = await response.json();
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!data) throw lastError || new Error('Unable to fetch consultants');

      timeTrackingConsultants = Array.isArray(data?.consultants) ? data.consultants : [];
      rebuildTimeTrackingConsultantSelect();
    } catch (error) {
      console.error('Failed loading consultants for time tracking:', error);
      timeTrackingConsultants = Array.isArray(consultants) ? consultants : [];
      rebuildTimeTrackingConsultantSelect();
    }
  }

  function rebuildTimeTrackingConsultantSelect() {
    const select = ui.timeTrackingConsultantSelect;
    if (!select) return;

    const current = Number(activeTimesheetConsultantId || 0);
    select.innerHTML = '<option value="">Select consultant...</option>';

    [...timeTrackingConsultants]
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      .forEach((consultant) => {
        select.add(
          new Option(consultant.name || `Consultant ${consultant.id}`, String(consultant.id))
        );
      });

    const exists = timeTrackingConsultants.some((item) => Number(item.id) === current);
    if (exists) {
      select.value = String(current);
      activeTimesheetConsultantId = current;
    } else {
      select.value = '';
      activeTimesheetConsultantId = 0;
      timesheetMonths = [];
      activeTimesheet = null;
      hasRequestedTimesheetLoad = false;
    }

    updateTimeTrackingListVisibility();
  }

  const updateTimeTrackingListVisibility = () => {
    const hasConsultant = Boolean(activeTimesheetConsultantId);
    const hasLoaded = Boolean(hasRequestedTimesheetLoad);
    if (ui.loadTimesheetsBtn) ui.loadTimesheetsBtn.hidden = !hasConsultant;
    if (ui.timesheetMonthCount) ui.timesheetMonthCount.hidden = true;
    if (ui.timesheetMonthList) ui.timesheetMonthList.hidden = !(hasConsultant && hasLoaded);
    if (ui.timesheetToggleOlderBtn && (!hasConsultant || !hasLoaded)) ui.timesheetToggleOlderBtn.hidden = true;
  };

  const normalizedTimesheetStatus = (status) => {
    const raw = String(status || '').trim().toLowerCase();
    if (raw === 'in progress') return { label: 'In Progress', className: 'timesheet-status-in-progress' };
    if (raw === 'completed') return { label: 'Completed', className: 'timesheet-status-completed' };
    return { label: 'Draft', className: 'timesheet-status-draft' };
  };

  const renderTimesheetMonths = () => {
    if (!ui.timesheetMonthList) return;
    ui.timesheetMonthList.innerHTML = '';
    const hasConsultantSelected = Boolean(activeTimesheetConsultantId);
    if (!hasConsultantSelected) {
      if (ui.timesheetMonthCount) ui.timesheetMonthCount.hidden = true;
      if (ui.timesheetToggleOlderBtn) ui.timesheetToggleOlderBtn.hidden = true;
      ui.timesheetsEmptyState.hidden = true;
      ui.timesheetsEmptyState.textContent = 'Select a consultant to load monthly timesheets.';
      updateTimeTrackingListVisibility();
      return;
    }
    if (!hasRequestedTimesheetLoad) {
      if (ui.timesheetMonthCount) ui.timesheetMonthCount.hidden = true;
      if (ui.timesheetToggleOlderBtn) ui.timesheetToggleOlderBtn.hidden = true;
      ui.timesheetsEmptyState.hidden = true;
      ui.timesheetsEmptyState.textContent = '';
      updateTimeTrackingListVisibility();
      return;
    }
    const sortedMonths = [...timesheetMonths].sort((a, b) => String(b.monthStart || '').localeCompare(String(a.monthStart || '')));
    const recentMonths = sortedMonths.slice(0, 2);
    const olderMonths = sortedMonths.slice(2);
    const visibleOlderMonths = olderMonths.slice(0, visibleOlderTimesheetCount);
    const visibleMonths = [...recentMonths, ...visibleOlderMonths];
    const hasMoreOlderMonths = olderMonths.length > visibleOlderMonths.length;

    if (ui.timesheetToggleOlderBtn) {
      const canShowToggle = Boolean(activeTimesheetConsultantId) && hasRequestedTimesheetLoad;
      ui.timesheetToggleOlderBtn.hidden = !canShowToggle || !hasMoreOlderMonths;
      ui.timesheetToggleOlderBtn.textContent = 'See older Timesheets';
    }

    const emptyMessage = hasMoreOlderMonths
      ? 'No timesheets for the current or previous month. Click "See older Timesheets" to view earlier months.'
      : 'No monthly timesheets found for the selected consultant.';
    ui.timesheetsEmptyState.hidden = Boolean(visibleMonths.length);
    ui.timesheetsEmptyState.textContent = emptyMessage;
    updateTimeTrackingListVisibility();
    visibleMonths.forEach((month) => {
      const status = normalizedTimesheetStatus(month.status);
      const row = document.createElement('div');
      row.className = `timesheet-month-row ${status.className}`;
      row.innerHTML = `<div class="timesheet-month-meta"><div class="timesheet-month-title">${month.label}</div><div class="grey-text">Status: ${status.label}</div></div><div class="timesheet-actions"><button class="btn" type="button" data-action="open">Open</button></div>`;
      row.querySelector('[data-action="open"]').addEventListener('click', async () => {
        await openMonthlyTimesheet(month.monthStart);
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

  const saveActiveTimesheetStatus = async (status) => {
    if (!activeTimesheet?.timesheetId) return;
    await request('/api/monthly-timesheets/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timesheetId: activeTimesheet.timesheetId, status })
    });
    activeTimesheet.status = status;
    timesheetMonths = timesheetMonths.map((month) => (
      Number(month.timesheetId) === Number(activeTimesheet.timesheetId)
        ? { ...month, status }
        : month
    ));
    refreshTimesheetDetailControls();
    toast(`Timesheet saved as ${status}`, 'teal darken-1');
  };

  const getTimesheetDisplayStatus = (status) => {
    const raw = String(status || '').trim().toLowerCase();
    if (raw === 'completed') return 'Completed';
    if (raw === 'in progress') return 'In Progress';
    return 'Draft';
  };

  const isTimesheetLocked = (status) => getTimesheetDisplayStatus(status) === 'Completed';

  const refreshTimesheetDetailControls = () => {
    const locked = isTimesheetLocked(activeTimesheet?.status);
    if (ui.timesheetSummaryStatus) ui.timesheetSummaryStatus.textContent = `• Status: ${getTimesheetDisplayStatus(activeTimesheet?.status)}`;
    if (ui.timesheetSaveDraftBtn) {
      ui.timesheetSaveDraftBtn.hidden = locked;
      ui.timesheetSaveDraftBtn.classList.toggle('timesheet-hidden', locked);
    }
    if (ui.timesheetSaveCompletedBtn) {
      ui.timesheetSaveCompletedBtn.hidden = locked;
      ui.timesheetSaveCompletedBtn.classList.toggle('timesheet-hidden', locked);
    }
    if (ui.timesheetReopenBtn) {
      ui.timesheetReopenBtn.hidden = !locked;
      ui.timesheetReopenBtn.classList.toggle('timesheet-hidden', !locked);
    }
    if (ui.addManualTimesheetLineBtn) ui.addManualTimesheetLineBtn.disabled = locked;
  };

  const timesheetLineDescription = (line) => {
    if (line.projectName) return line.projectName;
    if (!line.isManual) return line.activity || 'Time Off';
    return line.activity || 'Manual';
  };

  const lineTotalForDates = (line, dates) => dates.reduce((sum, dateIso) => sum + Number(line.entries?.[dateIso] || 0), 0);
  const lineMonthTotal = (line) => lineTotalForDates(line, Object.keys(line.entries || {}));

  const renderTimesheetSummary = () => {
    if (!ui.timesheetSummaryWrap || !activeTimesheet) return;
    const lines = activeTimesheet.lines || [];
    const table = document.createElement('table');
    table.className = 'striped responsive-table timesheet-summary-table';
    table.innerHTML = '<thead><tr><th>Description</th><th class="right-align">Total Hours</th></tr></thead>';
    const tbody = document.createElement('tbody');
    lines.forEach((line) => {
      const tr = document.createElement('tr');
      tr.dataset.lineId = String(line.id);
      tr.innerHTML = `<td>${timesheetLineDescription(line)}</td><td class="right-align" data-role="month-total">${lineMonthTotal(line).toFixed(1)}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    ui.timesheetSummaryWrap.innerHTML = '';
    ui.timesheetSummaryWrap.appendChild(table);
    refreshTimesheetDetailControls();
  };

  const updateTimesheetSummaryRowTotal = (line) => {
    if (!ui.timesheetSummaryWrap) return;
    const totalCell = ui.timesheetSummaryWrap.querySelector(`tr[data-line-id="${line.id}"] [data-role="month-total"]`);
    if (totalCell) totalCell.textContent = lineMonthTotal(line).toFixed(1);
  };

  const populateManualLineDayOffTypeSelect = () => {
    if (!ui.manualLineDayOffTypeSelect) return;
    const select = ui.manualLineDayOffTypeSelect;
    select.innerHTML = '<option value="">Select day off type...</option>';
    [...(dayOffTypes || [])]
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      .forEach((type) => {
        select.add(new Option(type.name, type.name));
      });
    select.value = '';
  };

  const printActiveTimesheet = () => {
    if (!activeTimesheet) return;
    const consultantName = findConsultantById(activeTimesheet.consultantId)?.name || 'Consultant';
    const title = `${consultantName} • ${monthLabel(activeTimesheet.monthStart)}`;
    const status = activeTimesheet.status || 'Draft';
    const monthWeeks = buildMonthWeeks(activeTimesheet.monthStart);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const lines = activeTimesheet.lines || [];
    const summaryRows = lines
      .map((line) => `<tr><td>${timesheetLineDescription(line)}</td><td>${lineMonthTotal(line).toFixed(1)}</td></tr>`)
      .join('');
    const weekSections = monthWeeks.map((weekDays, weekIndex) => {
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];
      const dayKeys = weekDays.map((day) => formatIsoDate(day));
      const headers = weekDays.map((day, idx) => `<th>${dayNames[idx]}<br>${day.getDate()}</th>`).join('');
      const rows = lines.map((line) => {
        const cells = dayKeys.map((key) => `<td>${Number(line.entries?.[key] || 0) ? Number(line.entries?.[key] || 0).toFixed(1) : ''}</td>`).join('');
        return `<tr><td>${timesheetLineDescription(line)}</td>${cells}<td>${lineTotalForDates(line, dayKeys).toFixed(1)}</td></tr>`;
      }).join('');
      return `
        <h3>Week ${weekIndex + 1}: ${formatDate(weekStart)} - ${formatDate(weekEnd)}</h3>
        <table>
          <thead><tr><th>Description</th>${headers}<th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }).join('');
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      toast('Please allow pop-ups to print the timesheet', 'orange darken-2');
      return;
    }
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #263238; }
        h1, h2, h3 { margin: 0 0 10px; }
        .meta { margin-bottom: 16px; color: #455a64; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        th, td { border: 1px solid #cfd8dc; padding: 6px 8px; text-align: left; font-size: 12px; }
        thead th { background: #eceff1; }
      </style></head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Status: ${status}</div>
        <h2>Month Summary</h2>
        <table><thead><tr><th>Description</th><th>Total Hours</th></tr></thead><tbody>${summaryRows}</tbody></table>
        <h2>Week Details</h2>
        ${weekSections}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderTimesheetWeek = () => {
    if (!activeTimesheet || !ui.timesheetTableWrap) return;
    const consultant = findConsultantById(activeTimesheet.consultantId);
    const locked = isTimesheetLocked(activeTimesheet.status);
    const monthWeeks = buildMonthWeeks(activeTimesheet.monthStart);
    const monthStartDate = parseIsoDate(activeTimesheet.monthStart);
    const currentWeek = monthWeeks[activeTimesheetWeekIndex] || [];
    const weekStart = currentWeek[0];
    const weekEnd = currentWeek[6];
    const detailMonthLabel = monthLabel(activeTimesheet.monthStart);
    const detailWeekLabel = weekOfMonthLabel(activeTimesheet.monthStart, activeTimesheetWeekIndex);
    if (ui.timesheetDetailTitle) {
      ui.timesheetDetailTitle.textContent = `${consultant?.name || 'Consultant'} • ${detailMonthLabel}${detailWeekLabel ? ` - ${detailWeekLabel}` : ''}`;
    }
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
      tr.dataset.lineId = String(line.id);
      const lineLabel = timesheetLineDescription(line);
      const activityInput = line.isManual ? `<input class="line-activity-input" type="text" value="${(line.activity || '').replace(/"/g, '&quot;')}" disabled/>` : (line.activity || '');
      tr.innerHTML = `<td><strong>${lineLabel}</strong>${line.isManual ? `<div>${activityInput}</div>` : ''}</td>`;
      let total = 0;
      currentWeek.forEach((day) => {
        const dayIso = formatIsoDate(day);
        const td = document.createElement('td');
        const context = dayContextForConsultant(consultant, day);
        const holiday = holidayByDateForConsultant(consultant, day);
        const inMonth = monthStartDate ? (day.getMonth() === monthStartDate.getMonth() && day.getFullYear() === monthStartDate.getFullYear()) : false;
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        if (inMonth && isWeekend) td.classList.add('timesheet-weekend');
        if (!inMonth) td.classList.add('timesheet-out-of-month');
        if (context.className && context.className !== 'context-weekend') td.classList.add(context.className);
        const value = Number(line.entries?.[dayIso] || 0);
        total += value;
        const holidayLabel = holiday?.name ? `<div class="timesheet-holiday-label">${holiday.name}</div>` : '';
        td.innerHTML = inMonth
          ? `<input class="timesheet-entry-input ${locked ? 'timesheet-entry-input--locked' : ''}" type="number" min="0" max="24" step="0.5" value="${value || ''}" ${locked ? 'disabled' : ''} />${holidayLabel}`
          : '<span class="grey-text">—</span>';
        if (locked && inMonth) td.classList.add('timesheet-locked-cell');
        const input = td.querySelector('input');
        if (input) {
          input.dataset.lineId = String(line.id);
          input.dataset.dayIso = dayIso;
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
              const updatedTotal = currentWeek.reduce((sum, weekDay) => sum + Number(line.entries?.[formatIsoDate(weekDay)] || 0), 0);
              const rowTotalCell = tr.querySelector('[data-role="week-total"]');
              if (rowTotalCell) rowTotalCell.textContent = updatedTotal.toFixed(1);
              updateTimesheetSummaryRowTotal(line);
            } catch (error) {
              toast(error.message || 'Failed to save hours', 'red darken-1');
            }
          });
        }
        tr.appendChild(td);
      });
      const totalCell = document.createElement('td');
      totalCell.dataset.role = 'week-total';
      totalCell.textContent = total.toFixed(1);
      tr.appendChild(totalCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    ui.timesheetTableWrap.innerHTML = '';
    ui.timesheetTableWrap.appendChild(table);
    renderTimesheetSummary();
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
      setTimeTrackingView({ showList: false });
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

  const rebuildProjectSelects = ({ managerId = '', projectType = '', clientBusinessPartnerId = '', clientContactIds = [], deliveryPartnerBusinessPartnerId = '', deliveryPartnerContactIds = [] } = {}) => {
    fields.managerId.innerHTML = '<option value="" disabled selected>Select a manager</option>';
    managerCandidates().forEach((consultant) => fields.managerId.add(new Option(consultant.name, consultant.id, false, Number(managerId) === Number(consultant.id))));

    const clientTypeId = businessPartnerTypes.find((type) => String(type.name || '').toLowerCase() === 'client')?.id;
    const thirdPartyTypeId = businessPartnerTypes.find((type) => String(type.name || '').toLowerCase() === 'third party')?.id;
    fields.clientBusinessPartnerId.innerHTML = '<option value="" selected>Select client</option>';
    businessPartners
      .filter((item) => !clientTypeId || Number(item.businessPartnerTypeId) === Number(clientTypeId))
      .forEach((item) => fields.clientBusinessPartnerId.add(new Option(item.companyName, item.id, false, Number(clientBusinessPartnerId) === Number(item.id))));

    fields.deliveryPartnerBusinessPartnerId.innerHTML = '<option value="" selected>No delivery partner</option>';
    businessPartners
      .filter((item) => !thirdPartyTypeId || Number(item.businessPartnerTypeId) === Number(thirdPartyTypeId))
      .forEach((item) => fields.deliveryPartnerBusinessPartnerId.add(new Option(item.companyName, item.id, false, Number(deliveryPartnerBusinessPartnerId) === Number(item.id))));

    const selectedClient = findBusinessPartnerById(clientBusinessPartnerId);
    fields.clientContactIds.innerHTML = '';
    (selectedClient?.contacts || []).forEach((contact) => {
      const label = `${contact.name || ''} ${contact.lastName || ''}`.trim() || contact.email || `Contact ${contact.id}`;
      fields.clientContactIds.add(new Option(label, contact.id, false, clientContactIds.map(Number).includes(Number(contact.id))));
    });

    const selectedDelivery = findBusinessPartnerById(deliveryPartnerBusinessPartnerId);
    fields.deliveryPartnerContactIds.innerHTML = '';
    (selectedDelivery?.contacts || []).forEach((contact) => {
      const label = `${contact.name || ''} ${contact.lastName || ''}`.trim() || contact.email || `Contact ${contact.id}`;
      fields.deliveryPartnerContactIds.add(new Option(label, contact.id, false, deliveryPartnerContactIds.map(Number).includes(Number(contact.id))));
    });

    fields.projectType.innerHTML = '<option value="" disabled>Select type</option>';
    projectTypes.forEach((type) => fields.projectType.add(new Option(type.name, type.name, false, String(projectType) === String(type.name))));
    if (projectType && !projectTypes.some((type) => String(type.name) === String(projectType))) {
      fields.projectType.add(new Option(`${projectType} (Legacy)`, projectType, false, true));
    }

    resetSelect('manager', fields.managerId);
    resetSelect('clientBusinessPartner', fields.clientBusinessPartnerId);
    resetSelect('clientContacts', fields.clientContactIds);
    resetSelect('deliveryPartnerBusinessPartner', fields.deliveryPartnerBusinessPartnerId);
    resetSelect('deliveryPartnerContacts', fields.deliveryPartnerContactIds);
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
      const roleLabel = member.projectRole || '—';
      const commentText = String(member.comments || '').trim();
      wrapper.innerHTML = `
        <div class="member-header">
          <div class="member-body">
            <div class="member-title-row">
              <strong>${consultant?.name || 'Unknown Consultant'}</strong>
              <span class="member-role-chip">${roleLabel}</span>
            </div>
            <div class="member-meta member-kpi-row"><span>Allocation: ${Number(member.allocation ?? 100)}%</span><span>Billable: ${member.billable === false ? 'No' : 'Yes'}</span></div>
            <div class="member-meta">Dates: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}</div>
            ${commentText ? `<div class="member-meta">Comments: ${commentText}</div>` : ''}
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
      const client = findBusinessPartnerById(project.clientBusinessPartnerId);
      const delivery = findBusinessPartnerById(project.deliveryPartnerBusinessPartnerId);
      row.innerHTML = `
        <td>${project.projectName}</td>
        <td>${client?.companyName || '—'}</td>
        <td>${consultantNameById(project.managerConsultantId)}</td>
        <td>${project.projectType || '—'}</td>
        <td>${(project.clientContacts || []).map((item) => `${item.name || ''} ${item.lastName || ''}`.trim() || item.email).filter(Boolean).join(', ') || '—'}</td>
        <td>${delivery?.companyName || '—'}</td>
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

    ui.businessPartnerTypesList.innerHTML = '';
    businessPartnerTypes.forEach((type) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${type.name}<button class="btn-flat secondary-content red-text" data-action="delete-business-partner-type" data-id="${type.id}"><i class="material-icons tiny">delete</i></button>`;
      ui.businessPartnerTypesList.appendChild(li);
    });

    ui.projectTypesList.innerHTML = '';
    projectTypes.forEach((type) => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `${type.name}<button class="btn-flat secondary-content red-text" data-action="delete-project-type" data-id="${type.id}"><i class="material-icons tiny">delete</i></button>`;
      ui.projectTypesList.appendChild(li);
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

  const showProjectsPanel = () => {
    collapseProjectTimeline();
    ui.projectsPanelCard.hidden = false;
    ui.projectFormCard.hidden = true;
    ui.projectMembersCard.hidden = true;
    if (ui.projectMembersColumn) ui.projectMembersColumn.hidden = true;
    updateProjectWorkspaceUi('showProjectsPanel');
  };
  const showManageProjectPanel = () => {
    ui.projectsPanelCard.hidden = true;
    ui.projectFormCard.hidden = false;
    ui.projectMembersCard.hidden = false;
    updateProjectWorkspaceUi('showManageProjectPanel');
  };
  const showConsultantsPanel = () => { ui.consultantsPanelCard.hidden = false; ui.consultantFormCard.hidden = true; };
  const showManageConsultantsPanel = () => { ui.consultantsPanelCard.hidden = true; ui.consultantFormCard.hidden = false; };
  const showBusinessPartnersPanel = () => { ui.businessPartnersPanelCard.hidden = false; ui.businessPartnerFormCard.hidden = true; };
  const showManageBusinessPartnerPanel = () => { ui.businessPartnersPanelCard.hidden = true; ui.businessPartnerFormCard.hidden = false; };

  const setBusinessPartnerFormMode = (mode) => {
    businessPartnerViewMode = mode;
    const readOnly = mode === 'view';
    ui.businessPartnerFormCard?.classList.toggle('form-mode-view', readOnly);
    ui.businessPartnerFormCard?.classList.toggle('form-mode-edit', !readOnly);
    [fields.businessPartnerCompanyName, fields.businessPartnerTypeId, fields.businessPartnerAddressStreet, fields.businessPartnerAddressNumber, fields.businessPartnerPostalCode, fields.businessPartnerCity, fields.businessPartnerRegion, fields.businessPartnerCountry]
      .forEach((el) => { if (el) el.disabled = readOnly; });
    if (ui.addBusinessPartnerContactBtn) ui.addBusinessPartnerContactBtn.hidden = readOnly;
    if (ui.businessPartnerSaveBtn) ui.businessPartnerSaveBtn.hidden = readOnly;
    resetSelect('businessPartnerType', fields.businessPartnerTypeId);
    resetSelect('businessPartnerCountry', fields.businessPartnerCountry);
    resetSelect('businessPartnerRegion', fields.businessPartnerRegion);
  };

  const renderBusinessPartnerContactsEditor = () => {
    if (!ui.businessPartnerContactsList) return;
    const readOnly = businessPartnerViewMode === 'view';
    ui.businessPartnerContactsList.innerHTML = '';
    if (!editingBusinessPartnerContacts.length) {
      ui.businessPartnerContactsList.innerHTML = '<p class="grey-text">No contact persons yet.</p>';
      return;
    }
    editingBusinessPartnerContacts.forEach((contact, index) => {
      const emails = (contact.emails || []).filter((item) => String(item || '').trim());
      const phones = (contact.phoneNumbers || []).filter((item) => String(item || '').trim());
      const summarize = (values, label) => {
        if (!values.length) return `${label}: —`;
        const [first, ...rest] = values;
        return `${label}: ${first}${rest.length ? ` (+${rest.length} more)` : ''}`;
      };
      const hasCommunication = emails.length || phones.length;
      const actionLabel = hasCommunication ? (readOnly ? 'Communication' : 'Edit Communication') : 'Add Communication';
      const card = document.createElement('div');
      card.className = 'member-card bp-contact-card';
      card.innerHTML = `
        <div class="row date-row">
          <div class="input-field col s12 m4"><input type="text" data-contact-index="${index}" data-field="name" value="${contact.name || ''}" ${readOnly ? 'disabled' : ''} /><label class="active">Name</label></div>
          <div class="input-field col s12 m4"><input type="text" data-contact-index="${index}" data-field="lastName" value="${contact.lastName || ''}" ${readOnly ? 'disabled' : ''} /><label class="active">Last Name</label></div>
          <div class="col s12 m3 bp-communication-summary">
            <div class="grey-text text-darken-1">${hasCommunication ? summarize(emails, 'Emails') : 'No communication details'}</div>
            <div class="grey-text text-darken-1">${hasCommunication ? summarize(phones, 'Phones') : ''}</div>
            <button class="btn-flat blue-text" type="button" data-action="open-communication" data-contact-index="${index}">${actionLabel}</button>
          </div>
          <div class="col s12 m1 right-align" style="margin-top:1.5rem;"><button class="btn-flat red-text ${readOnly ? 'timesheet-hidden' : ''}" type="button" data-action="remove-contact" data-contact-index="${index}"><i class="material-icons tiny">delete</i></button></div>
        </div>
      `;
      ui.businessPartnerContactsList.appendChild(card);
    });
  };

  const renderBusinessPartnerSections = () => {
    if (ui.bpAddressContent) ui.bpAddressContent.hidden = !businessPartnerAddressExpanded;
    if (ui.bpContactsContent) ui.bpContactsContent.hidden = !businessPartnerContactsExpanded;
    if (ui.bpProjectsContent) ui.bpProjectsContent.hidden = !businessPartnerProjectsExpanded;
    if (ui.bpAddressToggleIcon) ui.bpAddressToggleIcon.textContent = businessPartnerAddressExpanded ? 'expand_more' : 'chevron_right';
    if (ui.bpContactsToggleIcon) ui.bpContactsToggleIcon.textContent = businessPartnerContactsExpanded ? 'expand_more' : 'chevron_right';
    if (ui.bpProjectsToggleIcon) ui.bpProjectsToggleIcon.textContent = businessPartnerProjectsExpanded ? 'expand_more' : 'chevron_right';
  };

  const renderBusinessPartnerProjects = () => {
    if (!ui.businessPartnerProjectsBody || !ui.businessPartnerProjectsEmptyState) return;
    const businessPartnerId = Number(fields.businessPartnerId.value || 0);
    ui.businessPartnerProjectsBody.innerHTML = '';
    if (!businessPartnerId) {
      ui.businessPartnerProjectsEmptyState.hidden = false;
      return;
    }
    const relatedProjects = projects.filter((project) => Number(project.clientBusinessPartnerId) === businessPartnerId || Number(project.deliveryPartnerBusinessPartnerId) === businessPartnerId);
    relatedProjects.forEach((project) => {
      const client = findBusinessPartnerById(project.clientBusinessPartnerId);
      const delivery = findBusinessPartnerById(project.deliveryPartnerBusinessPartnerId);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.projectName || '—'}</td>
        <td>${client?.companyName || '—'}</td>
        <td>${consultantNameById(project.managerConsultantId)}</td>
        <td>${delivery?.companyName || '—'}</td>
        <td>${formatDate(project.startDate)}</td>
        <td>${formatDate(project.endDate)}</td>
      `;
      ui.businessPartnerProjectsBody.appendChild(row);
    });
    ui.businessPartnerProjectsEmptyState.hidden = relatedProjects.length > 0;
  };

  const renderCommunicationModalRows = () => {
    if (!ui.communicationEmailsList || !ui.communicationPhonesList) return;
    const readOnly = businessPartnerViewMode === 'view';
    const emails = editingCommunicationDraft.emails.length ? editingCommunicationDraft.emails : [''];
    const phones = editingCommunicationDraft.phoneNumbers.length ? editingCommunicationDraft.phoneNumbers : [''];
    ui.communicationEmailsList.innerHTML = emails.map((email, index) => `
      <div class="row date-row bp-comm-row">
        <div class="input-field col s10"><input type="email" data-comm-field="email" data-index="${index}" value="${email || ''}" ${readOnly ? 'disabled' : ''} /><label class="active">Email</label></div>
        <div class="col s2 right-align" style="margin-top:1.5rem;"><button class="btn-flat red-text ${readOnly ? 'timesheet-hidden' : ''}" type="button" data-action="remove-comm-email" data-index="${index}"><i class="material-icons tiny">remove_circle</i></button></div>
      </div>
    `).join('');
    ui.communicationPhonesList.innerHTML = phones.map((phone, index) => `
      <div class="row date-row bp-comm-row">
        <div class="input-field col s10"><input type="text" data-comm-field="phone" data-index="${index}" value="${phone || ''}" ${readOnly ? 'disabled' : ''} /><label class="active">Phone Number</label></div>
        <div class="col s2 right-align" style="margin-top:1.5rem;"><button class="btn-flat red-text ${readOnly ? 'timesheet-hidden' : ''}" type="button" data-action="remove-comm-phone" data-index="${index}"><i class="material-icons tiny">remove_circle</i></button></div>
      </div>
    `).join('');
    if (ui.addCommunicationEmailBtn) ui.addCommunicationEmailBtn.hidden = readOnly;
    if (ui.addCommunicationPhoneBtn) ui.addCommunicationPhoneBtn.hidden = readOnly;
    if (ui.saveCommunicationBtn) ui.saveCommunicationBtn.hidden = readOnly;
    updateTextFields();
  };

  const openCommunicationModalForContact = (contactIndex) => {
    const contact = editingBusinessPartnerContacts[contactIndex];
    if (!contact) return;
    editingCommunicationContactIndex = contactIndex;
    editingCommunicationDraft = {
      emails: [...(contact.emails || (contact.email ? [contact.email] : []))],
      phoneNumbers: [...(contact.phoneNumbers || [])]
    };
    if (ui.communicationModalContactName) {
      const label = `${contact.name || ''} ${contact.lastName || ''}`.trim();
      ui.communicationModalContactName.textContent = label || 'Contact';
    }
    renderCommunicationModalRows();
    modals.businessPartnerCommunication?.open();
  };

  const rebuildBusinessPartnerRegionSelect = ({ countryCode = '', regionValue = '' } = {}) => {
    const normalizedCountry = String(countryCode || '').toUpperCase();
    const regions = fallbackHolidayRegionsByCountry[normalizedCountry] || [];
    fields.businessPartnerRegion.innerHTML = '<option value="" selected>No region</option>';
    regions.forEach((region) => fields.businessPartnerRegion.add(new Option(region, region, false, String(region) === String(regionValue))));
    fields.businessPartnerRegion.disabled = !normalizedCountry || !regions.length;
    if (!regions.length) fields.businessPartnerRegion.value = '';
    resetSelect('businessPartnerRegion', fields.businessPartnerRegion);
  };

  const resetBusinessPartnerForm = () => {
    ui.businessPartnerForm?.reset();
    fields.businessPartnerId.value = '';
    editingBusinessPartnerContacts = [];
    const countryCodes = [...new Set([...(fallbackHolidayCountries || []), ...Object.keys(countryNamesByCode)])].sort();
    fields.businessPartnerCountry.innerHTML = '<option value="" selected>No country</option>';
    countryCodes.forEach((code) => fields.businessPartnerCountry.add(new Option(`${code} - ${countryNamesByCode[code] || code}`, code)));
    fields.businessPartnerRegion.innerHTML = '<option value="" selected>No region</option>';
    fields.businessPartnerRegion.disabled = true;
    fields.businessPartnerTypeId.innerHTML = '<option value="" selected>No type</option>';
    businessPartnerTypes.forEach((type) => fields.businessPartnerTypeId.add(new Option(type.name, type.id)));
    resetSelect('businessPartnerCountry', fields.businessPartnerCountry);
    resetSelect('businessPartnerRegion', fields.businessPartnerRegion);
    resetSelect('businessPartnerType', fields.businessPartnerTypeId);
    businessPartnerAddressExpanded = false;
    businessPartnerContactsExpanded = false;
    businessPartnerProjectsExpanded = false;
    renderBusinessPartnerSections();
    renderBusinessPartnerProjects();
    setBusinessPartnerFormMode('edit');
    renderBusinessPartnerContactsEditor();
    updateTextFields();
    showBusinessPartnersPanel();
  };

  const renderBusinessPartners = () => {
    ui.businessPartnersBody.innerHTML = '';
    businessPartners.forEach((partner) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${partner.companyName}</td>
        <td>${businessPartnerTypeName(partner.businessPartnerTypeId)}</td>
        <td>${partner.city || '—'}</td>
        <td>${partner.country || '—'}</td>
        <td>
          <button class="btn-flat teal-text" data-action="view-business-partner" data-id="${partner.id}"><i class="material-icons tiny">visibility</i></button>
          <button class="btn-flat blue-text" data-action="edit-business-partner" data-id="${partner.id}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text" data-action="delete-business-partner" data-id="${partner.id}"><i class="material-icons tiny">delete</i></button>
        </td>
      `;
      ui.businessPartnersBody.appendChild(row);
    });
    ui.businessPartnersEmptyState.hidden = businessPartners.length > 0;
  };

  const setTimeTrackingView = ({ showList }) => {
    if (ui.timeTrackingListCard) ui.timeTrackingListCard.hidden = !showList;
    if (ui.timesheetDetailCard) ui.timesheetDetailCard.hidden = showList;
  };

  const setProjectFormMode = (mode) => {
    projectViewMode = mode;
    const readOnly = mode === 'view';
    ui.projectFormTitle.textContent = readOnly ? 'Manage Project (View)' : 'Manage Project';
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
    updateProjectSummaryHeader();
    applyProjectModeUi('setProjectFormMode');
    updateProjectStatusUi();
    updateProjectMembersPanel();
  };

  const setConsultantFormMode = (mode) => {
    consultantViewMode = mode;
    const readOnly = mode === 'view';
    ui.consultantFormCard?.classList.toggle('form-mode-view', readOnly);
    ui.consultantFormCard?.classList.toggle('form-mode-edit', !readOnly);
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
      setTimeTrackingView({ showList: true });
      refreshTimeTrackingConsultantSelectFromApi().finally(() => {
        if (!activeTimesheetConsultantId) timesheetMonths = [];
        hasRequestedTimesheetLoad = false;
        renderTimesheetMonths();
      });
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
    if (fields.projectStatus) fields.projectStatus.value = 'Not Started';
    selectedProjectAssignments = [];
    selectedProjectPhases = [];
    selectedProjectMilestones = [];
    showProjectPhaseForm = false;
    showProjectMilestoneForm = false;
    editingProjectPhaseId = null;
    modalSelectedAreaId = '';
    modalTempConsultantIds = [];
    activeProjectWorkspaceTab = 'overview';
    projectFiles = [];
    renderProjectFiles();
    updateAssignedConsultantsSummary();
    rebuildProjectSelects();
    if (fields.projectStatus) resetSelect('projectStatus', fields.projectStatus);
    rebuildProjectPlanningSelects();
    setProjectFormMode('edit');
    updateProjectMembersPanel();
    selectedProjectTimelineYear = new Date().getFullYear();
    refreshProjectTimeline();
    renderProjectWeekDetail('', '', '');
    collapseProjectTimeline();
    updateProjectWorkspaceUi('resetProjectForm');
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
      { key: 'businessPartnerTypes', path: '/api/business-partner-types', prop: 'businessPartnerTypes', fallback: [] },
      { key: 'projectTypes', path: '/api/project-types', prop: 'projectTypes', fallback: [] },
      { key: 'businessPartners', path: '/api/business-partners', prop: 'businessPartners', fallback: [] },
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
    timeTrackingConsultants = loaded.consultants;
    roles = loaded.roles;
    areas = loaded.areas;
    dayOffTypes = loaded.dayOffTypes;
    businessPartnerTypes = loaded.businessPartnerTypes;
    projectTypes = loaded.projectTypes;
    businessPartners = loaded.businessPartners;
    holidayLocations = loaded.holidayLocations;
    allocationSimulations = loaded.allocationSimulations;

    renderProjects();
    renderConsultants();
    renderBusinessPartners();
    renderAdminLists();
    await refreshTimelines();
    rebuildProjectSelects({
      managerId: fields.managerId.value,
      projectType: fields.projectType.value,
      clientBusinessPartnerId: fields.clientBusinessPartnerId.value,
      clientContactIds: selectedIds(fields.clientContactIds),
      deliveryPartnerBusinessPartnerId: fields.deliveryPartnerBusinessPartnerId.value,
      deliveryPartnerContactIds: selectedIds(fields.deliveryPartnerContactIds)
    });
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
  ui.projectSummaryBackBtn?.addEventListener('click', showProjectsPanel);
  ui.projectWorkspaceTabs?.addEventListener('click', (event) => {
    const tabButton = event.target.closest('[data-workspace-tab]');
    if (!tabButton) return;
    activeProjectWorkspaceTab = tabButton.dataset.workspaceTab || 'overview';
    updateProjectWorkspaceUi('workspaceTabClick');
  });
  ui.projectUploadFileBtn?.addEventListener('click', () => {
    if (!fields.projectId.value) {
      toast('Save the project before uploading files', 'orange darken-2');
      return;
    }
    ui.projectFileUploadInput?.click();
  });
  ui.projectFileUploadInput?.addEventListener('change', async () => {
    const file = ui.projectFileUploadInput?.files?.[0];
    if (!file || !fields.projectId.value) return;
    try {
      await uploadProjectFile(fields.projectId.value, file);
      await loadProjectFiles(fields.projectId.value);
      toast('File uploaded', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to upload file', 'red darken-1');
    } finally {
      if (ui.projectFileUploadInput) ui.projectFileUploadInput.value = '';
    }
  });
  ui.projectFilesBody?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="download-project-file"]');
    if (!button || !fields.projectId.value) return;
    const fileId = Number(button.dataset.id);
    if (!fileId) return;
    window.location.href = `${primaryApiBase}/api/projects/${fields.projectId.value}/files/${fileId}/download`;
  });
  ui.projectSaveBtnHeader?.addEventListener('click', () => ui.projectForm.requestSubmit());
  ui.projectSwitchEditBtnHeader?.addEventListener('click', () => {
    console.debug('[ProjectMode:switchToEdit] from header pen');
    setProjectFormMode('edit');
    console.debug(`[switchToEdit] mode now ${projectViewMode}`);
  });
  ui.projectSwitchViewBtnHeader?.addEventListener('click', () => {
    console.debug('[ProjectMode:switchToView] from header eye');
    setProjectFormMode('view');
    console.debug(`[switchToView] mode now ${projectViewMode}`);
  });
  fields.startDate.addEventListener('change', updateProjectMembersPanel);
  fields.startDate.addEventListener('change', updateProjectStatusUi);
  fields.endDate.addEventListener('change', updateProjectMembersPanel);
  fields.endDate.addEventListener('change', updateProjectStatusUi);
  fields.clientBusinessPartnerId.addEventListener('change', () => {
    rebuildProjectSelects({
      managerId: fields.managerId.value,
      projectType: fields.projectType.value,
      clientBusinessPartnerId: fields.clientBusinessPartnerId.value,
      clientContactIds: [],
      deliveryPartnerBusinessPartnerId: fields.deliveryPartnerBusinessPartnerId.value,
      deliveryPartnerContactIds: selectedIds(fields.deliveryPartnerContactIds)
    });
    updateProjectSummaryHeader();
  });
  fields.deliveryPartnerBusinessPartnerId.addEventListener('change', () => {
    rebuildProjectSelects({
      managerId: fields.managerId.value,
      projectType: fields.projectType.value,
      clientBusinessPartnerId: fields.clientBusinessPartnerId.value,
      clientContactIds: selectedIds(fields.clientContactIds),
      deliveryPartnerBusinessPartnerId: fields.deliveryPartnerBusinessPartnerId.value,
      deliveryPartnerContactIds: []
    });
  });
  fields.projectName.addEventListener('input', () => { updateProjectTimelineExpandUi(); updateProjectSummaryHeader(); });
  fields.projectStatus?.addEventListener('change', updateProjectStatusUi);
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
    if (ui.memberBillableModal) ui.memberBillableModal.checked = true;
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
    selectedProjectAssignments.push({
      consultantId: selectedConsultantId,
      projectRole: role,
      startDate: start,
      endDate: end,
      allocation,
      billable: ui.memberBillableModal ? ui.memberBillableModal.checked : true,
      comments: ''
    });

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
    if (ui.memberBillableEdit) ui.memberBillableEdit.checked = member.billable !== false;
    ui.memberCommentsEdit.value = member.comments || '';
    ui.memberStartDateEdit.value = member.startDate || '';
    ui.memberEndDateEdit.value = member.endDate || '';
    rebuildMemberRoleSelect(member.projectRole || 'Project Member');

    ui.memberProjectRoleModal.disabled = readOnly;
    ui.memberAllocationEdit.disabled = readOnly;
    if (ui.memberBillableEdit) ui.memberBillableEdit.disabled = readOnly;
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
    item.billable = ui.memberBillableEdit ? ui.memberBillableEdit.checked : true;
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
    fields.projectType.value = project.projectType || '';
    if (fields.projectStatus) fields.projectStatus.value = project.projectStatus || 'Not Started';
    fields.managerId.value = project.managerConsultantId || '';
    fields.clientBusinessPartnerId.value = project.clientBusinessPartnerId || '';
    fields.deliveryPartnerBusinessPartnerId.value = project.deliveryPartnerBusinessPartnerId || '';
    fields.startDate.value = project.startDate;
    fields.endDate.value = project.endDate;
    selectedProjectAssignments = (project.consultantAssignments || []).map((item) => ({
      consultantId: Number(item.consultantId),
      projectRole: item.projectRole || 'Project Member',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      allocation: Number(item.allocation ?? 100),
      billable: item.billable !== false,
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
        billable: true,
        comments: ''
      });
    }

    selectedProjectTimelineYear = new Date().getFullYear();
    updateAssignedConsultantsSummary();
    rebuildProjectSelects({
      managerId: project.managerConsultantId,
      projectType: project.projectType || '',
      clientBusinessPartnerId: project.clientBusinessPartnerId || '',
      clientContactIds: (project.clientContacts || []).map((item) => Number(item.id)),
      deliveryPartnerBusinessPartnerId: project.deliveryPartnerBusinessPartnerId || '',
      deliveryPartnerContactIds: (project.deliveryPartnerContacts || []).map((item) => Number(item.id))
    });
    const targetMode = button.dataset.action === 'view-project' ? 'view' : 'edit';
    showProjectPhaseForm = false;
    showProjectMilestoneForm = false;
    activeProjectWorkspaceTab = 'overview';
    showManageProjectPanel();
    collapseProjectTimeline();
    updateProjectTimelineExpandUi();
    renderProjectWeekDetail('', '', '');
    console.debug(`[ProjectMode:openProject] action=${button.dataset.action} targetMode=${targetMode} projectId=${project.id}`);
    setProjectFormMode(targetMode);
    await loadProjectFiles(project.id);
    applyProjectModeUi('openProject-final');
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

  ui.businessPartnerTypeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/business-partner-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.businessPartnerTypeName.value.trim() }) });
      ui.businessPartnerTypeForm.reset();
      await loadAll();
      toast('Business partner type added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add business partner type', 'red darken-1');
    }
  });

  ui.projectTypeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/project-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.projectTypeName.value.trim() }) });
      ui.projectTypeForm.reset();
      await loadAll();
      toast('Project type added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to add project type', 'red darken-1');
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

  ui.businessPartnerTypesList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-business-partner-type"]');
    if (!button) return;
    try {
      await request(`/api/business-partner-types/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Business partner type removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to delete business partner type', 'red darken-1');
    }
  });

  ui.projectTypesList?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-project-type"]');
    if (!button) return;
    try {
      await request(`/api/project-types/${button.dataset.id}`, { method: 'DELETE' });
      await loadAll();
      toast('Project type removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to delete project type', 'red darken-1');
    }
  });

  ui.showBusinessPartnerFormBtn?.addEventListener('click', () => {
    resetBusinessPartnerForm();
    showManageBusinessPartnerPanel();
  });
  ui.backToBusinessPartnersBtn?.addEventListener('click', showBusinessPartnersPanel);
  ui.bpAddressToggleBtn?.addEventListener('click', () => {
    businessPartnerAddressExpanded = !businessPartnerAddressExpanded;
    renderBusinessPartnerSections();
  });
  ui.bpContactsToggleBtn?.addEventListener('click', () => {
    businessPartnerContactsExpanded = !businessPartnerContactsExpanded;
    renderBusinessPartnerSections();
  });
  ui.bpProjectsToggleBtn?.addEventListener('click', () => {
    businessPartnerProjectsExpanded = !businessPartnerProjectsExpanded;
    renderBusinessPartnerSections();
  });
  fields.businessPartnerCountry?.addEventListener('change', () => {
    rebuildBusinessPartnerRegionSelect({ countryCode: fields.businessPartnerCountry.value, regionValue: '' });
  });

  ui.addBusinessPartnerContactBtn?.addEventListener('click', () => {
    editingBusinessPartnerContacts.push({ name: '', lastName: '', emails: [], phoneNumbers: [] });
    renderBusinessPartnerContactsEditor();
    updateTextFields();
  });

  ui.businessPartnerContactsList?.addEventListener('input', (event) => {
    const input = event.target.closest('[data-contact-index][data-field]');
    if (!input) return;
    const index = Number(input.dataset.contactIndex);
    const field = input.dataset.field;
    const current = editingBusinessPartnerContacts[index];
    if (!current) return;
    current[field] = input.value;
  });

  ui.businessPartnerContactsList?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const index = Number(button.dataset.contactIndex);
    if (button.dataset.action === 'remove-contact') {
      editingBusinessPartnerContacts = editingBusinessPartnerContacts.filter((_, idx) => idx !== index);
      renderBusinessPartnerContactsEditor();
      updateTextFields();
      return;
    }
    if (button.dataset.action === 'open-communication') {
      openCommunicationModalForContact(index);
    }
  });

  ui.communicationEmailsList?.addEventListener('input', (event) => {
    const input = event.target.closest('input[data-comm-field="email"]');
    if (!input) return;
    editingCommunicationDraft.emails[Number(input.dataset.index)] = input.value;
  });

  ui.communicationPhonesList?.addEventListener('input', (event) => {
    const input = event.target.closest('input[data-comm-field="phone"]');
    if (!input) return;
    editingCommunicationDraft.phoneNumbers[Number(input.dataset.index)] = input.value;
  });

  ui.businessPartnerCommunicationModal?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (button.dataset.action === 'remove-comm-email') {
      editingCommunicationDraft.emails = editingCommunicationDraft.emails.filter((_, idx) => idx !== Number(button.dataset.index));
      renderCommunicationModalRows();
      return;
    }
    if (button.dataset.action === 'remove-comm-phone') {
      editingCommunicationDraft.phoneNumbers = editingCommunicationDraft.phoneNumbers.filter((_, idx) => idx !== Number(button.dataset.index));
      renderCommunicationModalRows();
    }
  });

  ui.addCommunicationEmailBtn?.addEventListener('click', () => {
    editingCommunicationDraft.emails = [...(editingCommunicationDraft.emails || []), ''];
    renderCommunicationModalRows();
  });

  ui.addCommunicationPhoneBtn?.addEventListener('click', () => {
    editingCommunicationDraft.phoneNumbers = [...(editingCommunicationDraft.phoneNumbers || []), ''];
    renderCommunicationModalRows();
  });

  ui.saveCommunicationBtn?.addEventListener('click', () => {
    if (businessPartnerViewMode === 'view') return;
    const contact = editingBusinessPartnerContacts[editingCommunicationContactIndex];
    if (!contact) return;
    contact.emails = (editingCommunicationDraft.emails || []).map((item) => String(item || '').trim()).filter(Boolean);
    contact.phoneNumbers = (editingCommunicationDraft.phoneNumbers || []).map((item) => String(item || '').trim()).filter(Boolean);
    contact.email = contact.emails[0] || '';
    renderBusinessPartnerContactsEditor();
    modals.businessPartnerCommunication?.close();
  });

  ui.businessPartnerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      companyName: fields.businessPartnerCompanyName.value.trim(),
      businessPartnerTypeId: fields.businessPartnerTypeId.value ? Number(fields.businessPartnerTypeId.value) : null,
      addressStreet: fields.businessPartnerAddressStreet.value.trim(),
      addressNumber: fields.businessPartnerAddressNumber.value.trim(),
      postalCode: fields.businessPartnerPostalCode.value.trim(),
      city: fields.businessPartnerCity.value.trim(),
      region: fields.businessPartnerRegion.value.trim(),
      country: fields.businessPartnerCountry.value.trim(),
      contacts: editingBusinessPartnerContacts.map((contact) => ({
        ...contact,
        emails: (contact.emails || (contact.email ? [contact.email] : [])).map((item) => String(item || '').trim()).filter(Boolean),
        phoneNumbers: (contact.phoneNumbers || []).map((item) => String(item || '').trim()).filter(Boolean)
      }))
    };
    try {
      const editing = Boolean(fields.businessPartnerId.value);
      await request(editing ? `/api/business-partners/${fields.businessPartnerId.value}` : '/api/business-partners', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll();
      resetBusinessPartnerForm();
      toast(editing ? 'Business partner updated' : 'Business partner added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save business partner', 'red darken-1');
    }
  });

  ui.businessPartnersBody?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const partner = findBusinessPartnerById(id);
    if (!partner) return;
    if (button.dataset.action === 'delete-business-partner') {
      if (!window.confirm(`Delete business partner "${partner.companyName}"?`)) return;
      try {
        await request(`/api/business-partners/${id}`, { method: 'DELETE' });
        await loadAll();
        toast('Business partner removed', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to delete business partner', 'red darken-1');
      }
      return;
    }
    fields.businessPartnerId.value = partner.id;
    fields.businessPartnerCompanyName.value = partner.companyName || '';
    fields.businessPartnerTypeId.value = partner.businessPartnerTypeId || '';
    fields.businessPartnerAddressStreet.value = partner.addressStreet || '';
    fields.businessPartnerAddressNumber.value = partner.addressNumber || '';
    fields.businessPartnerPostalCode.value = partner.postalCode || '';
    fields.businessPartnerCity.value = partner.city || '';
    const rawCountry = String(partner.country || '').trim();
    const normalizedCountryCode = (() => {
      const raw = String(partner.country || '').trim();
      if (!raw) return '';
      if (countryNamesByCode[raw.toUpperCase()]) return raw.toUpperCase();
      const prefix = raw.split('-')[0]?.trim().toUpperCase();
      if (countryNamesByCode[prefix]) return prefix;
      return '';
    })();
    if (!normalizedCountryCode && rawCountry) {
      fields.businessPartnerCountry.add(new Option(rawCountry, rawCountry, false, true));
    }
    fields.businessPartnerCountry.value = normalizedCountryCode || rawCountry;
    resetSelect('businessPartnerCountry', fields.businessPartnerCountry);
    rebuildBusinessPartnerRegionSelect({ countryCode: normalizedCountryCode || rawCountry, regionValue: partner.region || '' });
    editingBusinessPartnerContacts = (partner.contacts || []).map((c) => ({
      name: c.name || '',
      lastName: c.lastName || '',
      email: c.email || '',
      emails: c.emails || (c.email ? [c.email] : []),
      phoneNumbers: c.phoneNumbers || []
    }));
    fields.businessPartnerTypeId.innerHTML = '<option value="" selected>No type</option>';
    businessPartnerTypes.forEach((type) => fields.businessPartnerTypeId.add(new Option(type.name, type.id, false, Number(type.id) === Number(partner.businessPartnerTypeId))));
    resetSelect('businessPartnerType', fields.businessPartnerTypeId);
    businessPartnerAddressExpanded = false;
    businessPartnerContactsExpanded = false;
    businessPartnerProjectsExpanded = false;
    renderBusinessPartnerSections();
    renderBusinessPartnerProjects();
    setBusinessPartnerFormMode(button.dataset.action === 'view-business-partner' ? 'view' : 'edit');
    renderBusinessPartnerContactsEditor();
    updateTextFields();
    showManageBusinessPartnerPanel();
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
    console.debug('[ProjectMode:switchToEdit] from legacy pen');
    setProjectFormMode('edit');
    console.debug(`[switchToEditLegacy] mode now ${projectViewMode}`);
  });

  ui.consultantSwitchEditBtn?.addEventListener('click', () => {
    setConsultantFormMode('edit');
  });

  const timeTrackingConsultantSelectEl = ui.timeTrackingConsultantSelect;
  timeTrackingConsultantSelectEl?.addEventListener('change', () => {
    const selectedId = Number(timeTrackingConsultantSelectEl.value || 0);
    activeTimesheetConsultantId = selectedId;
    activeTimesheet = null;
    hasRequestedTimesheetLoad = false;
    visibleOlderTimesheetCount = 0;
    timesheetMonths = [];
    setTimeTrackingView({ showList: true });
    renderTimesheetMonths();
  });

  timeTrackingConsultantSelectEl?.addEventListener('focus', () => {
    refreshTimeTrackingConsultantSelectFromApi();
  });

  timeTrackingConsultantSelectEl?.addEventListener('mousedown', () => {
    refreshTimeTrackingConsultantSelectFromApi();
  });

  ui.loadTimesheetsBtn?.addEventListener('click', async () => {
    if (!activeTimesheetConsultantId) return;
    hasRequestedTimesheetLoad = true;
    visibleOlderTimesheetCount = 0;
    await loadTimesheetMonths(activeTimesheetConsultantId);
  });

  ui.timesheetToggleOlderBtn?.addEventListener('click', () => {
    visibleOlderTimesheetCount += 3;
    renderTimesheetMonths();
  });

  ui.backToTimesheetsBtn?.addEventListener('click', () => {
    setTimeTrackingView({ showList: true });
    renderTimesheetMonths();
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
    if (isTimesheetLocked(activeTimesheet.status)) {
      toast('Completed timesheets cannot be edited', 'orange darken-2');
      return;
    }
    if (!dayOffTypes.length) {
      toast('No day off types available. Add one in Administration first.', 'orange darken-2');
      return;
    }
    populateManualLineDayOffTypeSelect();
    modals.manualLine?.open();
  });

  ui.confirmManualLineBtn?.addEventListener('click', async () => {
    if (!activeTimesheet?.timesheetId) return;
    const activity = String(ui.manualLineDayOffTypeSelect?.value || '').trim();
    if (!activity) {
      toast('Select a day off type to add a manual line', 'orange darken-2');
      return;
    }
    try {
      await request('/api/monthly-timesheets/manual-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timesheetId: activeTimesheet.timesheetId, activity })
      });
      modals.manualLine?.close();
      await openMonthlyTimesheet(activeTimesheet.monthStart);
    } catch (error) {
      toast(error.message || 'Failed to add manual line', 'red darken-1');
    }
  });

  ui.timesheetSaveDraftBtn?.addEventListener('click', async () => {
    try {
      await saveActiveTimesheetStatus('In Progress');
    } catch (error) {
      toast(error.message || 'Failed to save timesheet status', 'red darken-1');
    }
  });

  ui.timesheetSaveCompletedBtn?.addEventListener('click', async () => {
    try {
      await saveActiveTimesheetStatus('Completed');
      renderTimesheetWeek();
    } catch (error) {
      toast(error.message || 'Failed to save timesheet status', 'red darken-1');
    }
  });

  ui.timesheetReopenBtn?.addEventListener('click', async () => {
    try {
      await saveActiveTimesheetStatus('In Progress');
      renderTimesheetWeek();
    } catch (error) {
      toast(error.message || 'Failed to reopen timesheet', 'red darken-1');
    }
  });

  ui.timesheetPrintBtn?.addEventListener('click', () => {
    printActiveTimesheet();
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
    modals.manualLine = M.Modal.init(ui.manualLineModal);
    modals.businessPartnerCommunication = M.Modal.init(ui.businessPartnerCommunicationModal);
  }

  setSection('projects');
  updateProjectTimelineExpandUi();
  resetProjectForm();
  resetConsultantForm();
  resetBusinessPartnerForm();
  loadAll().catch((error) => toast(error.message || 'Unable to load data', 'red darken-1'));
}
