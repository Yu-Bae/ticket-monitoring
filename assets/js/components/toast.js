/* ─── TOAST NOTIFICATION COMPONENT ─── */

let toastTmr = null;

const TICONS = {
  success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  edit:    '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  delete:  '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  info:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  error:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
};

export function showToast(msg, type = "success") {
  const toastEl = document.getElementById("toast");
  if (!toastEl) return;
  if (toastTmr) clearTimeout(toastTmr);
  
  toastEl.innerHTML = (TICONS[type] || "") + `<span>${msg}</span>`;
  toastEl.className = `t-${type} show`;
  toastTmr = setTimeout(() => toastEl.classList.remove("show"), 3500);
}
