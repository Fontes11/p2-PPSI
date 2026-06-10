import { State } from '../state.js';
import { EP, apiFetch, normalizeList, getCategorias } from '../api.js';
import { fmt, toast, loadingSpinner, openOverlay, closeOverlay } from '../utils.js';
import { uploadImage } from '../storage.js';

let categorias = [];

export function pageAdminProdutos() {
  return `
  <div class="container admin-wrap">
    <div class="admin-hdr">
      <h2>Gerenciar Produtos</h2>
      <button class="btn btn-accent" id="btn-novo-prod">+ Novo produto</button>
    </div>
    <div class="table-wrap">
      <div id="prod-table">${loadingSpinner()}</div>
    </div>
  </div>

  ${modalProduto()}`;
}

function modalProduto() {
  return `
  <div class="overlay" id="prod-overlay">
    <div class="modal-box">
      <div class="modal-hdr">
        <h3 id="prod-modal-title">Novo Produto</h3>
        <button class="modal-close" id="prod-modal-close">✕</button>
      </div>
      <form id="form-produto">
        <input type="hidden" name="id" />
        <div class="fg"><label>Nome</label>
          <input type="text" name="nome" required /></div>
        <div class="fg"><label>Descrição</label>
          <textarea name="descricao"></textarea></div>
        <div class="form-row">
          <div class="fg"><label>Preço (R$)</label>
            <input type="number" name="preco" step="0.01" min="0" required /></div>
          <div class="fg"><label>Estoque</label>
            <input type="number" name="estoque" step="1" min="0" required /></div>
        </div>
        <div class="fg"><label>Categoria</label>
          <select name="categoriaId" id="prod-categoria-select"></select>
        </div>
        <div class="fg"><label>Foto do produto</label>
          <input type="file" id="prod-foto-input" name="foto" accept="image/*" />
          <input type="hidden" name="imagemUrl" />
          <div id="prod-img-preview" class="img-preview"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="prod-modal-cancel">Cancelar</button>
          <button type="submit" class="btn btn-accent" id="prod-modal-save">Salvar</button>
        </div>
      </form>
    </div>
  </div>`;
}

export async function loadProdTable() {
  const el = document.getElementById('prod-table');
  if (!el) return;
  let list = State.products;
  if (!list.length) {
    try {
      const raw = await apiFetch(EP.produtos);
      if (raw) { State.products = normalizeList(raw); list = State.products; }
    } catch {}
    if (!list.length) { State.products = []; list = []; }
  }
  categorias = await getCategorias();
  el.innerHTML = buildProdTable(list);
  wireProdTable();
}

function categoriaNome(id) {
  const c = categorias.find(c => String(c.id) === String(id));
  return c?.nome || '—';
}

function buildProdTable(list) {
  if (!list.length) return `<div class="empty-state"><div class="ei">📦</div><p>Sem produtos.</p></div>`;
  return `
  <table>
    <thead><tr>
      <th>ID</th><th>Imagem</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${list.map(p => {
        const img = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || '';
        const thumb = img
          ? `<img src="${img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'" />`
          : '<span style="font-size:1.4rem">📦</span>';
        const cat = p.categoriaId != null ? categoriaNome(p.categoriaId) : (p.categoria || p.category || '—');
        return `<tr>
          <td><span class="badge badge-teal">#${p.id}</span></td>
          <td>${thumb}</td>
          <td><strong>${p.nome || p.name || '—'}</strong></td>
          <td>${cat}</td>
          <td>${fmt(p.preco || p.price)}</td>
          <td><div class="row-actions">
            <button class="btn btn-sm btn-outline" data-act="edit-prod" data-id="${p.id}">✏ Editar</button>
            <button class="btn btn-sm btn-danger"  data-act="del-prod"  data-id="${p.id}">✕ Excluir</button>
          </div></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function fillCategoriaSelect(selectedId) {
  const sel = document.getElementById('prod-categoria-select');
  if (!sel) return;
  sel.innerHTML = categorias.map(c =>
    `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${c.nome}</option>`
  ).join('');
}

function wireProdTable() {
  fillCategoriaSelect();

  document.getElementById('btn-novo-prod')?.addEventListener('click', () => {
    const form = document.getElementById('form-produto');
    form?.reset();
    if (form) { form.id.value = ''; form.imagemUrl.value = ''; }
    fillCategoriaSelect();
    document.getElementById('prod-img-preview').innerHTML = '';
    document.getElementById('prod-modal-title').textContent = 'Novo Produto';
    openOverlay('prod-overlay');
  });

  document.getElementById('prod-foto-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    const preview = document.getElementById('prod-img-preview');
    if (!file) { preview.innerHTML = ''; return; }
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Pré-visualização" />`;
  });

  document.getElementById('prod-modal-close')?.addEventListener('click',  () => closeOverlay('prod-overlay'));
  document.getElementById('prod-modal-cancel')?.addEventListener('click', () => closeOverlay('prod-overlay'));
  document.getElementById('prod-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'prod-overlay') closeOverlay('prod-overlay');
  });

  document.getElementById('prod-table')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id  = btn.dataset.id;

    if (act === 'edit-prod') {
      const p = State.products.find(x => String(x.id) === String(id));
      if (!p) return;
      const f = document.getElementById('form-produto');
      f.id.value        = p.id;
      f.nome.value      = p.nome || p.name || '';
      f.descricao.value = p.descricao || p.description || '';
      f.preco.value     = p.preco || p.price || '';
      f.estoque.value   = p.estoque ?? 0;
      f.imagemUrl.value = p.imagemUrl || p.imagem || p.image || p.imageUrl || '';
      f.foto.value = '';
      fillCategoriaSelect(p.categoriaId);
      const preview = document.getElementById('prod-img-preview');
      preview.innerHTML = f.imagemUrl.value
        ? `<img src="${f.imagemUrl.value}" alt="Pré-visualização" />`
        : '';
      document.getElementById('prod-modal-title').textContent = 'Editar Produto';
      openOverlay('prod-overlay');
    }

    if (act === 'del-prod') {
      if (!confirm('Excluir este produto?')) return;
      let ok = false, errMsg = '';
      try { await apiFetch(`${EP.produtos}/${id}`, { method: 'DELETE' }); ok = true; }
      catch (err) { errMsg = err.message; }
      State.products = State.products.filter(p => String(p.id) !== String(id));
      toast(ok ? 'Produto excluído!' : `Excluído localmente (${errMsg || 'falha na API'}).`, ok ? 'success' : 'info');
      await loadProdTable();
    }
  });

  document.getElementById('form-produto')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('prod-modal-save');
    const fd   = new FormData(e.target);
    const id   = fd.get('id');
    const foto = fd.get('foto');

    btn.innerHTML = '<span class="spinner"></span> Salvando'; btn.disabled = true;

    let imagemUrl = fd.get('imagemUrl') || '';
    if (foto && foto.size > 0) {
      try {
        imagemUrl = await uploadImage(foto);
      } catch (err) {
        toast(`Erro no upload: ${err.message}`, 'error');
        btn.innerHTML = 'Salvar'; btn.disabled = false;
        return;
      }
    }

    const payload = {
      nome:       fd.get('nome'),
      descricao:  fd.get('descricao'),
      preco:      parseFloat(fd.get('preco')),
      estoque:    parseInt(fd.get('estoque'), 10) || 0,
      categoriaId: parseInt(fd.get('categoriaId'), 10),
      imagemUrl,
      ativo: true,
    };
    let ok = false;
    let errMsg = '';
    try {
      if (id) {
        await apiFetch(`${EP.produtos}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch(EP.produtos, { method: 'POST', body: JSON.stringify(payload) });
      }
      ok = true;
    } catch (err) { errMsg = err.message; }
    if (!ok) {
      if (id) {
        const idx = State.products.findIndex(p => String(p.id) === String(id));
        if (idx > -1) State.products[idx] = { ...State.products[idx], ...payload };
      } else {
        State.products.unshift({ id: Date.now(), ...payload });
      }
    }
    toast(ok ? 'Produto salvo!' : `Salvo localmente (${errMsg || 'falha na API'}).`, ok ? 'success' : 'info');
    closeOverlay('prod-overlay');
    await loadProdTable();
  });
}

