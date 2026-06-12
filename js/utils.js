export function formatarPreco(v) {
  return parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const esperar = ms => new Promise(r => setTimeout(r, ms));

export function notificar(msg, tipo = 'info') {
  const el = document.createElement('div');
  const classes = { sucesso: 'sucesso', erro: 'erro', info: 'info' };
  el.className = `aviso ${classes[tipo] || 'info'}`;
  el.innerHTML = `<span>${msg}</span>`;
  document.getElementById('conteiner-avisos').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

export function spinnerCarregamento() {
  return `<div style="padding:48px;text-align:center;color:var(--suave)">
    <div class="carregando" style="border-color:rgba(0,0,0,.12);border-top-color:var(--destaque);display:inline-block;width:28px;height:28px"></div>
    <p style="margin-top:14px;font-size:.9rem">Carregando…</p>
  </div>`;
}

export function abrirSobreposicao(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('aberto');
}

export function fecharSobreposicao(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('aberto');
}
