"""
mock_data.py — Realistic seed data for UserAccess app (NYCEM-style org context).
Used by FastAPI routers when DB_MODE=mock in .env.
"""
from datetime import datetime, timedelta
import random

# ── Users ──────────────────────────────────────────────────────────────────
USERS = [
    {"userId": "vtran",      "fullName": "Van Tran",          "email": "vtran@nycem.nyc.gov",       "department": "Information Technology", "title": "IT Director",             "status": "Active",   "createdOn": "2019-06-01"},
    {"userId": "jrodriguez", "fullName": "Janet Rodriguez",   "email": "jrodriguez@nycem.nyc.gov",  "department": "Operations",             "title": "Operations Manager",      "status": "Active",   "createdOn": "2020-03-15"},
    {"userId": "mchen",      "fullName": "Michael Chen",      "email": "mchen@nycem.nyc.gov",       "department": "Logistics",              "title": "Logistics Coordinator",   "status": "Active",   "createdOn": "2021-07-20"},
    {"userId": "asmith",     "fullName": "Angela Smith",      "email": "asmith@nycem.nyc.gov",      "department": "Finance",                "title": "Budget Analyst",          "status": "Active",   "createdOn": "2020-11-02"},
    {"userId": "bwilliams",  "fullName": "Brian Williams",    "email": "bwilliams@nycem.nyc.gov",   "department": "Planning",               "title": "Senior Planner",          "status": "Active",   "createdOn": "2018-04-08"},
    {"userId": "lkim",       "fullName": "Lisa Kim",          "email": "lkim@nycem.nyc.gov",        "department": "Information Technology", "title": "Systems Analyst",         "status": "Active",   "createdOn": "2022-01-10"},
    {"userId": "dmarcus",    "fullName": "David Marcus",      "email": "dmarcus@nycem.nyc.gov",     "department": "Operations",             "title": "Operations Specialist",   "status": "Inactive", "createdOn": "2017-09-14"},
    {"userId": "sproctor",   "fullName": "Sandra Proctor",    "email": "sproctor@nycem.nyc.gov",    "department": "Human Resources",        "title": "HR Generalist",           "status": "Active",   "createdOn": "2023-02-28"},
    {"userId": "tmontgom",   "fullName": "Thomas Montgomery", "email": "tmontgom@nycem.nyc.gov",    "department": "Finance",                "title": "Financial Analyst",       "status": "Active",   "createdOn": "2021-05-17"},
    {"userId": "kpatel",     "fullName": "Kavita Patel",      "email": "kpatel@nycem.nyc.gov",      "department": "Logistics",              "title": "Warehouse Supervisor",    "status": "Active",   "createdOn": "2022-08-03"},
    {"userId": "rjohnson",   "fullName": "Robert Johnson",    "email": "rjohnson@nycem.nyc.gov",    "department": "Planning",               "title": "GIS Specialist",          "status": "Active",   "createdOn": "2020-06-25"},
    {"userId": "nwatson",    "fullName": "Nina Watson",       "email": "nwatson@nycem.nyc.gov",     "department": "Communications",         "title": "Public Information Officer","status": "Active", "createdOn": "2019-12-01"},
    {"userId": "clee",       "fullName": "Chris Lee",         "email": "clee@nycem.nyc.gov",        "department": "Information Technology", "title": "Database Administrator",  "status": "Active",   "createdOn": "2021-03-22"},
    {"userId": "pmendez",    "fullName": "Patricia Mendez",   "email": "pmendez@nycem.nyc.gov",     "department": "Executive",              "title": "Deputy Commissioner",     "status": "Active",   "createdOn": "2016-01-15"},
    {"userId": "jpark",      "fullName": "James Park",        "email": "jpark@nycem.nyc.gov",       "department": "Operations",             "title": "Field Coordinator",       "status": "Inactive", "createdOn": "2023-09-05"},
]

# ── Applications ────────────────────────────────────────────────────────────
APPLICATIONS = [
    {
        "appId": "CITYTRACK",   "aName": "CityTrack Emergency System",
        "description": "Core incident tracking and emergency management platform used by all field and operations staff.",
        "webConsole": "Yes",    "cloudStart": None,
        "aServer": "svr-app01", "aDirectory": "/apps/citytrack",
        "dbName": "CityTrackDB","isInternal": True,
        "dbServer": "svr-db01", "intURL": "http://citytrack.internal.nycem.nyc.gov",
        "extURL": None
    },
    {
        "appId": "BUDGETPRO",   "aName": "BudgetPro Financial Suite",
        "description": "Financial management and budget approval system integrated with NYC comptroller systems.",
        "webConsole": "Yes",    "cloudStart": "Azure",
        "aServer": None,        "aDirectory": None,
        "dbName": "BudgetDB",   "isInternal": True,
        "dbServer": "svr-db02", "intURL": "http://budgetpro.internal.nycem.nyc.gov",
        "extURL": "https://budgetpro.nycem.nyc.gov"
    },
    {
        "appId": "WAREHOUSEMGR","aName": "Warehouse Management System",
        "description": "Inventory and logistics management for NYCEM warehouse facilities and supply tracking.",
        "webConsole": "Yes",    "cloudStart": None,
        "aServer": "svr-app02", "aDirectory": "/apps/wms",
        "dbName": "WarehouseDB","isInternal": True,
        "dbServer": "svr-db01", "intURL": "http://wms.internal.nycem.nyc.gov",
        "extURL": None
    },
    {
        "appId": "GISPORTAL",   "aName": "GIS Mapping Portal",
        "description": "Geographic information system for mapping incident zones, resources, and evacuation routes.",
        "webConsole": "Yes",    "cloudStart": "Azure",
        "aServer": None,        "aDirectory": None,
        "dbName": "GISData",    "isInternal": False,
        "dbServer": "svr-db03", "intURL": "http://gis.internal.nycem.nyc.gov",
        "extURL": "https://gis.nycem.nyc.gov"
    },
    {
        "appId": "REPORTDB",    "aName": "Reporting & Analytics DB",
        "description": "Centralized reporting database for analytics, dashboards, and executive intelligence reports.",
        "webConsole": "No",     "cloudStart": None,
        "aServer": "svr-db02",  "aDirectory": None,
        "dbName": "ReportsDB",  "isInternal": True,
        "dbServer": "svr-db02", "intURL": None,
        "extURL": None
    },
    {
        "appId": "HRPORTAL",    "aName": "HR Self-Service Portal",
        "description": "Employee self-service HR system for leave requests, benefits, and personnel management.",
        "webConsole": "Yes",    "cloudStart": "Azure",
        "aServer": None,        "aDirectory": None,
        "dbName": None,         "isInternal": True,
        "dbServer": None,       "intURL": "http://hr.internal.nycem.nyc.gov",
        "extURL": "https://hr.nycem.nyc.gov"
    },
    {
        "appId": "ALERTNET",    "aName": "AlertNet Notification System",
        "description": "Emergency mass notification system for dispatching alerts to staff, public, and partner agencies.",
        "webConsole": "Yes",    "cloudStart": None,
        "aServer": "svr-app03", "aDirectory": "/apps/alertnet",
        "dbName": "AlertDB",    "isInternal": True,
        "dbServer": "svr-db01", "intURL": "http://alertnet.internal.nycem.nyc.gov",
        "extURL": None
    },
]

# ── Access Levels per Application ─────────────────────────────────────────
ACCESS_LEVELS = {
    "CITYTRACK":    [
        {"accessLevel": "Admin",     "comments": "Full system administration access"},
        {"accessLevel": "Editor",    "comments": "Can create and edit incident records"},
        {"accessLevel": "Viewer",    "comments": "Read-only access to all incidents"},
        {"accessLevel": "Reporter",  "comments": "Can generate and export reports"},
    ],
    "BUDGETPRO":    [
        {"accessLevel": "Admin",     "comments": "Full budget management access"},
        {"accessLevel": "Analyst",   "comments": "View and edit budget line items"},
        {"accessLevel": "Approver",  "comments": "Can approve budget requests"},
        {"accessLevel": "ReadOnly",  "comments": "View-only budget data"},
    ],
    "WAREHOUSEMGR": [
        {"accessLevel": "Admin",     "comments": "Full warehouse system access"},
        {"accessLevel": "Manager",   "comments": "Manage inventory and staff assignment"},
        {"accessLevel": "Operator",  "comments": "Log incoming/outgoing inventory"},
        {"accessLevel": "Auditor",   "comments": "View audit logs and reports"},
    ],
    "GISPORTAL":    [
        {"accessLevel": "Admin",     "comments": "Manage layers and data sources"},
        {"accessLevel": "Publisher", "comments": "Publish and share map layers"},
        {"accessLevel": "Editor",    "comments": "Edit geographic features"},
        {"accessLevel": "Viewer",    "comments": "View published maps"},
    ],
    "REPORTDB":     [
        {"accessLevel": "DBA",       "comments": "Database administrator — full access"},
        {"accessLevel": "ReadWrite", "comments": "Read and write reporting tables"},
        {"accessLevel": "ReadOnly",  "comments": "Read-only query access"},
    ],
    "HRPORTAL":     [
        {"accessLevel": "Admin",     "comments": "Full HR portal administration"},
        {"accessLevel": "HRStaff",   "comments": "Full HR staff capabilities"},
        {"accessLevel": "Manager",   "comments": "View team records and approve requests"},
        {"accessLevel": "Employee",  "comments": "Self-service access to own records"},
    ],
    "ALERTNET":     [
        {"accessLevel": "Admin",     "comments": "Full AlertNet administration"},
        {"accessLevel": "Dispatcher","comments": "Send and manage alerts"},
        {"accessLevel": "Viewer",    "comments": "View alert history"},
    ],
}

# ── User Access (User_Group) ────────────────────────────────────────────────
USER_ACCESS = [
    # vtran — IT Director, has broad access
    {"recId": "UG00001", "userId": "vtran",     "groupN": "Admin",     "applicationId": "CITYTRACK",    "createdOn": "2020-01-10"},
    {"recId": "UG00002", "userId": "vtran",     "groupN": "Admin",     "applicationId": "BUDGETPRO",    "createdOn": "2020-01-10"},
    {"recId": "UG00003", "userId": "vtran",     "groupN": "DBA",       "applicationId": "REPORTDB",     "createdOn": "2020-01-10"},
    {"recId": "UG00004", "userId": "vtran",     "groupN": "Admin",     "applicationId": "WAREHOUSEMGR", "createdOn": "2021-03-01"},
    {"recId": "UG00005", "userId": "vtran",     "groupN": "Admin",     "applicationId": "ALERTNET",     "createdOn": "2022-05-12"},
    # jrodriguez — Operations Manager
    {"recId": "UG00006", "userId": "jrodriguez","groupN": "Editor",    "applicationId": "CITYTRACK",    "createdOn": "2020-04-01"},
    {"recId": "UG00007", "userId": "jrodriguez","groupN": "Manager",   "applicationId": "WAREHOUSEMGR", "createdOn": "2021-07-15"},
    {"recId": "UG00008", "userId": "jrodriguez","groupN": "Dispatcher","applicationId": "ALERTNET",     "createdOn": "2022-06-01"},
    {"recId": "UG00009", "userId": "jrodriguez","groupN": "Employee",  "applicationId": "HRPORTAL",     "createdOn": "2020-04-01"},
    # mchen — Logistics
    {"recId": "UG00010", "userId": "mchen",     "groupN": "Operator",  "applicationId": "WAREHOUSEMGR", "createdOn": "2021-08-01"},
    {"recId": "UG00011", "userId": "mchen",     "groupN": "Viewer",    "applicationId": "CITYTRACK",    "createdOn": "2022-01-15"},
    {"recId": "UG00012", "userId": "mchen",     "groupN": "Employee",  "applicationId": "HRPORTAL",     "createdOn": "2021-08-01"},
    # asmith — Finance / Budget
    {"recId": "UG00013", "userId": "asmith",    "groupN": "Analyst",   "applicationId": "BUDGETPRO",    "createdOn": "2021-01-05"},
    {"recId": "UG00014", "userId": "asmith",    "groupN": "ReadOnly",  "applicationId": "REPORTDB",     "createdOn": "2021-01-05"},
    {"recId": "UG00015", "userId": "asmith",    "groupN": "Employee",  "applicationId": "HRPORTAL",     "createdOn": "2021-01-05"},
    # bwilliams — Planner
    {"recId": "UG00016", "userId": "bwilliams", "groupN": "Publisher", "applicationId": "GISPORTAL",    "createdOn": "2019-02-20"},
    {"recId": "UG00017", "userId": "bwilliams", "groupN": "Reporter",  "applicationId": "CITYTRACK",    "createdOn": "2019-02-20"},
    {"recId": "UG00018", "userId": "bwilliams", "groupN": "ReadOnly",  "applicationId": "REPORTDB",     "createdOn": "2020-03-10"},
    # lkim — Systems Analyst
    {"recId": "UG00019", "userId": "lkim",      "groupN": "Admin",     "applicationId": "GISPORTAL",    "createdOn": "2022-02-01"},
    {"recId": "UG00020", "userId": "lkim",      "groupN": "ReadWrite", "applicationId": "REPORTDB",     "createdOn": "2022-02-01"},
    {"recId": "UG00021", "userId": "lkim",      "groupN": "Viewer",    "applicationId": "CITYTRACK",    "createdOn": "2022-06-10"},
    # kpatel — Warehouse Supervisor
    {"recId": "UG00022", "userId": "kpatel",    "groupN": "Manager",   "applicationId": "WAREHOUSEMGR", "createdOn": "2022-09-01"},
    {"recId": "UG00023", "userId": "kpatel",    "groupN": "Auditor",   "applicationId": "WAREHOUSEMGR", "createdOn": "2022-09-01"},
    {"recId": "UG00024", "userId": "kpatel",    "groupN": "Employee",  "applicationId": "HRPORTAL",     "createdOn": "2022-09-01"},
    # tmontgom — Financial Analyst
    {"recId": "UG00025", "userId": "tmontgom",  "groupN": "Approver",  "applicationId": "BUDGETPRO",    "createdOn": "2021-06-01"},
    {"recId": "UG00026", "userId": "tmontgom",  "groupN": "ReadOnly",  "applicationId": "REPORTDB",     "createdOn": "2021-06-01"},
    # rjohnson — GIS Specialist
    {"recId": "UG00027", "userId": "rjohnson",  "groupN": "Editor",    "applicationId": "GISPORTAL",    "createdOn": "2020-07-10"},
    {"recId": "UG00028", "userId": "rjohnson",  "groupN": "ReadOnly",  "applicationId": "REPORTDB",     "createdOn": "2021-01-20"},
    # nwatson — Communications
    {"recId": "UG00029", "userId": "nwatson",   "groupN": "Dispatcher","applicationId": "ALERTNET",     "createdOn": "2020-01-05"},
    {"recId": "UG00030", "userId": "nwatson",   "groupN": "Viewer",    "applicationId": "GISPORTAL",    "createdOn": "2020-01-05"},
    # clee — DBA
    {"recId": "UG00031", "userId": "clee",      "groupN": "DBA",       "applicationId": "REPORTDB",     "createdOn": "2021-04-01"},
    {"recId": "UG00032", "userId": "clee",      "groupN": "Admin",     "applicationId": "WAREHOUSEMGR", "createdOn": "2022-01-15"},
    # pmendez — Deputy Commissioner
    {"recId": "UG00033", "userId": "pmendez",   "groupN": "Viewer",    "applicationId": "CITYTRACK",    "createdOn": "2016-02-01"},
    {"recId": "UG00034", "userId": "pmendez",   "groupN": "Approver",  "applicationId": "BUDGETPRO",    "createdOn": "2016-02-01"},
    {"recId": "UG00035", "userId": "pmendez",   "groupN": "Manager",   "applicationId": "HRPORTAL",     "createdOn": "2016-02-01"},
    # sproctor — HR
    {"recId": "UG00036", "userId": "sproctor",  "groupN": "HRStaff",   "applicationId": "HRPORTAL",     "createdOn": "2023-03-01"},
    {"recId": "UG00037", "userId": "sproctor",  "groupN": "Viewer",    "applicationId": "REPORTDB",     "createdOn": "2023-04-10"},
]

def get_user_access_count(user_id: str) -> int:
    return len([a for a in USER_ACCESS if a["userId"] == user_id])

def get_app_user_count(app_id: str) -> int:
    return len([a for a in USER_ACCESS if a["applicationId"] == app_id])

def get_next_rec_id() -> str:
    existing = [int(a["recId"].replace("UG", "")) for a in USER_ACCESS]
    return f"UG{max(existing) + 1:05d}"

def get_next_app_id() -> str:
    """Generate an incremental numeric app ID for new applications."""
    import re
    numeric = [int(re.sub(r'[^0-9]', '', a["appId"])) for a in APPLICATIONS if re.sub(r'[^0-9]', '', a["appId"])]
    n = (max(numeric) + 1) if numeric else 1
    return f"APP{n:04d}"
