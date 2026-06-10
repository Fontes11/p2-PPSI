export function fmt(v) {
  return parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${{ success: '✔', error: '✖', info: 'ℹ' }[type] || 'ℹ'}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

export function loadingSpinner() {
  return `<div style="padding:48px;text-align:center;color:var(--muted)">
    <div class="spinner" style="border-color:rgba(0,0,0,.12);border-top-color:var(--accent);display:inline-block;width:28px;height:28px"></div>
    <p style="margin-top:14px;font-size:.9rem">Carregando…</p>
  </div>`;
}

export function openOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

export function closeOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
