/*
  VPM / Inhouse PSA Azure SQL schema preparation script.

  This script mirrors the current SQLite application schema in SQL Server / Azure SQL syntax.
  It is prepared for future Azure setup and is not executed automatically by the local app.

  Conservative type choices:
  - App date-only fields are NVARCHAR(10) in YYYY-MM-DD format because current runtime code treats
    dates as strings for comparisons and JSON responses.
  - Month fields are NVARCHAR(10) to preserve the current SQLite text shape.
  - Boolean integer flags are BIT.
  - Monetary/rate/hour values use DECIMAL instead of SQLite REAL.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE dbo.roles (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_roles PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_roles_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_roles_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.areas (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_areas PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_areas_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_areas_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.day_off_types (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_day_off_types PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_day_off_types_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_day_off_types_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.business_partner_types (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_business_partner_types PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_business_partner_types_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_partner_types_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.project_types (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_types PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_project_types_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_project_types_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.company_branches (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_company_branches PRIMARY KEY,
  name NVARCHAR(255) NOT NULL CONSTRAINT UQ_company_branches_name UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_company_branches_created_at DEFAULT SYSUTCDATETIME(),
  tax_identification NVARCHAR(100) NULL,
  street_name NVARCHAR(255) NULL,
  street_number NVARCHAR(50) NULL,
  postal_code NVARCHAR(50) NULL,
  city NVARCHAR(255) NULL,
  region NVARCHAR(255) NULL,
  country NVARCHAR(255) NULL
);
GO

CREATE TABLE dbo.holiday_locations (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_holiday_locations PRIMARY KEY,
  label NVARCHAR(255) NOT NULL,
  country_code NVARCHAR(2) NOT NULL,
  region_code NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_holiday_locations_created_at DEFAULT SYSUTCDATETIME()
);
GO

-- Azure SQL hardening: use filtered unique indexes for nullable region_code so SQL Server
-- accepts the same existing SQLite data shape where UNIQUE constraints allow multiple NULLs.
CREATE UNIQUE INDEX UQ_holiday_locations_country_region
ON dbo.holiday_locations(country_code, region_code)
WHERE region_code IS NOT NULL;
GO

CREATE TABLE dbo.business_partners (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_business_partners PRIMARY KEY,
  company_name NVARCHAR(255) NOT NULL,
  address_street NVARCHAR(255) NULL,
  address_number NVARCHAR(50) NULL,
  postal_code NVARCHAR(50) NULL,
  city NVARCHAR(255) NULL,
  region NVARCHAR(255) NULL,
  country NVARCHAR(255) NULL,
  business_partner_type_id INT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_partners_created_at DEFAULT SYSUTCDATETIME(),
  tax_identification NVARCHAR(100) NULL,
  CONSTRAINT FK_business_partners_business_partner_type FOREIGN KEY (business_partner_type_id) REFERENCES dbo.business_partner_types(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.business_partner_contacts (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_business_partner_contacts PRIMARY KEY,
  business_partner_id INT NOT NULL,
  name NVARCHAR(255) NULL,
  last_name NVARCHAR(255) NULL,
  email NVARCHAR(255) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_partner_contacts_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_business_partner_contacts_partner FOREIGN KEY (business_partner_id) REFERENCES dbo.business_partners(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.business_partner_contact_phones (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_business_partner_contact_phones PRIMARY KEY,
  contact_id INT NOT NULL,
  phone_number NVARCHAR(100) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_partner_contact_phones_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_business_partner_contact_phones_contact FOREIGN KEY (contact_id) REFERENCES dbo.business_partner_contacts(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.business_partner_contact_emails (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_business_partner_contact_emails PRIMARY KEY,
  contact_id INT NOT NULL,
  email NVARCHAR(255) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_partner_contact_emails_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_business_partner_contact_emails_contact FOREIGN KEY (contact_id) REFERENCES dbo.business_partner_contacts(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.consultants (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_consultants PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  area NVARCHAR(255) NULL,
  position NVARCHAR(255) NULL,
  holiday_location_id INT NULL,
  company_branch_id INT NULL,
  salary DECIMAL(18,2) NOT NULL,
  start_date NVARCHAR(10) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_consultants_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_consultants_holiday_location FOREIGN KEY (holiday_location_id) REFERENCES dbo.holiday_locations(id) ON DELETE SET NULL,
  CONSTRAINT FK_consultants_company_branch FOREIGN KEY (company_branch_id) REFERENCES dbo.company_branches(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.holidays (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_holidays PRIMARY KEY,
  date NVARCHAR(10) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  country_code NVARCHAR(2) NOT NULL,
  region_code NVARCHAR(50) NULL,
  scope NVARCHAR(50) NOT NULL,
  year INT NOT NULL,
  source NVARCHAR(255) NOT NULL,
  CONSTRAINT CK_holidays_scope CHECK (scope IN ('national', 'regional', 'company_override'))
);
GO

-- Azure SQL hardening: use filtered unique indexes for nullable region_code so SQL Server
-- accepts the same existing SQLite data shape where UNIQUE constraints allow multiple NULLs.
CREATE UNIQUE INDEX UQ_holidays_date_country_region_scope
ON dbo.holidays(date, country_code, region_code, scope)
WHERE region_code IS NOT NULL;
GO

CREATE TABLE dbo.holiday_cache (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_holiday_cache PRIMARY KEY,
  country_code NVARCHAR(2) NOT NULL,
  region_code NVARCHAR(50) NULL,
  year INT NOT NULL,
  fetched_at DATETIME2 NOT NULL CONSTRAINT DF_holiday_cache_fetched_at DEFAULT SYSUTCDATETIME()
);
GO

-- Azure SQL hardening: use filtered unique indexes for nullable region_code so SQL Server
-- accepts the same existing SQLite data shape where UNIQUE constraints allow multiple NULLs.
CREATE UNIQUE INDEX UQ_holiday_cache_country_region_year
ON dbo.holiday_cache(country_code, region_code, year)
WHERE region_code IS NOT NULL;
GO

CREATE TABLE dbo.consultant_holiday_loads (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_consultant_holiday_loads PRIMARY KEY,
  consultant_id INT NOT NULL,
  year INT NOT NULL,
  country_code NVARCHAR(2) NOT NULL,
  region_code NVARCHAR(50) NULL,
  loaded_at DATETIME2 NOT NULL CONSTRAINT DF_consultant_holiday_loads_loaded_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_consultant_holiday_loads_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE
);
GO

-- Azure SQL hardening: use filtered unique indexes for nullable region_code so SQL Server
-- accepts the same existing SQLite data shape where UNIQUE constraints allow multiple NULLs.
CREATE UNIQUE INDEX UQ_consultant_holiday_loads_consultant_year_country_region
ON dbo.consultant_holiday_loads(consultant_id, year, country_code, region_code)
WHERE region_code IS NOT NULL;
GO

CREATE TABLE dbo.consultant_roles (
  consultant_id INT NOT NULL,
  role_id INT NOT NULL,
  CONSTRAINT PK_consultant_roles PRIMARY KEY (consultant_id, role_id),
  CONSTRAINT FK_consultant_roles_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE,
  CONSTRAINT FK_consultant_roles_role FOREIGN KEY (role_id) REFERENCES dbo.roles(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.consultant_areas (
  consultant_id INT NOT NULL,
  area_id INT NOT NULL,
  CONSTRAINT PK_consultant_areas PRIMARY KEY (consultant_id, area_id),
  CONSTRAINT FK_consultant_areas_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE,
  CONSTRAINT FK_consultant_areas_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.consultant_availability (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_consultant_availability PRIMARY KEY,
  consultant_id INT NOT NULL,
  day_off_type_id INT NULL,
  type NVARCHAR(255) NULL,
  start_date NVARCHAR(10) NOT NULL,
  end_date NVARCHAR(10) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_consultant_availability_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_consultant_availability_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE,
  CONSTRAINT FK_consultant_availability_day_off_type FOREIGN KEY (day_off_type_id) REFERENCES dbo.day_off_types(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.projects (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_projects PRIMARY KEY,
  project_name NVARCHAR(255) NOT NULL,
  client_name NVARCHAR(255) NOT NULL,
  project_lead NVARCHAR(255) NOT NULL,
  client_contact NVARCHAR(255) NOT NULL,
  start_date NVARCHAR(10) NOT NULL,
  end_date NVARCHAR(10) NOT NULL,
  manager_consultant_id INT NULL,
  project_type NVARCHAR(255) NULL,
  project_status NVARCHAR(50) NULL,
  client_business_partner_id INT NULL,
  delivery_partner_business_partner_id INT NULL,
  contract_with_branch_id INT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_projects_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_projects_manager_consultant FOREIGN KEY (manager_consultant_id) REFERENCES dbo.consultants(id) ON DELETE SET NULL,
  -- Azure SQL hardening: SQLite uses ON DELETE SET NULL here, but SQL Server can reject
  -- multiple cascade paths because projects has multiple relationships to business_partners.
  -- Application-level cleanup can handle clearing stale partner references.
  CONSTRAINT FK_projects_client_business_partner FOREIGN KEY (client_business_partner_id) REFERENCES dbo.business_partners(id) ON DELETE NO ACTION,
  -- Azure SQL hardening: SQLite uses ON DELETE SET NULL here, but SQL Server rejects
  -- multiple cascade paths because projects has multiple relationships to business_partners.
  -- Application-level cleanup can handle clearing stale partner references.
  CONSTRAINT FK_projects_delivery_partner_business_partner FOREIGN KEY (delivery_partner_business_partner_id) REFERENCES dbo.business_partners(id) ON DELETE NO ACTION,
  CONSTRAINT FK_projects_contract_with_branch FOREIGN KEY (contract_with_branch_id) REFERENCES dbo.company_branches(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.project_client_contacts (
  project_id INT NOT NULL,
  contact_id INT NOT NULL,
  CONSTRAINT PK_project_client_contacts PRIMARY KEY (project_id, contact_id),
  CONSTRAINT FK_project_client_contacts_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  CONSTRAINT FK_project_client_contacts_contact FOREIGN KEY (contact_id) REFERENCES dbo.business_partner_contacts(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.project_delivery_partner_contacts (
  project_id INT NOT NULL,
  contact_id INT NOT NULL,
  CONSTRAINT PK_project_delivery_partner_contacts PRIMARY KEY (project_id, contact_id),
  CONSTRAINT FK_project_delivery_partner_contacts_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  CONSTRAINT FK_project_delivery_partner_contacts_contact FOREIGN KEY (contact_id) REFERENCES dbo.business_partner_contacts(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.project_phases (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_phases PRIMARY KEY,
  project_id INT NOT NULL,
  name NVARCHAR(255) NOT NULL,
  start_date NVARCHAR(10) NOT NULL,
  end_date NVARCHAR(10) NOT NULL,
  CONSTRAINT FK_project_phases_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.project_milestones (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_milestones PRIMARY KEY,
  project_id INT NOT NULL,
  phase_id INT NULL,
  name NVARCHAR(255) NOT NULL,
  start_date NVARCHAR(10) NOT NULL,
  end_date NVARCHAR(10) NOT NULL,
  CONSTRAINT FK_project_milestones_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  -- Azure SQL hardening: SQLite uses ON DELETE SET NULL here, but SQL Server can reject
  -- project -> project_phases -> project_milestones together with project -> project_milestones
  -- as a multiple cascade path. Keep the FK and leave phase cleanup to application logic or
  -- later migration hardening.
  CONSTRAINT FK_project_milestones_phase FOREIGN KEY (phase_id) REFERENCES dbo.project_phases(id) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.project_consultants (
  project_id INT NOT NULL,
  consultant_id INT NOT NULL,
  project_role NVARCHAR(255) NULL,
  start_date NVARCHAR(10) NULL,
  end_date NVARCHAR(10) NULL,
  billable BIT NOT NULL CONSTRAINT DF_project_consultants_billable DEFAULT 1,
  CONSTRAINT PK_project_consultants PRIMARY KEY (project_id, consultant_id),
  CONSTRAINT FK_project_consultants_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  CONSTRAINT FK_project_consultants_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.project_positions (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_positions PRIMARY KEY,
  project_id INT NOT NULL,
  consultant_id INT NULL,
  area_id INT NULL,
  project_role NVARCHAR(255) NOT NULL,
  start_date NVARCHAR(10) NULL,
  end_date NVARCHAR(10) NULL,
  allocation DECIMAL(5,2) NOT NULL CONSTRAINT DF_project_positions_allocation DEFAULT 100,
  billable BIT NOT NULL CONSTRAINT DF_project_positions_billable DEFAULT 1,
  daily_rate DECIMAL(18,2) NULL,
  -- Existing SQLite data may contain non-ISO placeholders, not only 3-letter ISO currency codes.
  daily_rate_currency NVARCHAR(50) NULL,
  comments NVARCHAR(MAX) NULL,
  status NVARCHAR(50) NOT NULL CONSTRAINT DF_project_positions_status DEFAULT 'Open',
  CONSTRAINT FK_project_positions_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  CONSTRAINT FK_project_positions_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE SET NULL,
  CONSTRAINT FK_project_positions_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.monthly_timesheets (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_monthly_timesheets PRIMARY KEY,
  consultant_id INT NOT NULL,
  month_start NVARCHAR(10) NOT NULL,
  status NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_monthly_timesheets_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_monthly_timesheets_consultant_month_start UNIQUE (consultant_id, month_start),
  CONSTRAINT FK_monthly_timesheets_consultant FOREIGN KEY (consultant_id) REFERENCES dbo.consultants(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.monthly_timesheet_lines (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_monthly_timesheet_lines PRIMARY KEY,
  timesheet_id INT NOT NULL,
  project_id INT NULL,
  activity NVARCHAR(255) NULL,
  is_manual BIT NOT NULL CONSTRAINT DF_monthly_timesheet_lines_is_manual DEFAULT 0,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_monthly_timesheet_lines_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_monthly_timesheet_lines_timesheet FOREIGN KEY (timesheet_id) REFERENCES dbo.monthly_timesheets(id) ON DELETE CASCADE,
  CONSTRAINT FK_monthly_timesheet_lines_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE SET NULL
);
GO

CREATE TABLE dbo.monthly_timesheet_entries (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_monthly_timesheet_entries PRIMARY KEY,
  line_id INT NOT NULL,
  entry_date NVARCHAR(10) NOT NULL,
  hours DECIMAL(5,2) NOT NULL CONSTRAINT DF_monthly_timesheet_entries_hours DEFAULT 0,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_monthly_timesheet_entries_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_monthly_timesheet_entries_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_monthly_timesheet_entries_line_entry_date UNIQUE (line_id, entry_date),
  CONSTRAINT FK_monthly_timesheet_entries_line FOREIGN KEY (line_id) REFERENCES dbo.monthly_timesheet_lines(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.allocation_simulations (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_allocation_simulations PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  state_json NVARCHAR(MAX) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_allocation_simulations_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_allocation_simulations_updated_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.project_files (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_files PRIMARY KEY,
  project_id INT NOT NULL,
  original_filename NVARCHAR(255) NOT NULL,
  stored_filename NVARCHAR(255) NOT NULL CONSTRAINT UQ_project_files_stored_filename UNIQUE,
  file_size BIGINT NOT NULL,
  uploaded_at DATETIME2 NOT NULL CONSTRAINT DF_project_files_uploaded_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_project_files_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.project_budgets (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_project_budgets PRIMARY KEY,
  project_id INT NOT NULL,
  budget_name NVARCHAR(255) NOT NULL,
  budget_type NVARCHAR(50) NOT NULL CONSTRAINT DF_project_budgets_budget_type DEFAULT 'Initial',
  status NVARCHAR(50) NOT NULL CONSTRAINT DF_project_budgets_status DEFAULT 'Draft',
  start_date NVARCHAR(10) NOT NULL,
  end_date NVARCHAR(10) NOT NULL,
  amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_project_budgets_amount DEFAULT 0,
  currency NVARCHAR(3) NOT NULL CONSTRAINT DF_project_budgets_currency DEFAULT 'EUR',
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_project_budgets_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_project_budgets_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_project_budgets_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.invoices (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_invoices PRIMARY KEY,
  project_id INT NOT NULL,
  position_id INT NULL,
  invoice_ref NVARCHAR(255) NULL,
  period_from NVARCHAR(10) NOT NULL,
  period_to NVARCHAR(10) NOT NULL,
  invoice_date NVARCHAR(10) NOT NULL,
  due_date NVARCHAR(10) NULL,
  amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_invoices_amount DEFAULT 0,
  status NVARCHAR(50) NOT NULL CONSTRAINT DF_invoices_status DEFAULT 'Draft',
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_invoices_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_invoices_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_invoices_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
  -- Azure SQL hardening: SQLite uses ON DELETE SET NULL here, but SQL Server can reject
  -- project -> project_positions -> invoices together with project -> invoices as a multiple
  -- cascade path. Keep the FK and leave position cleanup to application logic or later migration
  -- hardening.
  CONSTRAINT FK_invoices_position FOREIGN KEY (position_id) REFERENCES dbo.project_positions(id) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.invoice_payments (
  id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_invoice_payments PRIMARY KEY,
  invoice_id INT NOT NULL,
  payment_date NVARCHAR(10) NOT NULL,
  amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_invoice_payments_amount DEFAULT 0,
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_invoice_payments_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_invoice_payments_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_invoice_payments_invoice FOREIGN KEY (invoice_id) REFERENCES dbo.invoices(id) ON DELETE CASCADE
);
GO
