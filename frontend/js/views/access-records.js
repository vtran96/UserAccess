// views/access-records.js — All access records with Change + Revoke columns
async function renderAccessRecords() {
  setBreadcrumb('Access Records');
  setActiveNav('nav-access');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;

  try {
    const records = await API.getAccess();

    content.innerHTML = `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Access Records</h1>
            <p class="page-subtitle">${records.length} total access assignments</p>
          </div>
        </div>
        <div class="filters-bar">
          <div class="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="access-search" type="text" placeholder="Search by user, app, or level…" />
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Application</th>
                <th>Access Level</th>
                <th>Department</th>
                <th>Granted</th>
                <th>Change</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="access-tbody">
              ${records.map(r => _accessRow(r)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchEl = document.getElementById('access-search');
    searchEl.oninput = () => {
      const q = searchEl.value.toLowerCase();
      document.querySelectorAll('#access-tbody tr').forEach(row => {
        row.style.display = row.dataset.search.includes(q) ? '' : 'none';
      });
    };

  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error loading records</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

function _accessRow(r) {
  const userName  = (r.userName  || r.userId).replace(/'/g, "\\'");
  const appName   = (r.appName   || r.applicationId).replace(/'/g, "\\'");
  const groupN    = r.groupN.replace(/'/g, "\\'");

  return `
    <tr data-search="${(r.userName+r.appName+r.groupN+(r.department||'')).toLowerCase()}">
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm" style="background:${avatarColor(r.userName||r.userId)}">${(r.userName||r.userId).split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div>
            <div class="user-name-cell" style="cursor:pointer;" onclick="navigate('/users/${r.userId}')">${r.userName || r.userId}</div>
            <div class="user-email-cell text-mono">${r.userId}</div>
          </div>
        </div>
      </td>
      <td><span style="cursor:pointer;font-weight:600;" onclick="navigate('/apps/${r.applicationId}')">${r.appName || r.applicationId}</span></td>
      <td><span class="badge badge-active" style="font-size:11.5px;">${r.groupN}</span></td>
      <td style="font-size:12.5px;color:var(--text-sub);">${r.department||'—'}</td>
      <td style="font-size:12px;color:var(--text-sub);">${formatDate(r.createdOn)}</td>
      <td>
        <button class="btn btn-secondary btn-sm"
          onclick="showChangeModal({
            recId:'${r.recId}',
            userId:'${r.userId}',
            userName:'${userName}',
            appId:'${r.applicationId}',
            appName:'${appName}',
            currentLevel:'${groupN}',
            onSuccess:renderAccessRecords
          })">Change</button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm"
          onclick="showRevokeModal({
            recId:'${r.recId}',
            userName:'${userName}',
            appName:'${appName}',
            level:'${groupN}',
            onSuccess:renderAccessRecords
          })">Revoke</button>
      </td>
    </tr>
  `;
}
