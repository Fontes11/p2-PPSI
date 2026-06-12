import { PONTOS, buscarApi, normalizarLista } from '../api.js';
import { notificar, spinnerCarregamento, abrirSobreposicao, fecharSobreposicao } from '../utils.js';

let usuarios = [];

export function paginaAdminUsuarios() {
  return `
  <div class="conteiner area-admin">
    <div class="cabecalho-admin">
      <h2>Gerenciar Usuários</h2>
      <button class="btn btn-destaque" id="botao-novo-usuario">+ Novo usuário</button>
    </div>
    <div class="area-tabela">
      <div id="tabela-usuarios">${spinnerCarregamento()}</div>
    </div>
  </div>

  ${modalUsuario()}`;
}

function modalUsuario() {
  return `
  <div class="sobreposicao" id="sobreposicao-usuario">
    <div class="caixa-modal">
      <div class="cabecalho-modal">
        <h3 id="titulo-modal-usuario">Novo Usuário</h3>
        <button class="fechar-modal" id="fechar-modal-usuario">×</button>
      </div>
      <form id="formulario-usuario">
        <input type="hidden" name="id" />
        <div class="grupo-campo"><label>Nome</label>
          <input type="text" name="nome" required /></div>
        <div class="grupo-campo"><label>E-mail</label>
          <input type="email" name="email" required /></div>
        <div class="grupo-campo"><label>Senha</label>
          <input type="password" name="senha" id="entrada-senha-usuario" placeholder="Mínimo 6 caracteres" minlength="6" /></div>
        <div class="grupo-campo"><label>Papel</label>
          <select name="papel">
            <option value="editor">Editor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <div class="acoes-modal">
          <button type="button" class="btn btn-contorno" id="cancelar-modal-usuario">Cancelar</button>
          <button type="submit" class="btn btn-destaque" id="salvar-modal-usuario">Salvar</button>
        </div>
      </form>
    </div>
  </div>`;
}

export async function carregarTabelaUsuarios() {
  const el = document.getElementById('tabela-usuarios');
  if (!el) return;
  try {
    const raw = await buscarApi(PONTOS.usuarios);
    usuarios = normalizarLista(raw);
  } catch (err) {
    usuarios = [];
    notificar(`Erro ao carregar usuários: ${err.message}`, 'erro');
  }
  el.innerHTML = construirTabelaUsuarios(usuarios);
  conectarTabelaUsuarios();
}

function rotuloPapel(p) {
  return p === 'administrador' ? 'Administrador' : 'Editor';
}

function construirTabelaUsuarios(lista) {
  if (!lista.length) return `<div class="estado-vazio"><div class="icone-vazio"></div><p>Sem usuários.</p></div>`;
  return `
  <table>
    <thead><tr>
      <th>ID</th><th>Nome</th><th>E-mail</th><th>Papel</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${lista.map(u => `
        <tr>
          <td><span class="selo selo-azul">#${u.id}</span></td>
          <td><strong>${u.nome || u.name || '—'}</strong></td>
          <td>${u.email || '—'}</td>
          <td>${rotuloPapel(u.papel || u.role)}</td>
          <td><div class="acoes-linha">
            <button class="btn btn-pequeno btn-contorno" data-act="editar-usuario" data-id="${u.id}">Editar</button>
            <button class="btn btn-pequeno btn-perigo"  data-act="excluir-usuario"  data-id="${u.id}">Excluir</button>
          </div></td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

function conectarTabelaUsuarios() {
  document.getElementById('botao-novo-usuario')?.addEventListener('click', () => {
    const form = document.getElementById('formulario-usuario');
    form?.reset();
    if (form) form.id.value = '';
    document.getElementById('entrada-senha-usuario').required = true;
    document.getElementById('titulo-modal-usuario').textContent = 'Novo Usuário';
    abrirSobreposicao('sobreposicao-usuario');
  });

  document.getElementById('fechar-modal-usuario')?.addEventListener('click',  () => fecharSobreposicao('sobreposicao-usuario'));
  document.getElementById('cancelar-modal-usuario')?.addEventListener('click', () => fecharSobreposicao('sobreposicao-usuario'));
  document.getElementById('sobreposicao-usuario')?.addEventListener('click', e => {
    if (e.target.id === 'sobreposicao-usuario') fecharSobreposicao('sobreposicao-usuario');
  });

  document.getElementById('tabela-usuarios')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id  = btn.dataset.id;

    if (act === 'editar-usuario') {
      const u = usuarios.find(x => String(x.id) === String(id));
      if (!u) return;
      const f = document.getElementById('formulario-usuario');
      f.id.value    = u.id;
      f.nome.value  = u.nome || u.name || '';
      f.email.value = u.email || '';
      f.senha.value = '';
      f.papel.value = u.papel || u.role || 'editor';
      document.getElementById('entrada-senha-usuario').required = false;
      document.getElementById('titulo-modal-usuario').textContent = 'Editar Usuário';
      abrirSobreposicao('sobreposicao-usuario');
    }

    if (act === 'excluir-usuario') {
      if (!confirm('Excluir este usuário?')) return;
      try {
        await buscarApi(`${PONTOS.usuarios}/${id}`, { method: 'DELETE' });
        notificar('Usuário excluído!', 'sucesso');
      } catch (err) {
        notificar(`Erro ao excluir: ${err.message}`, 'erro');
        return;
      }
      await carregarTabelaUsuarios();
    }
  });

  document.getElementById('formulario-usuario')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('salvar-modal-usuario');
    const fd  = new FormData(e.target);
    const id  = fd.get('id');
    const senha = fd.get('senha');

    const payload = {
      nome:  fd.get('nome'),
      email: fd.get('email'),
      papel: fd.get('papel'),
    };
    if (senha) payload.senha = senha;

    btn.innerHTML = '<span class="carregando"></span> Salvando'; btn.disabled = true;

    try {
      if (id) {
        await buscarApi(`${PONTOS.usuarios}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await buscarApi(PONTOS.usuarios, { method: 'POST', body: JSON.stringify(payload) });
      }
      notificar('Usuário salvo!', 'sucesso');
      fecharSobreposicao('sobreposicao-usuario');
      await carregarTabelaUsuarios();
    } catch (err) {
      notificar(`Erro ao salvar: ${err.message}`, 'erro');
    } finally {
      btn.innerHTML = 'Salvar'; btn.disabled = false;
    }
  });
}
