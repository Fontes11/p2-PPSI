import { State } from './state.js';
import { toast, sleep } from './utils.js';
import { apiFetch } from './api.js';

import { pageHome, loadProducts, renderProducts } from './pages/home.js';
import { pageProduto } from './pages/produto.js';
import { pageLogin } from './pages/login.js';
import { pageRegister } from './pages/register.js';
import { pageAdminProdutos, loadProdTable } from './pages/admin-produtos.js';
import { pageAdminUsuarios, loadUserTable } from './pages/admin-usuarios.js';

export function go(page, push = true) {
  State.page = page;
  if (push) {
    history.pushState(
      { page, selectedProductId: State.selectedProductId },
      '',
      `#${page}`
    );
  }
  render();
}

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = buildHeader() + buildPage() + buildFooter();
  wire();
}

window.addEventListener('popstate', e => {
  const s = e.state || { page: 'home', selectedProductId: null };
  State.page = s.page;
  State.selectedProductId = s.selectedProductId ?? null;
  render();
});

function buildHeader() {
  const loggedIn = !!State.user;
  const admin    = State.isAdmin();
  return `
  <header class="site-header">
    <div class="container header-inner">
      <div class="logo" data-nav="home">E-<span>Compras</span></div>
      <nav class="nav-actions">
        <button class="nav-btn" data-nav="home">Loja</button>
        ${loggedIn ? `
          ${admin ? `<button class="nav-btn" data-nav="admin-produtos">Produtos</button>
                     <button class="nav-btn" data-nav="admin-usuarios">Usuários</button>` : ''}
          <button class="nav-btn" id="hdr-logout">Sair</button>
        ` : `
          <button class="nav-btn" data-nav="login">Entrar</button>
          <button class="nav-btn btn-register-hdr" data-nav="register">Cadastrar</button>
        `}
      </nav>
    </div>
  </header>`;
}

function buildFooter() {
  return `<footer class="site-footer">© 2026 Gabriel Fontes</footer>`;
}

function buildPage() {
  switch (State.page) {
    case 'home':           return pageHome();
    case 'produto':        return pageProduto();
    case 'login':          return pageLogin();
    case 'register':       return pageRegister();
    case 'admin-produtos':
      if (!State.isAdmin()) { go('home', false); return ''; }
      return pageAdminProdutos();
    case 'admin-usuarios':
      if (!State.isAdmin()) { go('home', false); return ''; }
      return pageAdminUsuarios();
    default:               return pageHome();
  }
}

function wire() {
  const app = document.getElementById('app');

  app.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }

    const prod = e.target.closest('[data-act="view-prod"]');
    if (prod) { State.selectedProductId = prod.dataset.id; go('produto'); }
  });

  document.getElementById('hdr-logout')?.addEventListener('click', () => {
    State.logout(); toast('Até logo!', 'info'); go('home');
  });

  document.getElementById('form-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const fd  = new FormData(e.target);
    const email = fd.get('email').trim();
    const senha = fd.get('senha');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    await sleep(300);

    let apiResp = null;
    try {
      apiResp = await apiFetch('/entrar', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
    } catch {}

    // Bootstrap da conta admin/admin no backend, caso ainda não exista nele
    if (!apiResp?.accessToken && email.toLowerCase() === 'admin' && senha === 'admin') {
      try {
        await apiFetch('/cadastrar', {
          method: 'POST',
          body: JSON.stringify({ nome: 'Administrador', email: 'admin', senha: 'admin', papel: 'administrador' }),
        });
        apiResp = await apiFetch('/entrar', {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        });
      } catch {}
    }

    if (apiResp?.accessToken) {
      State.login(apiResp.user, apiResp.accessToken);
      toast(`Bem-vindo, ${apiResp.user.nome || apiResp.user.name}! 👋`, 'success');
      go('home');
      return;
    }

    const localUser = State.users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.senha === senha);

    if (localUser) {
      State.login(localUser);
      toast(`Bem-vindo, ${localUser.nome || localUser.name}! 👋`, 'success');
      go('home');
    } else {
      toast('E-mail ou senha incorretos.', 'error');
      btn.innerHTML = 'Entrar'; btn.disabled = false;
    }
  });

  document.getElementById('form-register')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-register');
    const fd  = new FormData(e.target);
    const nome   = fd.get('nome').trim();
    const email  = fd.get('email').trim().toLowerCase();
    const senha  = fd.get('senha');
    const senha2 = fd.get('senha2');
    if (senha !== senha2) { toast('As senhas não coincidem.', 'error'); return; }
    if (State.users.find(u => u.email === email)) { toast('E-mail já cadastrado.', 'error'); return; }
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    await sleep(300);

    let apiResp = null;
    try {
      apiResp = await apiFetch('/cadastrar', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, papel: 'editor' }),
      });
    } catch {}

    if (apiResp?.accessToken) {
      State.login(apiResp.user, apiResp.accessToken);
      toast(`Conta criada! Bem-vindo, ${nome} 🎉`, 'success');
      go('home');
      return;
    }

    const nu = { id: Date.now(), nome, email, senha, role: 'user' };
    State.users.push(nu); State.saveUsers();
    State.login(nu);
    toast(`Conta criada! Bem-vindo, ${nome} 🎉`, 'success');
    go('home');
  });

  document.getElementById('search-input')?.addEventListener('input', renderProducts);

  if (State.page === 'home')           loadProducts();
  if (State.page === 'admin-produtos') loadProdTable();
  if (State.page === 'admin-usuarios') loadUserTable();
}
