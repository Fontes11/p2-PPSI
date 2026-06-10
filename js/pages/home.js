import { State } from '../state.js';
import { EP, apiFetch, normalizeList, getCategorias } from '../api.js';
import { fmt, toast } from '../utils.js';

let categorias = [];

export function pageHome() {
  return `
  <section class="hero">
    <div class="container">
      <h2>Descubra produtos <em>incríveis</em></h2>
      <p>Curadoria selecionada com os melhores preços e qualidade.</p>
    </div>
  </section>
  <div class="container">
    <div class="shop-bar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input id="search-input" type="text" placeholder="Buscar produtos…" />
      </div>
    </div>
    <div class="section-head">
      <h3>Todos os produtos</h3>
      <span id="prod-count" class="count"></span>
    </div>
    <div id="prod-grid">${skeleton(6)}</div>
  </div>`;
}

function skeleton(n) {
  return `<div class="products-grid">${Array(n).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="sk" style="height:200px;border-radius:12px 12px 0 0"></div>
      <div style="padding:16px">
        <div class="sk" style="height:11px;width:55%;margin-bottom:10px"></div>
        <div class="sk" style="height:19px;margin-bottom:8px"></div>
        <div class="sk" style="height:13px;margin-bottom:16px"></div>
        <div class="sk" style="height:32px"></div>
      </div>
    </div>`).join('')}</div>`;
}

export async function loadProducts() {
  let raw;
  try {
    raw = await apiFetch(EP.produtos);
  } catch {}

  State.products = raw ? normalizeList(raw) : getDemoProducts();
  if (!raw) toast('Modo demonstração — API não respondeu.', 'info');
  if (raw) categorias = await getCategorias();
  renderProducts();
}

export function renderProducts() {
  const grid  = document.getElementById('prod-grid');
  const count = document.getElementById('prod-count');
  if (!grid) return;

  const q = (document.getElementById('search-input')?.value || '').toLowerCase();
  const list = q
    ? State.products.filter(p =>
        [p.nome, p.name, p.descricao, p.description, p.categoria, p.category]
          .some(v => (v || '').toLowerCase().includes(q)))
    : State.products;

  if (count) count.textContent = `${list.length} produto${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="ei">📦</div><p>Nenhum produto encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = `<div class="products-grid">${list.map(prodCard).join('')}</div>`;
}

function prodCard(p) {
  const imgSrc = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || p.img || p.thumbnail || p.picture || '';
  const nome   = p.nome || p.name || 'Produto';
  const desc   = p.descricao || p.description || '';
  const cat    = p.categoriaId != null
    ? (categorias.find(c => String(c.id) === String(p.categoriaId))?.nome || '')
    : (p.categoria || p.category || '');
  const preco  = fmt(p.preco || p.price || 0);

  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${nome}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="img-fallback" style="display:none">📦</div>`
    : `<div class="img-fallback">📦</div>`;

  return `
  <article class="product-card" data-act="view-prod" data-id="${p.id}">
    <div class="product-img">${imgHtml}</div>
    <div class="product-body">
      ${cat ? `<div class="product-cat">${cat}</div>` : ''}
      <div class="product-name">${nome}</div>
      <div class="product-desc">${desc}</div>
      <div class="product-price">${preco}</div>
    </div>
  </article>`;
}

function getDemoProducts() {
  return [
    { id:1, nome:'Fone Bluetooth Pro',    descricao:'Cancelamento de ruído ativo, 30h de bateria.',   preco:349.90, categoria:'Eletrônicos', imagem:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
    { id:2, nome:'Mochila Urban Slim',    descricao:'Compartimento para notebook até 15".',           preco:189.90, categoria:'Acessórios',  imagem:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' },
    { id:3, nome:'Tênis Corrida Ultra',   descricao:'Solado de amortecimento e cabedal respirável.',  preco:299.90, categoria:'Calçados',    imagem:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop' },
    { id:4, nome:'Câmera Instantânea',    descricao:'Revele memórias na hora. Filme incluso.',        preco:499.00, categoria:'Eletrônicos', imagem:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop' },
    { id:5, nome:'Planta Suculenta Kit',  descricao:'3 suculentas em vasos de cimento artesanais.',   preco:89.90,  categoria:'Decoração',   imagem:'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&h=300&fit=crop' },
    { id:6, nome:'Carregador Portátil',   descricao:'20.000 mAh, carga rápida, 2 saídas USB-C.',     preco:149.90, categoria:'Eletrônicos', imagem:'https://images.unsplash.com/photo-1609592806596-b65e4a8c6d58?w=400&h=300&fit=crop' },
    { id:7, nome:'Agenda Kraft 2025',     descricao:'Capa kraft, miolo pautado, elástico fechamento.',preco:49.90,  categoria:'Papelaria',   imagem:'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop' },
    { id:8, nome:'Caneca Térmica 500ml',  descricao:'Mantém temperatura por 12h. Anti-vazamento.',    preco:79.90,  categoria:'Utilidades',  imagem:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop' },
  ];
}
