import { Estado } from './state.js';

export const API = 'https://base-back-dwpz.onrender.com';

export const PONTOS = {
  produtos: '/produtos',
  usuarios: '/usuarios',
};

export async function buscarApi(caminho, opcoes = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if (Estado.token) headers.Authorization = `Bearer ${Estado.token}`;

  const res = await fetch(API + caminho, { ...opcoes, headers });
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try { const j = await res.json(); msg = j.mensagem || j.message || j.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

let cacheCategorias = null;

export function obterCategoriasSync() {
  return cacheCategorias || [];
}

export async function obterCategorias() {
  if (cacheCategorias) return cacheCategorias;
  try {
    const raw = await buscarApi('/categorias');
    cacheCategorias = normalizarLista(raw);
  } catch {
    cacheCategorias = [];
  }
  return cacheCategorias;
}

export function normalizarLista(dados) {
  if (Array.isArray(dados)) return dados;
  for (const k of ['data', 'items', 'produtos', 'products', 'usuarios', 'users', 'results']) {
    if (Array.isArray(dados[k])) return dados[k];
  }
  return [];
}
