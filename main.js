import { Estado } from './js/state.js';
import { renderizar } from './js/router.js';

(function popularAdminPadrao() {
  const existe = Estado.usuarios.some(u => u.email === 'admin');
  if (!existe) {
    Estado.usuarios.unshift({ id: 1, nome: 'Administrador', email: 'admin', senha: 'admin', role: 'admin' });
    Estado.salvarUsuarios();
  }
})();

Estado.restaurar();
history.replaceState({ pagina: Estado.pagina, idProdutoSelecionado: Estado.idProdutoSelecionado }, '', `#${Estado.pagina}`);
renderizar();
