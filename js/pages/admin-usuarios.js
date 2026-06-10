import { State } from '../state.js';
import { EP, apiFetch, normalizeList } from '../api.js';
import { toast, loadingSpinner, openOverlay, closeOverlay } from '../utils.js';

export function pageAdminUsuarios() {
  return `
  <div class="container admin-wrap">
    <div class="admin-hdr">
      <h2>Gerenciar Usuários</h2>
      <div class="admin-hdr-sub">Visualize, edite e exclua usuários cadastrados</div>
    </div>
    <div class="table-wrap">
      <div id="user-table">${loadingSpinner()}</div>
    </div>
  </div>

  ${modalUsuario()}`;
}

function modalUsuario() {
  return `
  <div class="overlay" id="user-overlay">
    <div class="modal-box">
      <div class="modal-hdr">
        <h3 id="user-modal-title">Editar Usuário</h3>
        <button class="modal-close" id="user-modal-close">✕</button>
      </div>
      <form id="form-usuario">
        <input type="hidden" name="id" />
        <div class="fg"><label>Nome</label>
          <input type="text" name="nome" required /></div>
        <div class="fg"><label>E-mail</label>
          <input type="email" name="email" required /></div>
        <div class="fg"><label>Nova senha <span style="color:var(--muted);font-weight:400">(deixe em branco para não alterar)</span></label>
          <input type="password" name="senha" placeholder="••••••••" minlength="6" /></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="user-modal-cancel">Cancelar</button>
          <button type="submit" class="btn btn-accent" id="user-modal-save">Salvar alterações</button>
        </div>
      </form>
    </div>
  </div>

  <div class="overlay" id="user-del-overlay">
    <div class="modal-box modal-sm">
      <div class="modal-hdr">
        <h3>Confirmar exclusão</h3>
        <button class="modal-close" id="user-del-close">✕</button>
      </div>
      <p style="margin:0 0 24px;color:var(--muted)">
        Tem certeza que deseja excluir o usuário <strong id="del-user-name"></strong>?
        Esta ação não pode ser desfeita.
      </p>
      <div class="modal-actions">
        <button class="btn btn-outline" id="user-del-cancel">Cancelar</button>
        <button class="btn btn-danger"  id="user-del-confirm">Sim, excluir</button>
      </div>
    </div>
  </div>`;
}

export async function loadUserTable() {
  const el = document.getElementById('user-table');
  if (!el) return;
  let list = [];

  try {
    const raw = await apiFetch(EP.usuarios);
    list = normalizeList(raw);
  } catch {}

  const localOnly = State.users.filter(lu => !list.some(au => au.email === lu.email));
  list = [...list, ...localOnly];

  el.innerHTML = buildUserTable(list);
  wireUserTable(list);
}

function buildUserTable(list) {
  if (!list.length) return `<div class="empty-state"><div class="ei">👥</div><p>Nenhum usuário encontrado.</p></div>`;

  return `
  <table>
    <thead><tr>
      <th>ID</th><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${list.map(u => {
        const role    = u.role || u.tipo || u.papel || 'user';
        const isAdmin = role === 'admin' || role === 'administrador';
        const nome    = u.nome || u.name || '—';
        const isSelf  = State.user && (String(u.id) === String(State.user.id) || u.email === State.user.email);
        return `<tr ${isSelf ? 'class="self-row"' : ''}>
          <td><span class="badge badge-teal">#${u.id || '—'}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="user-avatar-sm">${(nome[0] || '?').toUpperCase()}</div>
              <strong>${nome}</strong>
              ${isSelf ? '<span class="badge badge-teal" style="font-size:.68rem">você</span>' : ''}
            </div>
          </td>
          <td>${u.email || '—'}</td>
          <td><span class="badge ${isAdmin ? 'badge-amber' : 'badge-teal'}">
            ${isAdmin ? '⭐ Admin' : '👤 Cliente'}
          </span></td>
          <td><div class="row-actions">
            <button class="btn btn-sm btn-outline" data-act="edit-user" data-id="${u.id}" data-email="${u.email}">✏ Editar</button>
            <button class="btn btn-sm btn-danger"  data-act="del-user"  data-id="${u.id}" data-email="${u.email}" data-nome="${nome}"
              ${isSelf ? 'disabled title="Você não pode excluir sua própria conta"' : ''}>
              ✕ Excluir
            </button>
          </div></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function wireUserTable(list) {
  document.querySelectorAll('[data-act="edit-user"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.id;
      const email = btn.dataset.email;
      const u     = list.find(x => String(x.id) === String(id) || x.email === email);
      if (!u) return;
      const form = document.getElementById('form-usuario');
      form.id.value    = u.id || '';
      form.nome.value  = u.nome || u.name || '';
      form.email.value = u.email || '';
      form.senha.value = '';
      form.dataset.email = u.email;
      document.getElementById('user-modal-title').textContent = `Editar — ${u.nome || u.name}`;
      openOverlay('user-overlay');
    });
  });

  let pendingDelId    = null;
  let pendingDelEmail = null;

  document.querySelectorAll('[data-act="del-user"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      pendingDelId    = btn.dataset.id;
      pendingDelEmail = btn.dataset.email;
      document.getElementById('del-user-name').textContent = btn.dataset.nome;
      openOverlay('user-del-overlay');
    });
  });

  document.getElementById('user-del-confirm')?.addEventListener('click', async () => {
    closeOverlay('user-del-overlay');
    await deleteUser(pendingDelId, pendingDelEmail);
  });
  document.getElementById('user-del-cancel')?.addEventListener('click', () => closeOverlay('user-del-overlay'));
  document.getElementById('user-del-close')?.addEventListener('click',  () => closeOverlay('user-del-overlay'));

  document.getElementById('user-modal-close')?.addEventListener('click',  () => closeOverlay('user-overlay'));
  document.getElementById('user-modal-cancel')?.addEventListener('click', () => closeOverlay('user-overlay'));
  document.getElementById('user-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'user-overlay') closeOverlay('user-overlay');
  });

  document.getElementById('form-usuario')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('user-modal-save');
    const fd   = new FormData(e.target);
    const id   = fd.get('id');
    const email_original = e.target.dataset.email;
    const payload = {
      nome:  fd.get('nome').trim(),
      email: fd.get('email').trim().toLowerCase(),
    };
    const novaSenha = fd.get('senha');
    if (novaSenha) payload.senha = novaSenha;

    btn.innerHTML = '<span class="spinner"></span> Salvando';
    btn.disabled = true;

    let apiOk = false;
    if (id) {
      try {
        await apiFetch(`${EP.usuarios}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        apiOk = true;
        toast('Usuário atualizado!', 'success');
      } catch (err) {
        toast(`API: ${err.message}`, 'error');
      }
    }

    const localIdx = State.users.findIndex(u => u.email === email_original || String(u.id) === String(id));
    if (localIdx > -1) {
      State.users[localIdx] = { ...State.users[localIdx], ...payload };
      if (novaSenha) State.users[localIdx].senha = novaSenha;
      State.saveUsers();
    }

    if (!apiOk) toast('Salvo localmente.', 'info');

    if (State.user && State.user.email === email_original) {
      State.login({ ...State.user, ...payload }, State.token);
    }

    closeOverlay('user-overlay');
    await loadUserTable();
  });
}

async function deleteUser(id, email) {
  let apiOk = false;
  if (id) {
    try {
      await apiFetch(`${EP.usuarios}/${id}`, { method: 'DELETE' });
      apiOk = true;
    } catch {}
  }

  State.users = State.users.filter(u => u.email !== email && String(u.id) !== String(id));
  State.saveUsers();

  toast(apiOk ? 'Usuário excluído!' : 'Excluído localmente.', apiOk ? 'success' : 'info');
  await loadUserTable();
}
