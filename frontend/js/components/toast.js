// toast.js — Notification toast component
const Toast = (() => {
  const container = () => document.getElementById('toast-container');
  const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  function show({ type = 'info', title, message, duration = 4000 }) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="toast-icon">${ICONS[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
    `;
    container().appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  }

  return {
    success: (title, msg)  => show({ type: 'success', title, message: msg }),
    error:   (title, msg)  => show({ type: 'error',   title, message: msg }),
    warning: (title, msg)  => show({ type: 'warning', title, message: msg }),
    info:    (title, msg)  => show({ type: 'info',    title, message: msg }),
  };
})();
