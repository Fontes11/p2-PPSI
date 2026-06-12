import { Estado } from '../state.js';
import { formatarPreco } from '../utils.js';
import { obterCategoriasSync } from '../api.js';

export function paginaProduto() {
  const p = Estado.produtos.find(x => String(x.id) === String(Estado.idProdutoSelecionado));

  if (!p) {
    return `
    <div class="conteiner">
      <div class="estado-vazio"><div class="icone-vazio"></div><p>Produto não encontrado.</p></div>
      <div style="text-align:center;padding-bottom:40px">
        <button class="btn btn-contorno" data-nav="inicio">← Voltar para a loja</button>
      </div>
    </div>`;
  }

  const imgSrc = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || p.img || p.thumbnail || p.picture || '';
  const nome   = p.nome || p.name || 'Produto';
  const desc   = p.descricao || p.description || '';
  const cat    = p.categoriaId != null
    ? (obterCategoriasSync().find(c => String(c.id) === String(p.categoriaId))?.nome || '')
    : (p.categoria || p.category || '');
  const preco  = formatarPreco(p.preco || p.price || 0);

  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${nome}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="imagem-alternativa" style="display:none"></div>`
    : `<div class="imagem-alternativa"></div>`;

  return `
  <div class="conteiner">
    <div class="detalhe-wrap">
      <button class="btn btn-contorno" data-nav="inicio">← Voltar</button>
      <div class="detalhe-cartao">
        <div class="detalhe-imagem">${imgHtml}</div>
        <div class="detalhe-corpo">
          ${cat ? `<div class="categoria-produto">${cat}</div>` : ''}
          <h1 class="detalhe-nome">${nome}</h1>
          <div class="detalhe-preco">${preco}</div>
          <p class="detalhe-descricao">${desc}</p>
          <button class="btn btn-destaque largura-100" id="btn-comprar">Comprar</button>
        </div>
      </div>
    </div>
  </div>`;
}
