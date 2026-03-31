// app.js — Hash-based SPA router + sidebar/header helpers

// ── Auth Guard ────────────────────────────────────────────────
if (!Auth.require()) { /* redirects to login */ }

// ── Populate Sidebar User ─────────────────────────────────────
const _u = Auth.getUser();
if (_u) {
  document.getElementById('sidebar-name').textContent = _u.fullName || _u.username;
  document.getElementById('sidebar-role').textContent  = _u.role || 'Admin';
  document.getElementById('sidebar-avatar').textContent = (_u.fullName || 'A').split(' ').map(n=>n[0]).join('').slice(0,2);
}

// ── Router ────────────────────────────────────────────────────
function navigate(path) {
  window.location.hash = path;
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function setBreadcrumb(section, sectionHref, detail) {
  const bc = document.getElementById('breadcrumb');
  if (!bc) return;
  if (detail) {
    bc.innerHTML = `
      <a href="#${sectionHref||''}">${section}</a>
      <span class="sep">›</span>
      <span class="current">${detail}</span>
    `;
  } else {
    bc.innerHTML = `<span class="current">${section}</span>`;
  }
}

function route() {
  const hash = window.location.hash.replace('#', '') || '/';
  const content = document.getElementById('content');
  content.classList.remove('page-enter');
  void content.offsetWidth; // force reflow to restart animation
  content.classList.add('page-enter');

  // ── Match routes ──────────────────────────────────────────
  if (hash === '/') {
    renderDashboard();
  } else if (hash === '/users') {
    renderUsers();
  } else if (hash.startsWith('/users/')) {
    const userId = hash.split('/users/')[1];
    renderUserDetail(userId);
  } else if (hash === '/apps') {
    renderApplications();
  } else if (hash.startsWith('/apps/')) {
    const appId = hash.split('/apps/')[1];
    renderAppDetail(appId);
  } else if (hash === '/access') {
    renderAccessRecords();
  } else if (hash === '/access-levels') {
    renderAccessLevels();
  } else {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗺</div>
        <div class="empty-title">Page not found</div>
        <div class="empty-sub"><a href="#/">Return to Dashboard</a></div>
      </div>`;
  }
}

// ── Global Search ─────────────────────────────────────────────
let _globalDebounce;
document.getElementById('global-search').addEventListener('input', (e) => {
  clearTimeout(_globalDebounce);
  const q = e.target.value.trim();
  if (!q) return;
  _globalDebounce = setTimeout(() => {
    // Navigate to users with search pre-populated
    _usersState = { page: 1, pageSize: 10, search: q, status: '', dept: '' };
    navigate('/users');
  }, 500);
});

// ── Listen for hash changes and initial load ──────────────────
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);

// Kick off initial route (DOMContentLoaded may have fired already)
if (document.readyState !== 'loading') route();
