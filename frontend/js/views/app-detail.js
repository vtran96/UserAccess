// views/app-detail.js — Application detail with member list + Grant User Access
async function renderAppDetail(appId) {
  setActiveNav('nav-apps');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div><div class="loading-text">Loading application…</div></div>`;

  try {
    const app = await API.getApplication(appId);
    setBreadcrumb('Applications', '/apps', app.aName);
    _renderAppDetailContent(app);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Application not found</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

function _renderAppDetailContent(app) {
  const content = document.getElementById('content');
  const gradients = [
    'linear-gradient(135deg,#58a6ff,#3fb950)',
    'linear-gradient(135deg,#bc8cff,#58a6ff)',
    'linear-gradient(135deg,#ffa657,#d29922)',
    'linear-gradient(135deg,#3fb950,#56d364)',
    'linear-gradient(135deg,#ff7b72,#f78166)',
    'linear-gradient(135deg,#39d353,#3fb950)',
  ];
  const ci = app.appId.charCodeAt(0) % gradients.length;

  content.innerHTML = `
    <div class="page-enter">
      <button class="back-btn" onclick="navigate('/apps')">← Back to Applications</button>

      <div class="user-detail-header" style="align-items:flex-start;gap:22px;margin-bottom:24px;">
        <div class="app-card-icon" style="width:58px;height:58px;font-size:22px;border-radius:14px;background:${gradients[ci]};">${app.appId.slice(0,2)}</div>
        <div style="flex:1;">
          <div class="user-detail-name">${app.aName}</div>
          ${app.description ? `<div style="font-size:13px;color:var(--text-sub);margin-top:4px;max-width:600px;">${app.description}</div>` : ''}
          <div class="user-detail-meta" style="margin-top:8px;">
            <span class="text-mono" style="font-size:12px;">${app.appId}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <span class="badge ${app.isInternal ? 'badge-internal' : 'badge-cloud'}">${app.isInternal ? '🏢 Internal' : '☁️ Cloud'}</span>
            ${app.cloudStart ? `<span class="badge badge-cloud">☁️ ${app.cloudStart}</span>` : ''}
            ${app.webConsole === 'Yes' ? `<span class="badge badge-active">🌐 Web Console</span>` : ''}
          </div>
        </div>
        <div class="user-detail-actions">
          <button class="btn btn-secondary" onclick="showEditAppModal('${app.appId}');document.querySelector('.modal-overlay').addEventListener('click',e=>e.target===e.currentTarget&&Modal.close())">✏️ Edit App</button>
          ${app.intURL ? `<a class="btn btn-secondary" href="${app.intURL}" target="_blank">🌐 Open Internal</a>` : ''}
          ${app.extURL ? `<a class="btn btn-secondary" href="${app.extURL}" target="_blank">🔗 Open External</a>` : ''}
        </div>
      </div>

      <div class="two-col">
        <div>
          <div class="page-header" style="margin-bottom:16px;">
            <div>
              <h2 style="font-size:16px;font-weight:700;">Members</h2>
              <p style="font-size:13px;color:var(--text-sub);margin-top:3px;">${app.members.length} user${app.members.length!==1?'s':''} have access</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="showGrantUserToAppModal('${app.appId}', '${app.aName.replace(/'/g,"\\'")}')">
              + Grant User Access
            </button>
          </div>
          ${app.members.length === 0
            ? `<div class="empty-state"><div class="empty-icon">🔓</div><div class="empty-title">No members yet</div><div class="empty-sub">Use "+ Grant User Access" to add users.</div></div>`
            : `<div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Department</th>
                      <th>Access Level</th>
                      <th>Status</th>
                      <th>Since</th>
                      <th>Change</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${app.members.map(m => {
                      const safeUser = m.fullName.replace(/'/g, "\\'");
                      const safeApp  = app.aName.replace(/'/g, "\\'");
                      return `
                        <tr>
                          <td>
                            <div class="user-cell">
                              <div class="user-avatar-sm" style="background:${avatarColor(m.fullName)}">${m.fullName.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                              <div>
                                <div class="user-name-cell" style="cursor:pointer;" onclick="navigate('/users/${m.userId}')">${m.fullName}</div>
                                <div class="user-email-cell text-mono">${m.userId}</div>
                              </div>
                            </div>
                          </td>
                          <td style="font-size:12.5px;color:var(--text-sub);">${m.department||'—'}</td>
                          <td><span class="badge badge-active" style="font-size:11.5px;">${m.groupN}</span></td>
                          <td>${statusBadge(m.userStatus)}</td>
                          <td style="font-size:12px;color:var(--text-sub);">${formatDate(m.createdOn)}</td>
                          <td>
                            <button class="btn btn-secondary btn-sm"
                              onclick="showChangeModal({recId:'${m.recId}',userId:'${m.userId}',userName:'${safeUser}',appId:'${app.appId}',appName:'${safeApp}',currentLevel:'${m.groupN}',onSuccess:()=>renderAppDetail('${app.appId}')})">
                              Change
                            </button>
                          </td>
                          <td>
                            <button class="btn btn-danger btn-sm"
                              onclick="showRevokeModal({recId:'${m.recId}',userName:'${safeUser}',appName:'${safeApp}',level:'${m.groupN}',onSuccess:()=>renderAppDetail('${app.appId}')})">
                              Revoke
                            </button>
                          </td>
                        </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>`
          }
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">App Details</div></div>
          <div class="card-body">
            <table class="info-table">
              <tr><td>App ID</td><td class="text-mono">${app.appId}</td></tr>
              <tr><td>Server</td><td>${app.aServer || '—'}</td></tr>
              <tr><td>Directory</td><td class="text-mono" style="font-size:11px;">${app.aDirectory || '—'}</td></tr>
              <tr><td>Database</td><td>${app.dbName || '—'}</td></tr>
              <tr><td>DB Server</td><td>${app.dbServer || '—'}</td></tr>
            </table>
            ${app.accessLevels && app.accessLevels.length > 0 ? `
              <hr style="border-color:var(--border);margin:18px 0;">
              <div style="font-size:12px;font-weight:600;color:var(--text-sub);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em;">Access Levels</div>
              ${app.accessLevels.map(l => `
                <div style="padding:8px 0;border-bottom:1px solid var(--border-sub);">
                  <div style="font-size:13px;font-weight:600;color:var(--accent);">${l.accessLevel}</div>
                  ${l.comments ? `<div style="font-size:11.5px;color:var(--text-sub);margin-top:2px;">${l.comments}</div>` : ''}
                </div>
              `).join('')}
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Grant User Access (app-centric: pick user then level) ────────────────────
async function showGrantUserToAppModal(appId, appName) {
  let users = [], levels = [];
  try {
    const [usersRes, levelsRes] = await Promise.all([
      API.getUsers({ pageSize: 200 }),
      API.getAccessLevels(appId),
    ]);
    users  = usersRes.items;
    levels = levelsRes;
  } catch(e) {
    Toast.error('Error', 'Could not load data.'); return;
  }

  const body = `
    <div class="form-group">
      <label class="form-label">User <span style="color:var(--red)">*</span></label>
      <div class="search-input-wrap" style="margin-bottom:8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="grant-user-search" type="text" placeholder="Search users…" oninput="_filterGrantUsers()" />
      </div>
      <select class="form-control" id="grant-user-select" size="5" style="height:140px;">
        ${users.map(u => `<option value="${u.userId}">${u.fullName} — ${u.department || u.userId}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Access Level <span style="color:var(--red)">*</span></label>
      <select class="form-control" id="grant-level-select">
        <option value="">— Select level —</option>
        ${levels.map(l => `<option value="${l.accessLevel}">${l.accessLevel}${l.comments ? ' — ' + l.comments : ''}</option>`).join('')}
      </select>
    </div>
    <div id="grant-app-error" style="color:var(--red);font-size:12.5px;margin-top:4px;display:none;"></div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="grant-app-confirm">Grant Access</button>
  `;
  Modal.create({ title: `Grant Access — ${appName}`, body, footer });

  window._grantAllUsers = users;
  Modal.getEl('#grant-app-confirm').onclick = async () => {
    const userId  = Modal.getEl('#grant-user-select').value;
    const groupN  = Modal.getEl('#grant-level-select').value;
    const errEl   = Modal.getEl('#grant-app-error');
    errEl.style.display = 'none';
    if (!userId) { errEl.textContent = 'Please select a user.'; errEl.style.display = 'block'; return; }
    if (!groupN) { errEl.textContent = 'Please select an access level.'; errEl.style.display = 'block'; return; }
    try {
      Modal.getEl('#grant-app-confirm').disabled = true;
      await API.grantAccess({ userId, applicationId: appId, groupN });
      Modal.close();
      Toast.success('Access Granted', `User granted ${groupN} access to ${appName}.`);
      renderAppDetail(appId);
    } catch(err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      Modal.getEl('#grant-app-confirm').disabled = false;
    }
  };
}

function _filterGrantUsers() {
  const q = (Modal.getEl('#grant-user-search')?.value || '').toLowerCase();
  const sel = Modal.getEl('#grant-user-select');
  if (!sel) return;
  Array.from(sel.options).forEach(opt => {
    opt.style.display = opt.text.toLowerCase().includes(q) ? '' : 'none';
  });
}
