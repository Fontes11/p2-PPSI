import { Estado } from './state.js';
import { notificar, esperar } from './utils.js';
import { buscarApi } from './api.js';

import { paginaInicial, carregarProdutos, renderizarProdutos } from './pages/home.js';
import { paginaProduto } from './pages/produto.js';
import { paginaLogin } from './pages/login.js';
import { paginaCadastro } from './pages/register.js';
import { paginaAdminProdutos, carregarTabelaProdutos } from './pages/admin-produtos.js';
import { paginaAdminUsuarios, carregarTabelaUsuarios } from './pages/admin-usuarios.js';

export function navegar(pagina, empilhar = true) {
  Estado.pagina = pagina;
  if (empilhar) {
    history.pushState(
      { pagina, idProdutoSelecionado: Estado.idProdutoSelecionado },
      '',
      `#${pagina}`
    );
  }
  renderizar();
}

export function renderizar() {
  const app = document.getElementById('aplicativo');
  app.innerHTML = construirCabecalho() + construirPagina() + construirRodape();
  conectar();
}

window.addEventListener('popstate', e => {
  const s = e.state || { pagina: 'inicio', idProdutoSelecionado: null };
  Estado.pagina = s.pagina;
  Estado.idProdutoSelecionado = s.idProdutoSelecionado ?? null;
  renderizar();
});

function construirCabecalho() {
  const logado = !!Estado.usuario;
  const admin  = Estado.ehAdmin();
  return `
  <header class="cabecalho-site">
    <div class="conteiner interior-cabecalho">
      <div class="logo" data-nav="inicio">E-<span>Compras</span></div>
      <nav class="acoes-nav">
        <button class="btn-nav" data-nav="inicio">Loja</button>
        ${logado ? `
          ${admin ? `<button class="btn-nav" data-nav="admin-produtos">Produtos</button>
                     <button class="btn-nav" data-nav="admin-usuarios">Usuários</button>` : ''}
          <button class="btn-nav" id="botao-sair">Sair</button>
        ` : `
          <button class="btn-nav" data-nav="acesso">Entrar</button>
          <button class="btn-nav btn-cadastro-cabecalho" data-nav="cadastro">Cadastrar</button>
        `}
      </nav>
    </div>
  </header>`;
}

function construirRodape() {
  return `<footer class="rodape-site">© 2026 Gabriel Fontes</footer>`;
}

function construirPagina() {
  switch (Estado.pagina) {
    case 'inicio':         return paginaInicial();
    case 'produto':        return paginaProduto();
    case 'acesso':         return paginaLogin();
    case 'cadastro':       return paginaCadastro();
    case 'admin-produtos':
      if (!Estado.ehAdmin()) { navegar('inicio', false); return ''; }
      return paginaAdminProdutos();
    case 'admin-usuarios':
      if (!Estado.ehAdmin()) { navegar('inicio', false); return ''; }
      return paginaAdminUsuarios();
    default:               return paginaInicial();
  }
}

function conectar() {
  const app = document.getElementById('aplicativo');

  app.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); navegar(nav.dataset.nav); return; }

    const produto = e.target.closest('[data-act="ver-produto"]');
    if (produto) { Estado.idProdutoSelecionado = produto.dataset.id; navegar('produto'); }
  });

  document.getElementById('botao-sair')?.addEventListener('click', () => {
    Estado.sair(); notificar('Até logo!', 'info'); navegar('inicio');
  });

  document.getElementById('formulario-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('botao-login');
    const fd  = new FormData(e.target);
    const email = fd.get('email').trim();
    const senha = fd.get('senha');
    btn.innerHTML = '<span class="carregando"></span>'; btn.disabled = true;
    await esperar(300);

    let resp = null;
    try {
      resp = await buscarApi('/entrar', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
    } catch {}

    // Bootstrap da conta admin/admin no backend, caso ainda não exista nele
    if (!resp?.accessToken && email.toLowerCase() === 'admin' && senha === 'admin') {
      try {
        await buscarApi('/cadastrar', {
          method: 'POST',
          body: JSON.stringify({ nome: 'Administrador', email: 'admin', senha: 'admin', papel: 'administrador' }),
        });
        resp = await buscarApi('/entrar', {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        });
      } catch {}
    }

    if (resp?.accessToken) {
      Estado.entrar(resp.user, resp.accessToken);
      notificar(`Bem-vindo, ${resp.user.nome || resp.user.name}!`, 'sucesso');
      navegar('inicio');
      return;
    }

    const usuarioLocal = Estado.usuarios.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.senha === senha);

    if (usuarioLocal) {
      Estado.entrar(usuarioLocal);
      notificar(`Bem-vindo, ${usuarioLocal.nome || usuarioLocal.name}!`, 'sucesso');
      navegar('inicio');
    } else {
      notificar('E-mail ou senha incorretos.', 'erro');
      btn.innerHTML = 'Entrar'; btn.disabled = false;
    }
  });

  document.getElementById('formulario-cadastro')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('botao-cadastro');
    const fd  = new FormData(e.target);
    const nome   = fd.get('nome').trim();
    const email  = fd.get('email').trim().toLowerCase();
    const senha  = fd.get('senha');
    const senha2 = fd.get('senha2');
    if (senha !== senha2) { notificar('As senhas não coincidem.', 'erro'); return; }
    if (Estado.usuarios.find(u => u.email === email)) { notificar('E-mail já cadastrado.', 'erro'); return; }
    btn.innerHTML = '<span class="carregando"></span>'; btn.disabled = true;
    await esperar(300);

    let resp = null;
    try {
      resp = await buscarApi('/cadastrar', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, papel: 'editor' }),
      });
    } catch {}

    if (resp?.accessToken) {
      Estado.entrar(resp.user, resp.accessToken);
      notificar(`Conta criada! Bem-vindo, ${nome}`, 'sucesso');
      navegar('inicio');
      return;
    }

    const novoUsuario = { id: Date.now(), nome, email, senha, role: 'user' };
    Estado.usuarios.push(novoUsuario); Estado.salvarUsuarios();
    Estado.entrar(novoUsuario);
    notificar(`Conta criada! Bem-vindo, ${nome}`, 'sucesso');
    navegar('inicio');
  });

  document.getElementById('entrada-busca')?.addEventListener('input', renderizarProdutos);

  if (Estado.pagina === 'inicio')         carregarProdutos();
  if (Estado.pagina === 'admin-produtos') carregarTabelaProdutos();
  if (Estado.pagina === 'admin-usuarios') carregarTabelaUsuarios();
}
