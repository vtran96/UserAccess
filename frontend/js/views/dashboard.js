// views/dashboard.js
function avatarColor(name) {
  const colors = [
    '#58a6ff','#3fb950','#d29922','#f78166','#bc8cff',
    '#39d353','#ff7b72','#79c0ff','#ffa657','#56d364',
  ];
  let h = 0;
  for (const c of (name||'A')) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return colors[h % colors.length];
}

function statusBadge(status) {
  const cls = { Active: 'badge-active', Inactive: 'badge-inactive', Pending: 'badge-pending' };
  return `<span class="badge ${cls[status]||'badge-inactive'}">${status}</span>`;
}

const RECENT_ACTIVITY = [
  { type: 'grant',  user: 'Michael Chen',      app: 'CityTrack',   level: 'Viewer',   time: '2 hours ago'  },
  { type: 'grant',  user: 'Sandra Proctor',    app: 'ReportDB',    level: 'Viewer',   time: '4 hours ago'  },
  { type: 'change', user: 'Angela Smith',      app: 'BudgetPro',   level: 'Approver', time: 'Yesterday'    },
  { type: 'revoke', user: 'James Park',        app: 'AlertNet',    level: 'Viewer',   time: '2 days ago'   },
  { type: 'grant',  user: 'Kavita Patel',      app: 'HR Portal',   level: 'Employee', time: '3 days ago'   },
  { type: 'grant',  user: 'Thomas Montgomery', app: 'BudgetPro',   level: 'Approver', time: '5 days ago'   },
];

const ACTIVITY_META = {
  grant:  { icon: '🔑', cls: 'grant',  verb: 'was granted'    },
  revoke: { icon: '🚫', cls: 'revoke', verb: 'was revoked from' },
  change: { icon: '🔄', cls: 'change', verb: 'access changed in' },
};

async function renderDashboard() {
  setBreadcrumb('Dashboard');
  setActiveNav('nav-dashboard');

  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-center"><div class="spinner"></div><div class="loading-text">Loading dashboard…</div></div>`;

  try {
    const [usersRes, appsRes, accessRes] = await Promise.all([
      API.getUsers({ pageSize: 100 }),
      API.getApplications(),
      API.getAccess(),
    ]);

    const activeUsers = usersRes.items.filter(u => u.status === 'Active').length;

    content.innerHTML = `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Overview of user access across all applications.</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-card-clickable" onclick="navigate('/users')" title="View all users">
            <div class="stat-icon blue">👥</div>
            <div>
              <div class="stat-number">${usersRes.total}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
          <div class="stat-card stat-card-clickable" onclick="navigate('/users')" title="View active users">
            <div class="stat-icon green">✅</div>
            <div>
              <div class="stat-number">${activeUsers}</div>
              <div class="stat-label">Active Users</div>
            </div>
          </div>
          <div class="stat-card stat-card-clickable" onclick="navigate('/apps')" title="View applications">
            <div class="stat-icon teal">🖥</div>
            <div>
              <div class="stat-number">${appsRes.length}</div>
              <div class="stat-label">Applications</div>
            </div>
          </div>
          <div class="stat-card stat-card-clickable" onclick="navigate('/access')" title="View access records">
            <div class="stat-icon orange">🔑</div>
            <div>
              <div class="stat-number">${accessRes.length}</div>
              <div class="stat-label">Access Records</div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Recent Access Activity</div>
            </div>
            <div class="card-body" style="padding:0 22px;">
              <div class="activity-list">
                ${RECENT_ACTIVITY.map(a => {
                  const m = ACTIVITY_META[a.type];
                  return `
                    <div class="activity-item">
                      <div class="activity-dot ${m.cls}">${m.icon}</div>
                      <div class="activity-text">
                        <div><strong>${a.user}</strong> ${m.verb} <strong>${a.app}</strong> as <strong>${a.level}</strong></div>
                        <div class="activity-time">${a.time}</div>
                      </div>
                    </div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="card">
              <div class="card-header">
                <div class="card-title">Applications</div>
                <button class="btn btn-ghost btn-sm" onclick="navigate('/apps')">View All →</button>
              </div>
              <div class="card-body" style="padding:0;">
                ${appsRes.map(a => `
                  <div style="display:flex;align-items:center;gap:12px;padding:12px 22px;border-bottom:1px solid var(--border-sub);cursor:pointer;"
                       onclick="navigate('/apps/${a.appId}')" onmouseover="this.style.background='var(--surface-el)'" onmouseout="this.style.background=''">
                    <div class="app-icon" style="width:32px;height:32px;font-size:12px;">${a.appId.slice(0,2)}</div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.aName}</div>
                      <div style="font-size:11.5px;color:var(--text-sub);">${a.userCount} user${a.userCount!==1?'s':''}</div>
                    </div>
                    <span class="badge ${a.isInternal ? 'badge-internal' : 'badge-cloud'}" style="font-size:10px;">${a.isInternal ? 'Internal' : 'Cloud'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Could not load dashboard</div><div class="empty-sub">${err.message}</div></div>`;
  }
}
