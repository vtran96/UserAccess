# UserAccess Management Web App — Implementation Plan

A modern, premium web tool for granting, reviewing, and revoking user access to applications and databases within the organization.

---

## Background & Goal

The organization needs a centralized UI to manage **who has access to what**. Admins or managers should be able to:
- Look up users and see all their current application/group memberships
- Grant new access (assign a user to an application at a specific access level)
- Revoke or change existing access
- Browse the application roster to see all apps and who has access to them
- Manage which access levels exist per application

---

## Tech Stack

- **Frontend**: Vanilla HTML + CSS + JS (SPA, hash-based routing)
- **Backend**: Python FastAPI (mock data for now, PostgreSQL later)
- **Database**: PostgreSQL (`UserAccess` database)
- **Auth**: Microsoft SSO stub (admin/admin for development)

---

## Data Model

```
Users               ApplicationRoster        ApplicationAccessLevel
--------            -----------------        ----------------------
UserId (PK)         AppId (PK)               ApplicationID (FK)
FullName            aName                    AccessLevel
Email               WebConsole               Comments
Department          CloudStart
Title               aServer
Status              aDirectory
CreatedOn           dbName
                    IsInternal
                    DbServer                 User_Group
                    intURL                   ----------
                    extURL                   RecId (PK)
                                             UserId (FK)
                                             GroupN
                                             ApplicationId (FK)
                                             CreatedOn
```

---

## Project Structure

```
UserAccess/
├── Docs/
│   └── Implementation_Plan.md
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── mock_data.py
│   ├── auth.py
│   ├── requirements.txt
│   └── routers/
│       ├── users.py
│       ├── applications.py
│       ├── access.py
│       └── access_levels.py
└── frontend/
    ├── login.html
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── app.js
        ├── api.js
        ├── auth.js
        ├── components/
        │   ├── modal.js
        │   └── toast.js
        └── views/
            ├── dashboard.js
            ├── users.js
            ├── user-detail.js
            ├── applications.js
            └── app-detail.js
```

---

## UI Views

| View | Route | Description |
|---|---|---|
| Login | `/login.html` | MS SSO-style stub login |
| Dashboard | `#/` | Stats + recent activity |
| Users List | `#/users` | Searchable table of all users |
| User Detail | `#/users/:id` | User info + access cards + grant/revoke |
| Applications | `#/apps` | App roster card grid |
| App Detail | `#/apps/:id` | App info + members list |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login (admin/admin stub) |
| GET | `/users` | List users (search, filter, paginate) |
| GET | `/users/{id}` | User detail + access |
| PUT | `/users/{id}` | Update user |
| GET | `/applications` | List all apps |
| GET | `/applications/{id}` | App detail + members |
| GET | `/access` | Query access records |
| POST | `/access` | Grant new access |
| DELETE | `/access/{recId}` | Revoke access |
| GET | `/access-levels/{appId}` | Get access levels for an app |
