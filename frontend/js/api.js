// api.js — Fetch wrappers for UserAccess API
const API_BASE = 'http://127.0.0.1:8000';

const API = (() => {
  function headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.getToken()}`,
    };
  }

  async function request(method, path, body = null) {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (res.status === 401) { Auth.logout(); return; }
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
    return data;
  }

  return {
    // Users
    getUsers:       (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/users${q ? '?' + q : ''}`); },
    getUser:        (id)          => request('GET',    `/users/${id}`),
    updateUser:     (id, d)       => request('PUT',    `/users/${id}`, d),
    getDepartments: ()            => request('GET',    '/users/departments'),

    // Applications
    getApplications:   (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/applications${q ? '?' + q : ''}`); },
    getApplication:    (id)          => request('GET',  `/applications/${id}`),
    createApplication: (d)           => request('POST', '/applications', d),
    updateApplication: (id, d)       => request('PUT',  `/applications/${id}`, d),

    // Access
    getAccess:   (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/access${q ? '?' + q : ''}`); },
    grantAccess:  (d)          => request('POST',   '/access', d),
    updateAccess: (id, d)      => request('PUT',    `/access/${id}`, d),
    revokeAccess: (id)         => request('DELETE', `/access/${id}`),
    cloneAccess:  (targetUserId, sourceUserId) => request('POST', '/access/clone', { targetUserId, sourceUserId }),

    // Access Levels
    getAccessLevels:   (appId)          => request('GET',    `/access-levels/${appId}`),
    getAllAccessLevels: ()               => request('GET',    '/access-levels'),
    createAccessLevel: (d)              => request('POST',   '/access-levels', d),
    updateAccessLevel: (appId, level, d) => request('PUT',   `/access-levels/${appId}/${encodeURIComponent(level)}`, d),
    deleteAccessLevel: (appId, level)   => request('DELETE', `/access-levels/${appId}/${encodeURIComponent(level)}`),
  };
})();
