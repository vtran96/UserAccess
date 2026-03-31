// views/user-detail.js — User detail with access cards + Clone Access
async function renderUserDetail(userId) {
  setActiveNav('nav-users');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div><div class="loading-text">Loading user…</div></div>`;

  try {
    const user = await API.getUser(userId);
    setBreadcrumb('Users', '/users', user.fullName);
    _renderUserDetailContent(user);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">User not found</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

function _renderUserDetailContent(user) {
  const content = document.getElementById('content');
  const initials = user.fullName.split(' ').map(n=>n[0]).join('').slice(0,2);
  const color = avatarColor(user.fullName);

  content.innerHTML = `
    <div class="page-enter">
      <button class="back-btn" onclick="navigate('/users')">← Back to Users</button>

      <div class="user-detail-header">
        <div class="user-detail-avatar" style="background:${color}">${initials}</div>
        <div style="flex:1;">
          <div class="user-detail-name">${user.fullName}</div>
          <div class="user-detail-meta">
            <span>${user.department || 'No Department'}</span>
            <span>${user.title || 'No Title'}</span>
            <span class="text-mono" style="font-size:11.5px;">${user.email}</span>
          </div>
          <div style="margin-top:8px;">${statusBadge(user.status)}</div>
        </div>
        <div class="user-detail-actions">
          <button class="btn btn-secondary" onclick="showCloneAccessModal('${user.userId}', '${user.fullName.replace(/'/g,"\\'")}')">
            👥 Clone Access From…
          </button>
          <button class="btn btn-primary" id="btn-grant-${user.userId}"
            onclick="showGrantModal({userId:'${user.userId}',userName:'${user.fullName.replace(/'/g,"\\'")}',onSuccess:()=>renderUserDetail('${user.userId}')})">
            + Grant Access
          </button>
        </div>
      </div>

      <div class="page-header" style="margin-bottom:16px;">
        <div>
          <h2 style="font-size:16px;font-weight:700;">Application Access</h2>
          <p style="font-size:13px;color:var(--text-sub);margin-top:3px;">
            ${user.access.length} application${user.access.length!==1?'s':''} — click to change or revoke
          </p>
        </div>
      </div>

      <div id="access-cards-area">
        ${_renderAccessCards(user)}
      </div>
    </div>
  `;
}

function _renderAccessCards(user) {
  if (user.access.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">🔓</div>
        <div class="empty-title">No access granted yet</div>
        <div class="empty-sub">Click "+ Grant Access" to assign this user to an application.</div>
      </div>`;
  }

  return `
    <div class="access-grid">
      ${user.access.map(rec => {
        const appInitials = rec.applicationId.slice(0, 2);
        const colors = ['#58a6ff','#3fb950','#d29922','#bc8cff','#ff7b72','#39d353','#ffa657'];
        const ci = rec.applicationId.charCodeAt(0) % colors.length;
        const cardColor = colors[ci];
        const safeUser = user.fullName.replace(/'/g, "\\'");
        const safeApp  = (rec.appName||rec.applicationId).replace(/'/g, "\\'");
        return `
          <div class="access-card">
            <div class="access-card-app">
              <div class="app-icon" style="background:linear-gradient(135deg,${cardColor},var(--teal));">${appInitials}</div>
              <div>
                <div class="access-card-app-name">${rec.appName || rec.applicationId}</div>
                <div style="font-size:11px;color:var(--text-muted);font-family:monospace;">${rec.applicationId}</div>
              </div>
            </div>
            <div class="access-card-level">🔑 ${rec.groupN}</div>
            <div class="access-card-date">Since ${formatDate(rec.createdOn)}</div>
            <div class="access-card-actions">
              <button class="btn btn-secondary btn-sm" style="flex:1;"
                onclick="showChangeModal({recId:'${rec.recId}',userId:'${user.userId}',userName:'${safeUser}',appId:'${rec.applicationId}',appName:'${safeApp}',currentLevel:'${rec.groupN}',onSuccess:()=>renderUserDetail('${user.userId}')})">
                Change
              </button>
              <button class="btn btn-danger btn-sm" style="flex:1;"
                onclick="showRevokeModal({recId:'${rec.recId}',userName:'${safeUser}',appName:'${safeApp}',level:'${rec.groupN}',onSuccess:()=>renderUserDetail('${user.userId}')})">
                Revoke
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Clone Access Modal ───────────────────────────────────────────────────────
async function showCloneAccessModal(targetUserId, targetUserName) {
  // Step 1 — pick source user
  let allUsers = [];
  try {
    const res = await API.getUsers({ pageSize: 200 });
    allUsers = res.items.filter(u => u.userId !== targetUserId);
  } catch (e) {
    Toast.error('Error', 'Could not load users.');
    return;
  }

  const body = `
    <div class="form-group">
      <label class="form-label">Clone access from…</label>
      <p style="font-size:12.5px;color:var(--text-sub);margin-bottom:10px;">
        All access from the selected user will be copied to <strong>${targetUserName}</strong>.<br>
        Existing apps will be <strong>overwritten</strong> with the source level; new apps will be <strong>added</strong>.
      </p>
      <div class="search-input-wrap" style="margin-bottom:10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="clone-search" type="text" placeholder="Search users…" oninput="_filterCloneUsers()" />
      </div>
      <select class="form-control" id="clone-source-user" size="6" style="height:180px;">
        ${allUsers.map(u => `<option value="${u.userId}">${u.fullName} — ${u.department || u.userId}</option>`).join('')}
      </select>
    </div>
    <div id="clone-preview" style="margin-top:12px;display:none;">
      <div style="font-size:12px;font-weight:600;color:var(--text-sub);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Access to be cloned</div>
      <div id="clone-preview-list"></div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="clone-confirm-btn" disabled>Clone Access</button>
  `;
  Modal.create({ title: `Clone Access → ${targetUserName}`, body, footer });

  // Store users for filter
  window._cloneAllUsers = allUsers;

  const sel = Modal.getEl('#clone-source-user');
  sel.onchange = () => _previewCloneAccess(sel.value);

  Modal.getEl('#clone-confirm-btn').onclick = async () => {
    const sourceUserId = sel.value;
    if (!sourceUserId) return;
    Modal.getEl('#clone-confirm-btn').disabled = true;
    Modal.getEl('#clone-confirm-btn').textContent = 'Cloning…';
    try {
      const result = await API.cloneAccess(targetUserId, sourceUserId);
      Modal.close();
      Toast.success('Access Cloned', `Added ${result.added} new, updated ${result.overwritten} existing.`);
      renderUserDetail(targetUserId);
    } catch (err) {
      Toast.error('Clone Failed', err.message);
      Modal.getEl('#clone-confirm-btn').disabled = false;
      Modal.getEl('#clone-confirm-btn').textContent = 'Clone Access';
    }
  };
}

function _filterCloneUsers() {
  const q = (Modal.getEl('#clone-search')?.value || '').toLowerCase();
  const sel = Modal.getEl('#clone-source-user');
  if (!sel) return;
  Array.from(sel.options).forEach(opt => {
    opt.style.display = opt.text.toLowerCase().includes(q) ? '' : 'none';
  });
}

async function _previewCloneAccess(sourceUserId) {
  const btn = Modal.getEl('#clone-confirm-btn');
  const preview = Modal.getEl('#clone-preview');
  const list = Modal.getEl('#clone-preview-list');
  if (!btn || !preview || !list) return;

  btn.disabled = true;
  preview.style.display = 'block';
  list.innerHTML = '<div style="color:var(--text-sub);font-size:12.5px;">Loading…</div>';

  try {
    const sourceAccess = await API.getAccess({ userId: sourceUserId });
    if (sourceAccess.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted);font-size:12.5px;font-style:italic;">This user has no access records to clone.</div>';
      return;
    }
    list.innerHTML = sourceAccess.map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border-sub);">
        <div class="app-icon" style="width:26px;height:26px;font-size:10px;border-radius:6px;">${r.applicationId.slice(0,2)}</div>
        <div style="flex:1;font-size:13px;">${r.appName || r.applicationId}</div>
        <span class="badge badge-active" style="font-size:11px;">${r.groupN}</span>
      </div>
    `).join('');
    btn.disabled = false;
  } catch(e) {
    list.innerHTML = '<div style="color:var(--red);font-size:12.5px;">Could not load access records.</div>';
  }
}
