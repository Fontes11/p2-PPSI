export const State = {
  page: 'home',
  user: null,
  token: null,
  selectedProductId: null,
  users:    JSON.parse(localStorage.getItem('vt_users')    || '[]'),
  products: [],

  saveUsers() { localStorage.setItem('vt_users', JSON.stringify(this.users)); },

  login(u, token = null) {
    this.user = u;
    this.token = token;
    sessionStorage.setItem('vt_session', JSON.stringify({ user: u, token }));
  },
  logout() {
    this.user = null;
    this.token = null;
    sessionStorage.removeItem('vt_session');
  },
  restore() {
    const s = sessionStorage.getItem('vt_session');
    if (!s) return;
    const data = JSON.parse(s);
    if (data && data.user) {
      this.user  = data.user;
      this.token = data.token || null;
    } else {
      this.user = data;
    }
  },
  isAdmin() {
    return this.user?.role === 'admin' || this.user?.tipo === 'admin' || this.user?.papel === 'administrador';
  },
};
