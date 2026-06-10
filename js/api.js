import { State } from './state.js';

export const API = 'https://base-back-dwpz.onrender.com';

export const EP = {
  produtos: '/produtos',
  usuarios: '/usuarios',
};

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (State.token) headers.Authorization = `Bearer ${State.token}`;

  const res = await fetch(API + path, { ...opts, headers });
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try { const j = await res.json(); msg = j.mensagem || j.message || j.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

let categoriasCache = null;

export function getCategoriasSync() {
  return categoriasCache || [];
}

export async function getCategorias() {
  if (categoriasCache) return categoriasCache;
  try {
    const raw = await apiFetch('/categorias');
    categoriasCache = normalizeList(raw);
  } catch {
    categoriasCache = [];
  }
  return categoriasCache;
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  for (const k of ['data', 'items', 'produtos', 'products', 'usuarios', 'users', 'results']) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
}
