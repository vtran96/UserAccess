# Feature Enhancement — Implementation Plan

## Overview

7 distinct feature enhancements from `Docs/Feature_Enhancement.md`, grouped by component.
All work stays in **mock-data mode** — no PostgreSQL schema changes required.

---

## Feature Groups

### F1 — Dashboard: Clickable Stat Cards
**Scope:** `frontend/js/views/dashboard.js`

Each stat card wraps its content in a `cursor:pointer` div that calls `navigate()`.

| Card | Destination |
|---|---|
| Total Users | `/users` |
| Active Users | `/users?status=Active` |
| Applications | `/apps` |
| Access Records | `/access` |

---

### F2 — Applications Page: Add Application (+ button)
**Scope:** `frontend/js/views/applications.js`, `backend/routers/applications.py`, `backend/mock_data.py`, `frontend/js/api.js`

- Add an **"+ Add Application"** primary button to the Applications page header.
- Modal with fields: App ID, Name, Description, Server, Directory, DB Name, DB Server, Internal/Cloud toggle, Int URL, Ext URL.
- Backend: `POST /applications` endpoint writes to `mock_data.APPLICATIONS`.
- After submit, refresh the apps grid.

---

### F3 — Applications Page: Description Field + Search by Name & Description
**Scope:** `backend/mock_data.py`, `backend/routers/applications.py`, `frontend/js/views/applications.js`

- Add `description` field to every application record in `APPLICATIONS` (mock data).
- The existing search input on the Applications page will additionally search `description`.
- Update `data-name` attribute on each card to include `description` text.
- Backend search also includes `description`.

---

### F4 — Application Card: Edit Button
**Scope:** `frontend/js/views/applications.js`, `backend/routers/applications.py`, `backend/mock_data.py`, `frontend/js/api.js`

- Each app card gets an **"Edit"** button in the bottom-right (does NOT navigate away — `event.stopPropagation()`).
- Opens a modal pre-filled with: Name, Description, Server, Directory, DB Name, DB Server, Int URL, Ext URL, Internal toggle.
- Backend: `PUT /applications/{app_id}` updates the in-memory record.
- Description is displayed on the card and searchable.
- Clicking the card body still navigates to the App Detail page.

> **Important:** The App Detail page already has a "Grant Access" section. The requirement says you should also be able to grant access from the App Detail page — this is already implemented. We will verify it works and add a prominent "Grant Access" button to the App Detail header if not already visible.

---

### F5 — Application Detail: Grant Existing Users Access (confirm current state)
**Scope:** `frontend/js/views/app-detail.js`

- Verify the **"Grant Access"** button is visible in App Detail header (currently it grants from User Detail, not App Detail).
- Add a **"+ Grant User Access"** button in the App Detail Members section header. This modal will allow selecting a user + access level for this app.
- Backend: `POST /access` already exists and handles this.

---

### F6 — Access Records: Add "Change" Column
**Scope:** `frontend/js/views/access-records.js`

- Split the `Actions` column into two: **Change** | **Revoke**.
- "Change" opens `showChangeModal(...)` (already implemented in `modal.js`) with the record's data.
- After change, the table refreshes.

---

### F7 — User Detail: Replace "Edit User" → "Clone Access from Another User"
**Scope:** `frontend/js/views/user-detail.js`, `backend/routers/access.py`, `frontend/js/api.js`

**Clone Access Modal flow:**
1. User clicks "Clone Access From…"
2. Modal shows a searchable dropdown/select of all other users.
3. On selection, shows a preview list of that source user's access records.
4. "Clone" button calls backend `POST /access/clone` with `{ targetUserId, sourceUserId }`.
5. **Merge logic (backend):** For each source record, if target already has the same `applicationId`, **overwrite** the `groupN` (access level). If not, **add** a new record. Keep any target records for apps the source doesn't have.

Backend endpoint: `POST /access/clone` with body `{ targetUserId: str, sourceUserId: str }`.

---

### F8 — Sidebar: Access Levels Sub-nav under Applications
**Scope:** `frontend/index.html`, `frontend/js/app.js`, `frontend/js/views/access-levels.js` *(NEW file)*

- Add **"Access Levels"** as a collapsible or always-visible sub-item under Applications in the sidebar nav.
- Route: `/access-levels`
- Page shows a table grouped by Application: each row is `App | Level Name | Description`.
- Has an **"+ Add Level"** button → modal with App selector, Level Name, Description.
- Has an **"Edit"** and **"Delete"** action per row.
- Backend: `POST /access-levels`, `PUT /access-levels/{app_id}/{level}`, `DELETE /access-levels/{app_id}/{level}`.

---

## Proposed Changes by Component

### Backend

#### [MODIFY] mock_data.py
- Add `description` field to all `APPLICATIONS` entries.
- Add `get_next_app_id()` helper.

#### [MODIFY] routers/applications.py
- Add `POST /applications` — create new app.
- Add `PUT /applications/{app_id}` — edit app (name, description, etc.).
- Update `GET /applications` search to include `description`.

#### [MODIFY] routers/access.py
- Add `POST /access/clone` — clone access from source user to target user with merge logic.

#### [MODIFY] routers/access_levels.py
- Add `POST /access-levels` — create new level for an app.
- Add `PUT /access-levels/{app_id}/{level}` — edit a level's description.
- Add `DELETE /access-levels/{app_id}/{level}` — remove a level.

---

### Frontend

#### [MODIFY] api.js
- Add `createApplication(d)`, `updateApplication(id, d)`.
- Add `cloneAccess(targetUserId, sourceUserId)`.
- Add `createAccessLevel(d)`, `updateAccessLevel(appId, level, d)`, `deleteAccessLevel(appId, level)`.

#### [MODIFY] views/dashboard.js
- Wrap each stat card in a clickable container calling `navigate(...)`.

#### [MODIFY] views/applications.js
- Add `+ Add Application` button → `showAddAppModal()`.
- Each card: add Edit button (stop propagation), add `description` to `data-name` for search.
- Update search to include description field.

#### [MODIFY] views/app-detail.js
- Add `+ Grant User Access` button in the Members section header.
- This calls `showGrantModal({ appId, appName, onSuccess })` in a user-first mode.

#### [MODIFY] views/access-records.js
- Split Actions column → Change | Revoke, with `showChangeModal(...)` for Change.

#### [MODIFY] views/user-detail.js
- Replace `Edit User` button → `Clone Access From…` button.
- Implement `showCloneAccessModal(userId, onSuccess)` function.

#### [NEW] views/access-levels.js
- New full-page view: grouped table of all access levels by app.
- Add / Edit / Delete per row via modals.

#### [MODIFY] index.html
- Add `Access Levels` nav item under Applications in sidebar.
- Add `<script>` tag for `access-levels.js`.

#### [MODIFY] app.js
- Add route `/access-levels` → `renderAccessLevels()`.

#### [MODIFY] css/styles.css
- Add `.stat-card-link` cursor and hover style.
- Ensure app card edit button positioning works (absolute or flex footer).

---

## Verification Plan

### Automated
- `curl -X POST http://127.0.0.1:8000/applications` to confirm add-app endpoint.
- `curl -X POST http://127.0.0.1:8000/access/clone` to confirm clone endpoint.
- `curl http://127.0.0.1:8000/applications?search=emergency` to confirm description search.

### Manual Browser Testing
1. Click each Dashboard stat card → correct navigation.
2. Add a new application → appears in grid.
3. Edit an existing app → description updates and is searchable.
4. Click an app card body → navigates to detail; Edit button → opens modal.
5. App Detail → Grant User Access → user appears in members list.
6. Access Records → Change button → modal works, level updates.
7. User Detail → Clone Access → preview shows, merge executes correctly.
8. Access Levels sidebar → page loads with all levels; add/edit/delete work.
