// modal.js — Reusable modal dialog
const Modal = (() => {
  let overlay = null;

  function create({ title, body, footer, onClose }) {
    close(); // close any existing
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-footer">${footer || ''}</div>
      </div>
    `;
    overlay.querySelector('.modal-close').onclick = () => { close(); if (onClose) onClose(); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { close(); if (onClose) onClose(); } });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', escHandler);
    return overlay;
  }

  function escHandler(e) {
    if (e.key === 'Escape') close();
  }

  function close() {
    if (overlay) { overlay.remove(); overlay = null; }
    document.removeEventListener('keydown', escHandler);
  }

  function getEl(selector) {
    return overlay ? overlay.querySelector(selector) : null;
  }

  return { create, close, getEl };
})();

// ── Grant Access Modal ────────────────────────────────────────
async function showGrantModal({ userId, userName, onSuccess }) {
  let apps = [], levels = [];

  const body = `
    <div class="form-group">
      <label class="form-label" for="modal-app">Application</label>
      <select class="form-control" id="modal-app">
        <option value="">— Select application —</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label" for="modal-level">Access Level</label>
      <select class="form-control" id="modal-level" disabled>
        <option value="">— Select access level —</option>
      </select>
    </div>
    <div id="modal-preview" class="confirm-preview hidden">
      <div class="confirm-preview-label">Access Summary</div>
      <div class="confirm-preview-row"><span class="lbl">User</span><span class="val" id="prev-user"></span></div>
      <div class="confirm-preview-row"><span class="lbl">Application</span><span class="val" id="prev-app"></span></div>
      <div class="confirm-preview-row"><span class="lbl">Access Level</span><span class="val" id="prev-level"></span></div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="modal-grant-btn" disabled>Grant Access</button>
  `;

  Modal.create({ title: `Grant Access — ${userName}`, body, footer });

  // Populate apps
  try {
    const res = await API.getApplications();
    apps = res;
    const appSel = Modal.getEl('#modal-app');
    apps.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.appId; opt.textContent = a.aName;
      appSel.appendChild(opt);
    });

    appSel.onchange = async () => {
      const appId = appSel.value;
      const levelSel = Modal.getEl('#modal-level');
      levelSel.innerHTML = '<option value="">— Select access level —</option>';
      levelSel.disabled = true;
      Modal.getEl('#modal-preview').classList.add('hidden');
      Modal.getEl('#modal-grant-btn').disabled = true;

      if (!appId) return;
      const lvls = await API.getAccessLevels(appId);
      levels = lvls;
      lvls.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.accessLevel;
        opt.textContent = l.accessLevel + (l.comments ? ` — ${l.comments}` : '');
        levelSel.appendChild(opt);
      });
      levelSel.disabled = false;

      levelSel.onchange = () => {
        const preview = Modal.getEl('#modal-preview');
        const grantBtn = Modal.getEl('#modal-grant-btn');
        if (levelSel.value) {
          const appName = apps.find(a => a.appId === appId)?.aName || appId;
          Modal.getEl('#prev-user').textContent = userName;
          Modal.getEl('#prev-app').textContent = appName;
          Modal.getEl('#prev-level').textContent = levelSel.value;
          preview.classList.remove('hidden');
          grantBtn.disabled = false;
        } else {
          preview.classList.add('hidden');
          grantBtn.disabled = true;
        }
      };
    };

    Modal.getEl('#modal-grant-btn').onclick = async () => {
      const appId = Modal.getEl('#modal-app').value;
      const groupN = Modal.getEl('#modal-level').value;
      Modal.getEl('#modal-grant-btn').disabled = true;
      Modal.getEl('#modal-grant-btn').textContent = 'Granting…';
      try {
        await API.grantAccess({ userId, applicationId: appId, groupN });
        Modal.close();
        Toast.success('Access Granted', `${userName} now has ${groupN} access.`);
        if (onSuccess) onSuccess();
      } catch (err) {
        Toast.error('Grant Failed', err.message);
        Modal.getEl('#modal-grant-btn').disabled = false;
        Modal.getEl('#modal-grant-btn').textContent = 'Grant Access';
      }
    };
  } catch (err) {
    Toast.error('Error', 'Could not load applications.');
  }
}

// ── Change Access Level Modal ────────────────────────────────
async function showChangeModal({ recId, userId, userName, appId, appName, currentLevel, onSuccess }) {
  let levels = [];
  try { levels = await API.getAccessLevels(appId); } catch {}

  const opts = levels.map(l =>
    `<option value="${l.accessLevel}" ${l.accessLevel===currentLevel?'selected':''}>${l.accessLevel}${l.comments?' — '+l.comments:''}</option>`
  ).join('');

  const body = `
    <div class="confirm-preview" style="margin-bottom:16px;">
      <div class="confirm-preview-label">Current Access</div>
      <div class="confirm-preview-row"><span class="lbl">User</span><span class="val">${userName}</span></div>
      <div class="confirm-preview-row"><span class="lbl">Application</span><span class="val">${appName}</span></div>
      <div class="confirm-preview-row"><span class="lbl">Current Level</span><span class="val">${currentLevel}</span></div>
    </div>
    <div class="form-group">
      <label class="form-label" for="change-level">New Access Level</label>
      <select class="form-control" id="change-level">${opts}</select>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" id="modal-change-btn">Update Access</button>
  `;

  Modal.create({ title: `Change Access — ${appName}`, body, footer });

  Modal.getEl('#modal-change-btn').onclick = async () => {
    const groupN = Modal.getEl('#change-level').value;
    Modal.getEl('#modal-change-btn').disabled = true;
    Modal.getEl('#modal-change-btn').textContent = 'Updating…';
    try {
      await API.updateAccess(recId, { groupN });
      Modal.close();
      Toast.success('Access Updated', `${userName}'s access changed to ${groupN}.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      Toast.error('Update Failed', err.message);
      Modal.getEl('#modal-change-btn').disabled = false;
      Modal.getEl('#modal-change-btn').textContent = 'Update Access';
    }
  };
}

// ── Confirm Revoke Modal ──────────────────────────────────────
function showRevokeModal({ recId, userName, appName, level, onSuccess }) {
  const body = `
    <p style="color:var(--text-sub);margin-bottom:16px;">Are you sure you want to revoke the following access? This action cannot be undone.</p>
    <div class="confirm-preview">
      <div class="confirm-preview-label">Access to Revoke</div>
      <div class="confirm-preview-row"><span class="lbl">User</span><span class="val">${userName}</span></div>
      <div class="confirm-preview-row"><span class="lbl">Application</span><span class="val">${appName}</span></div>
      <div class="confirm-preview-row"><span class="lbl">Level</span><span class="val">${level}</span></div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-danger" id="modal-revoke-btn">Revoke Access</button>
  `;

  Modal.create({ title: 'Confirm Revoke Access', body, footer });

  Modal.getEl('#modal-revoke-btn').onclick = async () => {
    Modal.getEl('#modal-revoke-btn').disabled = true;
    Modal.getEl('#modal-revoke-btn').textContent = 'Revoking…';
    try {
      await API.revokeAccess(recId);
      Modal.close();
      Toast.success('Access Revoked', `${userName}'s access to ${appName} has been removed.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      Toast.error('Revoke Failed', err.message);
      Modal.getEl('#modal-revoke-btn').disabled = false;
      Modal.getEl('#modal-revoke-btn').textContent = 'Revoke Access';
    }
  };
}
