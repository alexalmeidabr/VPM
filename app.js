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
    sidebarLogoImage: document.getElementById('sidebar-logo-image'),
    sidebarLogoFallback: document.getElementById('sidebar-logo-fallback'),
    companyLogoPreviewImage: document.getElementById('company-logo-preview-image'),
    companyLogoPreviewEmpty: document.getElementById('company-logo-preview-empty'),
    companyLogoUploadInput: document.getElementById('company-logo-upload-input'),
    uploadCompanyLogoBtn: document.getElementById('upload-company-logo-btn'),
    removeCompanyLogoBtn: document.getElementById('remove-company-logo-btn'),

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
    projectRevenueNotImplemented: document.getElementById('project-revenue-not-implemented'),
    projectRevenueTimeMaterial: document.getElementById('project-revenue-time-material'),
    projectRevenueSubtabs: document.querySelectorAll('[data-revenue-subtab]'),
    projectRevenueSubtabPanels: document.querySelectorAll('[data-revenue-subtab-panel]'),
    revenueTotalContractedValue: document.getElementById('revenue-total-contracted-value'),
    revenueThisMonthValue: document.getElementById('revenue-this-month-value'),
    revenueNext3MonthsValue: document.getElementById('revenue-next-3-months-value'),
    revenueForecastTotalValue: document.getElementById('revenue-forecast-total-value'),
    revenueInvoicedValue: document.getElementById('revenue-invoiced-value'),
    revenuePaidValue: document.getElementById('revenue-paid-value'),
    revenueOutstandingValue: document.getElementById('revenue-outstanding-value'),
    revenueUnbilledValue: document.getElementById('revenue-unbilled-value'),
    revenueActualsChart: document.getElementById('revenue-actuals-chart'),
    revenueActualsChartFill: document.getElementById('revenue-actuals-chart-fill'),
    revenueActualsPaidLabel: document.getElementById('revenue-actuals-paid-label'),
    revenueActualsOutstandingLabel: document.getElementById('revenue-actuals-outstanding-label'),
    projectRevenueForecastBody: document.getElementById('project-revenue-forecast-body'),
    projectRevenueForecastEmpty: document.getElementById('project-revenue-forecast-empty'),
    forecastDetailsModal: document.getElementById('forecast-details-modal'),
    forecastDetailsModalTitle: document.getElementById('forecast-details-modal-title'),
    forecastDetailsModalBody: document.getElementById('forecast-details-modal-body'),
    forecastDetailsModalEmpty: document.getElementById('forecast-details-modal-empty'),
    forecastDetailsModalCloseBtn: document.getElementById('forecast-details-modal-close-btn'),
    projectRevenueInvoicePeriodsBody: document.getElementById('project-revenue-invoice-periods-body'),
    projectRevenueInvoicePeriodsEmpty: document.getElementById('project-revenue-invoice-periods-empty'),
    projectRevenueMonthInvoices: document.getElementById('project-revenue-month-invoices'),
    projectRevenueMonthInvoicesTitle: document.getElementById('project-revenue-month-invoices-title'),
    projectRevenueMonthInvoicesBody: document.getElementById('project-revenue-month-invoices-body'),
    projectRevenueMonthInvoicesEmpty: document.getElementById('project-revenue-month-invoices-empty'),
    projectProfitabilityNotImplemented: document.getElementById('project-profitability-not-implemented'),
    projectProfitabilityTimeMaterial: document.getElementById('project-profitability-time-material'),
    profitabilityRevenueValue: document.getElementById('profitability-revenue-value'),
    profitabilityCostValue: document.getElementById('profitability-cost-value'),
    profitabilityMarginValue: document.getElementById('profitability-margin-value'),
    profitabilityMarginPercentValue: document.getElementById('profitability-margin-percent-value'),
    projectProfitabilityBody: document.getElementById('project-profitability-body'),
    projectProfitabilityEmpty: document.getElementById('project-profitability-empty'),
    projectProfitabilityDetail: document.getElementById('project-profitability-detail'),
    projectProfitabilityDetailTitle: document.getElementById('project-profitability-detail-title'),
    projectProfitabilityDetailBody: document.getElementById('project-profitability-detail-body'),
    projectProfitabilityDetailEmpty: document.getElementById('project-profitability-detail-empty'),
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
    showClosedProjectPositionsRow: document.getElementById('show-closed-project-positions-row'),
    showClosedProjectPositionsToggle: document.getElementById('show-closed-project-positions-toggle'),
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
    projectPositionStatusModal: document.getElementById('project-position-status-modal'),
    memberStartDateModal: document.getElementById('member-start-date-modal'),
    memberEndDateModal: document.getElementById('member-end-date-modal'),
    memberAllocationModal: document.getElementById('member-allocation-modal'),
    memberBillableRowModal: document.getElementById('member-billable-row-modal'),
    memberBillableModal: document.getElementById('member-billable-modal'),
    memberDailyRateRowModal: document.getElementById('member-daily-rate-row-modal'),
    memberDailyRateModal: document.getElementById('member-daily-rate-modal'),
    memberDailyRateCurrencyModal: document.getElementById('member-daily-rate-currency-modal'),
    consultantPickerList: document.getElementById('consultant-picker-list'),
    saveConsultantAssignmentsBtn: document.getElementById('save-consultant-assignments-btn'),

    memberDetailsModal: document.getElementById('member-details-modal'),
    memberDetailsContent: document.getElementById('member-details-content'),
    memberModalTitle: document.getElementById('member-modal-title'),
    memberEditConsultantId: document.getElementById('member-edit-consultant-id'),
    memberConsultantModal: document.getElementById('member-consultant-modal'),
    memberAreaModal: document.getElementById('member-area-modal'),
    memberProjectRoleModal: document.getElementById('member-project-role-modal'),
    memberPositionStatusEdit: document.getElementById('member-position-status-edit'),
    memberAllocationEdit: document.getElementById('member-allocation-edit'),
    memberBillableRowEdit: document.getElementById('member-billable-row-edit'),
    memberBillableEdit: document.getElementById('member-billable-edit'),
    memberDailyRateRowEdit: document.getElementById('member-daily-rate-row-edit'),
    memberDailyRateEdit: document.getElementById('member-daily-rate-edit'),
    memberDailyRateCurrencyEdit: document.getElementById('member-daily-rate-currency-edit'),
    memberDailyRateDisplay: document.getElementById('member-daily-rate-display'),
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
    invoiceModal: document.getElementById('invoice-modal'),
    invoiceModalTitle: document.getElementById('invoice-modal-title'),
    invoiceId: document.getElementById('invoice-id'),
    invoiceRef: document.getElementById('invoice-ref'),
    invoicePeriodFrom: document.getElementById('invoice-period-from'),
    invoicePeriodTo: document.getElementById('invoice-period-to'),
    invoiceDate: document.getElementById('invoice-date'),
    invoiceDueDate: document.getElementById('invoice-due-date'),
    invoiceAmount: document.getElementById('invoice-amount'),
    invoiceStatus: document.getElementById('invoice-status'),
    invoiceNotes: document.getElementById('invoice-notes'),
    saveInvoiceBtn: document.getElementById('save-invoice-btn'),
    paymentModal: document.getElementById('payment-modal'),
    paymentInvoiceId: document.getElementById('payment-invoice-id'),
    paymentId: document.getElementById('payment-id'),
    paymentDate: document.getElementById('payment-date'),
    paymentAmount: document.getElementById('payment-amount'),
    paymentNotes: document.getElementById('payment-notes'),
    savePaymentBtn: document.getElementById('save-payment-btn'),
    timesheetDetailsModal: document.getElementById('timesheet-details-modal'),
    timesheetDetailsModalTitle: document.getElementById('timesheet-details-modal-title'),
    timesheetDetailsModalBody: document.getElementById('timesheet-details-modal-body'),
    timesheetDetailsModalEmpty: document.getElementById('timesheet-details-modal-empty'),
    availabilityType: document.getElementById('availability-type'),
    availabilityStartDate: document.getElementById('availability-start-date'),
    availabilityEndDate: document.getElementById('availability-end-date'),
    saveAvailabilityBtn: document.getElementById('save-availability-btn'),

    roleForm: document.getElementById('role-form'),
    areaForm: document.getElementById('area-form'),
    dayOffTypeForm: document.getElementById('day-off-type-form'),
    businessPartnerTypeForm: document.getElementById('business-partner-type-form'),
    projectTypeForm: document.getElementById('project-type-form'),
    showCompanyBranchFormBtn: document.getElementById('show-company-branch-form-btn'),
    companyBranchModal: document.getElementById('company-branch-modal'),
    companyBranchModalTitle: document.getElementById('company-branch-modal-title'),
    companyBranchForm: document.getElementById('company-branch-form'),
    saveCompanyBranchBtn: document.getElementById('save-company-branch-btn'),
    rolesList: document.getElementById('roles-list'),
    areasList: document.getElementById('areas-list'),
    dayOffTypesList: document.getElementById('day-off-types-list'),
    businessPartnerTypesList: document.getElementById('business-partner-types-list'),
    projectTypesList: document.getElementById('project-types-list'),
    companyBranchesList: document.getElementById('company-branches-list'),
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
    contractWithBranchId: document.getElementById('contract-with-branch-id'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),

    consultantId: document.getElementById('consultant-id'),
    consultantName: document.getElementById('consultant-name'),
    consultantStartDate: document.getElementById('consultant-start-date'),
    consultantAreaIds: document.getElementById('consultant-area-ids'),
    consultantCompanyRoleId: document.getElementById('consultant-company-role-id'),
    consultantSalary: document.getElementById('consultant-salary'),
    consultantCompanyBranchId: document.getElementById('consultant-company-branch-id'),
    consultantHolidayLocationId: document.getElementById('consultant-holiday-location-id'),

    roleName: document.getElementById('role-name'),
    areaName: document.getElementById('area-name'),
    dayOffTypeName: document.getElementById('day-off-type-name'),
    businessPartnerTypeName: document.getElementById('business-partner-type-name'),
    projectTypeName: document.getElementById('project-type-name'),
    businessPartnerId: document.getElementById('business-partner-id'),
    businessPartnerCompanyName: document.getElementById('business-partner-company-name'),
    businessPartnerTaxIdentification: document.getElementById('business-partner-tax-identification'),
    businessPartnerTypeId: document.getElementById('business-partner-type-id'),
    businessPartnerAddressStreet: document.getElementById('business-partner-address-street'),
    businessPartnerAddressNumber: document.getElementById('business-partner-address-number'),
    businessPartnerPostalCode: document.getElementById('business-partner-postal-code'),
    businessPartnerCity: document.getElementById('business-partner-city'),
    businessPartnerRegion: document.getElementById('business-partner-region'),
    businessPartnerCountry: document.getElementById('business-partner-country'),
    companyBranchId: document.getElementById('company-branch-id'),
    companyBranchName: document.getElementById('company-branch-name'),
    companyBranchTaxIdentification: document.getElementById('company-branch-tax-identification'),
    companyBranchStreetName: document.getElementById('company-branch-street-name'),
    companyBranchStreetNumber: document.getElementById('company-branch-street-number'),
    companyBranchPostalCode: document.getElementById('company-branch-postal-code'),
    companyBranchCity: document.getElementById('company-branch-city'),
    companyBranchRegion: document.getElementById('company-branch-region'),
    companyBranchCountry: document.getElementById('company-branch-country')
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
  let companyBranches = [];
  let businessPartners = [];
  let companyLogo = { hasLogo: false, logoUrl: null };
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
  let showClosedProjectPositions = false;
  let revenueInvoices = [];
  let revenueInvoicePeriods = [];
  let selectedInvoicePeriodMonth = '';
  let revenueTimesheetDetails = [];
  let revenueSummary = null;
  let revenueActualsSummary = null;
  let revenueForecastBreakdown = [];
  let selectedRevenueForecastMonth = '';
  let revenueForecastDetails = [];
  let isForecastDetailsLoading = false;
  let activeRevenueSubtab = 'invoices';
  let profitabilitySummary = null;
  let profitabilityBreakdown = [];
  let selectedProfitabilityMonth = '';
  let profitabilityDetails = [];
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

  const uploadCompanyLogo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const upload = async (baseUrl) => fetch(`${baseUrl}/api/company-logo`, { method: 'POST', body: formData });
    let response;
    try {
      response = await upload(primaryApiBase);
    } catch (error) {
      if (!(error instanceof TypeError) || primaryApiBase === fallbackApiBase) throw error;
      response = await upload(fallbackApiBase);
      window.localStorage.setItem('vpmApiOrigin', fallbackApiBase);
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Logo upload failed' }));
      throw new Error(payload.error || 'Logo upload failed');
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

  const invoiceStatusClass = (status) => ({
    Draft: 'status-invoice-draft',
    Issued: 'status-invoice-issued',
    'Partially Paid': 'status-invoice-partially-paid',
    Paid: 'status-invoice-paid',
    Overdue: 'status-invoice-overdue'
  }[String(status || '').trim()] || 'status-invoice-default');

  const generateInvoicePrintout = (invoiceId) => {
    if (!invoiceId) return;
    window.location.assign(`${primaryApiBase}/print/invoice/${invoiceId}`);
  };

  const resetSelect = (key, element) => {
    if (selectInstances[key]) selectInstances[key].destroy();
    if (window.M?.FormSelect) selectInstances[key] = M.FormSelect.init(element);
  };

  const managerCandidates = () => consultants.filter((consultant) => consultant.companyRole === 'Project Manager');
  const positionStatusValues = ['Open', 'Proposed', 'Approved', 'Assigned', 'Closed'];
  const positionDailyRateCurrencies = ['EUR', 'USD', 'GBP', 'CHF'];
  const positionStatusClassByValue = (status) => ({
    Open: 'position-status-open',
    Proposed: 'position-status-proposed',
    Approved: 'position-status-approved',
    Assigned: 'position-status-assigned',
    Closed: 'position-status-closed'
  }[status] || 'position-status-open');
  const getProjectPositionDisplayStatus = (position) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = position?.endDate ? new Date(`${position.endDate}T00:00:00`) : null;
    if (endDate && endDate < today) return 'Closed';
    const status = String(position?.status || '').trim();
    return positionStatusValues.includes(status) ? status : (position?.consultantId ? 'Assigned' : 'Open');
  };
  const isTimeMaterialProjectType = () => String(fields.projectType.value || '').trim().toLowerCase() === 'time material';
  const shouldShowPositionRateFields = ({ billable }) => isTimeMaterialProjectType() && billable !== false;
  const formatPositionDailyRate = (dailyRate, currency) => {
    const amount = Number(dailyRate);
    if (!Number.isFinite(amount)) return '—';
    const code = String(currency || 'EUR').trim().toUpperCase() || 'EUR';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    } catch (error) {
      return `${code} ${amount.toFixed(2)}`;
    }
  };
  const managerConsultantIdFromAssignments = () => {
    const managerMember = selectedProjectAssignments.find((item) => item.projectRole === 'Project Manager'
      && item.consultantId
      && getProjectPositionDisplayStatus(item) === 'Assigned');
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
    contractWithBranchId: fields.contractWithBranchId.value ? Number(fields.contractWithBranchId.value) : null,
    projectType: fields.projectType.value,
    projectStatus: fields.projectStatus?.value || 'Not Started',
    managerConsultantId: managerConsultantIdFromAssignments(),
    startDate: fields.startDate.value,
    endDate: fields.endDate.value,
    projectPositions: selectedProjectAssignments.map((item) => ({
      id: item.positionId || null,
      consultantId: item.consultantId ? Number(item.consultantId) : null,
      areaId: item.areaId ? Number(item.areaId) : null,
      projectRole: item.projectRole || 'Project Position',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      allocation: Number(item.allocation ?? 100),
      billable: item.billable !== false,
      dailyRate: item.dailyRate === '' || item.dailyRate === null || item.dailyRate === undefined ? null : Number(item.dailyRate),
      dailyRateCurrency: (item.dailyRate === '' || item.dailyRate === null || item.dailyRate === undefined)
        ? null
        : (item.dailyRateCurrency ? String(item.dailyRateCurrency).trim().toUpperCase() : null),
      comments: item.comments || '',
      status: item.status || (item.consultantId ? 'Assigned' : 'Open')
    })),
    consultantAssignments: selectedProjectAssignments.filter((item) => item.consultantId).map((item) => ({
      consultantId: Number(item.consultantId),
      projectRole: item.projectRole || 'Project Position',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      allocation: Number(item.allocation ?? 100),
      billable: item.billable !== false,
      comments: item.comments || ''
    })),
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

  const formatMoney = (value, currency = 'EUR') => {
    const amount = Number(value || 0);
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency || 'EUR').toUpperCase() }).format(amount);
    } catch (error) {
      return `${String(currency || 'EUR').toUpperCase()} ${amount.toFixed(2)}`;
    }
  };

  const renderRevenueSummary = () => {
    if (!ui.revenueTotalContractedValue) return;
    ui.revenueTotalContractedValue.textContent = formatMoney(revenueSummary?.totalContractedRevenue || 0);
    ui.revenueThisMonthValue.textContent = formatMoney(revenueSummary?.revenueThisMonth || 0);
    ui.revenueNext3MonthsValue.textContent = formatMoney(revenueSummary?.revenueNext3Months || 0);
    ui.revenueForecastTotalValue.textContent = formatMoney(revenueSummary?.totalForecastRevenueUntilProjectEnd || 0);
    if (ui.revenueUnbilledValue) ui.revenueUnbilledValue.textContent = formatMoney(revenueSummary?.unbilledForecast || 0);
  };

  const renderRevenueActuals = () => {
    if (!ui.revenueInvoicedValue) return;
    const invoiced = Number(revenueActualsSummary?.totalInvoiced || 0);
    const paid = Number(revenueActualsSummary?.totalPaid || 0);
    const outstanding = Number(revenueActualsSummary?.outstanding || 0);
    ui.revenueInvoicedValue.textContent = formatMoney(invoiced);
    ui.revenuePaidValue.textContent = formatMoney(paid);
    ui.revenueOutstandingValue.textContent = formatMoney(outstanding);
    if (ui.revenueActualsPaidLabel) ui.revenueActualsPaidLabel.textContent = formatMoney(paid);
    if (ui.revenueActualsOutstandingLabel) ui.revenueActualsOutstandingLabel.textContent = formatMoney(outstanding);
    if (ui.revenueActualsChart) {
      const total = paid + outstanding;
      const paidDeg = total > 0 ? Math.round((paid / total) * 360) : 0;
      ui.revenueActualsChart.querySelector('.pie-chart-ring')?.style.setProperty('background', `conic-gradient(#26a69a 0deg, #26a69a ${paidDeg}deg, #ff7043 ${paidDeg}deg, #ff7043 360deg)`);
    }
  };

  const renderRevenueSubtabs = () => {
    ui.projectRevenueSubtabs?.forEach((button) => {
      const key = button.dataset.revenueSubtab;
      button.classList.toggle('active', key === activeRevenueSubtab);
    });
    ui.projectRevenueSubtabPanels?.forEach((panel) => {
      const key = panel.dataset.revenueSubtabPanel;
      panel.hidden = key !== activeRevenueSubtab;
    });
  };

  const renderRevenueForecastBreakdown = () => {
    if (!ui.projectRevenueForecastBody) return;
    ui.projectRevenueForecastBody.innerHTML = '';
    ui.projectRevenueForecastEmpty.hidden = revenueForecastBreakdown.length > 0;
    revenueForecastBreakdown.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.monthLabel || row.month}</td>
        <td>${Number(row.billableDays || 0).toFixed(2)}</td>
        <td>${formatMoney(row.revenue || 0, 'EUR')}</td>
        <td>${Number(row.positionsCount || 0)}</td>
        <td>${Number(row.consultantsCount || 0)}</td>
        <td><button type="button" class="btn-flat teal-text" data-action="forecast-month-detail" data-month="${row.month}">View Details</button></td>
      `;
      ui.projectRevenueForecastBody.appendChild(tr);
    });
  };

  const renderRevenueForecastDetails = () => {
    const hasSelection = Boolean(selectedRevenueForecastMonth);
    console.debug('[RevenueForecast] Rendering details into modal container only (no inline detail section).');
    if (!hasSelection) {
      if (ui.forecastDetailsModalBody) ui.forecastDetailsModalBody.innerHTML = '';
      if (ui.forecastDetailsModalEmpty) ui.forecastDetailsModalEmpty.hidden = false;
      if (ui.forecastDetailsModalTitle) ui.forecastDetailsModalTitle.textContent = 'Revenue Forecast Details';
      return;
    }
    const selected = revenueForecastBreakdown.find((row) => row.month === selectedRevenueForecastMonth);
    if (ui.forecastDetailsModalTitle) ui.forecastDetailsModalTitle.textContent = `Revenue Forecast Details — ${selected?.monthLabel || selectedRevenueForecastMonth}`;
    if (ui.forecastDetailsModalBody) {
      ui.forecastDetailsModalBody.innerHTML = '';
      revenueForecastDetails.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.positionName || 'Project Position'}</td>
          <td>${row.consultantName || 'Open Position'}</td>
          <td>${Number(row.allocationPercent ?? 100).toFixed(0)}%</td>
          <td>${row.dailyRate != null ? formatMoney(row.dailyRate, row.dailyRateCurrency || 'EUR') : '—'}</td>
          <td>${Number(row.billableDays || 0).toFixed(2)}</td>
          <td>${formatMoney(row.revenue || 0, row.dailyRateCurrency || 'EUR')}</td>
        `;
        ui.forecastDetailsModalBody.appendChild(tr);
      });
    }
    if (ui.forecastDetailsModalEmpty) ui.forecastDetailsModalEmpty.hidden = revenueForecastDetails.length > 0;
    console.debug(`[RevenueForecast] Modal body populated for month=${selectedRevenueForecastMonth}, rows=${revenueForecastDetails.length}`);
  };

  const renderProfitability = () => {
    if (!ui.profitabilityRevenueValue) return;
    ui.profitabilityRevenueValue.textContent = formatMoney(profitabilitySummary?.totalForecastRevenue || 0);
    ui.profitabilityCostValue.textContent = formatMoney(profitabilitySummary?.totalForecastCost || 0);
    ui.profitabilityMarginValue.textContent = formatMoney(profitabilitySummary?.totalForecastGrossMargin || 0);
    ui.profitabilityMarginPercentValue.textContent = `${Number(profitabilitySummary?.forecastMarginPercent || 0).toFixed(2)}%`;
    ui.projectProfitabilityBody.innerHTML = '';
    ui.projectProfitabilityEmpty.hidden = profitabilityBreakdown.length > 0;
    profitabilityBreakdown.forEach((row) => {
      const isSelected = selectedProfitabilityMonth === row.month;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.monthLabel || row.month}</td>
        <td>${formatMoney(row.revenue || 0, 'EUR')}</td>
        <td>${formatMoney(row.internalCost || 0, 'EUR')}</td>
        <td>${formatMoney(row.grossMargin || 0, 'EUR')}</td>
        <td>${Number(row.marginPercent || 0).toFixed(2)}%</td>
        <td><button type="button" class="btn-flat teal-text" data-action="profitability-month-detail" data-month="${row.month}">${isSelected ? 'Refresh' : 'View Details'}</button></td>
      `;
      ui.projectProfitabilityBody.appendChild(tr);
    });
  };

  const renderProfitabilityDetails = () => {
    if (!ui.projectProfitabilityDetail) return;
    const hasSelection = Boolean(selectedProfitabilityMonth);
    ui.projectProfitabilityDetail.hidden = !hasSelection;
    if (!hasSelection) return;
    const selected = profitabilityBreakdown.find((row) => row.month === selectedProfitabilityMonth);
    if (ui.projectProfitabilityDetailTitle) ui.projectProfitabilityDetailTitle.textContent = `Profitability Month Details — ${selected?.monthLabel || selectedProfitabilityMonth}`;
    if (ui.projectProfitabilityDetailBody) {
      ui.projectProfitabilityDetailBody.innerHTML = '';
      profitabilityDetails.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.positionName || 'Project Position'}</td>
          <td>${row.consultantName || 'Open Position'}</td>
          <td>${Number(row.allocationPercent ?? 100).toFixed(0)}%</td>
          <td>${formatMoney(row.revenue || 0, row.dailyRateCurrency || 'EUR')}</td>
          <td>${formatMoney(row.internalCost || 0, row.dailyRateCurrency || 'EUR')}</td>
          <td>${formatMoney(row.grossMargin || 0, row.dailyRateCurrency || 'EUR')}</td>
          <td>${Number(row.marginPercent || 0).toFixed(2)}%</td>
        `;
        ui.projectProfitabilityDetailBody.appendChild(tr);
      });
    }
    if (ui.projectProfitabilityDetailEmpty) ui.projectProfitabilityDetailEmpty.hidden = profitabilityDetails.length > 0;
  };

  const timesheetStatusClass = (status) => {
    if (status === 'Completed') return 'status-timesheet-completed';
    if (status === 'Incompleted') return 'status-timesheet-incompleted';
    return 'status-timesheet-not-started';
  };

  const consultantTimesheetStatusClass = (status) => {
    if (status === 'Completed') return 'status-timesheet-completed';
    if (status === 'Pending') return 'status-timesheet-incompleted';
    return 'status-timesheet-not-started';
  };

  const renderTimesheetDetailsModal = (monthLabel) => {
    if (!ui.timesheetDetailsModalBody) return;
    if (ui.timesheetDetailsModalTitle) ui.timesheetDetailsModalTitle.textContent = `Timesheet Details – ${monthLabel}`;
    ui.timesheetDetailsModalBody.innerHTML = '';
    revenueTimesheetDetails.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.consultantName || 'Consultant'}</td>
        <td>${item.projectRole || 'Project Position'}</td>
        <td><span class="status-badge ${consultantTimesheetStatusClass(item.status)}">${item.status || 'Not Started'}</span></td>
        <td>${Number(item.totalHours || 0).toFixed(2)}</td>
      `;
      ui.timesheetDetailsModalBody.appendChild(row);
    });
    if (ui.timesheetDetailsModalEmpty) ui.timesheetDetailsModalEmpty.hidden = revenueTimesheetDetails.length > 0;
  };

  const renderRevenueInvoicePeriods = () => {
    if (!ui.projectRevenueInvoicePeriodsBody) return;
    ui.projectRevenueInvoicePeriodsBody.innerHTML = '';
    ui.projectRevenueInvoicePeriodsEmpty.hidden = revenueInvoicePeriods.length > 0;
    revenueInvoicePeriods.forEach((period) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${period.monthLabel || period.month}</td>
        <td><span class="status-badge ${timesheetStatusClass(period.timesheetStatus)}">${period.timesheetStatus || 'Not Started'}</span></td>
        <td><button type="button" class="btn-flat blue-text" data-action="view-timesheet-details" data-month="${period.month}" title="View timesheet details"><i class="material-icons tiny">visibility</i></button></td>
        <td>${period.periodFrom} → ${period.periodTo}</td>
        <td>${formatMoney(period.proposedAmount || 0, period.currency || 'EUR')}</td>
        <td>${Number(period.invoiceCount || 0)} invoice(s) · ${formatMoney(period.invoicedTotal || 0, period.currency || 'EUR')}</td>
        <td>
          <button type="button" class="btn waves-effect waves-light" data-action="add-invoice-period" data-month="${period.month}">Add Invoice</button>
          ${Number(period.invoiceCount || 0) > 0 ? `<button type="button" class="btn-flat indigo-text" data-action="view-period-invoices" data-month="${period.month}">View Invoices</button>` : ''}
        </td>
      `;
      ui.projectRevenueInvoicePeriodsBody.appendChild(row);
    });
  };

  const renderRevenueMonthInvoices = () => {
    if (!ui.projectRevenueMonthInvoices) return;
    if (!selectedInvoicePeriodMonth) {
      ui.projectRevenueMonthInvoices.hidden = true;
      return;
    }
    const period = revenueInvoicePeriods.find((item) => item.month === selectedInvoicePeriodMonth);
    const monthInvoices = revenueInvoices.filter((invoice) => {
      const fromMonth = String(invoice.periodFrom || '').slice(0, 7);
      const toMonth = String(invoice.periodTo || '').slice(0, 7);
      return fromMonth <= selectedInvoicePeriodMonth && toMonth >= selectedInvoicePeriodMonth;
    });
    ui.projectRevenueMonthInvoices.hidden = false;
    if (ui.projectRevenueMonthInvoicesTitle) ui.projectRevenueMonthInvoicesTitle.textContent = `Invoices for ${period?.monthLabel || selectedInvoicePeriodMonth}`;
    if (ui.projectRevenueMonthInvoicesBody) {
      ui.projectRevenueMonthInvoicesBody.innerHTML = '';
      monthInvoices.forEach((invoice) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${invoice.invoiceRef || '—'}</td>
          <td>${invoice.periodFrom} → ${invoice.periodTo}</td>
          <td>${formatDate(invoice.invoiceDate)}</td>
          <td>${invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</td>
          <td>${formatMoney(invoice.amount)}</td>
          <td>${formatMoney(invoice.paidAmount)}</td>
          <td><span class="status-badge ${invoiceStatusClass(invoice.status)}">${invoice.status}</span></td>
          <td>
            <button type="button" class="btn-flat blue-text" data-action="edit-invoice" data-id="${invoice.id}" title="Edit"><i class="material-icons tiny">edit</i></button>
            <button type="button" class="btn-flat teal-text" data-action="add-payment" data-id="${invoice.id}" title="Register Payment"><i class="material-icons tiny">payments</i></button>
            <button type="button" class="btn-flat indigo-text" data-action="generate-invoice" data-id="${invoice.id}" title="Generate Invoice"><i class="material-icons tiny">print</i></button>
            <button type="button" class="btn-flat red-text" data-action="delete-invoice" data-id="${invoice.id}" title="Delete"><i class="material-icons tiny">delete</i></button>
          </td>
        `;
        ui.projectRevenueMonthInvoicesBody.appendChild(row);
      });
    }
    if (ui.projectRevenueMonthInvoicesEmpty) ui.projectRevenueMonthInvoicesEmpty.hidden = monthInvoices.length > 0;
  };

  const loadRevenueData = async (projectId) => {
    if (!projectId) {
      revenueSummary = null;
      revenueActualsSummary = null;
      revenueInvoices = [];
      revenueInvoicePeriods = [];
      selectedInvoicePeriodMonth = '';
      revenueTimesheetDetails = [];
      revenueForecastBreakdown = [];
      selectedRevenueForecastMonth = '';
      revenueForecastDetails = [];
      profitabilitySummary = null;
      profitabilityBreakdown = [];
      selectedProfitabilityMonth = '';
      profitabilityDetails = [];
      renderRevenueSummary();
      renderRevenueActuals();
      renderRevenueSubtabs();
      renderRevenueForecastDetails();
      renderRevenueInvoicePeriods();
      renderRevenueMonthInvoices();
      renderProfitability();
      renderProfitabilityDetails();
      return;
    }
    selectedRevenueForecastMonth = '';
    revenueForecastDetails = [];
    selectedProfitabilityMonth = '';
    profitabilityDetails = [];
    const [forecastSummaryPayload, actualsPayload, invoicesPayload, invoicePeriodsPayload, forecastPayload, profitabilitySummaryPayload, profitabilityBreakdownPayload] = await Promise.all([
      request(`/api/projects/${projectId}/revenue-forecast-summary`),
      request(`/api/projects/${projectId}/revenue-actuals-summary`),
      request(`/api/projects/${projectId}/invoices`),
      request(`/api/projects/${projectId}/revenue/invoice-periods`),
      request(`/api/projects/${projectId}/revenue-forecast-monthly`),
      request(`/api/projects/${projectId}/profitability-summary`),
      request(`/api/projects/${projectId}/profitability-monthly`)
    ]);
    revenueSummary = forecastSummaryPayload || null;
    revenueActualsSummary = actualsPayload || null;
    revenueInvoices = invoicesPayload?.invoices || [];
    revenueInvoicePeriods = invoicePeriodsPayload?.periods || [];
    revenueTimesheetDetails = [];
    if (selectedInvoicePeriodMonth && !revenueInvoicePeriods.some((item) => item.month === selectedInvoicePeriodMonth)) selectedInvoicePeriodMonth = '';
    revenueForecastBreakdown = forecastPayload?.rows || [];
    profitabilitySummary = profitabilitySummaryPayload || null;
    profitabilityBreakdown = profitabilityBreakdownPayload?.rows || [];
    renderRevenueSummary();
    renderRevenueActuals();
    renderRevenueSubtabs();
    renderRevenueForecastBreakdown();
    renderRevenueForecastDetails();
    renderRevenueInvoicePeriods();
    renderRevenueMonthInvoices();
    renderProfitability();
    renderProfitabilityDetails();
  };

  const openForecastDetailsModal = () => {
    const modalElement = ui.forecastDetailsModal;
    if (!modalElement) {
      console.debug('[RevenueForecast] Missing forecast details dialog ref.');
      return;
    }
    const isDialog = String(modalElement.tagName || '').toUpperCase() === 'DIALOG';
    const hasShowModal = typeof modalElement.showModal === 'function';
    console.debug(`[RevenueForecast] open() tag=${modalElement.tagName} isDialog=${isDialog} hasShowModal=${hasShowModal} open=${Boolean(modalElement.open)}`);
    if (!isDialog || !hasShowModal) {
      // Defensive fallback only.
      modalElement.style.display = 'block';
      return;
    }
    if (modalElement.open) return;
    modalElement.showModal();
  };

  const closeForecastDetailsModal = () => {
    const modalElement = ui.forecastDetailsModal;
    if (!modalElement) return;
    const isDialog = String(modalElement.tagName || '').toUpperCase() === 'DIALOG';
    if (isDialog && typeof modalElement.close === 'function' && modalElement.open) {
      modalElement.close();
      return;
    }
    modalElement.style.display = 'none';
  };

  const loadRevenueForecastMonthDetails = async (projectId, month) => {
    if (!projectId || !month) return;
    if (isForecastDetailsLoading) {
      console.debug(`[RevenueForecast] Request ignored because previous load is in progress (month=${month}).`);
      return;
    }
    isForecastDetailsLoading = true;
    console.debug(`[RevenueForecast] View Details click captured for month=${month}, projectId=${projectId}`);
    try {
      const payload = await request(`/api/projects/${projectId}/revenue-forecast-month-details?month=${encodeURIComponent(month)}`);
      selectedRevenueForecastMonth = month;
      revenueForecastDetails = payload?.rows || [];
      console.debug(`[RevenueForecast] Modal data loaded for month=${month}, rows=${revenueForecastDetails.length}`);
      renderRevenueForecastDetails();
      console.debug('[RevenueForecast] Opening forecast details modal');
      openForecastDetailsModal();
      console.debug('[RevenueForecast] Open flow completed.');
    } finally {
      isForecastDetailsLoading = false;
    }
  }; // loadRevenueForecastMonthDetails

  const loadProfitabilityMonthDetails = async (projectId, month) => {
    if (!projectId || !month) return;
    const payload = await request(`/api/projects/${projectId}/profitability-month-details?month=${encodeURIComponent(month)}`);
    selectedProfitabilityMonth = month;
    profitabilityDetails = payload?.rows || [];
    renderProfitability();
    renderProfitabilityDetails();
  };

  const resetInvoiceModal = (invoice = null, defaults = null) => {
    if (!invoice) {
      ui.invoiceModalTitle.textContent = 'Add Invoice';
      ui.invoiceId.value = '';
      ui.invoiceRef.value = '';
      ui.invoicePeriodFrom.value = defaults?.periodFrom || fields.startDate.value || '';
      ui.invoicePeriodTo.value = defaults?.periodTo || fields.endDate.value || '';
      ui.invoiceDate.value = new Date().toISOString().slice(0, 10);
      ui.invoiceDueDate.value = '';
      ui.invoiceAmount.value = defaults?.amount != null ? Number(defaults.amount).toFixed(2) : '';
      ui.invoiceStatus.value = 'Draft';
      ui.invoiceNotes.value = defaults?.notes || '';
    } else {
      ui.invoiceModalTitle.textContent = 'Edit Invoice';
      ui.invoiceId.value = invoice.id;
      ui.invoiceRef.value = invoice.invoiceRef || '';
      ui.invoicePeriodFrom.value = invoice.periodFrom || '';
      ui.invoicePeriodTo.value = invoice.periodTo || '';
      ui.invoiceDate.value = invoice.invoiceDate || '';
      ui.invoiceDueDate.value = invoice.dueDate || '';
      ui.invoiceAmount.value = String(invoice.amount ?? '');
      ui.invoiceStatus.value = invoice.status || 'Draft';
      ui.invoiceNotes.value = invoice.notes || '';
    }
    resetSelect('invoiceStatus', ui.invoiceStatus);
    updateTextFields();
  };

  const resetPaymentModal = (invoiceId) => {
    ui.paymentInvoiceId.value = String(invoiceId || '');
    ui.paymentId.value = '';
    ui.paymentDate.value = new Date().toISOString().slice(0, 10);
    ui.paymentAmount.value = '';
    ui.paymentNotes.value = '';
    updateTextFields();
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
    const isRevenueTab = isSavedProject && activeTab === 'revenue';
    const isProfitabilityTab = isSavedProject && activeTab === 'profitability';
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
    if (isRevenueTab) {
      const isTimeMaterial = isTimeMaterialProjectType();
      if (ui.projectRevenueTimeMaterial) ui.projectRevenueTimeMaterial.hidden = !isTimeMaterial;
      if (ui.projectRevenueNotImplemented) ui.projectRevenueNotImplemented.hidden = isTimeMaterial;
      if (isTimeMaterial) renderRevenueSubtabs();
    }
    if (isProfitabilityTab) {
      const isTimeMaterial = isTimeMaterialProjectType();
      if (ui.projectProfitabilityTimeMaterial) ui.projectProfitabilityTimeMaterial.hidden = !isTimeMaterial;
      if (ui.projectProfitabilityNotImplemented) ui.projectProfitabilityNotImplemented.hidden = isTimeMaterial;
    }
    console.debug(`[projectWorkspace] context=${context} saved=${isSavedProject} activeTab=${activeTab} overviewTab=${isOverviewTab} teamMain=${isTeamTab} timelineMain=${isTimelineTab}`);
  };

  const statusClassByValue = (status) => ({
    'Not Started': 'status-not-started',
    'In Progress': 'status-in-progress',
    Delayed: 'status-delayed',
    Completed: 'status-completed'
  }[status] || 'status-in-progress');

  const deriveProjectDisplayStatusFromData = ({ startDate = '', projectStatus = 'Not Started', projectPhases = [] } = {}) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const projectStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
    if (projectStart && projectStart > today) return 'Not Started';
    const phaseList = Array.isArray(projectPhases) ? projectPhases : [];
    const phases = phaseList.filter((item) => item && item.startDate && item.endDate);
    if (phases.length) {
      const parsed = phases
        .map((phase) => ({
          name: String(phase.name || '').trim(),
          start: new Date(`${phase.startDate}T00:00:00`),
          end: new Date(`${phase.endDate}T00:00:00`)
        }))
        .sort((a, b) => a.start - b.start);
      const activePhase = parsed.find((phase) => phase.start <= today && phase.end >= today);
      if (activePhase) return activePhase.name || 'In Progress';
      if (parsed.every((phase) => phase.end < today)) return 'Completed';
      if (today < parsed[0].start) return 'Not Started';
      return 'In Progress';
    }
    return projectStatus || 'Not Started';
  };

  const deriveProjectDisplayStatus = () => deriveProjectDisplayStatusFromData({
    startDate: fields.startDate.value,
    projectStatus: fields.projectStatus?.value || 'Not Started',
    projectPhases: selectedProjectPhases
  });

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

    [fields.projectName, fields.clientBusinessPartnerId, fields.clientContactIds, fields.projectType, fields.projectStatus, fields.deliveryPartnerBusinessPartnerId, fields.deliveryPartnerContactIds, fields.contractWithBranchId, fields.startDate, fields.endDate]
      .forEach((el) => { if (el) el.disabled = readOnly; });
    fields.managerId.disabled = true;

    resetSelect('manager', fields.managerId);
    resetSelect('clientBusinessPartner', fields.clientBusinessPartnerId);
    resetSelect('clientContacts', fields.clientContactIds);
    resetSelect('deliveryPartnerBusinessPartner', fields.deliveryPartnerBusinessPartnerId);
    resetSelect('deliveryPartnerContacts', fields.deliveryPartnerContactIds);
    resetSelect('contractWithBranch', fields.contractWithBranchId);
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
  const projectPositionAreaLabel = (position) => {
    if (position?.areaId) {
      const areaName = areaNameById(position.areaId);
      if (areaName && areaName !== '—') return areaName;
    }
    return 'Unassigned';
  };
  const sortProjectPositionAreaGroups = (groups) => {
    const normalized = (value) => String(value || '').trim().toLowerCase();
    const preferredRanks = new Map([
      ['management', 0],
      ['tm (transport management)', 1],
      ['ewm (extended warehouse management)', 2],
      ['yl (yard logistics)', 3]
    ]);
    const developmentLabel = 'development';

    return [...groups].sort((a, b) => {
      const aLabel = normalized(a.label);
      const bLabel = normalized(b.label);

      const aIsDevelopment = aLabel === developmentLabel;
      const bIsDevelopment = bLabel === developmentLabel;
      if (aIsDevelopment && !bIsDevelopment) return 1;
      if (!aIsDevelopment && bIsDevelopment) return -1;

      const aRank = preferredRanks.has(aLabel) ? preferredRanks.get(aLabel) : null;
      const bRank = preferredRanks.has(bLabel) ? preferredRanks.get(bLabel) : null;
      if (aRank !== null && bRank !== null) return aRank - bRank;
      if (aRank !== null) return -1;
      if (bRank !== null) return 1;

      return a.label.localeCompare(b.label);
    });
  };
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
      const buckets = new Map();
      const pushUnique = (bucket, member, consultant) => {
        const id = member.consultantId ? `consultant-${Number(member.consultantId)}` : `position-${String(member.positionId || Math.random())}`;
        if (bucket.ids.has(id)) return;
        bucket.ids.add(id);
        bucket.members.push({ member, consultant });
      };

      members.forEach((member) => {
        const consultant = findConsultantById(member.consultantId);
        const areaLabel = projectPositionAreaLabel(member);
        if (!buckets.has(areaLabel)) buckets.set(areaLabel, { label: areaLabel, members: [], ids: new Set() });
        pushUnique(buckets.get(areaLabel), member, consultant);
      });

      return sortProjectPositionAreaGroups(Array.from(buckets.values()))
        .filter((group) => group.members.length);
    };

    if (!isProjectTimelineExpanded) {
      const projectRow = createTimelineRow({ label: 'Project', startDate: projectStart, endDate: projectEnd, type: 'project' });
      container.appendChild(projectRow);
      merged.forEach((member) => {
        const consultant = findConsultantById(member.consultantId);
        container.appendChild(createTimelineRow({
          label: consultant ? consultant.name : `Open Position – ${member.projectRole || 'Project Position'}`,
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
          label: consultant ? consultant.name : `Open Position – ${member.projectRole || 'Project Position'}`,
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
    const assignedCount = selectedProjectAssignments
      .filter((item) => getProjectPositionDisplayStatus(item) === 'Assigned').length;
    ui.assignedConsultantsSummary.textContent = `${assignedCount} position${assignedCount === 1 ? '' : 's'} assigned`;
  };

  const rebuildProjectSelects = ({ managerId = '', projectType = '', clientBusinessPartnerId = '', clientContactIds = [], deliveryPartnerBusinessPartnerId = '', deliveryPartnerContactIds = [], contractWithBranchId = '' } = {}) => {
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
    fields.contractWithBranchId.innerHTML = '<option value="" selected>No company branch</option>';
    companyBranches.forEach((branch) => fields.contractWithBranchId.add(new Option(branch.name, branch.id, false, Number(contractWithBranchId) === Number(branch.id))));

    resetSelect('manager', fields.managerId);
    resetSelect('clientBusinessPartner', fields.clientBusinessPartnerId);
    resetSelect('clientContacts', fields.clientContactIds);
    resetSelect('deliveryPartnerBusinessPartner', fields.deliveryPartnerBusinessPartnerId);
    resetSelect('deliveryPartnerContacts', fields.deliveryPartnerContactIds);
    resetSelect('contractWithBranch', fields.contractWithBranchId);
    resetSelect('projectType', fields.projectType);
  };

  const rebuildConsultantSelects = ({ areaIds = [], companyRoleId = '', companyBranchId = '', holidayLocationId = '' } = {}) => {
    fields.consultantAreaIds.innerHTML = '';
    areas.forEach((area) => fields.consultantAreaIds.add(new Option(area.name, area.id, false, areaIds.map(Number).includes(Number(area.id)))));
    fields.consultantCompanyRoleId.innerHTML = '<option value="" disabled selected>Select company role</option>';
    roles.forEach((role) => fields.consultantCompanyRoleId.add(new Option(role.name, role.id, false, Number(companyRoleId) === Number(role.id))));
    fields.consultantCompanyBranchId.innerHTML = '<option value="" selected>No company branch</option>';
    companyBranches.forEach((branch) => fields.consultantCompanyBranchId.add(new Option(branch.name, branch.id, false, Number(companyBranchId) === Number(branch.id))));
    fields.consultantHolidayLocationId.innerHTML = '<option value="" selected>No holiday location</option>';
    holidayLocations.forEach((location) => fields.consultantHolidayLocationId.add(new Option(location.label, location.id, false, Number(holidayLocationId) === Number(location.id))));
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
    resetSelect('consultantCompanyBranch', fields.consultantCompanyBranchId);
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
    if (ui.projectPositionStatusModal) {
      ui.projectPositionStatusModal.innerHTML = '';
      positionStatusValues.forEach((status) => ui.projectPositionStatusModal.add(new Option(status, status, false, status === 'Open')));
    }
    resetSelect('assignmentArea', ui.consultantAreaFilterModal);
    resetSelect('assignmentRole', ui.projectRoleModal);
    if (ui.projectPositionStatusModal) resetSelect('assignmentPositionStatus', ui.projectPositionStatusModal);
  };

  const rebuildMemberRoleSelect = (roleName) => {
    ui.memberProjectRoleModal.innerHTML = '';
    roles.forEach((role) => ui.memberProjectRoleModal.add(new Option(role.name, role.name, false, role.name === roleName)));
    resetSelect('memberRole', ui.memberProjectRoleModal);
  };

  const rebuildMemberStatusSelect = (statusValue) => {
    if (!ui.memberPositionStatusEdit) return;
    const normalized = positionStatusValues.includes(statusValue) ? statusValue : 'Open';
    ui.memberPositionStatusEdit.innerHTML = '';
    positionStatusValues.forEach((status) => ui.memberPositionStatusEdit.add(new Option(status, status, false, status === normalized)));
    resetSelect('memberPositionStatus', ui.memberPositionStatusEdit);
  };

  const rebuildMemberAreaSelect = (areaId) => {
    if (!ui.memberAreaModal) return;
    ui.memberAreaModal.innerHTML = '';
    ui.memberAreaModal.add(new Option('Unassigned', '', false, !areaId));
    areas.forEach((area) => {
      const selected = areaId ? Number(area.id) === Number(areaId) : false;
      ui.memberAreaModal.add(new Option(area.name, String(area.id), false, selected));
    });
    resetSelect('memberArea', ui.memberAreaModal);
  };

  const rebuildPositionRateCurrencySelect = (target, selectedCurrency) => {
    if (!target) return;
    const normalized = String(selectedCurrency || 'EUR').trim().toUpperCase() || 'EUR';
    target.innerHTML = '';
    positionDailyRateCurrencies.forEach((code) => target.add(new Option(code, code, false, code === normalized)));
    resetSelect(target.id || 'positionRateCurrency', target);
  };

  const updatePositionRateVisibilityForAdd = () => {
    const showBillable = isTimeMaterialProjectType();
    if (ui.memberBillableRowModal) ui.memberBillableRowModal.hidden = !showBillable;
    if (!showBillable && ui.memberBillableModal) ui.memberBillableModal.checked = false;
    const billable = ui.memberBillableModal ? ui.memberBillableModal.checked : true;
    const visible = showBillable && shouldShowPositionRateFields({ billable });
    if (ui.memberDailyRateRowModal) ui.memberDailyRateRowModal.hidden = !visible;
  };

  const updatePositionRateVisibilityForEdit = ({ readOnly = false } = {}) => {
    const showBillable = isTimeMaterialProjectType();
    if (ui.memberBillableRowEdit) ui.memberBillableRowEdit.hidden = !showBillable;
    if (!showBillable && ui.memberBillableEdit) ui.memberBillableEdit.checked = false;
    const billable = ui.memberBillableEdit ? ui.memberBillableEdit.checked : true;
    const visible = showBillable && shouldShowPositionRateFields({ billable });
    if (ui.memberDailyRateRowEdit) ui.memberDailyRateRowEdit.hidden = !visible;
    if (ui.memberDailyRateDisplay) {
      ui.memberDailyRateDisplay.hidden = !visible || !readOnly;
      if (!ui.memberDailyRateDisplay.hidden) {
        ui.memberDailyRateDisplay.textContent = `Daily Rate: ${formatPositionDailyRate(ui.memberDailyRateEdit?.value, ui.memberDailyRateCurrencyEdit?.value)}`;
      }
    }
  };

  const rebuildMemberConsultantSelect = ({ areaId = null, consultantId = null, positionId = '' } = {}) => {
    if (!ui.memberConsultantModal) return;
    ui.memberConsultantModal.innerHTML = '';
    ui.memberConsultantModal.add(new Option('Open Position (no consultant assigned)', '', false, !consultantId));

    const blockedIds = new Set(
      selectedProjectAssignments
        .filter((entry) => String(entry.positionId) !== String(positionId) && entry.consultantId)
        .map((entry) => Number(entry.consultantId))
    );

    const candidates = consultants.filter((consultant) => {
      if (blockedIds.has(Number(consultant.id))) return false;
      if (!areaId) return true;
      return (consultant.areaIds || []).map(Number).includes(Number(areaId));
    });

    candidates
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      .forEach((consultant) => {
        const selected = consultantId ? Number(consultant.id) === Number(consultantId) : false;
        ui.memberConsultantModal.add(new Option(consultant.name, String(consultant.id), false, selected));
      });

    if (consultantId && !candidates.some((consultant) => Number(consultant.id) === Number(consultantId))) {
      ui.memberConsultantModal.value = '';
    }

    resetSelect('memberConsultant', ui.memberConsultantModal);
  };

  const renderConsultantPickerList = () => {
    if (!modalSelectedAreaId) {
      ui.consultantPickerList.innerHTML = '<p class="grey-text">Select an area to view consultants or save as an open position.</p>';
      return;
    }
    const areaId = Number(modalSelectedAreaId);
    const assignedIds = new Set(selectedProjectAssignments.map((item) => Number(item.consultantId)));
    const candidates = consultants.filter((consultant) => {
      const matchesArea = (consultant.areaIds || []).map(Number).includes(areaId);
      return matchesArea && !assignedIds.has(Number(consultant.id));
    });
    ui.consultantPickerList.innerHTML = '';
    const openOption = document.createElement('p');
    openOption.className = 'consultant-picker-item';
    openOption.innerHTML = `<label><input type="radio" name="project-consultant-choice" data-consultant-id="" ${modalTempConsultantIds.length ? '' : 'checked'} /><span>Open Position (no consultant assigned)</span></label>`;
    ui.consultantPickerList.appendChild(openOption);
    if (!candidates.length) {
      const info = document.createElement('p');
      info.className = 'grey-text';
      info.textContent = 'No available consultants in this area right now.';
      ui.consultantPickerList.appendChild(info);
      return;
    }
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
    const hasClosedPositions = selectedProjectAssignments.some((item) => getProjectPositionDisplayStatus(item) === 'Closed');
    if (!hasClosedPositions) showClosedProjectPositions = false;
    if (ui.showClosedProjectPositionsRow) ui.showClosedProjectPositionsRow.hidden = !hasClosedPositions;
    if (ui.showClosedProjectPositionsToggle) ui.showClosedProjectPositionsToggle.checked = Boolean(showClosedProjectPositions);
    const allMembers = showClosedProjectPositions
      ? [...selectedProjectAssignments]
      : selectedProjectAssignments.filter((item) => getProjectPositionDisplayStatus(item) !== 'Closed');

    if (!allMembers.length) {
      ui.projectMembersList.innerHTML = `<p class="grey-text">${selectedProjectAssignments.length ? 'No project positions match the current filter.' : 'No project positions yet.'}</p>`;
      refreshProjectTimeline();
      return;
    }

    const createMemberCard = (member, consultant) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'member-card';
      const roleLabel = member.projectRole || '—';
      const commentText = String(member.comments || '').trim();
      const displayStatus = getProjectPositionDisplayStatus(member);
      const consultantLabel = consultant?.name || 'Open Position';
      const canEditPosition = projectViewMode !== 'view';
      const hasDailyRate = member.dailyRate !== null && member.dailyRate !== undefined && member.dailyRate !== '';
      const showDailyRate = shouldShowPositionRateFields({ billable: member.billable !== false }) && hasDailyRate;
      const showBillable = isTimeMaterialProjectType();
      const dailyRateLabel = showDailyRate ? formatPositionDailyRate(member.dailyRate, member.dailyRateCurrency) : '';
      wrapper.innerHTML = `
        <div class="member-header">
          <div class="member-body">
            <div class="member-title-row">
              <strong>${consultantLabel}</strong>
              <span class="member-role-chip">${roleLabel}</span>
              <span class="position-status-badge ${positionStatusClassByValue(displayStatus)}">${displayStatus}</span>
            </div>
            <div class="member-meta member-kpi-row"><span>Allocation: ${Number(member.allocation ?? 100)}%</span>${showBillable ? `<span>Billable: ${member.billable === false ? 'No' : 'Yes'}</span>` : ''}${showDailyRate ? `<span>Daily Rate: ${dailyRateLabel}</span>` : ''}</div>
            <div class="member-meta">Dates: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}</div>
            ${commentText ? `<div class="member-meta">Comments: ${commentText}</div>` : ''}
          </div>
          <div>
            <button type="button" class="btn-flat teal-text" data-action="view-member" data-position-id="${member.positionId}"><i class="material-icons tiny">visibility</i></button>
            ${canEditPosition ? `<button type="button" class="btn-flat blue-text" data-action="edit-member" data-position-id="${member.positionId}"><i class="material-icons tiny">edit</i></button>` : ''}
            <button type="button" class="btn-flat red-text" data-action="remove-member" data-position-id="${member.positionId}"><i class="material-icons tiny">delete</i></button>
          </div>
        </div>
      `;
      return wrapper;
    };

    const buckets = new Map();
    const pushUnique = (bucket, member, consultant) => {
      const id = member.consultantId ? `consultant-${Number(member.consultantId)}` : `position-${String(member.positionId || Math.random())}`;
      if (bucket.ids.has(id)) return;
      bucket.ids.add(id);
      bucket.members.push({ member, consultant });
    };

    allMembers.forEach((member) => {
      const consultant = findConsultantById(member.consultantId);
      const areaLabel = projectPositionAreaLabel(member);
      if (!buckets.has(areaLabel)) buckets.set(areaLabel, { label: areaLabel, members: [], ids: new Set() });
      pushUnique(buckets.get(areaLabel), member, consultant);
    });

    const orderedGroups = sortProjectPositionAreaGroups(Array.from(buckets.values()))
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
    console.debug('[renderProjects] entered', { projectCount: projects.length });
    ui.projectsBody.innerHTML = '';
    projects.forEach((project) => {
      try {
        const row = document.createElement('tr');
        const client = findBusinessPartnerById(project?.clientBusinessPartnerId);
        const delivery = findBusinessPartnerById(project?.deliveryPartnerBusinessPartnerId);
        const displayStatus = deriveProjectDisplayStatusFromData({
          startDate: project?.startDate || '',
          projectStatus: project?.projectStatus || 'Not Started',
          projectPhases: Array.isArray(project?.projectPhases) ? project.projectPhases : []
        });
        row.innerHTML = `
          <td>${project?.projectName || 'Untitled Project'}</td>
          <td>${client?.companyName || '—'}</td>
          <td><span class="status-badge ${statusClassByValue(displayStatus)}">${displayStatus}</span></td>
          <td>${consultantNameById(project?.managerConsultantId)}</td>
          <td>${project?.projectType || '—'}</td>
          <td>${delivery?.companyName || '—'}</td>
          <td><span class="chip date-chip">${formatDate(project?.startDate)} → ${formatDate(project?.endDate)}</span></td>
          <td class="actions-cell">
            <div class="actions-group">
              <button class="btn-flat teal-text" data-action="view-project" data-id="${project?.id}"><i class="material-icons tiny">visibility</i></button>
              <button class="btn-flat blue-text" data-action="edit-project" data-id="${project?.id}"><i class="material-icons tiny">edit</i></button>
              <button class="btn-flat red-text" data-action="delete-project" data-id="${project?.id}"><i class="material-icons tiny">delete</i></button>
            </div>
          </td>
        `;
        ui.projectsBody.appendChild(row);
      } catch (error) {
        console.error('[renderProjects] failed for project row', { projectId: project?.id, error });
      }
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
        <td>${formatMoney(consultant.salary || 0)}</td>
        <td>${consultant.companyBranchName || '—'}</td>
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

    ui.companyBranchesList.innerHTML = '';
    companyBranches.forEach((branch) => {
      const li = document.createElement('li');
      li.className = 'collection-item company-branch-item';
      const address = [branch.streetName, branch.streetNumber, branch.postalCode, branch.city, branch.region, branch.country].filter(Boolean).join(', ');
      li.innerHTML = `
        <div class="company-branch-item-content">
          <div class="company-branch-item-title">${branch.name || '—'}</div>
          <div class="company-branch-item-meta">${branch.taxIdentification ? `Tax ID: ${branch.taxIdentification}` : 'Tax ID: —'}</div>
          <div class="company-branch-item-meta">${address || 'Address: —'}</div>
        </div>
        <div class="company-branch-item-actions">
          <button class="btn-flat blue-text company-branch-action-btn" data-action="edit-company-branch" data-id="${branch.id}" aria-label="Edit branch ${branch.name || ''}"><i class="material-icons tiny">edit</i></button>
          <button class="btn-flat red-text company-branch-action-btn" data-action="delete-company-branch" data-id="${branch.id}" aria-label="Delete branch ${branch.name || ''}"><i class="material-icons tiny">delete</i></button>
        </div>
      `;
      ui.companyBranchesList.appendChild(li);
    });
  };

  const clearCompanyLogoImages = () => {
    if (ui.sidebarLogoImage) {
      ui.sidebarLogoImage.hidden = true;
      ui.sidebarLogoImage.removeAttribute('src');
    }
    if (ui.companyLogoPreviewImage) {
      ui.companyLogoPreviewImage.hidden = true;
      ui.companyLogoPreviewImage.removeAttribute('src');
    }
  };

  const renderCompanyLogoFallback = () => {
    clearCompanyLogoImages();
    if (ui.sidebarLogoFallback) ui.sidebarLogoFallback.hidden = false;
    if (ui.companyLogoPreviewEmpty) ui.companyLogoPreviewEmpty.hidden = false;
    if (ui.removeCompanyLogoBtn) ui.removeCompanyLogoBtn.disabled = true;
  };

  const renderCompanyLogoUi = () => {
    const hasLogo = Boolean(companyLogo?.hasLogo && companyLogo?.logoUrl);
    if (!hasLogo) {
      renderCompanyLogoFallback();
      return;
    }
    const logoUrl = String(companyLogo.logoUrl);
    const probe = new Image();
    probe.onload = () => {
      if (ui.sidebarLogoImage) {
        ui.sidebarLogoImage.src = logoUrl;
        ui.sidebarLogoImage.hidden = false;
      }
      if (ui.companyLogoPreviewImage) {
        ui.companyLogoPreviewImage.src = logoUrl;
        ui.companyLogoPreviewImage.hidden = false;
      }
      if (ui.sidebarLogoFallback) ui.sidebarLogoFallback.hidden = true;
      if (ui.companyLogoPreviewEmpty) ui.companyLogoPreviewEmpty.hidden = true;
      if (ui.removeCompanyLogoBtn) ui.removeCompanyLogoBtn.disabled = false;
    };
    probe.onerror = () => {
      companyLogo = { hasLogo: false, logoUrl: null };
      renderCompanyLogoFallback();
    };
    probe.src = logoUrl;
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
    [fields.businessPartnerCompanyName, fields.businessPartnerTaxIdentification, fields.businessPartnerTypeId, fields.businessPartnerAddressStreet, fields.businessPartnerAddressNumber, fields.businessPartnerPostalCode, fields.businessPartnerCity, fields.businessPartnerRegion, fields.businessPartnerCountry]
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

  const rebuildCompanyBranchRegionSelect = ({ countryCode = '', regionValue = '' } = {}) => {
    const normalizedCountry = String(countryCode || '').toUpperCase();
    const regions = fallbackHolidayRegionsByCountry[normalizedCountry] || [];
    fields.companyBranchRegion.innerHTML = '<option value="" selected>No region</option>';
    regions.forEach((region) => fields.companyBranchRegion.add(new Option(region, region, false, String(region) === String(regionValue))));
    fields.companyBranchRegion.disabled = !normalizedCountry || !regions.length;
    if (!regions.length) fields.companyBranchRegion.value = '';
    resetSelect('companyBranchRegion', fields.companyBranchRegion);
  };

  const rebuildCompanyBranchCountrySelect = (countryValue = '') => {
    const countryCodes = [...new Set([...(fallbackHolidayCountries || []), ...Object.keys(countryNamesByCode)])].sort();
    fields.companyBranchCountry.innerHTML = '<option value="" selected>No country</option>';
    countryCodes.forEach((code) => fields.companyBranchCountry.add(new Option(`${code} - ${countryNamesByCode[code] || code}`, code)));
    if (countryValue && !countryNamesByCode[countryValue]) {
      fields.companyBranchCountry.add(new Option(countryValue, countryValue, false, true));
    }
    fields.companyBranchCountry.value = countryValue || '';
    resetSelect('companyBranchCountry', fields.companyBranchCountry);
  };

  const resetCompanyBranchForm = () => {
    ui.companyBranchForm?.reset();
    if (fields.companyBranchId) fields.companyBranchId.value = '';
    if (ui.companyBranchModalTitle) ui.companyBranchModalTitle.textContent = 'Add Company Branch';
    rebuildCompanyBranchCountrySelect('');
    fields.companyBranchRegion.innerHTML = '<option value="" selected>No region</option>';
    fields.companyBranchRegion.disabled = true;
    resetSelect('companyBranchRegion', fields.companyBranchRegion);
    updateTextFields();
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
    [fields.consultantName, fields.consultantStartDate, fields.consultantAreaIds, fields.consultantCompanyRoleId, fields.consultantSalary, fields.consultantCompanyBranchId].forEach((el) => {
      el.disabled = readOnly;
    });
    fields.consultantHolidayLocationId.disabled = readOnly;
    resetSelect('consultantAreas', fields.consultantAreaIds);
    resetSelect('consultantCompanyRole', fields.consultantCompanyRoleId);
    resetSelect('consultantCompanyBranch', fields.consultantCompanyBranchId);
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
    showClosedProjectPositions = false;
    if (ui.showClosedProjectPositionsToggle) ui.showClosedProjectPositionsToggle.checked = false;
    activeProjectWorkspaceTab = 'overview';
    projectFiles = [];
    revenueInvoices = [];
    revenueInvoicePeriods = [];
    selectedInvoicePeriodMonth = '';
    revenueSummary = null;
    revenueActualsSummary = null;
    revenueForecastBreakdown = [];
    selectedRevenueForecastMonth = '';
    revenueForecastDetails = [];
    profitabilitySummary = null;
    profitabilityBreakdown = [];
    selectedProfitabilityMonth = '';
    profitabilityDetails = [];
    renderRevenueSummary();
    renderRevenueActuals();
    renderRevenueInvoicePeriods();
    renderRevenueMonthInvoices();
    renderRevenueForecastBreakdown();
    renderRevenueForecastDetails();
    renderProfitability();
    renderProfitabilityDetails();
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
      { key: 'companyBranches', path: '/api/company-branches', prop: 'companyBranches', fallback: [] },
      { key: 'businessPartners', path: '/api/business-partners', prop: 'businessPartners', fallback: [] },
      { key: 'holidayLocations', path: '/api/holiday-locations', prop: 'holidayLocations', fallback: [] },
      { key: 'allocationSimulations', path: '/api/allocation-simulations', prop: 'simulations', fallback: [] },
      { key: 'companyLogo', path: '/api/company-logo', prop: 'companyLogo', fallback: { hasLogo: false, logoUrl: null } }
    ];

    const results = await Promise.allSettled(endpoints.map((item) => request(item.path)));
    const loaded = {};
    const failed = [];

    const extractCollection = (payload, preferredProp, fallback = []) => {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== 'object') return fallback;
      if (Array.isArray(payload[preferredProp])) return payload[preferredProp];
      if (Array.isArray(payload.items)) return payload.items;
      if (Array.isArray(payload.data)) return payload.data;
      return fallback;
    };

    const extractCompanyLogo = (payload) => {
      if (!payload || typeof payload !== 'object') return { hasLogo: false, logoUrl: null };
      return {
        hasLogo: Boolean(payload.hasLogo),
        logoUrl: payload.logoUrl || null
      };
    };

    results.forEach((result, index) => {
      const endpoint = endpoints[index];
      if (result.status === 'fulfilled') {
        loaded[endpoint.key] = endpoint.key === 'companyLogo'
          ? extractCompanyLogo(result.value)
          : extractCollection(result.value, endpoint.prop, endpoint.fallback);
        if (endpoint.key === 'projects') {
          console.debug('[loadAll] raw /api/projects response', result.value);
          console.debug('[loadAll] Array.isArray(projectsRes.projects)', Array.isArray(result.value?.projects));
          console.debug('[loadAll] normalized projects length', loaded[endpoint.key].length);
        }
      } else {
        loaded[endpoint.key] = endpoint.fallback;
        failed.push(endpoint.path);
        if (endpoint.key === 'projects') {
          console.error('[loadAll] /api/projects request failed', result.reason);
        }
      }
    });

    console.debug('[loadAll] /api/projects payload', loaded.projects);
    projects = Array.isArray(loaded.projects) ? loaded.projects : [];
    console.debug('[loadAll] projects loaded', { count: projects.length });
    consultants = loaded.consultants;
    timeTrackingConsultants = loaded.consultants;
    roles = loaded.roles;
    areas = loaded.areas;
    dayOffTypes = loaded.dayOffTypes;
    businessPartnerTypes = loaded.businessPartnerTypes;
    projectTypes = loaded.projectTypes;
    companyBranches = loaded.companyBranches;
    businessPartners = loaded.businessPartners;
    holidayLocations = loaded.holidayLocations;
    allocationSimulations = loaded.allocationSimulations;
    companyLogo = loaded.companyLogo || { hasLogo: false, logoUrl: null };

    renderProjects();
    console.debug('[loadAll] empty state visible', projects.length === 0);
    renderConsultants();
    renderBusinessPartners();
    renderAdminLists();
    renderCompanyLogoUi();
    await refreshTimelines();
    rebuildProjectSelects({
      managerId: fields.managerId.value,
      projectType: fields.projectType.value,
      clientBusinessPartnerId: fields.clientBusinessPartnerId.value,
      clientContactIds: selectedIds(fields.clientContactIds),
      deliveryPartnerBusinessPartnerId: fields.deliveryPartnerBusinessPartnerId.value,
      deliveryPartnerContactIds: selectedIds(fields.deliveryPartnerContactIds),
      contractWithBranchId: fields.contractWithBranchId.value
    });
    rebuildConsultantSelects({ areaIds: selectedIds(fields.consultantAreaIds), companyRoleId: fields.consultantCompanyRoleId.value, companyBranchId: fields.consultantCompanyBranchId.value, holidayLocationId: fields.consultantHolidayLocationId.value });
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
      deliveryPartnerContactIds: selectedIds(fields.deliveryPartnerContactIds),
      contractWithBranchId: fields.contractWithBranchId.value
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
      deliveryPartnerContactIds: [],
      contractWithBranchId: fields.contractWithBranchId.value
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
    if (ui.projectPositionStatusModal) ui.projectPositionStatusModal.value = 'Open';
    ui.memberStartDateModal.value = fields.startDate.value;
    ui.memberEndDateModal.value = fields.endDate.value;
    ui.memberAllocationModal.value = '100';
    if (ui.memberBillableModal) ui.memberBillableModal.checked = true;
    if (ui.memberDailyRateModal) ui.memberDailyRateModal.value = '';
    rebuildPositionRateCurrencySelect(ui.memberDailyRateCurrencyModal, 'EUR');
    updatePositionRateVisibilityForAdd();
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
    if (!option.dataset.consultantId) {
      modalTempConsultantIds = [];
      return;
    }
    const id = Number(option.dataset.consultantId);
    modalTempConsultantIds = Number.isNaN(id) ? [] : [id];
  });

  ui.saveConsultantAssignmentsBtn.addEventListener('click', async () => {
    const role = ui.projectRoleModal.value;
    if (!role) { toast('Project Role is required', 'red darken-1'); return; }
    const start = ui.memberStartDateModal.value;
    const end = ui.memberEndDateModal.value;
    if (start && end && start > end) { toast('Start date cannot be after end date', 'red darken-1'); return; }
    const allocation = Number(ui.memberAllocationModal.value || 100);
    if (Number.isNaN(allocation) || allocation < 0 || allocation > 100) {
      toast('Allocation must be between 0 and 100', 'red darken-1');
      return;
    }

    const selectedConsultantId = modalTempConsultantIds.length ? Number(modalTempConsultantIds[0]) : null;
    const selectedStatus = ui.projectPositionStatusModal?.value || (selectedConsultantId ? 'Assigned' : 'Open');
    const dailyRateValue = ui.memberDailyRateModal?.value ? Number(ui.memberDailyRateModal.value) : null;
    selectedProjectAssignments.push({
      positionId: `${Date.now()}-${Math.random()}`,
      consultantId: selectedConsultantId,
      areaId: modalSelectedAreaId ? Number(modalSelectedAreaId) : null,
      projectRole: role,
      startDate: start,
      endDate: end,
      allocation,
      billable: ui.memberBillableModal ? ui.memberBillableModal.checked : true,
      dailyRate: dailyRateValue,
      dailyRateCurrency: dailyRateValue !== null && ui.memberDailyRateCurrencyModal?.value ? String(ui.memberDailyRateCurrencyModal.value).trim().toUpperCase() : null,
      comments: '',
      status: selectedStatus
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
      toast(fields.projectId.value ? 'Project position saved' : 'Project position added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save project position', 'red darken-1');
    }
  });

  ui.projectMembersList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const positionId = String(button.dataset.positionId || '');
    const member = selectedProjectAssignments.find((item) => String(item.positionId) === positionId);
    if (!member) return;
    const consultantId = member.consultantId ? Number(member.consultantId) : 0;

    if (button.dataset.action === 'remove-member') {
      selectedProjectAssignments = selectedProjectAssignments.filter((item) => String(item.positionId) !== positionId);
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
        toast('Project position removed', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to remove project position', 'red darken-1');
      }
      return;
    }
    if (button.dataset.action === 'edit-member' && projectViewMode === 'view') {
      toast('Switch project to Edit mode to modify project positions', 'blue-grey darken-2');
      return;
    }

    const readOnly = button.dataset.action === 'view-member';
    ui.memberModalTitle.textContent = readOnly ? 'View Project Position' : 'Edit Project Position';
    ui.memberDetailsContent?.classList.toggle('form-mode-view', readOnly);
    ui.memberDetailsContent?.classList.toggle('form-mode-edit', !readOnly);
    ui.memberEditConsultantId.value = positionId;
    ui.memberAllocationEdit.value = Number(member.allocation ?? 100);
    if (ui.memberBillableEdit) ui.memberBillableEdit.checked = member.billable !== false;
    ui.memberCommentsEdit.value = member.comments || '';
    ui.memberStartDateEdit.value = member.startDate || '';
    ui.memberEndDateEdit.value = member.endDate || '';
    if (ui.memberDailyRateEdit) ui.memberDailyRateEdit.value = member.dailyRate ?? '';
    rebuildMemberStatusSelect(getProjectPositionDisplayStatus(member));
    rebuildPositionRateCurrencySelect(ui.memberDailyRateCurrencyEdit, member.dailyRateCurrency || 'EUR');
    rebuildMemberAreaSelect(member.areaId);
    rebuildMemberConsultantSelect({ areaId: member.areaId, consultantId, positionId });
    rebuildMemberRoleSelect(member.projectRole || 'Project Position');
    updatePositionRateVisibilityForEdit({ readOnly });

    if (ui.memberAreaModal) ui.memberAreaModal.disabled = readOnly;
    if (ui.memberConsultantModal) ui.memberConsultantModal.disabled = readOnly;
    ui.memberProjectRoleModal.disabled = readOnly;
    if (ui.memberPositionStatusEdit) ui.memberPositionStatusEdit.disabled = readOnly;
    ui.memberAllocationEdit.disabled = readOnly;
    if (ui.memberBillableEdit) ui.memberBillableEdit.disabled = readOnly;
    if (ui.memberDailyRateEdit) ui.memberDailyRateEdit.disabled = readOnly;
    if (ui.memberDailyRateCurrencyEdit) ui.memberDailyRateCurrencyEdit.disabled = readOnly;
    ui.memberCommentsEdit.disabled = readOnly;
    ui.memberStartDateEdit.disabled = readOnly;
    ui.memberEndDateEdit.disabled = readOnly;
    ui.saveMemberDetailsBtn.hidden = readOnly;
    if (ui.memberAreaModal) resetSelect('memberArea', ui.memberAreaModal);
    if (ui.memberConsultantModal) resetSelect('memberConsultant', ui.memberConsultantModal);
    if (ui.memberPositionStatusEdit) resetSelect('memberPositionStatus', ui.memberPositionStatusEdit);
    resetSelect('memberRole', ui.memberProjectRoleModal);
    updateTextFields();
    modals.memberDetails?.open();
  });

  if (ui.memberAreaModal) {
    ui.memberAreaModal.addEventListener('change', () => {
      const positionId = String(ui.memberEditConsultantId.value || '');
      const selectedConsultantId = ui.memberConsultantModal?.value ? Number(ui.memberConsultantModal.value) : null;
      const selectedAreaId = ui.memberAreaModal.value ? Number(ui.memberAreaModal.value) : null;
      rebuildMemberConsultantSelect({ areaId: selectedAreaId, consultantId: selectedConsultantId, positionId });
    });
  }
  if (ui.memberBillableModal) {
    ui.memberBillableModal.addEventListener('change', updatePositionRateVisibilityForAdd);
  }
  if (ui.memberBillableEdit) {
    ui.memberBillableEdit.addEventListener('change', () => {
      const readOnly = ui.saveMemberDetailsBtn.hidden;
      updatePositionRateVisibilityForEdit({ readOnly });
    });
  }
  if (ui.showClosedProjectPositionsToggle) {
    ui.showClosedProjectPositionsToggle.addEventListener('change', () => {
      showClosedProjectPositions = Boolean(ui.showClosedProjectPositionsToggle.checked);
      updateProjectMembersPanel();
    });
  }
  fields.projectType.addEventListener('change', () => {
    updatePositionRateVisibilityForAdd();
    const readOnly = ui.saveMemberDetailsBtn.hidden;
    updatePositionRateVisibilityForEdit({ readOnly });
    updateProjectMembersPanel();
  });

  ui.saveMemberDetailsBtn.addEventListener('click', async () => {
    const positionId = String(ui.memberEditConsultantId.value || '');
    const item = selectedProjectAssignments.find((member) => String(member.positionId) === positionId);
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
    item.areaId = ui.memberAreaModal?.value ? Number(ui.memberAreaModal.value) : null;
    item.status = ui.memberPositionStatusEdit?.value || item.status || 'Open';
    item.consultantId = ui.memberConsultantModal?.value ? Number(ui.memberConsultantModal.value) : null;
    if (item.consultantId && (!item.status || item.status === 'Open')) {
      item.status = 'Assigned';
    } else if (!item.consultantId && item.status === 'Assigned') {
      item.status = 'Open';
    }
    item.allocation = allocation;
    item.billable = ui.memberBillableEdit ? ui.memberBillableEdit.checked : true;
    item.dailyRate = ui.memberDailyRateEdit?.value ? Number(ui.memberDailyRateEdit.value) : null;
    item.dailyRateCurrency = item.dailyRate !== null && ui.memberDailyRateCurrencyEdit?.value ? String(ui.memberDailyRateCurrencyEdit.value).trim().toUpperCase() : null;
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
      toast('Project position updated', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save project position', 'red darken-1');
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
      companyBranchId: fields.consultantCompanyBranchId.value ? Number(fields.consultantCompanyBranchId.value) : null,
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
    fields.contractWithBranchId.value = project.contractWithBranchId || '';
    fields.startDate.value = project.startDate;
    fields.endDate.value = project.endDate;
    showClosedProjectPositions = false;
    if (ui.showClosedProjectPositionsToggle) ui.showClosedProjectPositionsToggle.checked = false;
    const projectPositions = project.projectPositions || project.consultantAssignments || [];
    selectedProjectAssignments = projectPositions.map((item) => ({
      positionId: String(item.id || `${Date.now()}-${Math.random()}`),
      consultantId: item.consultantId ? Number(item.consultantId) : null,
      areaId: item.areaId ? Number(item.areaId) : null,
      projectRole: item.projectRole || 'Project Position',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      allocation: Number(item.allocation ?? 100),
      billable: item.billable !== false,
      dailyRate: item.dailyRate === '' || item.dailyRate === null || item.dailyRate === undefined ? null : Number(item.dailyRate),
      dailyRateCurrency: item.dailyRateCurrency ? String(item.dailyRateCurrency).trim().toUpperCase() : null,
      comments: item.comments || '',
      status: item.status || (item.consultantId ? 'Assigned' : 'Open')
    }));
    selectedProjectPhases = (project.projectPhases || []).map((item) => ({ id: String(item.id || Date.now() + Math.random()), name: item.name || '', startDate: item.startDate || '', endDate: item.endDate || '' }));
    selectedProjectMilestones = (project.projectMilestones || []).map((item) => ({ id: String(item.id || Date.now() + Math.random()), phaseId: item.phaseId ? String(item.phaseId) : '', name: item.name || '', startDate: item.startDate || '', endDate: item.endDate || '' }));
    rebuildProjectPlanningSelects();

    if (project.managerConsultantId && !selectedProjectAssignments.some((item) => item.projectRole === 'Project Manager')) {
      selectedProjectAssignments.unshift({
        positionId: `${Date.now()}-pm`,
        consultantId: Number(project.managerConsultantId),
        projectRole: 'Project Manager',
        startDate: project.startDate,
        endDate: project.endDate,
        allocation: 100,
        billable: true,
        dailyRate: null,
        dailyRateCurrency: null,
        comments: '',
        status: 'Assigned'
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
      deliveryPartnerContactIds: (project.deliveryPartnerContacts || []).map((item) => Number(item.id)),
      contractWithBranchId: project.contractWithBranchId || ''
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
    await loadRevenueData(project.id);
    applyProjectModeUi('openProject-final');
    updateTextFields();
  });

  ui.projectRevenueSubtabs?.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.revenueSubtab;
      if (!next) return;
      activeRevenueSubtab = next;
      renderRevenueSubtabs();
    });
  });

  ui.projectRevenueForecastBody?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="forecast-month-detail"]');
    if (!button) return;
    const month = String(button.dataset.month || '').trim();
    const projectId = Number(fields.projectId.value || 0);
    if (!projectId || !month) return;
    console.debug(`[RevenueForecast] Delegated forecast detail button click month=${month}, projectId=${projectId}`);
    try {
      await loadRevenueForecastMonthDetails(projectId, month);
    } catch (error) {
      console.debug('[RevenueForecast] Failed to open forecast details modal', error);
      toast(error.message || 'Unable to load forecast month details', 'red darken-1');
    }
  });

  ui.projectProfitabilityBody?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="profitability-month-detail"]');
    if (!button) return;
    const month = String(button.dataset.month || '').trim();
    const projectId = Number(fields.projectId.value || 0);
    if (!projectId || !month) return;
    try {
      await loadProfitabilityMonthDetails(projectId, month);
    } catch (error) {
      toast(error.message || 'Unable to load profitability month details', 'red darken-1');
    }
  });

  ui.projectRevenueInvoicePeriodsBody?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const month = String(button.dataset.month || '').trim();
    const period = revenueInvoicePeriods.find((item) => String(item.month) === month);
    const projectId = Number(fields.projectId.value || 0);
    if (!projectId || !period) return;

    if (button.dataset.action === 'add-invoice-period') {
      selectedInvoicePeriodMonth = month;
      renderRevenueMonthInvoices();
      resetInvoiceModal(null, {
        periodFrom: period.periodFrom,
        periodTo: period.periodTo,
        amount: period.proposedAmount
      });
      modals.invoice?.open();
      return;
    }
    if (button.dataset.action === 'view-period-invoices') {
      selectedInvoicePeriodMonth = month;
      renderRevenueMonthInvoices();
      return;
    }
    if (button.dataset.action === 'view-timesheet-details') {
      try {
        const payload = await request(`/api/projects/${projectId}/revenue/timesheet-details?month=${encodeURIComponent(month)}`);
        revenueTimesheetDetails = payload?.details || [];
        renderTimesheetDetailsModal(period.monthLabel || month);
        modals.timesheetDetails?.open();
      } catch (error) {
        toast(error.message || 'Unable to load timesheet details', 'red darken-1');
      }
      return;
    }
  });

  ui.projectRevenueMonthInvoicesBody?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const invoiceId = Number(button.dataset.id);
    const invoice = revenueInvoices.find((item) => Number(item.id) === invoiceId);
    if (!invoice) return;

    if (button.dataset.action === 'edit-invoice') {
      resetInvoiceModal(invoice);
      modals.invoice?.open();
      return;
    }
    if (button.dataset.action === 'add-payment') {
      resetPaymentModal(invoiceId);
      modals.payment?.open();
      return;
    }
    if (button.dataset.action === 'generate-invoice') {
      generateInvoicePrintout(invoiceId);
      return;
    }
    if (button.dataset.action === 'delete-invoice') {
      const confirmed = window.confirm(`Delete invoice "${invoice.invoiceRef || invoice.id}"?`);
      if (!confirmed) return;
      try {
        await request(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
        await loadRevenueData(fields.projectId.value);
        toast('Invoice deleted', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to delete invoice', 'red darken-1');
      }
    }
  });

  ui.saveInvoiceBtn?.addEventListener('click', async () => {
    const projectId = Number(fields.projectId.value);
    if (!projectId) return;
    const payload = {
      invoiceRef: ui.invoiceRef.value.trim(),
      periodFrom: ui.invoicePeriodFrom.value,
      periodTo: ui.invoicePeriodTo.value,
      invoiceDate: ui.invoiceDate.value,
      dueDate: ui.invoiceDueDate.value,
      amount: Number(ui.invoiceAmount.value || 0),
      status: ui.invoiceStatus.value,
      notes: ui.invoiceNotes.value.trim()
    };
    if (!payload.periodFrom || !payload.periodTo || !payload.invoiceDate) {
      toast('Period and invoice date are required', 'red darken-1');
      return;
    }
    try {
      const invoiceId = Number(ui.invoiceId.value || 0);
      await request(invoiceId ? `/api/invoices/${invoiceId}` : `/api/projects/${projectId}/invoices`, {
        method: invoiceId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      modals.invoice?.close();
      await loadRevenueData(projectId);
      toast(invoiceId ? 'Invoice updated' : 'Invoice added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save invoice', 'red darken-1');
    }
  });

  ui.savePaymentBtn?.addEventListener('click', async () => {
    const invoiceId = Number(ui.paymentInvoiceId.value || 0);
    if (!invoiceId) return;
    const payload = {
      paymentDate: ui.paymentDate.value,
      amount: Number(ui.paymentAmount.value || 0),
      notes: ui.paymentNotes.value.trim()
    };
    if (!payload.paymentDate || !(payload.amount > 0)) {
      toast('Payment date and amount are required', 'red darken-1');
      return;
    }
    try {
      const paymentId = Number(ui.paymentId.value || 0);
      await request(paymentId ? `/api/payments/${paymentId}` : `/api/invoices/${invoiceId}/payments`, {
        method: paymentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      modals.payment?.close();
      await loadRevenueData(fields.projectId.value);
      toast('Payment saved', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save payment', 'red darken-1');
    }
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
    rebuildConsultantSelects({ areaIds: consultant.areaIds || [], companyRoleId: consultant.companyRoleId || '', companyBranchId: consultant.companyBranchId || '', holidayLocationId: consultant.holidayLocationId || '' });
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

  ui.showCompanyBranchFormBtn?.addEventListener('click', () => {
    resetCompanyBranchForm();
    modals.companyBranch?.open();
  });

  ui.sidebarLogoImage?.addEventListener('error', () => {
    companyLogo = { hasLogo: false, logoUrl: null };
    renderCompanyLogoFallback();
  });
  ui.companyLogoPreviewImage?.addEventListener('error', () => {
    companyLogo = { hasLogo: false, logoUrl: null };
    renderCompanyLogoFallback();
  });
  ui.uploadCompanyLogoBtn?.addEventListener('click', () => {
    ui.companyLogoUploadInput?.click();
  });
  ui.companyLogoUploadInput?.addEventListener('change', async () => {
    const file = ui.companyLogoUploadInput.files?.[0];
    if (!file) return;
    try {
      const payload = await uploadCompanyLogo(file);
      companyLogo = { hasLogo: Boolean(payload?.hasLogo), logoUrl: payload?.logoUrl || null };
      renderCompanyLogoUi();
      toast('Company logo updated', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to upload company logo', 'red darken-1');
    } finally {
      ui.companyLogoUploadInput.value = '';
    }
  });
  ui.removeCompanyLogoBtn?.addEventListener('click', async () => {
    try {
      await request('/api/company-logo', { method: 'DELETE' });
      companyLogo = { hasLogo: false, logoUrl: null };
      renderCompanyLogoUi();
      toast('Company logo removed', 'orange darken-2');
    } catch (error) {
      toast(error.message || 'Failed to remove company logo', 'red darken-1');
    }
  });

  fields.companyBranchCountry?.addEventListener('change', () => {
    rebuildCompanyBranchRegionSelect({ countryCode: fields.companyBranchCountry.value, regionValue: '' });
  });

  ui.saveCompanyBranchBtn?.addEventListener('click', async () => {
    const payload = {
      name: fields.companyBranchName.value.trim(),
      taxIdentification: fields.companyBranchTaxIdentification.value.trim(),
      streetName: fields.companyBranchStreetName.value.trim(),
      streetNumber: fields.companyBranchStreetNumber.value.trim(),
      postalCode: fields.companyBranchPostalCode.value.trim(),
      city: fields.companyBranchCity.value.trim(),
      region: fields.companyBranchRegion.value.trim(),
      country: fields.companyBranchCountry.value.trim()
    };
    try {
      const editing = Boolean(fields.companyBranchId.value);
      await request(editing ? `/api/company-branches/${fields.companyBranchId.value}` : '/api/company-branches', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll();
      modals.companyBranch?.close();
      resetCompanyBranchForm();
      toast(editing ? 'Company branch updated' : 'Company branch added', 'teal darken-1');
    } catch (error) {
      toast(error.message || 'Failed to save company branch', 'red darken-1');
    }
  });
  ui.companyBranchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    ui.saveCompanyBranchBtn?.click();
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

  ui.companyBranchesList?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const branch = companyBranches.find((item) => Number(item.id) === id);
    if (!branch) return;
    if (button.dataset.action === 'edit-company-branch') {
      resetCompanyBranchForm();
      if (ui.companyBranchModalTitle) ui.companyBranchModalTitle.textContent = 'Edit Company Branch';
      fields.companyBranchId.value = branch.id;
      fields.companyBranchName.value = branch.name || '';
      fields.companyBranchTaxIdentification.value = branch.taxIdentification || '';
      fields.companyBranchStreetName.value = branch.streetName || '';
      fields.companyBranchStreetNumber.value = branch.streetNumber || '';
      fields.companyBranchPostalCode.value = branch.postalCode || '';
      fields.companyBranchCity.value = branch.city || '';
      const countryValue = String(branch.country || '').trim();
      rebuildCompanyBranchCountrySelect(countryValue);
      rebuildCompanyBranchRegionSelect({ countryCode: countryValue, regionValue: branch.region || '' });
      updateTextFields();
      modals.companyBranch?.open();
      return;
    }
    if (button.dataset.action === 'delete-company-branch') {
      try {
        await request(`/api/company-branches/${id}`, { method: 'DELETE' });
        await loadAll();
        toast('Company branch removed', 'orange darken-2');
      } catch (error) {
        toast(error.message || 'Failed to delete company branch', 'red darken-1');
      }
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
      taxIdentification: fields.businessPartnerTaxIdentification.value.trim(),
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
    fields.businessPartnerTaxIdentification.value = partner.taxIdentification || '';
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
    modals.invoice = M.Modal.init(ui.invoiceModal);
    modals.payment = M.Modal.init(ui.paymentModal);
    modals.timesheetDetails = M.Modal.init(ui.timesheetDetailsModal);
    modals.businessPartnerCommunication = M.Modal.init(ui.businessPartnerCommunicationModal);
    modals.companyBranch = M.Modal.init(ui.companyBranchModal);
  }

  ui.forecastDetailsModalCloseBtn?.addEventListener('click', () => {
    closeForecastDetailsModal();
  });

  ui.forecastDetailsModal?.addEventListener('click', (event) => {
    if (event.target === ui.forecastDetailsModal) closeForecastDetailsModal();
  });

  ui.forecastDetailsModal?.addEventListener('cancel', (event) => {
    console.debug('[RevenueForecast] Dialog cancel event captured (Escape/backdrop).');
    event.preventDefault();
    closeForecastDetailsModal();
  });

  ui.forecastDetailsModal?.addEventListener('close', () => {
    console.debug('[RevenueForecast] Dialog close event observed.');
    ui.forecastDetailsModal?.style.removeProperty('display');
  });

  setSection('projects');
  updateProjectTimelineExpandUi();
  resetProjectForm();
  resetConsultantForm();
  resetBusinessPartnerForm();
  loadAll().catch((error) => toast(error.message || 'Unable to load data', 'red darken-1'));
}
;
