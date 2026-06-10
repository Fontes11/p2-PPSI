import { State } from '../state.js';
import { fmt } from '../utils.js';
import { getCategoriasSync } from '../api.js';

export function pageProduto() {
  const p = State.products.find(x => String(x.id) === String(State.selectedProductId));

  if (!p) {
    return `
    <div class="container">
      <div class="empty-state"><div class="ei">📦</div><p>Produto não encontrado.</p></div>
      <div style="text-align:center;padding-bottom:40px">
        <button class="btn btn-outline" data-nav="home">← Voltar para a loja</button>
      </div>
    </div>`;
  }

  const imgSrc = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || p.img || p.thumbnail || p.picture || '';
  const nome   = p.nome || p.name || 'Produto';
  const desc   = p.descricao || p.description || '';
  const cat    = p.categoriaId != null
    ? (getCategoriasSync().find(c => String(c.id) === String(p.categoriaId))?.nome || '')
    : (p.categoria || p.category || '');
  const preco  = fmt(p.preco || p.price || 0);

  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${nome}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="img-fallback" style="display:none">📦</div>`
    : `<div class="img-fallback">📦</div>`;

  return `
  <div class="container">
    <div class="produto-wrap">
      <button class="btn btn-outline" data-nav="home">← Voltar</button>
      <div class="produto-card">
        <div class="produto-img">${imgHtml}</div>
        <div class="produto-body">
          ${cat ? `<div class="product-cat">${cat}</div>` : ''}
          <h1 class="produto-nome">${nome}</h1>
          <div class="produto-preco">${preco}</div>
          <p class="produto-desc">${desc}</p>
          <button class="btn btn-accent w100" id="btn-comprar">Comprar</button>
        </div>
      </div>
    </div>
  </div>`;
}
