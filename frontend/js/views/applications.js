// views/applications.js — Application roster with Add, Edit, description search
async function renderApplications() {
  setBreadcrumb('Applications');
  setActiveNav('nav-apps');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div><div class="loading-text">Loading applications…</div></div>`;

  try {
    const apps = await API.getApplications();

    content.innerHTML = `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Applications</h1>
            <p class="page-subtitle">${apps.length} registered applications — click a card to manage access.</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <div class="search-input-wrap" style="min-width:240px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input id="app-search" type="text" placeholder="Search by name or description…" />
            </div>
            <button class="btn btn-primary" onclick="showAddAppModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Application
            </button>
          </div>
        </div>
        <div class="apps-grid" id="apps-grid">
          ${apps.map(a => _renderAppCard(a)).join('')}
        </div>
      </div>
    `;

    document.getElementById('app-search').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.app-card').forEach(card => {
        card.style.display = card.dataset.search.includes(q) ? '' : 'none';
      });
    };

  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error loading applications</div><div class="empty-sub">${err.message}</div></div>`;
  }
}

const _APP_GRADIENTS = [
  'linear-gradient(135deg,#58a6ff,#3fb950)',
  'linear-gradient(135deg,#bc8cff,#58a6ff)',
  'linear-gradient(135deg,#ffa657,#d29922)',
  'linear-gradient(135deg,#3fb950,#56d364)',
  'linear-gradient(135deg,#ff7b72,#f78166)',
  'linear-gradient(135deg,#39d353,#3fb950)',
];

function _appGradient(appId) {
  return _APP_GRADIENTS[appId.charCodeAt(0) % _APP_GRADIENTS.length];
}

function _renderAppCard(a) {
  const desc = a.description ? a.description : '';
  const descPreview = desc.length > 80 ? desc.slice(0, 80) + '…' : desc;
  const searchVal = (a.aName + a.appId + desc).toLowerCase();

  return `
    <div class="app-card" data-search="${searchVal}" onclick="navigate('/apps/${a.appId}')">
      <div class="app-card-header">
        <div class="app-card-icon" style="background:${_appGradient(a.appId)};">${a.appId.slice(0,2)}</div>
        <div style="flex:1;min-width:0;">
          <div class="app-card-name">${a.aName}</div>
          <div class="app-card-id">${a.appId}</div>
        </div>
      </div>
      ${descPreview ? `<div style="font-size:12px;color:var(--text-sub);margin:8px 0 4px;line-height:1.45;">${descPreview}</div>` : ''}
      <div class="app-card-meta" style="margin-top:6px;">
        <span class="badge ${a.isInternal ? 'badge-internal' : 'badge-cloud'}">${a.isInternal ? '🏢 Internal' : '☁️ Cloud'}</span>
        ${a.cloudStart ? `<span class="badge badge-cloud">${a.cloudStart}</span>` : ''}
        ${a.webConsole === 'Yes' ? `<span class="badge badge-active">Web Console</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
        <div class="app-card-stat">
          <span style="font-size:18px;font-weight:800;color:var(--accent);">${a.userCount}</span>
          <span style="color:var(--text-sub);font-size:12px;margin-left:4px;">user${a.userCount!==1?'s':''}</span>
        </div>
        <div style="display:flex;gap:6px;" onclick="event.stopPropagation()">
          ${a.intURL ? `<a href="${a.intURL}" target="_blank" class="btn btn-ghost btn-sm" title="Internal URL">🌐</a>` : ''}
          ${a.extURL ? `<a href="${a.extURL}" target="_blank" class="btn btn-ghost btn-sm" title="External URL">🔗</a>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();showEditAppModal('${a.appId}')">✏️ Edit</button>
        </div>
      </div>
      ${a.dbName ? `<div style="margin-top:8px;font-size:11.5px;color:var(--text-muted);">🗄 ${a.dbName}${a.dbServer?' on '+a.dbServer:''}</div>` : ''}
    </div>
  `;
}

// ── Add Application Modal ────────────────────────────────────────────────────
function showAddAppModal() {
  const body = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label class="form-label">App ID <span style="color:var(--red)">*</span></label>
        <input class="form-control text-mono" id="add-appId" placeholder="e.g. MYAPP" style="text-transform:uppercase;" />
      </div>
      <div class="form-group">
        <label class="form-label">App Name <span style="color:var(--red)">*</span></label>
        <input class="form-control" id="add-aName" placeholder="Full application name" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" id="add-description" rows="2" placeholder="What does this application do?"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label class="form-label">Server</label>
        <input class="form-control text-mono" id="add-aServer" placeholder="svr-appXX" />
      </div>
      <div class="form-group">
        <label class="form-label">Directory</label>
        <input class="form-control text-mono" id="add-aDirectory" placeholder="/apps/name" />
      </div>
      <div class="form-group">
        <label class="form-label">DB Name</label>
        <input class="form-control text-mono" id="add-dbName" placeholder="DatabaseName" />
      </div>
      <div class="form-group">
        <label class="form-label">DB Server</label>
        <input class="form-control text-mono" id="add-dbServer" placeholder="svr-dbXX" />
      </div>
      <div class="form-group">
        <label class="form-label">Internal URL</label>
        <input class="form-control" id="add-intURL" placeholder="http://…" />
      </div>
      <div class="form-group">
        <label class="form-label">External URL</label>
        <input class="form-control" id="add-extURL" placeholder="https://…" />
      </div>
    </div>
    <div style="display:flex;gap:20px;align-items:center;margin-top:4px;">
      <div class="form-group" style="margin:0;">
        <label class="form-label">Type</label>
        <select class="form-control" id="add-isInternal">
          <option value="true">🏢 Internal</option>
          <option value="false">☁️ Cloud</option>
        </select>
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Cloud Platform</label>
        <input class="form-control" id="add-cloudStart" placeholder="Azure, AWS, GCP…" />
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Web Console?</label>
        <select class="form-control" id="add-webConsole">
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
    </div>
    <div id="add-app-error" style="color:var(--red);font-size:12.5px;margin-top:8px;display:none;"></div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="add-app-save">Create Application</button>
  `;
  Modal.create({ title: 'Add Application', body, footer });
  Modal.getEl('#add-appId').oninput = (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };

  Modal.getEl('#add-app-save').onclick = async () => {
    const errEl = Modal.getEl('#add-app-error');
    errEl.style.display = 'none';
    const appId = Modal.getEl('#add-appId').value.trim().toUpperCase();
    const aName = Modal.getEl('#add-aName').value.trim();
    if (!appId || !aName) { errEl.textContent = 'App ID and Name are required.'; errEl.style.display = 'block'; return; }

    const payload = {
      appId,
      aName,
      description:  Modal.getEl('#add-description').value.trim() || null,
      aServer:      Modal.getEl('#add-aServer').value.trim()      || null,
      aDirectory:   Modal.getEl('#add-aDirectory').value.trim()   || null,
      dbName:       Modal.getEl('#add-dbName').value.trim()       || null,
      dbServer:     Modal.getEl('#add-dbServer').value.trim()     || null,
      intURL:       Modal.getEl('#add-intURL').value.trim()       || null,
      extURL:       Modal.getEl('#add-extURL').value.trim()       || null,
      isInternal:   Modal.getEl('#add-isInternal').value === 'true',
      cloudStart:   Modal.getEl('#add-cloudStart').value.trim()   || null,
      webConsole:   Modal.getEl('#add-webConsole').value,
    };

    try {
      Modal.getEl('#add-app-save').disabled = true;
      Modal.getEl('#add-app-save').textContent = 'Creating…';
      await API.createApplication(payload);
      Modal.close();
      Toast.success('Application Created', `${aName} was added.`);
      renderApplications();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      Modal.getEl('#add-app-save').disabled = false;
      Modal.getEl('#add-app-save').textContent = 'Create Application';
    }
  };
}

// ── Edit Application Modal ───────────────────────────────────────────────────
async function showEditAppModal(appId) {
  let app;
  try {
    app = await API.getApplication(appId);
  } catch(e) {
    Toast.error('Error', 'Could not load application data.');
    return;
  }

  const body = `
    <div class="form-group">
      <label class="form-label">App ID</label>
      <input class="form-control text-mono" value="${app.appId}" disabled />
    </div>
    <div class="form-group">
      <label class="form-label">App Name</label>
      <input class="form-control" id="edit-aName" value="${app.aName || ''}" />
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-control" id="edit-description" rows="2">${app.description || ''}</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label class="form-label">Server</label>
        <input class="form-control text-mono" id="edit-aServer" value="${app.aServer || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Directory</label>
        <input class="form-control text-mono" id="edit-aDirectory" value="${app.aDirectory || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">DB Name</label>
        <input class="form-control text-mono" id="edit-dbName" value="${app.dbName || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">DB Server</label>
        <input class="form-control text-mono" id="edit-dbServer" value="${app.dbServer || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Internal URL</label>
        <input class="form-control" id="edit-intURL" value="${app.intURL || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">External URL</label>
        <input class="form-control" id="edit-extURL" value="${app.extURL || ''}" />
      </div>
    </div>
    <div style="display:flex;gap:20px;align-items:center;margin-top:4px;">
      <div class="form-group" style="margin:0;">
        <label class="form-label">Type</label>
        <select class="form-control" id="edit-isInternal">
          <option value="true" ${app.isInternal ? 'selected' : ''}>🏢 Internal</option>
          <option value="false" ${!app.isInternal ? 'selected' : ''}>☁️ Cloud</option>
        </select>
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Cloud Platform</label>
        <input class="form-control" id="edit-cloudStart" value="${app.cloudStart || ''}" placeholder="Azure, AWS…" />
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Web Console?</label>
        <select class="form-control" id="edit-webConsole">
          <option value="Yes" ${app.webConsole === 'Yes' ? 'selected' : ''}>Yes</option>
          <option value="No"  ${app.webConsole !== 'Yes' ? 'selected' : ''}>No</option>
        </select>
      </div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="edit-app-save">Save Changes</button>
  `;
  Modal.create({ title: `Edit — ${app.aName}`, body, footer });

  Modal.getEl('#edit-app-save').onclick = async () => {
    const payload = {
      aName:       Modal.getEl('#edit-aName').value.trim()       || undefined,
      description: Modal.getEl('#edit-description').value.trim(),
      aServer:     Modal.getEl('#edit-aServer').value.trim()     || null,
      aDirectory:  Modal.getEl('#edit-aDirectory').value.trim()  || null,
      dbName:      Modal.getEl('#edit-dbName').value.trim()      || null,
      dbServer:    Modal.getEl('#edit-dbServer').value.trim()    || null,
      intURL:      Modal.getEl('#edit-intURL').value.trim()      || null,
      extURL:      Modal.getEl('#edit-extURL').value.trim()      || null,
      isInternal:  Modal.getEl('#edit-isInternal').value === 'true',
      cloudStart:  Modal.getEl('#edit-cloudStart').value.trim()  || null,
      webConsole:  Modal.getEl('#edit-webConsole').value,
    };
    try {
      Modal.getEl('#edit-app-save').disabled = true;
      await API.updateApplication(appId, payload);
      Modal.close();
      Toast.success('Application Updated', `${payload.aName || appId} saved.`);
      renderApplications();
    } catch (err) {
      Toast.error('Error', err.message);
      Modal.getEl('#edit-app-save').disabled = false;
    }
  };
}
