-- ============================================================
-- UserAccess PostgreSQL Schema
-- Database: UserAccess
-- Run: psql -U <user> -d UserAccess -f schema_postgres.sql
-- ============================================================

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Users" (
    "UserId"     VARCHAR(31)  NOT NULL PRIMARY KEY,
    "FullName"   VARCHAR(100) NOT NULL,
    "Email"      VARCHAR(150) NOT NULL,
    "Department" VARCHAR(63)  NULL,
    "Title"      VARCHAR(63)  NULL,
    "Status"     VARCHAR(20)  NOT NULL DEFAULT 'Active',
    "CreatedOn"  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── ApplicationRoster ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ApplicationRoster" (
    "AppId"      VARCHAR(31)  NOT NULL PRIMARY KEY,
    "aName"      VARCHAR(63)  NOT NULL,
    "WebConsole" VARCHAR(3)   NULL,
    "CloudStart" VARCHAR(63)  NULL,
    "aServer"    VARCHAR(31)  NULL,
    "aDirectory" VARCHAR(63)  NULL,
    "dbName"     VARCHAR(31)  NULL,
    "IsInternal" BOOLEAN      NULL DEFAULT TRUE,
    "DbServer"   VARCHAR(31)  NULL,
    "intURL"     VARCHAR(100) NULL,
    "extURL"     VARCHAR(300) NULL
);

-- ── ApplicationAccessLevel ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ApplicationAccessLevel" (
    "ApplicationID" VARCHAR(31)  NOT NULL REFERENCES "ApplicationRoster"("AppId"),
    "AccessLevel"   VARCHAR(50)  NOT NULL,
    "Comments"      VARCHAR(500) NULL,
    UNIQUE ("ApplicationID", "AccessLevel")
);

-- ── User_Group (Access Junction) ───────────────────────────────
CREATE TABLE IF NOT EXISTS "User_Group" (
    "RecId"         VARCHAR(7)   NOT NULL PRIMARY KEY DEFAULT LEFT(gen_random_uuid()::text, 7),
    "UserId"        VARCHAR(31)  NOT NULL REFERENCES "Users"("UserId"),
    "GroupN"        VARCHAR(31)  NOT NULL,
    "ApplicationId" VARCHAR(31)  NULL REFERENCES "ApplicationRoster"("AppId"),
    "CreatedOn"     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_group_userid ON "User_Group"("UserId");
CREATE INDEX IF NOT EXISTS idx_user_group_appid  ON "User_Group"("ApplicationId");
CREATE INDEX IF NOT EXISTS idx_users_status       ON "Users"("Status");
CREATE INDEX IF NOT EXISTS idx_users_dept         ON "Users"("Department");

-- ── Seed: Applications ─────────────────────────────────────────
INSERT INTO "ApplicationRoster" VALUES
  ('CITYTRACK',   'CityTrack Emergency System',    'Yes', NULL,    'svr-app01', '/apps/citytrack', 'CityTrackDB', TRUE,  'svr-db01', 'http://citytrack.internal.nycem.nyc.gov', NULL),
  ('BUDGETPRO',   'BudgetPro Financial Suite',     'Yes', 'Azure', NULL,        NULL,               'BudgetDB',    TRUE,  'svr-db02', 'http://budgetpro.internal.nycem.nyc.gov',  'https://budgetpro.nycem.nyc.gov'),
  ('WAREHOUSEMGR','Warehouse Management System',   'Yes', NULL,    'svr-app02', '/apps/wms',        'WarehouseDB', TRUE,  'svr-db01', 'http://wms.internal.nycem.nyc.gov',         NULL),
  ('GISPORTAL',   'GIS Mapping Portal',            'Yes', 'Azure', NULL,        NULL,               'GISData',     FALSE, 'svr-db03', 'http://gis.internal.nycem.nyc.gov',          'https://gis.nycem.nyc.gov'),
  ('REPORTDB',    'Reporting & Analytics DB',      'No',  NULL,    'svr-db02',  NULL,               'ReportsDB',   TRUE,  'svr-db02', NULL,                                         NULL),
  ('HRPORTAL',    'HR Self-Service Portal',        'Yes', 'Azure', NULL,        NULL,               NULL,          TRUE,  NULL,       'http://hr.internal.nycem.nyc.gov',           'https://hr.nycem.nyc.gov'),
  ('ALERTNET',    'AlertNet Notification System',  'Yes', NULL,    'svr-app03', '/apps/alertnet',   'AlertDB',     TRUE,  'svr-db01', 'http://alertnet.internal.nycem.nyc.gov',    NULL)
ON CONFLICT ("AppId") DO NOTHING;

-- ── Seed: Access Levels ────────────────────────────────────────
INSERT INTO "ApplicationAccessLevel" VALUES
  ('CITYTRACK',   'Admin',      'Full system administration access'),
  ('CITYTRACK',   'Editor',     'Can create and edit incident records'),
  ('CITYTRACK',   'Viewer',     'Read-only access to all incidents'),
  ('CITYTRACK',   'Reporter',   'Can generate and export reports'),
  ('BUDGETPRO',   'Admin',      'Full budget management access'),
  ('BUDGETPRO',   'Analyst',    'View and edit budget line items'),
  ('BUDGETPRO',   'Approver',   'Can approve budget requests'),
  ('BUDGETPRO',   'ReadOnly',   'View-only budget data'),
  ('WAREHOUSEMGR','Admin',      'Full warehouse system access'),
  ('WAREHOUSEMGR','Manager',    'Manage inventory and staff assignment'),
  ('WAREHOUSEMGR','Operator',   'Log incoming/outgoing inventory'),
  ('WAREHOUSEMGR','Auditor',    'View audit logs and reports'),
  ('GISPORTAL',   'Admin',      'Manage layers and data sources'),
  ('GISPORTAL',   'Publisher',  'Publish and share map layers'),
  ('GISPORTAL',   'Editor',     'Edit geographic features'),
  ('GISPORTAL',   'Viewer',     'View published maps'),
  ('REPORTDB',    'DBA',        'Database administrator — full access'),
  ('REPORTDB',    'ReadWrite',  'Read and write reporting tables'),
  ('REPORTDB',    'ReadOnly',   'Read-only query access'),
  ('HRPORTAL',    'Admin',      'Full HR portal administration'),
  ('HRPORTAL',    'HRStaff',    'Full HR staff capabilities'),
  ('HRPORTAL',    'Manager',    'View team records and approve requests'),
  ('HRPORTAL',    'Employee',   'Self-service access to own records'),
  ('ALERTNET',    'Admin',      'Full AlertNet administration'),
  ('ALERTNET',    'Dispatcher', 'Send and manage alerts'),
  ('ALERTNET',    'Viewer',     'View alert history')
ON CONFLICT ("ApplicationID", "AccessLevel") DO NOTHING;

-- ── Seed: Users ────────────────────────────────────────────────
INSERT INTO "Users" VALUES
  ('vtran',      'Van Tran',          'vtran@nycem.nyc.gov',       'Information Technology', 'IT Director',             'Active',   '2019-06-01'),
  ('jrodriguez', 'Janet Rodriguez',   'jrodriguez@nycem.nyc.gov',  'Operations',             'Operations Manager',      'Active',   '2020-03-15'),
  ('mchen',      'Michael Chen',      'mchen@nycem.nyc.gov',       'Logistics',              'Logistics Coordinator',   'Active',   '2021-07-20'),
  ('asmith',     'Angela Smith',      'asmith@nycem.nyc.gov',      'Finance',                'Budget Analyst',          'Active',   '2020-11-02'),
  ('bwilliams',  'Brian Williams',    'bwilliams@nycem.nyc.gov',   'Planning',               'Senior Planner',          'Active',   '2018-04-08'),
  ('lkim',       'Lisa Kim',          'lkim@nycem.nyc.gov',        'Information Technology', 'Systems Analyst',         'Active',   '2022-01-10'),
  ('dmarcus',    'David Marcus',      'dmarcus@nycem.nyc.gov',     'Operations',             'Operations Specialist',   'Inactive', '2017-09-14'),
  ('sproctor',   'Sandra Proctor',    'sproctor@nycem.nyc.gov',    'Human Resources',        'HR Generalist',           'Active',   '2023-02-28'),
  ('tmontgom',   'Thomas Montgomery', 'tmontgom@nycem.nyc.gov',    'Finance',                'Financial Analyst',       'Active',   '2021-05-17'),
  ('kpatel',     'Kavita Patel',      'kpatel@nycem.nyc.gov',      'Logistics',              'Warehouse Supervisor',    'Active',   '2022-08-03'),
  ('rjohnson',   'Robert Johnson',    'rjohnson@nycem.nyc.gov',    'Planning',               'GIS Specialist',          'Active',   '2020-06-25'),
  ('nwatson',    'Nina Watson',       'nwatson@nycem.nyc.gov',     'Communications',         'Public Information Officer','Active', '2019-12-01'),
  ('clee',       'Chris Lee',         'clee@nycem.nyc.gov',        'Information Technology', 'Database Administrator',  'Active',   '2021-03-22'),
  ('pmendez',    'Patricia Mendez',   'pmendez@nycem.nyc.gov',     'Executive',              'Deputy Commissioner',     'Active',   '2016-01-15'),
  ('jpark',      'James Park',        'jpark@nycem.nyc.gov',       'Operations',             'Field Coordinator',       'Inactive', '2023-09-05')
ON CONFLICT ("UserId") DO NOTHING;

-- ── Seed: Access Records ───────────────────────────────────────
INSERT INTO "User_Group" ("RecId","UserId","GroupN","ApplicationId","CreatedOn") VALUES
  ('UG00001','vtran',     'Admin',     'CITYTRACK',    '2020-01-10'),
  ('UG00002','vtran',     'Admin',     'BUDGETPRO',    '2020-01-10'),
  ('UG00003','vtran',     'DBA',       'REPORTDB',     '2020-01-10'),
  ('UG00004','vtran',     'Admin',     'WAREHOUSEMGR', '2021-03-01'),
  ('UG00005','vtran',     'Admin',     'ALERTNET',     '2022-05-12'),
  ('UG00006','jrodriguez','Editor',    'CITYTRACK',    '2020-04-01'),
  ('UG00007','jrodriguez','Manager',   'WAREHOUSEMGR', '2021-07-15'),
  ('UG00008','jrodriguez','Dispatcher','ALERTNET',     '2022-06-01'),
  ('UG00009','jrodriguez','Employee',  'HRPORTAL',     '2020-04-01'),
  ('UG00010','mchen',     'Operator',  'WAREHOUSEMGR', '2021-08-01'),
  ('UG00011','mchen',     'Viewer',    'CITYTRACK',    '2022-01-15'),
  ('UG00012','mchen',     'Employee',  'HRPORTAL',     '2021-08-01'),
  ('UG00013','asmith',    'Analyst',   'BUDGETPRO',    '2021-01-05'),
  ('UG00014','asmith',    'ReadOnly',  'REPORTDB',     '2021-01-05'),
  ('UG00015','asmith',    'Employee',  'HRPORTAL',     '2021-01-05'),
  ('UG00016','bwilliams', 'Publisher', 'GISPORTAL',    '2019-02-20'),
  ('UG00017','bwilliams', 'Reporter',  'CITYTRACK',    '2019-02-20'),
  ('UG00018','bwilliams', 'ReadOnly',  'REPORTDB',     '2020-03-10'),
  ('UG00019','lkim',      'Admin',     'GISPORTAL',    '2022-02-01'),
  ('UG00020','lkim',      'ReadWrite', 'REPORTDB',     '2022-02-01'),
  ('UG00021','lkim',      'Viewer',    'CITYTRACK',    '2022-06-10'),
  ('UG00022','kpatel',    'Manager',   'WAREHOUSEMGR', '2022-09-01'),
  ('UG00023','kpatel',    'Auditor',   'WAREHOUSEMGR', '2022-09-01'),
  ('UG00024','kpatel',    'Employee',  'HRPORTAL',     '2022-09-01'),
  ('UG00025','tmontgom',  'Approver',  'BUDGETPRO',    '2021-06-01'),
  ('UG00026','tmontgom',  'ReadOnly',  'REPORTDB',     '2021-06-01'),
  ('UG00027','rjohnson',  'Editor',    'GISPORTAL',    '2020-07-10'),
  ('UG00028','rjohnson',  'ReadOnly',  'REPORTDB',     '2021-01-20'),
  ('UG00029','nwatson',   'Dispatcher','ALERTNET',     '2020-01-05'),
  ('UG00030','nwatson',   'Viewer',    'GISPORTAL',    '2020-01-05'),
  ('UG00031','clee',      'DBA',       'REPORTDB',     '2021-04-01'),
  ('UG00032','clee',      'Admin',     'WAREHOUSEMGR', '2022-01-15'),
  ('UG00033','pmendez',   'Viewer',    'CITYTRACK',    '2016-02-01'),
  ('UG00034','pmendez',   'Approver',  'BUDGETPRO',    '2016-02-01'),
  ('UG00035','pmendez',   'Manager',   'HRPORTAL',     '2016-02-01'),
  ('UG00036','sproctor',  'HRStaff',   'HRPORTAL',     '2023-03-01'),
  ('UG00037','sproctor',  'ReadOnly',  'REPORTDB',     '2023-04-10')
ON CONFLICT ("RecId") DO NOTHING;
