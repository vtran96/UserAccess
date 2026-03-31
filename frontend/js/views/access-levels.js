// views/access-levels.js — Manage access level definitions per application
async function renderAccessLevels() {
  setBreadcrumb('Access Levels');
  setActiveNav('nav-access-levels');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div><div class="loading-text">Loading access levels…</div></div>`;

  try {
    const [levels, apps] = await Promise.all([
      API.getAllAccessLevels(),
      API.getApplications(),
    ]);

    // Group by applicationId
    const grouped = {};
    for (const lvl of levels) {
      if (!grouped[lvl.applicationId]) {
        grouped[lvl.applicationId] = { appName: lvl.appName, levels: [] };
      }
      grouped[lvl.applicationId].levels.push(lvl);
    }

    const appIds = Object.keys(grouped);

    content.innerHTML = `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Access Levels</h1>
            <p class="page-subtitle">Define and manage permission levels for each application.</p>
          </div>
          <button class="btn btn-primary" onclick="showAddLevelModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Level
          </button>
        </div>

        <div class="filters-bar">
          <div class="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="level-search" type="text" placeholder="Search by app or level…" />
          </div>
        </div>

        <div id="levels-container">
          ${appIds.length === 0
            ? `<div class="empty-state"><div class="empty-icon">🔏</div><div class="empty-title">No access levels defined</div><div class="empty-sub">Click "Add Level" to get started.</div></div>`
            : appIds.map(appId => _renderLevelGroup(appId, grouped[appId])).join('')
          }
        </div>
      </div>
    `;

    document.getElementById('level-search').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.level-group').forEach(group => {
        const rows = group.querySelectorAll('tr[data-search]');
        let visible = 0;
        rows.forEach(row => {
          const show = row.dataset.search.includes(q);
          row.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        group.style.display = visible > 0 || q === '' ? '' : 'none';
      });
    };

  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error loading access levels</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

function _renderLevelGroup(appId, group) {
  const gradients = ['#58a6ff','#3fb950','#d29922','#bc8cff','#ff7b72','#ffa657'];
  const color = gradients[appId.charCodeAt(0) % gradients.length];

  return `
    <div class="level-group card" style="margin-bottom:16px;">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="app-icon" style="width:30px;height:30px;font-size:11px;background:linear-gradient(135deg,${color},var(--teal));border-radius:8px;">${appId.slice(0,2)}</div>
          <div>
            <div class="card-title" style="margin:0;">${group.appName}</div>
            <div style="font-size:11.5px;color:var(--text-muted);font-family:monospace;">${appId}</div>
          </div>
        </div>
        <span style="font-size:12px;color:var(--text-sub);">${group.levels.length} level${group.levels.length!==1?'s':''}</span>
      </div>
      <div class="card-body" style="padding:0;">
        <table>
          <thead>
            <tr>
              <th style="width:180px;">Level Name</th>
              <th>Description</th>
              <th style="width:130px;text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${group.levels.map(lvl => `
              <tr data-search="${(appId + group.appName + lvl.accessLevel + (lvl.comments||'')).toLowerCase()}">
                <td>
                  <span style="font-weight:700;color:var(--accent);">${lvl.accessLevel}</span>
                </td>
                <td style="font-size:13px;color:var(--text-sub);">${lvl.comments || '<em style="color:var(--text-muted)">No description</em>'}</td>
                <td style="text-align:right;">
                  <div style="display:flex;gap:6px;justify-content:flex-end;">
                    <button class="btn btn-secondary btn-sm"
                      onclick="showEditLevelModal('${appId}', '${lvl.accessLevel.replace(/'/g,"\\'")}', '${(lvl.comments||'').replace(/'/g,"\\'")}')">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm"
                      onclick="showDeleteLevelModal('${appId}', '${group.appName.replace(/'/g,"\\'")}', '${lvl.accessLevel.replace(/'/g,"\\'")}')">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Add Level Modal ──────────────────────────────────────────────────────────
async function showAddLevelModal(preselectedAppId) {
  let apps = [];
  try {
    apps = await API.getApplications();
  } catch(e) {
    Toast.error('Error', 'Could not load applications.'); return;
  }

  const body = `
    <div class="form-group">
      <label class="form-label">Application <span style="color:var(--red)">*</span></label>
      <select class="form-control" id="new-level-app">
        <option value="">— Select application —</option>
        ${apps.map(a => `<option value="${a.appId}" ${a.appId === preselectedAppId ? 'selected' : ''}>${a.aName} (${a.appId})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Level Name <span style="color:var(--red)">*</span></label>
      <input class="form-control" id="new-level-name" placeholder="e.g. Viewer, Admin, Editor…" />
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" id="new-level-desc" rows="2" placeholder="What can this level do?"></textarea>
    </div>
    <div id="add-level-error" style="color:var(--red);font-size:12.5px;display:none;margin-top:4px;"></div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="add-level-save">Add Level</button>
  `;
  Modal.create({ title: 'Add Access Level', body, footer });

  Modal.getEl('#add-level-save').onclick = async () => {
    const errEl = Modal.getEl('#add-level-error');
    errEl.style.display = 'none';
    const applicationId = Modal.getEl('#new-level-app').value;
    const accessLevel   = Modal.getEl('#new-level-name').value.trim();
    const comments      = Modal.getEl('#new-level-desc').value.trim();
    if (!applicationId) { errEl.textContent = 'Select an application.'; errEl.style.display = 'block'; return; }
    if (!accessLevel)   { errEl.textContent = 'Level name is required.'; errEl.style.display = 'block'; return; }
    try {
      Modal.getEl('#add-level-save').disabled = true;
      await API.createAccessLevel({ applicationId, accessLevel, comments: comments || null });
      Modal.close();
      Toast.success('Level Added', `${accessLevel} added.`);
      renderAccessLevels();
    } catch(err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      Modal.getEl('#add-level-save').disabled = false;
    }
  };
}

// ── Edit Level Modal ─────────────────────────────────────────────────────────
function showEditLevelModal(appId, levelName, currentDesc) {
  const body = `
    <div class="form-group">
      <label class="form-label">App ID</label>
      <input class="form-control text-mono" value="${appId}" disabled />
    </div>
    <div class="form-group">
      <label class="form-label">Level Name</label>
      <input class="form-control" id="edit-level-name" value="${levelName}" />
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" id="edit-level-desc" rows="2">${currentDesc}</textarea>
    </div>
    <div id="edit-level-error" style="color:var(--red);font-size:12.5px;display:none;margin-top:4px;"></div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="edit-level-save">Save</button>
  `;
  Modal.create({ title: `Edit Level — ${levelName}`, body, footer });

  Modal.getEl('#edit-level-save').onclick = async () => {
    const errEl = Modal.getEl('#edit-level-error');
    errEl.style.display = 'none';
    const newName = Modal.getEl('#edit-level-name').value.trim();
    const newDesc = Modal.getEl('#edit-level-desc').value.trim();
    try {
      Modal.getEl('#edit-level-save').disabled = true;
      await API.updateAccessLevel(appId, levelName, { accessLevel: newName || undefined, comments: newDesc });
      Modal.close();
      Toast.success('Level Updated', `${newName || levelName} saved.`);
      renderAccessLevels();
    } catch(err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      Modal.getEl('#edit-level-save').disabled = false;
    }
  };
}

// ── Delete Level Confirm ─────────────────────────────────────────────────────
function showDeleteLevelModal(appId, appName, levelName) {
  const body = `
    <p style="font-size:14px;color:var(--text-sub);margin-bottom:4px;">
      You are about to delete the <strong style="color:var(--accent)">${levelName}</strong> access level from <strong>${appName}</strong>.
    </p>
    <p style="font-size:13px;color:var(--red);margin-top:10px;">⚠️ Users currently assigned this level will retain their records, but the level will no longer appear in the definition list.</p>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-danger" id="delete-level-confirm">Delete Level</button>
  `;
  Modal.create({ title: `Delete Level — ${levelName}`, body, footer });

  Modal.getEl('#delete-level-confirm').onclick = async () => {
    try {
      Modal.getEl('#delete-level-confirm').disabled = true;
      await API.deleteAccessLevel(appId, levelName);
      Modal.close();
      Toast.success('Level Deleted', `${levelName} removed from ${appName}.`);
      renderAccessLevels();
    } catch(err) {
      Toast.error('Error', err.message);
      Modal.getEl('#delete-level-confirm').disabled = false;
    }
  };
}
