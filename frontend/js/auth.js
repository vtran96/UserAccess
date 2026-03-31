// auth.js — Auth state management
const Auth = (() => {
  const TOKEN_KEY = 'ua_token';
  const USER_KEY  = 'ua_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser()  {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }
  function isLoggedIn() { return !!getToken(); }
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  }
  function require() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
  }

  return { getToken, getUser, isLoggedIn, logout, require };
})();

function logout() { Auth.logout(); }
