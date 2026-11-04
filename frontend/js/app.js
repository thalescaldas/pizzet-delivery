import { api, isDemo } from './api.js';
import { money } from './data.js';
const app = document.querySelector('#app');
const state = {
  page: 'home',
  products: [],
  cart: JSON.parse(localStorage.getItem('pizzet_cart') || '[]'),
  theme: localStorage.getItem('pizzet_theme') || 'dark',
  user: null,
  orders: [],
  filter: 'Todas',
  search: '',
  drawer: false,
  modal: null,
  mobileMenu: false,
  selectedOrder: null,
};
const icons = { cart: '🛒', rocket: '🚀', star: '✦', alien: '👽', moon: '☾' };
const escapeHtml = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const saveCart = () => localStorage.setItem('pizzet_cart', JSON.stringify(state.cart));
const cartCount = () => state.cart.reduce((n, x) => n + x.qty, 0);
const cartTotal = () => state.cart.reduce((n, x) => n + x.price * x.qty, 0);
const productById = (id) => state.products.find((p) => String(p.id) === String(id));
const img = (p) =>
  p.imageUrl
    ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy">`
    : `<div class="pizza-art" style="--pizza-accent:${escapeHtml(p.accent || '#e77b35')}"><span>${escapeHtml(p.emoji || '🍕')}</span></div>`;
function toast(msg) {
  const el = document.querySelector('#toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 3500);
}
function nav(page) {
  state.page = page;
  state.drawer = false;
  state.modal = null;
  state.mobileMenu = false;
  state.search = '';
  state.filter = 'Todas';
  history.replaceState(null, '', `#${page}`);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'orders') loadOrders();
}
function header() {
  return `<header class="header"><div class="container header-inner"><a href="#home" class="brand" data-nav="home" aria-label="PizzET início">PizzE<span>T</span><span class="brand-ufo">⌁</span></a><nav class="nav ${state.mobileMenu ? 'open' : ''}" aria-label="Menu principal">${[
    ['home', 'Início'],
    ['menu', 'Cardápio'],
    ['orders', 'Pedidos'],
    ['about', 'Sobre'],
  ]
    .map(([k, v]) => `<a href="#${k}" data-nav="${k}" class="${state.page === k ? 'active' : ''}">${v}</a>`)
    .join(
      '',
    )}</nav><div class="header-actions"><button class="icon-btn" data-action="theme" aria-label="Alternar modo claro e escuro">${state.theme === 'dark' ? '☀' : '☾'}</button><button class="account-btn" data-action="account">${state.user ? `👤 ${escapeHtml(state.user.name?.split(' ')[0] || 'Minha conta')}` : '👤 Entrar'}</button><button class="cart-trigger" data-action="drawer" aria-label="Abrir carrinho">🛒<b>${cartCount()}</b></button><button class="icon-btn mobile-toggle" data-action="mobile" aria-label="Abrir menu">☰</button></div></div></header>`;
}
function hero(title, subtitle, cta = false) {
  return `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><span class="eyebrow">// DELIVERY INTERGALÁCTICO</span><h1>${title}</h1><p>${subtitle}</p>${cta ? '<button class="btn btn-primary" data-nav="menu">🚀 ABDUZIR MINHA FOME <span>↗</span></button>' : ''}</div><div class="hero-visual" role="img" aria-label="Mascote alienígena e OVNI no universo PizzET"><div class="hero-art hero-art-dark"></div><div class="hero-art hero-art-light"></div></div></div></section>`;
}
function productCard(p) {
  return `<article class="product-card"><div class="product-image">${img(p)}</div><span class="category-tag">${escapeHtml(p.category || 'Pizza')}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || '')}</p><div class="product-bottom"><strong>${money(p.price)}</strong><button class="btn btn-small btn-primary" data-add="${escapeHtml(p.id)}" aria-label="Adicionar ${escapeHtml(p.name)} ao carrinho">+ Abduzir</button></div></article>`;
}
function home() {
  return `${hero('SABOR DE OUTRO <em>PLANETA.</em>', 'Pizzas irresistíveis, ingredientes de outra galáxia e entrega na velocidade de um OVNI.', true)}<section class="section container"><div class="section-heading"><div><span class="eyebrow">// ESCOLHAS DA TRIPULAÇÃO</span><h2>As favoritas da <em>galáxia</em></h2></div><button class="text-link" data-nav="menu">Ver cardápio completo →</button></div><div class="product-grid featured">${state.products.slice(0, 4).map(productCard).join('')}</div></section><section class="section container"><div class="promo"><div><span class="eyebrow">// SUA PRÓXIMA MISSÃO</span><h2>SUA FOME SERÁ <em>ABDUZIDA!</em></h2><p>Monte sua missão gastronômica e receba pizzas quentinhas na sua órbita.</p><button class="btn btn-primary" data-nav="menu">Explorar sabores ↗</button></div><div class="promo-art"><img src="./assets/mascot-banner.webp" alt="Mascote PizzET" loading="lazy"></div></div></section><section class="section container"><div class="section-heading"><h2>Como funciona?</h2></div><div class="benefits"><div><b>01 🚀</b><h3>Escolha sua pizza</h3><p>Explore nosso cardápio intergaláctico.</p></div><div><b>02 🛒</b><h3>Finalize a missão</h3><p>Informe seu endereço e confirme o pedido.</p></div><div><b>03 👽</b><h3>Receba em casa</h3><p>Acompanhe o status até a entrega.</p></div></div></section>`;
}
function menu() {
  let products = state.products.filter(
    (p) =>
      (state.filter === 'Todas' || p.category === state.filter) &&
      `${p.name} ${p.description}`.toLowerCase().includes(state.search.toLowerCase()),
  );
  let categories = ['Todas', ...new Set(state.products.map((p) => p.category))];
  return `${hero('CARDÁPIO <em>INTERGALÁCTICO.</em>', 'Escolha sua pizza e embarque numa viagem de sabor.')}<section class="section container"><div class="section-heading"><h2>Explore os sabores</h2><span>${products.length} produtos</span></div><div class="catalog-layout"><aside class="filters"><h3>Filtrar por categoria</h3>${categories.map((c) => `<button data-filter="${escapeHtml(c)}" class="filter-btn ${state.filter === c ? 'active' : ''}">${escapeHtml(c)}</button>`).join('')}</aside><div><label class="search-wrap"><span>⌕</span><input id="search" type="search" placeholder="Buscar pizzas, ingredientes..." value="${escapeHtml(state.search)}" autocomplete="off" aria-label="Buscar produtos"></label><div class="product-grid">${products.length ? products.map(productCard).join('') : '<div class="empty">Nenhum produto encontrado.</div>'}</div></div></div></section>`;
}
function cartRows() {
  return state.cart.length
    ? state.cart
        .map(
          (x) =>
            `<div class="cart-row"><div class="cart-mini">${img(x)}</div><div class="cart-info"><h3>${escapeHtml(x.name)}</h3><p>${money(x.price)} cada</p><div class="quantity"><button data-qty="${escapeHtml(x.id)}" data-delta="-1" aria-label="Diminuir quantidade">−</button><span>${x.qty}</span><button data-qty="${escapeHtml(x.id)}" data-delta="1" aria-label="Aumentar quantidade">+</button></div></div><div class="cart-end"><b>${money(x.price * x.qty)}</b><button class="remove" data-remove="${escapeHtml(x.id)}" aria-label="Remover produto">✕</button></div></div>`,
        )
        .join('')
    : '<div class="empty"><div class="empty-emoji">🛸</div><h3>Seu carrinho está vazio</h3><p>Que tal abduzir uma pizza?</p><button class="btn btn-primary" data-nav="menu">Ver cardápio</button></div>';
}
function cart() {
  return `<section class="section container page-space"><span class="eyebrow">// SUA MISSÃO</span><h1 class="page-title">MEU <em>CARRINHO</em></h1><div class="checkout-grid"><div class="panel"><h2>Seus itens (${cartCount()})</h2>${cartRows()}</div><div class="panel summary"><h2>Resumo do pedido</h2><div class="summary-line"><span>Subtotal</span><b>${money(cartTotal())}</b></div><div class="summary-line"><span>Entrega</span><b>${money(state.cart.length ? 7.9 : 0)}</b></div><div class="summary-line total"><span>Total</span><b>${money(cartTotal() + (state.cart.length ? 7.9 : 0))}</b></div><button class="btn btn-primary btn-full" data-nav="checkout" ${!state.cart.length ? 'disabled' : ''}>Decolar pedido 🚀</button></div></div></section>`;
}
function checkout() {
  if (!state.cart.length) return cart();
  return `<section class="section container page-space"><span class="eyebrow">// FINALIZAR MISSÃO</span><h1 class="page-title">FINALIZE SEU <em>PEDIDO</em></h1><div class="checkout-grid"><form class="panel form" id="checkout-form"><h2>Endereço de entrega</h2><div class="form-grid"><label>CEP<input name="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" required></label><label>Número<input name="numero" inputmode="numeric" pattern="[0-9]+" required></label><label class="wide">Rua<input name="rua" required maxlength="120"></label><label>Bairro<input name="bairro" required maxlength="80"></label><label>Cidade<input name="cidade" required maxlength="80"></label><label>Estado (UF)<input name="estado" required minlength="2" maxlength="2" placeholder="MG"></label><label>Complemento<input name="complemento" maxlength="100"></label></div><h2>Pagamento simulado</h2><p class="muted">Não será realizada nenhuma cobrança.</p><label>Forma de pagamento<select name="paymentMethod"><option value="simulado">Pagamento simulado (demonstração)</option><option value="na_entrega">Pagamento na entrega (simulação)</option></select></label><button class="btn btn-primary btn-full" type="submit">Confirmar pedido 🚀</button></form><div class="panel summary"><h2>Resumo da missão</h2>${state.cart.map((x) => `<div class="summary-line"><span>${x.qty}× ${escapeHtml(x.name)}</span><b>${money(x.qty * x.price)}</b></div>`).join('')}<div class="summary-line"><span>Entrega</span><b>R$ 7,90</b></div><div class="summary-line total"><span>Total</span><b>${money(cartTotal() + 7.9)}</b></div></div></div></section>`;
}
function orders() {
  return `<section class="section container page-space"><span class="eyebrow">// SUA JORNADA</span><h1 class="page-title">MEUS <em>PEDIDOS</em></h1>${!state.user ? `<div class="panel empty"><h2>Entre na sua conta para acompanhar seus pedidos.</h2><button class="btn btn-primary" data-action="login">Entrar</button></div>` : state.orders.length ? `<div class="orders-list">${state.orders.map((o) => `<article class="panel order-card"><div><span class="eyebrow">PEDIDO #${escapeHtml(o.id)}</span><h2>${money(o.total)}</h2><p>${escapeHtml(o.createdAt || '')}</p></div><div><span class="status">${escapeHtml(o.status || 'Confirmado')}</span><button class="btn btn-outline" data-order="${escapeHtml(o.id)}">Acompanhar →</button></div></article>`).join('')}</div>` : '<div class="panel empty"><h2>Você ainda não tem pedidos.</h2><p>Seu primeiro pedido intergaláctico está esperando!</p><button class="btn btn-primary" data-nav="menu">Explorar cardápio</button></div>'}</section>`;
}
function tracking() {
  const o = state.selectedOrder;
  return `<section class="section container page-space"><span class="eyebrow">// RASTREAMENTO</span><h1 class="page-title">SUA PIZZA <em>A CAMINHO?</em></h1><div class="panel tracking"><h2>Pedido #${escapeHtml(o?.id || '—')}</h2><span class="status">${escapeHtml(o?.status || 'Confirmado')}</span><div class="steps">${['Confirmado', 'Em preparo', 'A caminho', 'Entregue'].map((s, i) => `<div class="step ${Math.max(0, ['Confirmado', 'Em preparo', 'A caminho', 'Entregue'].indexOf(o?.status || 'Confirmado')) >= i ? 'done' : ''}"><div>${['✓', '👨‍🍳', '🛸', '🏠'][i]}</div><span>${s}</span></div>`).join('')}</div><p class="muted">O status é atualizado conforme o servidor registra cada etapa. Não há rastreamento GPS nesta versão.</p><button class="btn btn-outline" data-nav="orders">← Voltar aos pedidos</button></div></section>`;
}
function profile() {
  return `<section class="section container page-space"><span class="eyebrow">// SUA CONTA</span><h1 class="page-title">MEU <em>PERFIL</em></h1><form id="profile-form" class="panel form profile-form"><h2>Dados pessoais</h2><label>Nome completo<input name="name" value="${escapeHtml(state.user?.name || '')}" required></label><label>E-mail<input type="email" value="${escapeHtml(state.user?.email || '')}" disabled></label><label>Telefone<input name="phone" type="tel" inputmode="tel" value="${escapeHtml(state.user?.phone || '')}" placeholder="(31) 99999-9999"></label><button class="btn btn-primary" type="submit">Salvar alterações</button></form></section>`;
}
function about() {
  return `${hero('CONHEÇA A <em>PIZZET.</em>', 'Mais que uma pizzaria: uma viagem gastronômica pelo universo, unindo sabor e diversão.')}<section class="section container"><div class="benefits"><div><b>🚀</b><h3>Nossa missão</h3><p>Entregar pizzas deliciosas e uma experiência fora de órbita.</p></div><div><b>🪐</b><h3>Nossa visão</h3><p>Ser a pizzaria mais querida da galáxia.</p></div><div><b>👽</b><h3>Nossos valores</h3><p>Qualidade, criatividade, respeito e diversão.</p></div></div></section>`;
}
function success() {
  return `<section class="section container page-space"><div class="panel success"><div class="success-icon">✓</div><h1>Pedido <em>confirmado!</em></h1><p>Sua missão foi recebida. Acompanhe o status em Meus Pedidos.</p><div class="button-row"><button class="btn btn-primary" data-nav="orders">Acompanhar pedido</button><button class="btn btn-outline" data-nav="home">Voltar ao início</button></div></div></section>`;
}
function footer() {
  return `<footer class="footer"><div class="container footer-inner"><div><div class="brand">PizzE<span>T</span> ⌁</div><p>A pizza mais rápida da galáxia.</p></div><div><h3>Navegação</h3><button data-nav="home">Início</button><button data-nav="menu">Cardápio</button><button data-nav="orders">Pedidos</button></div><div><h3>Informações</h3><p>Projeto acadêmico demonstrativo.</p><p>Pagamentos fictícios. Sem entregas reais.</p></div></div><div class="container copyright">© 2026 PizzET — Projeto interdisciplinar.</div></footer>`;
}
function drawer() {
  return `<div class="overlay" data-action="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Carrinho"><div class="drawer-head"><h2>🛒 Seu carrinho (${cartCount()})</h2><button class="icon-btn" data-action="close" aria-label="Fechar">✕</button></div><div class="drawer-body">${cartRows()}</div><div class="drawer-foot"><div class="summary-line total"><span>Subtotal</span><b>${money(cartTotal())}</b></div><button class="btn btn-primary btn-full" data-nav="cart">Ver carrinho →</button></div></aside>`;
}
function modal() {
  const register = state.modal === 'register';
  return `<div class="overlay" data-action="close"></div><div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div class="auth-art"><div class="brand">PizzE<span>T</span> ⌁</div><h2>FAÇA PARTE DO <em>UNIVERSO PIZZET</em></h2><div class="auth-alien">👽🍕</div><p>Entre na tripulação mais saborosa da galáxia.</p></div><form id="auth-form" class="auth-form"><button type="button" class="modal-close" data-action="close" aria-label="Fechar">✕</button><div class="auth-tabs"><button type="button" class="${!register ? 'active' : ''}" data-action="login">Entrar</button><button type="button" class="${register ? 'active' : ''}" data-action="register">Criar conta</button></div><h2 id="auth-title">${register ? 'Crie sua conta' : 'Bem-vindo de volta!'}</h2>${register ? '<label>Nome completo<input name="name" autocomplete="name" required maxlength="100"></label>' : ''}<label>E-mail<input name="email" type="email" autocomplete="email" required></label>${register ? '<label>Telefone<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(31) 99999-9999" required></label>' : ''}<label>Senha<input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="8" required></label>${register ? '<label>Confirmar senha<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label><label class="checkline"><input type="checkbox" required> Concordo com os termos de uso demonstrativos.</label>' : ''}<button type="submit" class="btn btn-primary btn-full">${register ? 'Criar minha conta' : 'Entrar na PizzET'}</button><p class="muted small">Autenticação real depende da API C#.</p></form></div>`;
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  const pages = { home, menu, cart, checkout, orders, tracking, profile, about, success };
  app.innerHTML =
    header() +
    `<main id="main">${(pages[state.page] || home)()}</main>` +
    footer() +
    (state.drawer ? drawer() : '') +
    (state.modal ? modal() : '');
  document.body.classList.toggle('locked', !!(state.drawer || state.modal));
}
async function loadOrders() {
  if (!state.user) return;
  try {
    state.orders = await api.orders();
    render();
  } catch (e) {
    toast(e.message);
  }
}
async function init() {
  try {
    state.products = await api.products();
    if (!isDemo) {
      try {
        state.user = await api.me();
      } catch {}
    }
  } catch (e) {
    toast(e.message);
  }
  const hash = location.hash.slice(1);
  state.page = [
    'home',
    'menu',
    'cart',
    'checkout',
    'orders',
    'tracking',
    'profile',
    'about',
    'success',
  ].includes(hash)
    ? hash
    : 'home';
  render();
  if (state.page === 'orders') loadOrders();
}
app.addEventListener('click', async (e) => {
  const btn = e.target.closest(
    '[data-nav],[data-action],[data-add],[data-filter],[data-qty],[data-remove],[data-order]',
  );
  if (!btn) return;
  e.preventDefault();
  if (btn.dataset.nav) {
    nav(btn.dataset.nav);
    return;
  }
  if (btn.dataset.filter) {
    state.filter = btn.dataset.filter;
    render();
    return;
  }
  if (btn.dataset.add) {
    const p = productById(btn.dataset.add);
    if (!p) return;
    const existing = state.cart.find((x) => String(x.id) === String(p.id));
    if (existing) existing.qty++;
    else
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
    render();
    toast(`${p.name} abduzida para o carrinho!`);
    return;
  }
  if (btn.dataset.qty) {
    const item = state.cart.find((x) => String(x.id) === btn.dataset.qty);
    if (item) {
      item.qty += Number(btn.dataset.delta);
      if (item.qty <= 0) state.cart = state.cart.filter((x) => x !== item);
      saveCart();
      render();
    }
    return;
  }
  if (btn.dataset.remove) {
    state.cart = state.cart.filter((x) => String(x.id) !== btn.dataset.remove);
    saveCart();
    render();
    return;
  }
  if (btn.dataset.order) {
    try {
      state.selectedOrder = await api.order(btn.dataset.order);
      nav('tracking');
    } catch (err) {
      toast(err.message);
    }
    return;
  }
  switch (btn.dataset.action) {
    case 'theme':
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pizzet_theme', state.theme);
      render();
      break;
    case 'drawer':
      state.drawer = true;
      render();
      break;
    case 'close':
      state.drawer = false;
      state.modal = null;
      render();
      break;
    case 'mobile':
      state.mobileMenu = !state.mobileMenu;
      render();
      break;
    case 'account':
      if (state.user) nav('profile');
      else {
        state.modal = 'login';
        render();
      }
      break;
    case 'login':
      state.modal = 'login';
      render();
      break;
    case 'register':
      state.modal = 'register';
      render();
      break;
  }
});
app.addEventListener('input', (e) => {
  if (e.target.id === 'search') {
    const start = e.target.selectionStart;
    state.search = e.target.value;
    const grid = app.querySelector('.product-grid');
    const filtered = state.products.filter(
      (p) =>
        (state.filter === 'Todas' || p.category === state.filter) &&
        `${p.name} ${p.description}`.toLowerCase().includes(state.search.toLowerCase()),
    );
    if (grid)
      grid.innerHTML = filtered.length
        ? filtered.map(productCard).join('')
        : '<div class="empty">Nenhum produto encontrado.</div>';
    const count = app.querySelector('.section-heading span');
    if (count) count.textContent = `${filtered.length} produtos`;
    e.target.setSelectionRange(start, start);
  }
});
app.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = Object.fromEntries(new FormData(form).entries());
  const submit = form.querySelector('[type="submit"]');
  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Aguarde...';
  }
  try {
    if (form.id === 'auth-form') {
      if (state.modal === 'register') {
        if (fd.password !== fd.confirmPassword) throw new Error('As senhas não coincidem.');
        await api.register({ name: fd.name, email: fd.email, phone: fd.phone, password: fd.password });
        state.modal = 'login';
        toast('Cadastro realizado! Agora entre na sua conta.');
      } else {
        await api.login(fd.email, fd.password);
        state.user = await api.me();
        state.modal = null;
        toast('Bem-vindo à PizzET!');
      }
      render();
    } else if (form.id === 'profile-form') {
      state.user = await api.updateProfile({ name: fd.name, phone: fd.phone });
      toast('Perfil atualizado!');
      render();
    } else if (form.id === 'checkout-form') {
      if (!state.user) throw new Error('Entre na sua conta antes de finalizar o pedido.');
      const items = state.cart.map((x) => ({ productId: x.id, quantity: x.qty }));
      const address = {
        cep: fd.cep,
        street: fd.rua,
        number: fd.numero,
        neighborhood: fd.bairro,
        city: fd.cidade,
        state: fd.estado,
        complement: fd.complemento,
      };
      const order = await api.createOrder({ items, address, paymentMethod: fd.paymentMethod });
      state.selectedOrder = order;
      state.cart = [];
      saveCart();
      nav('success');
      toast('Pedido confirmado!');
    }
  } catch (err) {
    toast(err.message);
    if (submit) {
      submit.disabled = false;
      submit.textContent = 'Tentar novamente';
    }
  }
});
window.addEventListener('hashchange', () => {
  const page = location.hash.slice(1);
  if (
    page !== state.page &&
    ['home', 'menu', 'cart', 'checkout', 'orders', 'tracking', 'profile', 'about', 'success'].includes(page)
  )
    nav(page);
});
init();
