export const Estado = {
  pagina: 'inicio',
  usuario: null,
  token: null,
  idProdutoSelecionado: null,
  usuarios:    JSON.parse(localStorage.getItem('vt_usuarios')    || '[]'),
  produtos: [],

  salvarUsuarios() { localStorage.setItem('vt_usuarios', JSON.stringify(this.usuarios)); },

  entrar(u, token = null) {
    this.usuario = u;
    this.token = token;
    sessionStorage.setItem('vt_sessao', JSON.stringify({ usuario: u, token }));
  },
  sair() {
    this.usuario = null;
    this.token = null;
    sessionStorage.removeItem('vt_sessao');
  },
  restaurar() {
    const s = sessionStorage.getItem('vt_sessao');
    if (!s) return;
    const dados = JSON.parse(s);
    if (dados && dados.usuario) {
      this.usuario = dados.usuario;
      this.token = dados.token || null;
    } else {
      this.usuario = dados;
    }
  },
  ehAdmin() {
    return this.usuario?.role === 'admin' || this.usuario?.tipo === 'admin' || this.usuario?.papel === 'administrador';
  },
};
