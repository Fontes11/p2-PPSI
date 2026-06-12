import { Estado } from '../state.js';
import { PONTOS, buscarApi, normalizarLista, obterCategorias } from '../api.js';
import { formatarPreco, notificar, spinnerCarregamento, abrirSobreposicao, fecharSobreposicao } from '../utils.js';
import { enviarImagem } from '../storage.js';

let categorias = [];

export function paginaAdminProdutos() {
  return `
  <div class="conteiner area-admin">
    <div class="cabecalho-admin">
      <h2>Gerenciar Produtos</h2>
      <button class="btn btn-destaque" id="botao-novo-produto">+ Novo produto</button>
    </div>
    <div class="area-tabela">
      <div id="tabela-produtos">${spinnerCarregamento()}</div>
    </div>
  </div>

  ${modalProduto()}`;
}

function marcadorUploadImagem() {
  return `<div class="marcador-upload-imagem">
    <span>Clique para selecionar uma imagem</span>
  </div>`;
}

function modalProduto() {
  return `
  <div class="sobreposicao" id="sobreposicao-produto">
    <div class="caixa-modal">
      <div class="cabecalho-modal">
        <h3 id="titulo-modal-produto">Novo Produto</h3>
        <button class="fechar-modal" id="fechar-modal-produto">×</button>
      </div>
      <form id="formulario-produto">
        <input type="hidden" name="id" />
        <div class="grupo-campo"><label>Nome</label>
          <input type="text" name="nome" required /></div>
        <div class="grupo-campo"><label>Descrição</label>
          <textarea name="descricao"></textarea></div>
        <div class="linha-formulario">
          <div class="grupo-campo"><label>Preço (R$)</label>
            <input type="number" name="preco" step="0.01" min="0" required /></div>
          <div class="grupo-campo"><label>Estoque</label>
            <input type="number" name="estoque" step="1" min="0" required /></div>
        </div>
        <div class="grupo-campo"><label>Categoria</label>
          <select name="categoriaId" id="selecao-categoria-produto"></select>
        </div>
        <div class="grupo-campo"><label>Foto do produto</label>
          <input type="file" id="entrada-foto-produto" name="foto" accept="image/*" hidden />
          <input type="hidden" name="imagemUrl" />
          <div id="previa-imagem-produto" class="previa-imagem caixa-upload-imagem">${marcadorUploadImagem()}</div>
        </div>
        <div class="acoes-modal">
          <button type="button" class="btn btn-contorno" id="cancelar-modal-produto">Cancelar</button>
          <button type="submit" class="btn btn-destaque" id="salvar-modal-produto">Salvar</button>
        </div>
      </form>
    </div>
  </div>`;
}

export async function carregarTabelaProdutos() {
  const el = document.getElementById('tabela-produtos');
  if (!el) return;
  let lista = Estado.produtos;
  if (!lista.length) {
    try {
      const raw = await buscarApi(PONTOS.produtos);
      if (raw) { Estado.produtos = normalizarLista(raw); lista = Estado.produtos; }
    } catch {}
    if (!lista.length) { Estado.produtos = []; lista = []; }
  }
  categorias = await obterCategorias();
  el.innerHTML = construirTabelaProdutos(lista);
  conectarTabelaProdutos();
}

function nomeCategoria(id) {
  const c = categorias.find(c => String(c.id) === String(id));
  return c?.nome || '—';
}

function construirTabelaProdutos(lista) {
  if (!lista.length) return `<div class="estado-vazio"><div class="icone-vazio"></div><p>Sem produtos.</p></div>`;
  return `
  <table>
    <thead><tr>
      <th>ID</th><th>Imagem</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${lista.map(p => {
        const img = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || '';
        const thumb = img
          ? `<img src="${img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'" />`
          : '';
        const cat = p.categoriaId != null ? nomeCategoria(p.categoriaId) : (p.categoria || p.category || '—');
        return `<tr>
          <td><span class="selo selo-azul">#${p.id}</span></td>
          <td>${thumb}</td>
          <td><strong>${p.nome || p.name || '—'}</strong></td>
          <td>${cat}</td>
          <td>${formatarPreco(p.preco || p.price)}</td>
          <td><div class="acoes-linha">
            <button class="btn btn-pequeno btn-contorno" data-act="editar-produto" data-id="${p.id}">Editar</button>
            <button class="btn btn-pequeno btn-perigo"  data-act="excluir-produto"  data-id="${p.id}">Excluir</button>
          </div></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function preencherSelecaoCategoria(idSelecionado) {
  const sel = document.getElementById('selecao-categoria-produto');
  if (!sel) return;
  sel.innerHTML = categorias.map(c =>
    `<option value="${c.id}" ${String(c.id) === String(idSelecionado) ? 'selected' : ''}>${c.nome}</option>`
  ).join('');
}

function conectarTabelaProdutos() {
  preencherSelecaoCategoria();

  document.getElementById('botao-novo-produto')?.addEventListener('click', () => {
    const form = document.getElementById('formulario-produto');
    form?.reset();
    if (form) { form.id.value = ''; form.imagemUrl.value = ''; }
    preencherSelecaoCategoria();
    document.getElementById('previa-imagem-produto').innerHTML = marcadorUploadImagem();
    document.getElementById('titulo-modal-produto').textContent = 'Novo Produto';
    abrirSobreposicao('sobreposicao-produto');
  });

  document.getElementById('previa-imagem-produto')?.addEventListener('click', () => {
    document.getElementById('entrada-foto-produto')?.click();
  });

  document.getElementById('entrada-foto-produto')?.addEventListener('change', e => {
    const arquivo = e.target.files?.[0];
    const previa = document.getElementById('previa-imagem-produto');
    if (!arquivo) { previa.innerHTML = marcadorUploadImagem(); return; }
    previa.innerHTML = `<img src="${URL.createObjectURL(arquivo)}" alt="Pré-visualização" />`;
  });

  document.getElementById('fechar-modal-produto')?.addEventListener('click',  () => fecharSobreposicao('sobreposicao-produto'));
  document.getElementById('cancelar-modal-produto')?.addEventListener('click', () => fecharSobreposicao('sobreposicao-produto'));
  document.getElementById('sobreposicao-produto')?.addEventListener('click', e => {
    if (e.target.id === 'sobreposicao-produto') fecharSobreposicao('sobreposicao-produto');
  });

  document.getElementById('tabela-produtos')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id  = btn.dataset.id;

    if (act === 'editar-produto') {
      const p = Estado.produtos.find(x => String(x.id) === String(id));
      if (!p) return;
      const f = document.getElementById('formulario-produto');
      f.id.value        = p.id;
      f.nome.value      = p.nome || p.name || '';
      f.descricao.value = p.descricao || p.description || '';
      f.preco.value     = p.preco || p.price || '';
      f.estoque.value   = p.estoque ?? 0;
      f.imagemUrl.value = p.imagemUrl || p.imagem || p.image || p.imageUrl || '';
      f.foto.value = '';
      preencherSelecaoCategoria(p.categoriaId);
      const previa = document.getElementById('previa-imagem-produto');
      previa.innerHTML = f.imagemUrl.value
        ? `<img src="${f.imagemUrl.value}" alt="Pré-visualização" />`
        : marcadorUploadImagem();
      document.getElementById('titulo-modal-produto').textContent = 'Editar Produto';
      abrirSobreposicao('sobreposicao-produto');
    }

    if (act === 'excluir-produto') {
      if (!confirm('Excluir este produto?')) return;
      let ok = false, errMsg = '';
      try { await buscarApi(`${PONTOS.produtos}/${id}`, { method: 'DELETE' }); ok = true; }
      catch (err) { errMsg = err.message; }
      Estado.produtos = Estado.produtos.filter(p => String(p.id) !== String(id));
      notificar(ok ? 'Produto excluído!' : `Excluído localmente (${errMsg || 'falha na API'}).`, ok ? 'sucesso' : 'info');
      await carregarTabelaProdutos();
    }
  });

  document.getElementById('formulario-produto')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('salvar-modal-produto');
    const fd   = new FormData(e.target);
    const id   = fd.get('id');
    const foto = fd.get('foto');

    btn.innerHTML = '<span class="carregando"></span> Salvando'; btn.disabled = true;

    let imagemUrl = fd.get('imagemUrl') || '';
    if (foto && foto.size > 0) {
      try {
        imagemUrl = await enviarImagem(foto);
      } catch (err) {
        notificar(`Erro no upload: ${err.message}`, 'erro');
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
        await buscarApi(`${PONTOS.produtos}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await buscarApi(PONTOS.produtos, { method: 'POST', body: JSON.stringify(payload) });
      }
      ok = true;
    } catch (err) { errMsg = err.message; }
    if (!ok) {
      if (id) {
        const idx = Estado.produtos.findIndex(p => String(p.id) === String(id));
        if (idx > -1) Estado.produtos[idx] = { ...Estado.produtos[idx], ...payload };
      } else {
        Estado.produtos.unshift({ id: Date.now(), ...payload });
      }
    }
    notificar(ok ? 'Produto salvo!' : `Salvo localmente (${errMsg || 'falha na API'}).`, ok ? 'sucesso' : 'info');
    fecharSobreposicao('sobreposicao-produto');
    await carregarTabelaProdutos();
  });
}
