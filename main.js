import { State } from './js/state.js';
import { render } from './js/router.js';

(function seedAdmin() {
  const exists = State.users.some(u => u.email === 'admin');
  if (!exists) {
    State.users.unshift({ id: 1, nome: 'Administrador', email: 'admin', senha: 'admin', role: 'admin' });
    State.saveUsers();
  }
})();

State.restore();
history.replaceState({ page: State.page, selectedProductId: State.selectedProductId }, '', `#${State.page}`);
render();
