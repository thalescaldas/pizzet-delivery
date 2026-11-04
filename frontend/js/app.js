// =====================================================================
// PizzET — aplicação (HTML, CSS e JavaScript puros)
// Cada "página" é uma função que devolve HTML. render() monta a tela
// a partir do objeto "state". A navegação usa o # da URL (ex.: #menu).
// =====================================================================
import { api } from './api.js';
import {
  money,
  CATEGORIAS,
  STATUS,
  ETAPAS,
  textoStatus,
  PAGAMENTOS,
  nomePagamento,
  TAXA_ENTREGA_ESTIMADA,
  formatarData,
  formatarCep,
  formatarTelefone,
} from './data.js';
import { ativarMascaras, formatarCamposComMascara, limparDigitos } from './mascaras.js';

const app = document.querySelector('#app');
const PAGINAS = [
  'home',
  'menu',
  'cart',
  'checkout',
  'orders',
  'tracking',
  'profile',
  'about',
  'success',
  'admin',
];

// ---------------------------------------------------------------------
// ESTADO DA APLICAÇÃO
// ---------------------------------------------------------------------
const state = {
  page: 'home',
  param: null, // ex.: id do pedido em #tracking/12
  products: [], // catálogo completo (ativos)
  productsStatus: 'loading', // loading | ok | error
  menuResults: null, // resultado da busca/filtro no cardápio (null = usar products)
  menuLoading: false,
  cart: lerCarrinho(),
  theme: lerPreferencia('pizzet_theme', 'dark'),
  user: null,
  orders: [],
  ordersStatus: 'idle', // idle | loading | ok | error
  addresses: [],
  addressesStatus: 'idle',
  selectedOrder: null,
  lastOrder: null,
  filter: 'Todas',
  search: '',
  drawer: false,
  modal: null, // 'login' | 'register' | null
  modalMessage: '',
  afterLogin: null, // página para abrir depois de entrar (ex.: checkout)
  mobileMenu: false,
  admin: { tab: 'produtos', products: [], orders: [], status: '', editing: null, loading: false },
};

let elementoQueAbriuModal = null; // para devolver o foco ao fechar o modal
let timerAcompanhamento = null; // atualização automática do status
let timerBusca = null;

// ---------------------------------------------------------------------
// UTILITÁRIOS
// ---------------------------------------------------------------------

/** Escapa texto antes de colocar no HTML (proteção contra XSS). */
const escapeHtml = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

function lerPreferencia(chave, padrao) {
  try {
    return localStorage.getItem(chave) || padrao;
  } catch {
    return padrao;
  }
}

/** O carrinho guarda só id, nome, preço exibido e quantidade. O preço que vale é o do servidor. */
function lerCarrinho() {
  try {
    const itens = JSON.parse(localStorage.getItem('pizzet_cart') || '[]');
    return Array.isArray(itens) ? itens.filter((x) => x && x.id && x.qty > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('pizzet_cart', JSON.stringify(state.cart));
  } catch {
    /* navegador sem armazenamento: o carrinho dura só nesta aba */
  }
}

const cartCount = () => state.cart.reduce((n, x) => n + x.qty, 0);
const cartTotal = () => state.cart.reduce((n, x) => n + x.price * x.qty, 0);
const productById = (id) => state.products.find((p) => String(p.id) === String(id));
const isAdmin = () => !!state.user?.ehAdministrador;
const primeiroNome = () => (state.user?.nome || 'Minha conta').split(' ')[0];

const img = (p) =>
  p.imageUrl
    ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy">`
    : `<div class="pizza-art" style="--pizza-accent:${escapeHtml(p.accent || '#e77b35')}" role="img" aria-label="${escapeHtml(p.name)}"><span aria-hidden="true">${escapeHtml(p.emoji || '🍕')}</span></div>`;

function toast(msg) {
  const el = document.querySelector('#toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 4000);
}

/** Bloco padrão de "carregando", "erro" e "vazio". */
const estadoCarregando = (texto = 'Carregando...') =>
  `<div class="empty state-loading" role="status"><div class="loader" aria-hidden="true"></div><p>${texto}</p></div>`;
const estadoErro = (texto, acao = '') =>
  `<div class="empty state-error" role="alert"><div class="empty-emoji" aria-hidden="true">🛰️</div><h3>${escapeHtml(texto)}</h3>${acao}</div>`;

// ---------------------------------------------------------------------
// NAVEGAÇÃO
// ---------------------------------------------------------------------
function nav(page, param = null) {
  if (page === 'checkout' && !state.user) {
    // Precisa estar logado para finalizar o pedido
    state.afterLogin = 'checkout';
    abrirModal('login', 'Entre ou crie sua conta para finalizar o pedido.');
    return;
  }
  if (page === 'admin' && !isAdmin()) page = 'home';
  if ((page === 'profile' || page === 'tracking') && !state.user) {
    state.afterLogin = page;
    abrirModal('login');
    return;
  }

  pararAcompanhamento();
  state.page = page;
  state.param = param;
  state.drawer = false;
  state.modal = null;
  state.mobileMenu = false;
  state.search = '';
  state.filter = 'Todas';
  state.menuResults = null;
  // Ao abrir o acompanhamento, nunca mostra dados antigos: busca o pedido de novo na API
  if (page === 'tracking') state.selectedOrder = null;
  history.replaceState(null, '', `#${page}${param ? `/${param}` : ''}`);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  carregarDadosDaPagina();
}

function lerHash() {
  const [page, param] = location.hash.slice(1).split('/');
  return { page: PAGINAS.includes(page) ? page : 'home', param: param || null };
}

/** Busca na API o que cada página precisa. */
function carregarDadosDaPagina() {
  if (state.page === 'orders') loadOrders();
  if (state.page === 'checkout' || state.page === 'profile') loadAddresses();
  if (state.page === 'tracking' && state.param) loadOrder(state.param, true);
  if (state.page === 'admin') loadAdmin();
}

// ---------------------------------------------------------------------
// COMPONENTES (mesmo HTML/classes do protótipo V2)
// ---------------------------------------------------------------------
function header() {
  const links = [
    ['home', 'Início'],
    ['menu', 'Cardápio'],
    ['orders', 'Pedidos'],
    ['about', 'Sobre'],
  ];
  if (isAdmin()) links.push(['admin', 'Admin']);
  return `<header class="header"><div class="container header-inner">
    <a href="#home" class="brand" data-nav="home" aria-label="PizzET início">PizzE<span>T</span><span class="brand-ufo" aria-hidden="true">⌁</span></a>
    <nav id="menu-principal" class="nav ${state.mobileMenu ? 'open' : ''}" aria-label="Menu principal">
      ${links.map(([k, v]) => `<a href="#${k}" data-nav="${k}" class="${state.page === k ? 'active' : ''}" ${state.page === k ? 'aria-current="page"' : ''}>${v}</a>`).join('')}
    </nav>
    <div class="header-actions">
      <button class="icon-btn" data-action="theme" aria-label="${state.theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}">${state.theme === 'dark' ? '☀' : '☾'}</button>
      <button class="account-btn" data-action="account" aria-label="${state.user ? `Minha conta (${escapeHtml(primeiroNome())})` : 'Entrar ou criar conta'}">${state.user ? `👤 ${escapeHtml(primeiroNome())}` : '👤 Entrar'}</button>
      <button class="cart-trigger" data-action="drawer" aria-label="Abrir carrinho, ${cartCount()} itens">🛒<b aria-hidden="true">${cartCount()}</b></button>
      <button class="icon-btn mobile-toggle" data-action="mobile" aria-label="${state.mobileMenu ? 'Fechar menu' : 'Abrir menu'}" aria-expanded="${state.mobileMenu}" aria-controls="menu-principal">${state.mobileMenu ? '✕' : '☰'}</button>
    </div>
  </div></header>`;
}

function hero(title, subtitle, cta = false) {
  return `<section class="hero"><div class="container hero-grid">
    <div class="hero-copy"><span class="eyebrow">// DELIVERY INTERGALÁCTICO</span><h1>${title}</h1><p>${subtitle}</p>
      ${cta ? '<button class="btn btn-primary" data-nav="menu">🚀 ABDUZIR MINHA FOME <span aria-hidden="true">↗</span></button>' : ''}
    </div>
    <div class="hero-visual" role="img" aria-label="Mascote alienígena e OVNI no universo PizzET"><div class="hero-art hero-art-dark"></div><div class="hero-art hero-art-light"></div></div>
  </div></section>`;
}

function productCard(p) {
  return `<article class="product-card">
    <div class="product-image">${img(p)}</div>
    <span class="category-tag">${escapeHtml(p.category || 'Pizza')}</span>
    <h3>${escapeHtml(p.name)}</h3>
    <p>${escapeHtml(p.description || '')}</p>
    <div class="product-bottom"><strong>${money(p.price)}</strong>
      <button class="btn btn-small btn-primary" data-add="${escapeHtml(p.id)}" aria-label="Adicionar ${escapeHtml(p.name)} ao carrinho">+ Abduzir</button>
    </div>
  </article>`;
}

/** Grade de produtos com estados de carregando/erro/vazio. */
function productGrid(lista, classeExtra = '') {
  if (state.productsStatus === 'loading') return estadoCarregando('Carregando o cardápio intergaláctico...');
  if (state.productsStatus === 'error')
    return estadoErro(
      'Não foi possível carregar o cardápio.',
      '<button class="btn btn-primary" data-action="retry-products">Tentar novamente</button>',
    );
  if (!lista.length) return '<div class="empty">Nenhum produto encontrado.</div>';
  return `<div class="product-grid ${classeExtra}">${lista.map(productCard).join('')}</div>`;
}

// ---------------------------------------------------------------------
// PÁGINAS
// ---------------------------------------------------------------------
function home() {
  return `${hero('SABOR DE OUTRO <em>PLANETA.</em>', 'Pizzas irresistíveis, ingredientes de outra galáxia e entrega na velocidade de um OVNI.', true)}
  <section class="section container"><div class="section-heading"><div><span class="eyebrow">// ESCOLHAS DA TRIPULAÇÃO</span><h2>As favoritas da <em>galáxia</em></h2></div><button class="text-link" data-nav="menu">Ver cardápio completo →</button></div>
    ${productGrid(state.products.filter((p) => p.categoryCode !== 'BEBIDA').slice(0, 4), 'featured')}
  </section>
  <section class="section container"><div class="promo"><div><span class="eyebrow">// SUA PRÓXIMA MISSÃO</span><h2>SUA FOME SERÁ <em>ABDUZIDA!</em></h2><p>Monte sua missão gastronômica e receba pizzas quentinhas na sua órbita.</p><button class="btn btn-primary" data-nav="menu">Explorar sabores ↗</button></div><div class="promo-art"><img src="./assets/mascot-banner.webp" alt="Mascote PizzET ao lado de caixas de pizza e um OVNI" loading="lazy"></div></div></section>
  <section class="section container"><div class="section-heading"><h2>Como funciona?</h2></div><div class="benefits"><div><b>01 🚀</b><h3>Escolha sua pizza</h3><p>Explore nosso cardápio intergaláctico.</p></div><div><b>02 🛒</b><h3>Finalize a missão</h3><p>Informe seu endereço e confirme o pedido.</p></div><div><b>03 👽</b><h3>Receba em casa</h3><p>Acompanhe o status até a entrega.</p></div></div></section>`;
}

/** Produtos visíveis no cardápio: resultado da API (busca) ou o catálogo carregado. */
function produtosDoMenu() {
  return state.menuResults ?? state.products;
}

function menuGridHtml() {
  if (state.menuLoading) return estadoCarregando('Buscando sabores...');
  return productGrid(produtosDoMenu());
}

function menu() {
  const categorias = ['Todas', ...CATEGORIAS.map((c) => c.nome)];
  const total = produtosDoMenu().length;
  return `${hero('CARDÁPIO <em>INTERGALÁCTICO.</em>', 'Escolha sua pizza e embarque numa viagem de sabor.')}
  <section class="section container"><div class="section-heading"><h2>Explore os sabores</h2><span id="menu-count" aria-live="polite">${total} produtos</span></div>
    <div class="catalog-layout">
      <aside class="filters" aria-label="Filtrar por categoria"><h3>Filtrar por categoria</h3>
        ${categorias.map((c) => `<button data-filter="${escapeHtml(c)}" class="filter-btn ${state.filter === c ? 'active' : ''}" aria-pressed="${state.filter === c}">${escapeHtml(c)}</button>`).join('')}
      </aside>
      <div>
        <label class="search-wrap"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Buscar pizzas, ingredientes..." value="${escapeHtml(state.search)}" autocomplete="off" aria-label="Buscar produtos" maxlength="100"></label>
        <div id="menu-results">${menuGridHtml()}</div>
      </div>
    </div>
  </section>`;
}

function cartRows() {
  if (!state.cart.length)
    return '<div class="empty"><div class="empty-emoji" aria-hidden="true">🛸</div><h3>Seu carrinho está vazio</h3><p>Que tal abduzir uma pizza?</p><button class="btn btn-primary" data-nav="menu">Ver cardápio</button></div>';
  return state.cart
    .map(
      (x) => `<div class="cart-row"><div class="cart-mini">${img(x)}</div>
      <div class="cart-info"><h3>${escapeHtml(x.name)}</h3><p>${money(x.price)} cada</p>
        <div class="quantity"><button data-qty="${escapeHtml(x.id)}" data-delta="-1" aria-label="Diminuir quantidade de ${escapeHtml(x.name)}">−</button><span aria-label="Quantidade">${x.qty}</span><button data-qty="${escapeHtml(x.id)}" data-delta="1" aria-label="Aumentar quantidade de ${escapeHtml(x.name)}" ${x.qty >= 20 ? 'disabled' : ''}>+</button></div>
      </div>
      <div class="cart-end"><b>${money(x.price * x.qty)}</b><button class="remove" data-remove="${escapeHtml(x.id)}" aria-label="Remover ${escapeHtml(x.name)}">✕</button></div></div>`,
    )
    .join('');
}

const taxaExibida = () => (state.cart.length ? TAXA_ENTREGA_ESTIMADA : 0);

function cart() {
  return `<section class="section container page-space"><span class="eyebrow">// SUA MISSÃO</span><h1 class="page-title">MEU <em>CARRINHO</em></h1>
  <div class="checkout-grid"><div class="panel"><h2>Seus itens (${cartCount()})</h2>${cartRows()}</div>
    <div class="panel summary"><h2>Resumo do pedido</h2>
      <div class="summary-line"><span>Subtotal</span><b>${money(cartTotal())}</b></div>
      <div class="summary-line"><span>Entrega</span><b>${money(taxaExibida())}</b></div>
      <div class="summary-line total"><span>Total</span><b>${money(cartTotal() + taxaExibida())}</b></div>
      <button class="btn btn-primary btn-full" data-nav="checkout" ${!state.cart.length ? 'disabled' : ''}>Decolar pedido 🚀</button>
      <p class="muted small">O valor final é confirmado pelo servidor ao registrar o pedido.</p>
    </div></div></section>`;
}

/** Campos de endereço (usados no checkout e no perfil). Nomes iguais aos da API. */
function camposEndereco() {
  return `<div class="form-grid">
    <label>CEP<input name="cep" data-mask="cep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000" required></label>
    <label>Número<input name="numero" data-mask="numero" inputmode="numeric" maxlength="6" required></label>
    <label class="wide">Rua<input name="logradouro" autocomplete="address-line1" required maxlength="150"></label>
    <label>Bairro<input name="bairro" required maxlength="80"></label>
    <label>Cidade<input name="cidade" autocomplete="address-level2" required maxlength="80"></label>
    <label>Estado (UF)<input name="uf" data-mask="uf" autocomplete="address-level1" required minlength="2" maxlength="2" placeholder="MG"></label>
    <label>Complemento<input name="complemento" maxlength="60"></label>
    <label class="wide">Apelido do endereço<input name="apelido" maxlength="30" placeholder="Casa, Trabalho..."></label>
  </div>`;
}

const textoEndereco = (e) =>
  `${escapeHtml(e.logradouro)}, ${escapeHtml(e.numero)}${e.complemento ? ` — ${escapeHtml(e.complemento)}` : ''} · ${escapeHtml(e.bairro)}, ${escapeHtml(e.cidade)}/${escapeHtml(e.uf)} · CEP ${formatarCep(e.cep)}`;

function checkout() {
  if (!state.cart.length) return cart();
  let enderecos;
  if (state.addressesStatus === 'loading' || state.addressesStatus === 'idle')
    enderecos = estadoCarregando('Carregando seus endereços...');
  else {
    const salvos = state.addresses
      .map(
        (
          e,
          i,
        ) => `<label class="address-option"><input type="radio" name="enderecoId" value="${e.id}" ${i === 0 ? 'checked' : ''}>
        <span><b>${escapeHtml(e.apelido)}</b><small>${textoEndereco(e)}</small></span></label>`,
      )
      .join('');
    enderecos = `<div class="address-list" role="radiogroup" aria-label="Endereço de entrega">${salvos}
      <label class="address-option"><input type="radio" name="enderecoId" value="novo" ${!state.addresses.length ? 'checked' : ''}><span><b>+ Novo endereço</b><small>Cadastrar outro endereço de entrega</small></span></label></div>
      <div id="novo-endereco" ${state.addresses.length ? 'hidden' : ''}>${camposEndereco()}</div>`;
  }
  return `<section class="section container page-space"><span class="eyebrow">// FINALIZAR MISSÃO</span><h1 class="page-title">FINALIZE SEU <em>PEDIDO</em></h1>
  <div class="checkout-grid"><form class="panel form" id="checkout-form" novalidate><h2>Endereço de entrega</h2>${enderecos}
    <h2>Pagamento simulado</h2><p class="muted">Não será realizada nenhuma cobrança.</p>
    <label>Forma de pagamento<select name="formaPagamento">${PAGAMENTOS.map((p) => `<option value="${p.codigo}">${p.nome}</option>`).join('')}</select></label>
    <button class="btn btn-primary btn-full" type="submit">Confirmar pedido 🚀</button></form>
    <div class="panel summary"><h2>Resumo da missão</h2>
      ${state.cart.map((x) => `<div class="summary-line"><span>${x.qty}× ${escapeHtml(x.name)}</span><b>${money(x.qty * x.price)}</b></div>`).join('')}
      <div class="summary-line"><span>Entrega</span><b>${money(TAXA_ENTREGA_ESTIMADA)}</b></div>
      <div class="summary-line total"><span>Total</span><b>${money(cartTotal() + TAXA_ENTREGA_ESTIMADA)}</b></div>
      <p class="muted small">Preços e total são recalculados pelo servidor.</p>
    </div></div></section>`;
}

function statusBadge(codigo) {
  return `<span class="status status-${escapeHtml(String(codigo).toLowerCase())}">${escapeHtml(textoStatus(codigo))}</span>`;
}

function orders() {
  let conteudo;
  if (!state.user)
    conteudo = `<div class="panel empty"><h2>Entre na sua conta para acompanhar seus pedidos.</h2><button class="btn btn-primary" data-action="login">Entrar</button></div>`;
  else if (state.ordersStatus === 'loading' || state.ordersStatus === 'idle')
    conteudo = `<div class="panel">${estadoCarregando('Buscando seus pedidos...')}</div>`;
  else if (state.ordersStatus === 'error')
    conteudo = `<div class="panel">${estadoErro('Não foi possível carregar seus pedidos.', '<button class="btn btn-primary" data-action="retry-orders">Tentar novamente</button>')}</div>`;
  else if (!state.orders.length)
    conteudo =
      '<div class="panel empty"><h2>Você ainda não tem pedidos.</h2><p>Seu primeiro pedido intergaláctico está esperando!</p><button class="btn btn-primary" data-nav="menu">Explorar cardápio</button></div>';
  else
    conteudo = `<div class="orders-list">${state.orders
      .map(
        (
          o,
        ) => `<article class="panel order-card"><div><span class="eyebrow">PEDIDO #${escapeHtml(o.id)}</span><h2>${money(o.total)}</h2>
          <p class="muted">${escapeHtml(formatarData(o.criadoEm))} · ${o.itens.reduce((n, i) => n + i.quantidade, 0)} itens</p></div>
          <div>${statusBadge(o.status)}<button class="btn btn-outline" data-order="${escapeHtml(o.id)}">Acompanhar →</button></div></article>`,
      )
      .join('')}</div>`;
  return `<section class="section container page-space"><span class="eyebrow">// SUA JORNADA</span><h1 class="page-title">MEUS <em>PEDIDOS</em></h1>${conteudo}</section>`;
}

function tracking() {
  const o = state.selectedOrder;
  let corpo;
  if (!o) corpo = estadoCarregando('Localizando seu pedido na galáxia...');
  else {
    const cancelado = o.status === 'CANCELADO';
    const etapaAtual = ETAPAS.indexOf(o.status);
    corpo = `<h2>Pedido #${escapeHtml(o.id)}</h2>${statusBadge(o.status)}
      ${
        cancelado
          ? '<p class="cancel-note" role="status">Este pedido foi cancelado. Nenhuma cobrança foi realizada.</p>'
          : `<ol class="steps" aria-label="Etapas do pedido">${ETAPAS.map(
              (s, i) =>
                `<li class="step ${etapaAtual >= i ? 'done' : ''}" ${etapaAtual === i ? 'aria-current="step"' : ''}><div aria-hidden="true">${STATUS[s].icone}</div><span>${STATUS[s].texto}</span></li>`,
            ).join('')}</ol>`
      }
      <div class="tracking-details">
        <div><h3>Itens</h3>${o.itens.map((i) => `<div class="summary-line"><span>${i.quantidade}× ${escapeHtml(i.nome)}</span><b>${money(i.subtotal)}</b></div>`).join('')}
          <div class="summary-line"><span>Entrega</span><b>${money(o.taxaEntrega)}</b></div>
          <div class="summary-line total"><span>Total</span><b>${money(o.total)}</b></div></div>
        <div><h3>Entrega</h3><p class="muted">${textoEndereco(o.entrega)}</p><h3>Pagamento</h3><p class="muted">${escapeHtml(nomePagamento(o.formaPagamento))}</p>
          <p class="muted small">Pedido feito em ${escapeHtml(formatarData(o.criadoEm))} · atualizado em ${escapeHtml(formatarData(o.atualizadoEm))}</p></div>
      </div>`;
  }
  return `<section class="section container page-space"><span class="eyebrow">// RASTREAMENTO</span><h1 class="page-title">SUA PIZZA <em>A CAMINHO?</em></h1>
    <div class="panel tracking">${corpo}
      <p class="muted">O status é atualizado automaticamente conforme a pizzaria registra cada etapa. Não há rastreamento GPS nesta versão.</p>
      <button class="btn btn-outline" data-nav="orders">← Voltar aos pedidos</button></div></section>`;
}

function profile() {
  const u = state.user || {};
  let lista;
  if (state.addressesStatus === 'loading' || state.addressesStatus === 'idle')
    lista = estadoCarregando('Carregando endereços...');
  else if (!state.addresses.length) lista = '<p class="muted">Nenhum endereço cadastrado ainda.</p>';
  else
    lista = `<ul class="address-saved">${state.addresses
      .map(
        (e) =>
          `<li><span><b>${escapeHtml(e.apelido)}</b><small>${textoEndereco(e)}</small></span><button class="btn btn-small btn-danger" data-delete-address="${e.id}" aria-label="Excluir endereço ${escapeHtml(e.apelido)}">Excluir</button></li>`,
      )
      .join('')}</ul>`;

  return `<section class="section container page-space"><span class="eyebrow">// SUA CONTA</span><h1 class="page-title">MEU <em>PERFIL</em></h1>
  <div class="profile-grid">
    <form id="profile-form" class="panel form profile-form" novalidate><h2>Dados pessoais</h2>
      <label>Nome completo<input name="nome" data-mask="nome" autocomplete="name" value="${escapeHtml(u.nome || '')}" required maxlength="120"></label>
      <label>E-mail<input type="email" value="${escapeHtml(u.email || '')}" disabled></label>
      ${u.cpfMascarado ? `<label>CPF<input value="${escapeHtml(u.cpfMascarado)}" disabled></label>` : ''}
      <label>Telefone<input name="telefone" data-mask="telefone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(formatarTelefone(u.telefone))}" placeholder="(31) 99999-9999" required></label>
      <div class="button-row left"><button class="btn btn-primary" type="submit">Salvar alterações</button><button class="btn btn-outline" type="button" data-action="logout">Sair da conta</button></div>
    </form>
    <div class="panel"><h2>Meus endereços</h2>${lista}
      <details class="add-address"><summary class="btn btn-outline">+ Adicionar endereço</summary>
        <form id="address-form" class="form" novalidate>${camposEndereco()}<button class="btn btn-primary" type="submit">Salvar endereço</button></form>
      </details>
    </div>
  </div></section>`;
}

function about() {
  return `${hero('CONHEÇA A <em>PIZZET.</em>', 'Mais que uma pizzaria: uma viagem gastronômica pelo universo, unindo sabor e diversão.')}
  <section class="section container"><div class="benefits"><div><b>🚀</b><h3>Nossa missão</h3><p>Entregar pizzas deliciosas e uma experiência fora de órbita.</p></div><div><b>🪐</b><h3>Nossa visão</h3><p>Ser a pizzaria mais querida da galáxia.</p></div><div><b>👽</b><h3>Nossos valores</h3><p>Qualidade, criatividade, respeito e diversão.</p></div></div></section>`;
}

function success() {
  const o = state.lastOrder;
  return `<section class="section container page-space"><div class="panel success"><div class="success-icon" aria-hidden="true">✓</div>
    <h1>Pedido <em>confirmado!</em></h1>
    <p>Sua missão foi recebida${o ? `: pedido <b>#${escapeHtml(o.id)}</b>, total de <b>${money(o.total)}</b> (calculado pelo servidor)` : ''}. Acompanhe o status em Meus Pedidos.</p>
    <div class="button-row">${o ? `<button class="btn btn-primary" data-order="${escapeHtml(o.id)}">Acompanhar pedido</button>` : '<button class="btn btn-primary" data-nav="orders">Acompanhar pedido</button>'}<button class="btn btn-outline" data-nav="home">Voltar ao início</button></div>
  </div></section>`;
}

// ---------------------------------------------------------------------
// PAINEL ADMINISTRATIVO
// ---------------------------------------------------------------------
function admin() {
  const a = state.admin;
  const abas = [
    ['produtos', 'Produtos'],
    ['pedidos', 'Pedidos'],
  ];
  return `<section class="section container page-space"><span class="eyebrow">// CENTRAL DE COMANDO</span><h1 class="page-title">PAINEL <em>ADMIN</em></h1>
    <div class="admin-tabs" role="tablist" aria-label="Seções do painel">
      ${abas.map(([k, v]) => `<button role="tab" id="aba-${k}" aria-selected="${a.tab === k}" aria-controls="painel-${k}" class="${a.tab === k ? 'active' : ''}" data-admin-tab="${k}">${v}</button>`).join('')}
    </div>
    <div role="tabpanel" id="painel-${a.tab}" aria-labelledby="aba-${a.tab}">${a.tab === 'produtos' ? adminProdutos() : adminPedidos()}</div>
  </section>`;
}

function adminProdutoForm() {
  const p = state.admin.editing;
  if (!p) return '';
  const novo = p === 'novo';
  const v = novo
    ? {
        name: '',
        description: '',
        categoryCode: 'TRADICIONAL',
        price: '',
        imagemUrlOriginal: '',
        active: true,
      }
    : p;
  return `<form id="product-form" class="panel form admin-form" novalidate><h2>${novo ? 'Novo produto' : `Editar: ${escapeHtml(v.name)}`}</h2>
    <div class="form-grid">
      <label class="wide">Nome<input name="nome" value="${escapeHtml(v.name)}" required maxlength="100"></label>
      <label class="wide">Descrição<input name="descricao" value="${escapeHtml(v.description)}" maxlength="500"></label>
      <label>Categoria<select name="categoria">${CATEGORIAS.map((c) => `<option value="${c.codigo}" ${c.codigo === v.categoryCode ? 'selected' : ''}>${c.nome}</option>`).join('')}</select></label>
      <label>Preço (R$)<input name="preco" data-mask="preco" inputmode="decimal" value="${v.price === '' ? '' : String(Number(v.price).toFixed(2)).replace('.', ',')}" placeholder="49,90" required></label>
      <label class="wide">Imagem (opcional)<input name="imagemUrl" value="${escapeHtml(v.imagemUrlOriginal)}" maxlength="255" placeholder="assets/pizza-1.webp"></label>
      <label class="checkline wide"><input type="checkbox" name="ativo" ${v.active ? 'checked' : ''}> Produto ativo (aparece no cardápio)</label>
    </div>
    <div class="button-row left"><button class="btn btn-primary" type="submit">${novo ? 'Cadastrar produto' : 'Salvar alterações'}</button><button class="btn btn-outline" type="button" data-action="cancel-edit">Cancelar</button></div>
  </form>`;
}

function adminProdutos() {
  const a = state.admin;
  let lista;
  if (a.loading) lista = estadoCarregando('Carregando produtos...');
  else if (!a.products.length) lista = '<div class="empty">Nenhum produto cadastrado.</div>';
  else
    lista = `<div class="admin-list">${a.products
      .map(
        (
          p,
        ) => `<article class="admin-row ${p.active ? '' : 'inactive'}"><div class="cart-mini">${img(p)}</div>
        <div class="admin-info"><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.category)} · ${money(p.price)}</p>
          <span class="status ${p.active ? '' : 'status-cancelado'}">${p.active ? 'Ativo' : 'Inativo'}</span></div>
        <div class="admin-actions"><button class="btn btn-small btn-outline" data-edit-product="${p.id}">Editar</button>
          ${p.active ? `<button class="btn btn-small btn-danger" data-deactivate-product="${p.id}">Desativar</button>` : `<button class="btn btn-small btn-primary" data-activate-product="${p.id}">Reativar</button>`}</div>
      </article>`,
      )
      .join('')}</div>`;
  return `<div class="section-heading"><h2>Produtos (${a.products.length})</h2><button class="btn btn-primary" data-action="new-product">+ Novo produto</button></div>
    ${adminProdutoForm()}${lista}`;
}

function adminPedidos() {
  const a = state.admin;
  let lista;
  if (a.loading) lista = estadoCarregando('Carregando pedidos...');
  else if (!a.orders.length) lista = '<div class="panel empty">Nenhum pedido encontrado.</div>';
  else
    lista = `<div class="orders-list">${a.orders
      .map(
        (
          o,
        ) => `<article class="panel admin-order"><div class="admin-order-head"><div><span class="eyebrow">PEDIDO #${escapeHtml(o.id)}</span>
          <h3>${escapeHtml(o.clienteNome || '')} · ${money(o.total)}</h3><p class="muted">${escapeHtml(formatarData(o.criadoEm))} · ${escapeHtml(nomePagamento(o.formaPagamento))}</p></div>${statusBadge(o.status)}</div>
        <p class="muted small">${o.itens.map((i) => `${i.quantidade}× ${escapeHtml(i.nome)}`).join(', ')}</p>
        <p class="muted small">${textoEndereco(o.entrega)}</p>
        <div class="button-row left">${
          o.proximosStatus.length
            ? o.proximosStatus
                .map(
                  (s) =>
                    `<button class="btn btn-small ${s === 'CANCELADO' ? 'btn-danger' : 'btn-primary'}" data-set-status="${s}" data-order-id="${o.id}">${s === 'CANCELADO' ? 'Cancelar pedido' : `Mover para: ${escapeHtml(textoStatus(s))}`}</button>`,
                )
                .join('')
            : '<span class="muted small">Pedido finalizado.</span>'
        }</div>
      </article>`,
      )
      .join('')}</div>`;
  return `<div class="section-heading"><h2>Pedidos</h2>
      <div class="admin-filter"><label>Status <select id="admin-status-filter"><option value="">Todos</option>${Object.keys(
        STATUS,
      )
        .map((s) => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${STATUS[s].texto}</option>`)
        .join('')}</select></label>
      <button class="btn btn-small btn-outline" data-action="refresh-admin">Atualizar</button></div></div>${lista}`;
}

// ---------------------------------------------------------------------
// RODAPÉ, CARRINHO LATERAL E MODAL
// ---------------------------------------------------------------------
function footer() {
  return `<footer class="footer"><div class="container footer-inner"><div><div class="brand">PizzE<span>T</span> <span aria-hidden="true">⌁</span></div><p>A pizza mais rápida da galáxia.</p></div>
    <div><h3>Navegação</h3><button data-nav="home">Início</button><button data-nav="menu">Cardápio</button><button data-nav="orders">Pedidos</button></div>
    <div><h3>Informações</h3><p>Projeto acadêmico demonstrativo.</p><p>Pagamentos fictícios. Sem entregas reais.</p></div></div>
    <div class="container copyright">© 2026 PizzET — Projeto interdisciplinar.</div></footer>`;
}

function drawer() {
  return `<div class="overlay" data-action="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer-head"><h2 id="drawer-title">🛒 Seu carrinho (${cartCount()})</h2><button class="icon-btn" data-action="close" aria-label="Fechar carrinho">✕</button></div>
    <div class="drawer-body">${cartRows()}</div>
    <div class="drawer-foot"><div class="summary-line total"><span>Subtotal</span><b>${money(cartTotal())}</b></div><button class="btn btn-primary btn-full" data-nav="cart" ${!state.cart.length ? 'disabled' : ''}>Ver carrinho →</button></div>
  </aside>`;
}

function modal() {
  const register = state.modal === 'register';
  return `<div class="overlay" data-action="close"></div><div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div class="auth-art"><div class="brand">PizzE<span>T</span> <span aria-hidden="true">⌁</span></div><h2>FAÇA PARTE DO <em>UNIVERSO PIZZET</em></h2><div class="auth-alien" aria-hidden="true">👽🍕</div><p>Entre na tripulação mais saborosa da galáxia.</p></div>
    <form id="auth-form" class="auth-form" novalidate>
      <button type="button" class="modal-close" data-action="close" aria-label="Fechar">✕</button>
      <div class="auth-tabs"><button type="button" class="${!register ? 'active' : ''}" aria-pressed="${!register}" data-action="login">Entrar</button><button type="button" class="${register ? 'active' : ''}" aria-pressed="${register}" data-action="register">Criar conta</button></div>
      <h2 id="auth-title">${register ? 'Crie sua conta' : 'Bem-vindo de volta!'}</h2>
      ${state.modalMessage ? `<p class="auth-message" role="status">${escapeHtml(state.modalMessage)}</p>` : ''}
      ${register ? '<label>Nome completo<input name="nome" data-mask="nome" autocomplete="name" required maxlength="120"></label><label>CPF<input name="cpf" data-mask="cpf" inputmode="numeric" placeholder="000.000.000-00" required></label>' : ''}
      <label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="256"></label>
      ${register ? '<label>Telefone<input name="telefone" data-mask="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(31) 99999-9999" required></label>' : ''}
      <label>Senha<input name="senha" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="8" required aria-describedby="${register ? 'dica-senha' : ''}"></label>
      ${register ? '<p id="dica-senha" class="muted small left">Mínimo de 8 caracteres, com letras minúsculas e números.</p><label>Confirmar senha<input name="confirmarSenha" type="password" autocomplete="new-password" minlength="8" required></label><label class="checkline"><input type="checkbox" name="termos" required> Concordo com os termos de uso demonstrativos.</label>' : ''}
      <button type="submit" class="btn btn-primary btn-full">${register ? 'Criar minha conta' : 'Entrar na PizzET'}</button>
    </form></div>`;
}

// ---------------------------------------------------------------------
// RENDERIZAÇÃO
// ---------------------------------------------------------------------
function render() {
  document.documentElement.dataset.theme = state.theme;
  const pages = { home, menu, cart, checkout, orders, tracking, profile, about, success, admin };
  app.innerHTML =
    header() +
    `<main id="main" tabindex="-1">${(pages[state.page] || home)()}</main>` +
    footer() +
    (state.drawer ? drawer() : '') +
    (state.modal ? modal() : '');
  document.body.classList.toggle('locked', !!(state.drawer || state.modal));

  // Partes de fora do diálogo ficam "inertes" enquanto ele está aberto (teclado e leitor de tela)
  const dialogoAberto = !!(state.drawer || state.modal);
  app.querySelectorAll('.header, main, .footer').forEach((el) => (el.inert = dialogoAberto));
  formatarCamposComMascara(app);
  focarDialogo();
}

/** Ao abrir um diálogo, o foco vai para o primeiro campo dele. */
function focarDialogo() {
  const dialogo = app.querySelector('.auth-modal, .drawer');
  if (dialogo && !dialogo.contains(document.activeElement)) {
    // Prioridade: primeiro campo de texto; se não houver (gaveta do carrinho), o primeiro botão
    const alvo = dialogo.querySelector('input:not([type=checkbox])') || dialogo.querySelector('button');
    alvo?.focus();
  }
}

function abrirModal(tipo, mensagem = '') {
  if (!state.modal && !state.drawer) elementoQueAbriuModal = document.activeElement;
  state.modal = tipo;
  state.modalMessage = mensagem;
  state.drawer = false;
  state.mobileMenu = false;
  render();
}

function fecharDialogos() {
  state.drawer = false;
  state.modal = null;
  state.modalMessage = '';
  render();
  // Devolve o foco para o botão que abriu o diálogo (ou para o botão de conta)
  const seletor = elementoQueAbriuModal?.dataset?.action
    ? `[data-action="${elementoQueAbriuModal.dataset.action}"]`
    : '[data-action="account"]';
  app.querySelector(seletor)?.focus();
  elementoQueAbriuModal = null;
}

// ---------------------------------------------------------------------
// ERROS DE FORMULÁRIO (mostrados junto ao campo, com aria-invalid)
// ---------------------------------------------------------------------
function limparErros(form) {
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
  form.querySelectorAll('[aria-invalid]').forEach((el) => {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-errormessage');
  });
}

function mostrarErroCampo(form, nome, mensagem) {
  const input = form.querySelector(`[name="${nome}"]`);
  if (!input) return false;
  const id = `erro-${form.id}-${nome}`;
  const span = document.createElement('span');
  span.className = 'field-error';
  span.id = id;
  span.textContent = mensagem;
  (input.closest('label') || input).insertAdjacentElement('afterend', span);
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-errormessage', id);
  return true;
}

/** Mostra erros por campo; foca o primeiro campo inválido. */
function mostrarErros(form, erros, mensagemGeral) {
  limparErros(form);
  let algum = false;
  for (const [campo, msg] of Object.entries(erros)) {
    if (mostrarErroCampo(form, campo, msg)) algum = true;
  }
  if (algum) form.querySelector('[aria-invalid="true"]')?.focus();
  toast(mensagemGeral);
}

/** Validação no navegador (a API valida de novo). Devolve {campo: mensagem}. */
function validarCampos(form, regras) {
  const erros = {};
  for (const [campo, validar] of Object.entries(regras)) {
    const input = form.querySelector(`[name="${campo}"]`);
    if (!input) continue;
    const valor = input.type === 'checkbox' ? input.checked : input.value.trim();
    const msg = validar(valor);
    if (msg) erros[campo] = msg;
  }
  return erros;
}

const obrigatorio = (texto) => (v) => (!v ? texto : '');
const regrasEndereco = {
  cep: (v) => (limparDigitos(v).length !== 8 ? 'CEP deve ter 8 dígitos.' : ''),
  numero: (v) => (!/^\d{1,6}$/.test(v) ? 'Informe apenas números.' : ''),
  logradouro: (v) => (v.length < 2 ? 'Informe a rua.' : ''),
  bairro: (v) => (v.length < 2 ? 'Informe o bairro.' : ''),
  cidade: (v) => (v.length < 2 ? 'Informe a cidade.' : ''),
  uf: (v) => (!/^[A-Z]{2}$/.test(v) ? 'UF com 2 letras.' : ''),
};

function cpfValido(cpf) {
  const d = limparDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

const dadosEndereco = (fd) => ({
  cep: limparDigitos(fd.cep || ''),
  numero: limparDigitos(fd.numero || ''),
  logradouro: fd.logradouro,
  bairro: fd.bairro,
  cidade: fd.cidade,
  uf: (fd.uf || '').toUpperCase(),
  complemento: fd.complemento || null,
  apelido: fd.apelido || null,
});

// ---------------------------------------------------------------------
// CARREGAMENTO DE DADOS DA API
// ---------------------------------------------------------------------
async function loadProducts() {
  state.productsStatus = 'loading';
  try {
    state.products = await api.products();
    state.productsStatus = 'ok';
    sincronizarCarrinho();
  } catch (e) {
    state.productsStatus = 'error';
    toast(e.message);
  }
}

/** Atualiza nome/preço/imagem do carrinho com o catálogo atual e remove itens indisponíveis. */
function sincronizarCarrinho() {
  const antes = state.cart.length;
  state.cart = state.cart
    .map((item) => {
      const p = productById(item.id);
      return p
        ? { ...item, name: p.name, price: p.price, imageUrl: p.imageUrl, emoji: p.emoji, accent: p.accent }
        : null;
    })
    .filter(Boolean);
  if (state.cart.length < antes)
    toast('Alguns itens do carrinho não estão mais disponíveis e foram removidos.');
  saveCart();
}

/** Busca no cardápio pela API (texto + categoria). */
async function buscarNoMenu() {
  const categoria = CATEGORIAS.find((c) => c.nome === state.filter)?.codigo;
  if (!state.search.trim() && !categoria) {
    state.menuResults = null;
    atualizarResultadosMenu();
    return;
  }
  state.menuLoading = true;
  atualizarResultadosMenu();
  const pedidoBusca = (buscarNoMenu.contador = (buscarNoMenu.contador || 0) + 1);
  try {
    const resultado = await api.products({ busca: state.search.trim(), categoria });
    if (pedidoBusca !== buscarNoMenu.contador) return; // chegou uma busca mais nova
    state.menuResults = resultado;
  } catch (e) {
    toast(e.message);
  } finally {
    if (pedidoBusca === buscarNoMenu.contador) {
      state.menuLoading = false;
      atualizarResultadosMenu();
    }
  }
}

/** Atualiza só a grade do cardápio (não redesenha a página, para não perder o foco da busca). */
function atualizarResultadosMenu() {
  const area = app.querySelector('#menu-results');
  if (area) area.innerHTML = menuGridHtml();
  const contador = app.querySelector('#menu-count');
  if (contador)
    contador.textContent = state.menuLoading ? 'Buscando...' : `${produtosDoMenu().length} produtos`;
}

async function loadOrders() {
  if (!state.user) return;
  state.ordersStatus = 'loading';
  render();
  try {
    state.orders = await api.orders();
    state.ordersStatus = 'ok';
  } catch (e) {
    state.ordersStatus = 'error';
    tratarErroSessao(e);
  }
  if (state.page === 'orders') render();
}

async function loadAddresses() {
  if (!state.user) return;
  state.addressesStatus = 'loading';
  try {
    state.addresses = await api.addresses();
    state.addressesStatus = 'ok';
  } catch (e) {
    state.addressesStatus = 'error';
    tratarErroSessao(e);
  }
  if (state.page === 'checkout' || state.page === 'profile') render();
}

/** Carrega um pedido e, se não estiver finalizado, agenda nova consulta a cada 15 s. */
async function loadOrder(id, primeiraVez = false) {
  if (primeiraVez) state.selectedOrder = null;
  try {
    const pedido = await api.order(id);
    const mudou = state.selectedOrder && state.selectedOrder.status !== pedido.status;
    state.selectedOrder = pedido;
    if (state.page !== 'tracking' || state.param !== String(id)) return;
    render();
    if (mudou) toast(`Status atualizado: ${textoStatus(pedido.status)}`);
    if (!['ENTREGUE', 'CANCELADO'].includes(pedido.status)) {
      pararAcompanhamento();
      timerAcompanhamento = setTimeout(() => loadOrder(id), 15000);
    }
  } catch (e) {
    tratarErroSessao(e);
    if (e.status === 404) nav('orders');
  }
}

function pararAcompanhamento() {
  clearTimeout(timerAcompanhamento);
  timerAcompanhamento = null;
}

async function loadAdmin() {
  if (!isAdmin()) return;
  const a = state.admin;
  a.loading = true;
  render();
  try {
    if (a.tab === 'produtos') a.products = await api.adminProducts();
    else a.orders = await api.adminOrders(a.status);
  } catch (e) {
    tratarErroSessao(e);
  }
  a.loading = false;
  if (state.page === 'admin') render();
}

/** Sessão expirada (401): limpa o usuário e pede login de novo. */
function tratarErroSessao(e) {
  toast(e.message);
  if (e.status === 401 && state.user) {
    state.user = null;
    abrirModal('login', 'Sua sessão expirou. Entre novamente.');
  }
}

// ---------------------------------------------------------------------
// EVENTOS: CLIQUES
// ---------------------------------------------------------------------
app.addEventListener('click', async (e) => {
  const btn = e.target.closest(
    '[data-nav],[data-action],[data-add],[data-filter],[data-qty],[data-remove],[data-order],[data-admin-tab],[data-edit-product],[data-deactivate-product],[data-activate-product],[data-set-status],[data-delete-address]',
  );
  if (!btn) return;
  e.preventDefault();
  const d = btn.dataset;

  if (d.nav) return nav(d.nav);

  if (d.filter) {
    state.filter = d.filter;
    app.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.filter === d.filter);
      b.setAttribute('aria-pressed', b.dataset.filter === d.filter);
    });
    return buscarNoMenu();
  }

  if (d.add) {
    const p = productById(d.add) || produtosDoMenu().find((x) => String(x.id) === d.add);
    if (!p) return;
    const existente = state.cart.find((x) => String(x.id) === String(p.id));
    if (existente) {
      if (existente.qty >= 20) return toast('Quantidade máxima por item: 20.');
      existente.qty++;
    } else
      state.cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        emoji: p.emoji,
        accent: p.accent,
        imageUrl: p.imageUrl,
        qty: 1,
      });
    saveCart();
    // Atualiza só o contador do carrinho, mantendo o foco no botão clicado
    const contador = app.querySelector('.cart-trigger b');
    if (contador) contador.textContent = cartCount();
    app.querySelector('.cart-trigger')?.setAttribute('aria-label', `Abrir carrinho, ${cartCount()} itens`);
    return toast(`${p.name} abduzida para o carrinho!`);
  }

  if (d.qty) {
    const item = state.cart.find((x) => String(x.id) === d.qty);
    if (item) {
      item.qty = Math.min(20, item.qty + Number(d.delta));
      if (item.qty <= 0) state.cart = state.cart.filter((x) => x !== item);
      saveCart();
      render();
    }
    return;
  }

  if (d.remove) {
    state.cart = state.cart.filter((x) => String(x.id) !== d.remove);
    saveCart();
    return render();
  }

  if (d.order) return nav('tracking', d.order);

  if (d.deleteAddress) {
    if (!confirm('Excluir este endereço? Pedidos antigos não são afetados.')) return;
    try {
      await api.deleteAddress(d.deleteAddress);
      toast('Endereço excluído.');
      loadAddresses();
    } catch (err) {
      tratarErroSessao(err);
    }
    return;
  }

  // ----- Admin -----
  if (d.adminTab) {
    state.admin.tab = d.adminTab;
    state.admin.editing = null;
    return loadAdmin();
  }
  if (d.editProduct) {
    state.admin.editing = state.admin.products.find((p) => String(p.id) === d.editProduct);
    render();
    return app.querySelector('#product-form input')?.focus();
  }
  if (d.deactivateProduct || d.activateProduct) {
    const id = d.deactivateProduct || d.activateProduct;
    const p = state.admin.products.find((x) => String(x.id) === id);
    try {
      if (d.deactivateProduct) {
        if (!confirm(`Desativar "${p.name}"? Ele sai do cardápio, mas continua no histórico.`)) return;
        await api.deleteProduct(id);
      } else {
        await api.updateProduct(id, paraProdutoRequest(p, { ativo: true }));
      }
      toast(d.deactivateProduct ? 'Produto desativado.' : 'Produto reativado.');
      await loadAdmin();
      loadProducts();
    } catch (err) {
      tratarErroSessao(err);
    }
    return;
  }
  if (d.setStatus) {
    btn.disabled = true;
    try {
      await api.updateOrderStatus(d.orderId, d.setStatus);
      toast(`Pedido #${d.orderId}: ${textoStatus(d.setStatus)}`);
      loadAdmin();
    } catch (err) {
      btn.disabled = false;
      tratarErroSessao(err);
    }
    return;
  }

  switch (d.action) {
    case 'theme':
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('pizzet_theme', state.theme);
      } catch {
        /* sem armazenamento */
      }
      render();
      app.querySelector('[data-action="theme"]')?.focus();
      break;
    case 'drawer':
      elementoQueAbriuModal = btn;
      state.drawer = true;
      render();
      break;
    case 'close':
      fecharDialogos();
      break;
    case 'mobile':
      state.mobileMenu = !state.mobileMenu;
      render();
      app.querySelector('[data-action="mobile"]')?.focus();
      break;
    case 'account':
      if (state.user) nav('profile');
      else abrirModal('login');
      break;
    case 'login':
      abrirModal('login', state.modalMessage);
      break;
    case 'register':
      abrirModal('register', state.modalMessage);
      break;
    case 'logout':
      try {
        await api.logout();
      } catch {
        /* mesmo com erro, limpa a sessão local */
      }
      state.user = null;
      state.orders = [];
      state.addresses = [];
      toast('Você saiu da sua conta. Até a próxima missão!');
      nav('home');
      break;
    case 'retry-products':
      await loadProducts();
      render();
      break;
    case 'retry-orders':
      loadOrders();
      break;
    case 'new-product':
      state.admin.editing = 'novo';
      render();
      app.querySelector('#product-form input')?.focus();
      break;
    case 'cancel-edit':
      state.admin.editing = null;
      render();
      break;
    case 'refresh-admin':
      loadAdmin();
      break;
  }
});

// ---------------------------------------------------------------------
// EVENTOS: DIGITAÇÃO E MUDANÇAS
// ---------------------------------------------------------------------
app.addEventListener('input', (e) => {
  if (e.target.id === 'search') {
    state.search = e.target.value;
    clearTimeout(timerBusca);
    timerBusca = setTimeout(buscarNoMenu, 300); // espera parar de digitar
  }
});

app.addEventListener('change', (e) => {
  if (e.target.name === 'enderecoId') {
    const novo = app.querySelector('#novo-endereco');
    if (novo) novo.hidden = e.target.value !== 'novo';
  }
  if (e.target.id === 'admin-status-filter') {
    state.admin.status = e.target.value;
    loadAdmin();
  }
});

// Teclado: Esc fecha diálogos; Tab fica preso dentro do diálogo aberto
document.addEventListener('keydown', (e) => {
  if (!state.modal && !state.drawer) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    fecharDialogos();
    return;
  }
  if (e.key === 'Tab') {
    const dialogo = app.querySelector('.auth-modal, .drawer');
    const focaveis = [
      ...dialogo.querySelectorAll('button:not([disabled]), input:not([disabled]), select, a[href]'),
    ];
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }
});

// ---------------------------------------------------------------------
// EVENTOS: ENVIO DE FORMULÁRIOS
// ---------------------------------------------------------------------
function paraProdutoRequest(p, extra = {}) {
  return {
    nome: p.name,
    descricao: p.description,
    categoria: p.categoryCode,
    preco: p.price,
    imagemUrl: p.imagemUrlOriginal || null,
    ativo: p.active,
    ...extra,
  };
}

app.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = Object.fromEntries(new FormData(form).entries());
  const submit = form.querySelector('[type="submit"]');
  const textoOriginal = submit?.textContent;
  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Aguarde...';
  }

  try {
    limparErros(form);
    if (form.id === 'auth-form') await enviarAutenticacao(form, fd);
    else if (form.id === 'profile-form') await enviarPerfil(form, fd);
    else if (form.id === 'address-form') await enviarEndereco(form, fd);
    else if (form.id === 'checkout-form') await enviarPedido(form, fd);
    else if (form.id === 'product-form') await enviarProduto(form, fd);
  } catch (err) {
    if (err.campos) {
      // Erros da API aparecem junto aos campos correspondentes
      mostrarErros(form, err.campos, err.message);
    } else toast(err.message);
    if (err.status === 401 && form.id !== 'auth-form') tratarErroSessao(err);
  } finally {
    if (submit && document.contains(submit)) {
      submit.disabled = false;
      submit.textContent = textoOriginal;
    }
  }
});

/** Erro de validação local (lançado para cair no mesmo tratamento dos erros da API). */
function erroLocal(erros) {
  const err = new Error(Object.values(erros)[0]);
  err.campos = erros;
  return err;
}

async function enviarAutenticacao(form, fd) {
  const cadastro = state.modal === 'register';
  const regras = {
    email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? 'Informe um e-mail válido.' : ''),
    senha: obrigatorio('Informe sua senha.'),
  };
  if (cadastro) {
    Object.assign(regras, {
      nome: (v) => (v.length < 2 ? 'Informe seu nome completo.' : ''),
      cpf: (v) => (!cpfValido(v) ? 'CPF inválido.' : ''),
      telefone: (v) =>
        ![10, 11].includes(limparDigitos(v).length) ? 'Telefone com DDD (10 ou 11 dígitos).' : '',
      senha: (v) =>
        v.length < 8 || !/\d/.test(v) || !/[a-z]/.test(v)
          ? 'Mínimo 8 caracteres, com letras minúsculas e números.'
          : '',
      confirmarSenha: (v) => (v !== fd.senha ? 'As senhas não coincidem.' : ''),
      termos: (v) => (!v ? 'É preciso aceitar os termos.' : ''),
    });
  }
  const erros = validarCampos(form, regras);
  if (Object.keys(erros).length) throw erroLocal(erros);

  if (cadastro) {
    state.user = await api.register({
      nome: fd.nome.trim(),
      cpf: limparDigitos(fd.cpf),
      telefone: limparDigitos(fd.telefone),
      email: fd.email.trim(),
      senha: fd.senha,
    });
    toast(`Bem-vindo à tripulação, ${primeiroNome()}!`);
  } else {
    state.user = await api.login(fd.email.trim(), fd.senha);
    toast('Bem-vindo à PizzET!');
  }

  const destino = state.afterLogin;
  state.afterLogin = null;
  state.modal = null;
  state.modalMessage = '';
  if (destino) nav(destino, state.param);
  else {
    render();
    carregarDadosDaPagina();
  }
}

async function enviarPerfil(form, fd) {
  const erros = validarCampos(form, {
    nome: (v) => (v.length < 2 ? 'Informe seu nome completo.' : ''),
    telefone: (v) =>
      ![10, 11].includes(limparDigitos(v).length) ? 'Telefone com DDD (10 ou 11 dígitos).' : '',
  });
  if (Object.keys(erros).length) throw erroLocal(erros);
  state.user = await api.updateProfile({ nome: fd.nome.trim(), telefone: limparDigitos(fd.telefone) });
  toast('Perfil atualizado!');
  render();
}

async function enviarEndereco(form, fd) {
  const erros = validarCampos(form, regrasEndereco);
  if (Object.keys(erros).length) throw erroLocal(erros);
  await api.createAddress(dadosEndereco(fd));
  toast('Endereço salvo!');
  await loadAddresses();
}

async function enviarPedido(form, fd) {
  if (!state.user) {
    state.afterLogin = 'checkout';
    return abrirModal('login', 'Entre na sua conta para finalizar o pedido.');
  }
  let enderecoId = fd.enderecoId;
  if (!enderecoId || enderecoId === 'novo') {
    const erros = validarCampos(form, regrasEndereco);
    if (Object.keys(erros).length) throw erroLocal(erros);
    const novo = await api.createAddress(dadosEndereco(fd));
    enderecoId = novo.id;
    state.addresses.unshift(novo);
  }

  // Envia SOMENTE ids e quantidades. Preços e total são calculados pelo servidor.
  const pedido = await api.createOrder({
    enderecoId: Number(enderecoId),
    formaPagamento: fd.formaPagamento,
    itens: state.cart.map((x) => ({ produtoId: x.id, quantidade: x.qty })),
  });
  state.lastOrder = pedido;
  state.cart = [];
  saveCart();
  nav('success');
  toast('Pedido confirmado!');
}

async function enviarProduto(form, fd) {
  const preco = Number(
    String(fd.preco || '')
      .replace(/\./g, '')
      .replace(',', '.'),
  );
  const erros = validarCampos(form, {
    nome: (v) => (v.length < 2 ? 'Informe o nome (mínimo 2 caracteres).' : ''),
    preco: () => (!(preco > 0 && preco <= 9999.99) ? 'Preço entre 0,01 e 9.999,99.' : ''),
    imagemUrl: (v) =>
      v && !/^(assets\/[\w\-.]+|https:\/\/\S+)$/.test(v) ? 'Use assets/arquivo.webp ou https://...' : '',
  });
  if (Object.keys(erros).length) throw erroLocal(erros);

  const dados = {
    nome: fd.nome.trim(),
    descricao: fd.descricao.trim(),
    categoria: fd.categoria,
    preco,
    imagemUrl: fd.imagemUrl.trim() || null,
    ativo: form.querySelector('[name="ativo"]').checked,
  };
  const editando = state.admin.editing;
  if (editando === 'novo') await api.createProduct(dados);
  else await api.updateProduct(editando.id, dados);
  toast(editando === 'novo' ? 'Produto cadastrado!' : 'Produto atualizado!');
  state.admin.editing = null;
  await loadAdmin();
  loadProducts();
}

// ---------------------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------------------
window.addEventListener('hashchange', () => {
  const { page, param } = lerHash();
  if (page !== state.page || param !== state.param) nav(page, param);
});

async function init() {
  ativarMascaras(app);
  const { page, param } = lerHash();
  state.page = page;
  state.param = param;
  render(); // mostra a tela já com "carregando"

  // Quem está logado? (a API responde 204 = ninguém)
  try {
    state.user = await api.me();
  } catch {
    state.user = null;
  }
  await loadProducts();

  // Páginas que exigem login/admin
  if (['checkout', 'profile', 'tracking'].includes(state.page) && !state.user) {
    state.afterLogin = state.page;
    state.page = 'home';
    history.replaceState(null, '', '#home');
    render();
    return abrirModal('login', 'Entre na sua conta para continuar.');
  }
  if (state.page === 'admin' && !isAdmin()) state.page = 'home';
  render();
  carregarDadosDaPagina();
}

init();
