/*
  VPM / Inhouse PSA Azure SQL reference-data seed script.

  Run after 001_schema.sql. This mirrors the default reference data inserted by seed_defaults()
  in the local SQLite bootstrap. It is idempotent by reference name.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO dbo.roles (name)
SELECT seed.name
FROM (VALUES
  (N'TM Junior Consultant'),
  (N'TM Regular Consultant'),
  (N'TM Senior Consultant'),
  (N'Project Manager'),
  (N'EWM Junior Consultant'),
  (N'EWM Regular Consultant'),
  (N'EWM Senior Consultant')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.roles existing WHERE existing.name = seed.name);
GO

INSERT INTO dbo.areas (name)
SELECT seed.name
FROM (VALUES
  (N'TM (Transport Management)'),
  (N'EWM (Extended Warehouse Management)'),
  (N'YL (Yard Logistics)')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.areas existing WHERE existing.name = seed.name);
GO

INSERT INTO dbo.day_off_types (name)
SELECT seed.name
FROM (VALUES
  (N'Vacation'),
  (N'PTO')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.day_off_types existing WHERE existing.name = seed.name);
GO

INSERT INTO dbo.business_partner_types (name)
SELECT seed.name
FROM (VALUES
  (N'Client'),
  (N'Third Party')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.business_partner_types existing WHERE existing.name = seed.name);
GO

INSERT INTO dbo.project_types (name)
SELECT seed.name
FROM (VALUES
  (N'Time Material'),
  (N'Fixed Price'),
  (N'Milestone Billing'),
  (N'Non-Billable')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.project_types existing WHERE existing.name = seed.name);
GO

INSERT INTO dbo.company_branches (name)
SELECT seed.name
FROM (VALUES
  (N'Poland'),
  (N'Germany')
) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.company_branches existing WHERE existing.name = seed.name);
GO
