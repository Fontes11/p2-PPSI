import { Estado } from '../state.js';
import { PONTOS, buscarApi, normalizarLista, obterCategorias } from '../api.js';
import { formatarPreco, notificar } from '../utils.js';

let categorias = [];

export function paginaInicial() {
  return `
  <section class="banner">
    <div class="conteiner">
      <h2>o Melhor <em>E-Comerce</em></h2>
      <p>Os Melhores Produtos Para você.</p>
    </div>
  </section>
  <div class="conteiner">
    <div class="barra-loja">
      <div class="area-busca">
        <input id="entrada-busca" type="text" placeholder="Buscar produtos…" />
      </div>
    </div>
    <div class="cabecalho-secao">
      <h3>Todos os produtos</h3>
    </div>
    <div id="grade-produtos">${esqueleto(6)}</div>
  </div>`;
}

function esqueleto(n) {
  return `<div class="grade-cartoes">${Array(n).fill(0).map(() => `
    <div class="cartao-esqueleto">
      <div class="esq" style="height:200px;border-radius:12px 12px 0 0"></div>
      <div style="padding:16px">
        <div class="esq" style="height:11px;width:55%;margin-bottom:10px"></div>
        <div class="esq" style="height:19px;margin-bottom:8px"></div>
        <div class="esq" style="height:13px;margin-bottom:16px"></div>
        <div class="esq" style="height:32px"></div>
      </div>
    </div>`).join('')}</div>`;
}

export async function carregarProdutos() {
  let raw;
  try {
    raw = await buscarApi(PONTOS.produtos);
  } catch {}

  Estado.produtos = raw ? normalizarLista(raw) : obterProdutosDemo();
  if (!raw) notificar('Modo demonstração — API não respondeu.', 'info');
  if (raw) categorias = await obterCategorias();
  renderizarProdutos();
}

export function renderizarProdutos() {
  const grade = document.getElementById('grade-produtos');
  if (!grade) return;

  const q = (document.getElementById('entrada-busca')?.value || '').toLowerCase();
  const lista = q
    ? Estado.produtos.filter(p =>
        [p.nome, p.name, p.descricao, p.description, p.categoria, p.category]
          .some(v => (v || '').toLowerCase().includes(q)))
    : Estado.produtos;

  if (!lista.length) {
    grade.innerHTML = `<div class="estado-vazio"><div class="icone-vazio"></div><p>Nenhum produto encontrado.</p></div>`;
    return;
  }

  grade.innerHTML = `<div class="grade-cartoes">${lista.map(cartaoProduto).join('')}</div>`;
}

function cartaoProduto(p) {
  const imgSrc = p.imagemUrl || p.imagem || p.image || p.imageUrl || p.foto || p.img || p.thumbnail || p.picture || '';
  const nome   = p.nome || p.name || 'Produto';
  const desc   = p.descricao || p.description || '';
  const cat    = p.categoriaId != null
    ? (categorias.find(c => String(c.id) === String(p.categoriaId))?.nome || '')
    : (p.categoria || p.category || '');
  const preco  = formatarPreco(p.preco || p.price || 0);

  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${nome}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="imagem-alternativa" style="display:none"></div>`
    : `<div class="imagem-alternativa"></div>`;

  return `
  <article class="cartao-produto" data-act="ver-produto" data-id="${p.id}">
    <div class="imagem-produto">${imgHtml}</div>
    <div class="corpo-produto">
      ${cat ? `<div class="categoria-produto">${cat}</div>` : ''}
      <div class="nome-produto">${nome}</div>
      <div class="descricao-produto">${desc}</div>
      <div class="preco-produto">${preco}</div>
    </div>
  </article>`;
}

function obterProdutosDemo() {
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
