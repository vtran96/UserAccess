// views/users.js — Users list with search, filter, pagination
let _usersState = { page: 1, pageSize: 10, search: '', status: '', dept: '' };
let _deptList = [];

async function renderUsers(resetPage = true) {
  setBreadcrumb('Users');
  setActiveNav('nav-users');
  if (resetPage) _usersState.page = 1;

  const content = document.getElementById('content');
  // Render shell first (keeps filters visible while data loads)
  if (resetPage) {
    content.innerHTML = `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Users</h1>
            <p class="page-subtitle">Search and manage user access across the organization.</p>
          </div>
          <button class="btn btn-primary" onclick="navigate('/users/new')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
        <div class="filters-bar">
          <div class="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="user-search" type="text" placeholder="Search by name, email, or ID…" value="${_usersState.search}" />
          </div>
          <select class="filter-select" id="user-status-filter">
            <option value="">All Status</option>
            <option value="Active" ${_usersState.status==='Active'?'selected':''}>Active</option>
            <option value="Inactive" ${_usersState.status==='Inactive'?'selected':''}>Inactive</option>
          </select>
          <select class="filter-select" id="user-dept-filter">
            <option value="">All Departments</option>
            ${_deptList.map(d => `<option value="${d}" ${_usersState.dept===d?'selected':''}>${d}</option>`).join('')}
          </select>
          <div class="filters-spacer"></div>
        </div>
        <div id="users-table-area"><div class="loading-center"><div class="spinner"></div></div></div>
      </div>
    `;
    _bindUserFilters();

    // Load departments list once
    if (_deptList.length === 0) {
      try {
        _deptList = await API.getDepartments();
        const sel = document.getElementById('user-dept-filter');
        if (sel) {
          sel.innerHTML = `<option value="">All Departments</option>` +
            _deptList.map(d => `<option value="${d}" ${_usersState.dept===d?'selected':''}>${d}</option>`).join('');
        }
      } catch {}
    }
  }

  await _loadUsersTable();
}

function _bindUserFilters() {
  let debounce;
  const searchEl = document.getElementById('user-search');
  if (searchEl) searchEl.oninput = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      _usersState.search = searchEl.value;
      _usersState.page = 1;
      _loadUsersTable();
    }, 350);
  };
  const statusEl = document.getElementById('user-status-filter');
  if (statusEl) statusEl.onchange = () => {
    _usersState.status = statusEl.value;
    _usersState.page = 1;
    _loadUsersTable();
  };
  const deptEl = document.getElementById('user-dept-filter');
  if (deptEl) deptEl.onchange = () => {
    _usersState.dept = deptEl.value;
    _usersState.page = 1;
    _loadUsersTable();
  };
}

async function _loadUsersTable() {
  const area = document.getElementById('users-table-area');
  if (!area) return;
  area.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  try {
    const params = {
      page: _usersState.page,
      pageSize: _usersState.pageSize,
    };
    if (_usersState.search)  params.search = _usersState.search;
    if (_usersState.status)  params.status = _usersState.status;
    if (_usersState.dept)    params.department = _usersState.dept;

    const data = await API.getUsers(params);

    if (data.items.length === 0) {
      area.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><div class="empty-title">No users found</div><div class="empty-sub">Try adjusting your search or filters.</div></div>`;
      return;
    }

    area.innerHTML = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Department</th>
              <th>Title</th>
              <th>Status</th>
              <th>Access</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(u => `
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-sm" style="background:${avatarColor(u.fullName)}">${u.fullName.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                    <div>
                      <div class="user-name-cell">${u.fullName}</div>
                      <div class="user-email-cell text-mono">${u.userId}</div>
                    </div>
                  </div>
                </td>
                <td style="color:var(--text-sub);font-size:12.5px;">${u.email}</td>
                <td style="font-size:13px;">${u.department || '—'}</td>
                <td style="font-size:12.5px;color:var(--text-sub);">${u.title || '—'}</td>
                <td>${statusBadge(u.status)}</td>
                <td><span style="font-size:13px;font-weight:700;color:var(--accent);">${u.accessCount}</span> <span style="font-size:11.5px;color:var(--text-sub);">apps</span></td>
                <td style="font-size:12px;color:var(--text-sub);">${formatDate(u.createdOn)}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="navigate('/users/${u.userId}')">
                    Manage Access
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${_renderPagination(data)}
    `;
  } catch (err) {
    area.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error loading users</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

function _renderPagination(data) {
  if (data.totalPages <= 1) return `<div class="pagination"><div class="pagination-info">Showing ${data.items.length} of ${data.total} users</div></div>`;
  const { page, totalPages, total, items } = data;
  const start = (page-1)*_usersState.pageSize+1;
  const end = start+items.length-1;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page-1 && i <= page+1))
      pages.push(i);
    else if (pages[pages.length-1] !== '…') pages.push('…');
  }

  return `
    <div class="pagination">
      <div class="pagination-info">Showing ${start}–${end} of ${total} users</div>
      <div class="pagination-controls">
        <button class="page-btn" onclick="_usersState.page=${page-1};_loadUsersTable()" ${page<=1?'disabled':''}>‹</button>
        ${pages.map(p => p === '…'
          ? `<button class="page-btn" disabled>…</button>`
          : `<button class="page-btn ${p===page?'active':''}" onclick="_usersState.page=${p};_loadUsersTable()">${p}</button>`
        ).join('')}
        <button class="page-btn" onclick="_usersState.page=${page+1};_loadUsersTable()" ${page>=totalPages?'disabled':''}>›</button>
      </div>
    </div>
  `;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
