// Teste ponta a ponta no navegador: cliente + administrador
const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2] || 'tests/saida';
const BASE = 'http://localhost:5039/';
const ADMIN_SENHA = process.env.PIZZET_ADMIN_SENHA;
const resultados = [];
const ok = (nome, cond, extra = '') => {
  resultados.push(`${cond ? '✅' : '❌'} ${nome}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
};

function vigiar(page, rotulo, problemas) {
  page.on('console', (m) => {
    if (m.type() === 'error') problemas.push(`[${rotulo}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problemas.push(`[${rotulo}] JS: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 500 || (r.status() === 404 && !r.url().includes('/api/')))
      problemas.push(`[${rotulo}] HTTP ${r.status()} ${r.url()}`);
  });
}

(async () => {
  const browser = await chromium.launch();
  const problemas = [];

  // ===================== CLIENTE (desktop) =====================
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  vigiar(page, 'cliente', problemas);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const cards = await page.locator('.product-grid.featured .product-card').count();
  ok('Home carrega 4 destaques vindos da API', cards === 4, `${cards} cards`);
  ok('Imagem real de pizza no card', (await page.locator('.product-card img[src*="pizza-1"]').count()) > 0);

  // Cardápio + busca pela API
  await page.click('.nav [data-nav="menu"]');
  await page.waitForSelector('#menu-results .product-card');
  const totalMenu = await page.locator('#menu-results .product-card').count();
  ok('Cardápio mostra 10 produtos ativos (inativo oculto)', totalMenu === 10, `${totalMenu}`);
  await page.fill('#search', 'lactea');
  await page.waitForFunction(() => document.querySelectorAll('#menu-results .product-card').length === 1);
  ok(
    'Busca "lactea" (sem acento) encontra "Via Láctea" pela API',
    (await page.textContent('#menu-results')).includes('Via Láctea'),
  );
  ok(
    'Foco permanece na busca durante a digitação',
    await page.evaluate(() => document.activeElement.id === 'search'),
  );
  await page.fill('#search', 'xyzabc');
  await page.waitForSelector('#menu-results .empty');
  ok(
    'Busca sem resultado mostra mensagem',
    (await page.textContent('#menu-results')).includes('Nenhum produto'),
  );
  await page.fill('#search', '');
  await page.click('[data-filter="Bebidas"]');
  await page.waitForFunction(() => document.querySelectorAll('#menu-results .product-card').length === 3);
  ok('Filtro "Bebidas" pela API devolve 3', true);
  await page.click('[data-filter="Todas"]');
  await page.waitForFunction(() => document.querySelectorAll('#menu-results .product-card').length === 10);

  // Carrinho
  await page.click('[data-add="1"]');
  await page.click('[data-add="1"]');
  await page.click('[data-add="8"]');
  ok('Contador do carrinho = 3', (await page.textContent('.cart-trigger b')).trim() === '3');
  await page.click('[data-action="drawer"]');
  ok(
    'Gaveta do carrinho abre com foco dentro',
    await page.evaluate(() => document.querySelector('.drawer').contains(document.activeElement)),
  );
  await page.keyboard.press('Escape');
  ok('Esc fecha a gaveta', (await page.locator('.drawer').count()) === 0);
  // Adulteração de preço no localStorage: o servidor deve ignorar
  await page.evaluate(() => {
    const c = JSON.parse(localStorage.getItem('pizzet_cart'));
    c[0].price = 0.01;
    localStorage.setItem('pizzet_cart', JSON.stringify(c));
  });
  await page.goto(BASE + '#cart', { waitUntil: 'networkidle' });
  ok(
    'Preço adulterado no navegador é corrigido pelo catálogo da API',
    (await page.textContent('.summary')).includes('113,70'),
  );

  // Checkout sem login -> modal de login
  await page.click('[data-nav="checkout"]');
  await page.waitForSelector('.auth-modal');
  ok(
    'Checkout sem login abre o modal de login',
    (await page.textContent('.auth-modal')).includes('finalizar o pedido'),
  );
  ok(
    'Foco vai para o primeiro campo do modal',
    await page.evaluate(() => document.activeElement.name === 'email'),
  );
  // Tab preso no modal
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  ok(
    'Tab fica preso dentro do modal',
    await page.evaluate(() => document.querySelector('.auth-modal').contains(document.activeElement)),
  );

  // Cadastro com validação + máscaras
  await page.click('.auth-tabs [data-action="register"]');
  await page.click('#auth-form [type=submit]');
  ok('Cadastro vazio mostra erros por campo', (await page.locator('.field-error').count()) >= 4);
  await page.fill('[name=nome]', 'Ana123 da Silva');
  ok('Máscara de nome remove números', (await page.inputValue('[name=nome]')) === 'Ana da Silva');
  await page.fill('[name=cpf]', '52998224725');
  ok('Máscara de CPF', (await page.inputValue('[name=cpf]')) === '529.982.247-25');
  await page.fill('[name=telefone]', '61999998888');
  ok('Máscara de telefone', (await page.inputValue('[name=telefone]')) === '(61) 99999-8888');
  await page.fill('[name=email]', 'ana@teste.dev');
  await page.fill('[name=senha]', 'senha1234');
  await page.fill('[name=confirmarSenha]', 'senha1234');
  await page.check('[name=termos]');
  await page.click('#auth-form [type=submit]');
  await page.waitForSelector('#checkout-form');
  ok(
    'Cadastro entra logado e segue para o checkout',
    (await page.textContent('.account-btn')).includes('Ana'),
  );

  // Cookie de sessão HttpOnly
  const cookies = await ctx.cookies();
  const auth = cookies.find((c) => c.name === 'PizzET.Auth');
  ok('Cookie de login é HttpOnly e SameSite=Lax', auth && auth.httpOnly && auth.sameSite === 'Lax');
  ok(
    'JavaScript não enxerga o cookie',
    !(await page.evaluate(() => document.cookie)).includes('PizzET.Auth'),
  );
  ok(
    'Nenhuma senha/token no localStorage',
    !(await page.evaluate(() => JSON.stringify(localStorage))).match(/senha|token|password/i),
  );

  // Checkout com novo endereço
  await page.waitForSelector('[name=cep]');
  await page.click('#checkout-form [type=submit]');
  ok('Endereço vazio mostra erros', (await page.locator('#checkout-form .field-error').count()) >= 5);
  await page.fill('[name=cep]', '70040010');
  ok('Máscara de CEP', (await page.inputValue('[name=cep]')) === '70040-010');
  await page.fill('[name=numero]', '42abc');
  ok('Número aceita só dígitos', (await page.inputValue('[name=numero]')) === '42');
  await page.fill('[name=logradouro]', 'Rua das Estrelas');
  await page.fill('[name=bairro]', 'Centro');
  await page.fill('[name=cidade]', 'Brasília');
  await page.fill('[name=uf]', 'df');
  ok('Máscara de UF', (await page.inputValue('[name=uf]')) === 'DF');
  await page.selectOption('[name=formaPagamento]', 'PIX');
  await page.click('#checkout-form [type=submit]');
  await page.waitForSelector('.success');
  const textoSucesso = await page.textContent('.success');
  ok(
    'Pedido registrado com total do servidor (R$ 121,60)',
    textoSucesso.includes('121,60'),
    textoSucesso.match(/pedido #\d+/i)?.[0],
  );
  ok('Carrinho esvaziado após o pedido', (await page.textContent('.cart-trigger b')).trim() === '0');

  // Acompanhamento
  await page.click('.success [data-order]');
  await page.waitForSelector('.steps');
  ok(
    'Acompanhamento mostra status Recebido',
    (await page.textContent('.tracking .status')).includes('Recebido'),
  );
  const pedidoId = page.url().split('/').pop();

  // Meus pedidos
  await page.click('.nav [data-nav="orders"]');
  await page.waitForSelector('.order-card');
  ok('Histórico lista o pedido', (await page.locator('.order-card').count()) === 1);

  // Perfil
  await page.click('[data-action="account"]');
  await page.waitForSelector('#profile-form');
  ok(
    'Perfil mostra CPF mascarado',
    (await page.inputValue('#profile-form input[disabled]:not([type=email])')).startsWith('***.'),
  );
  ok(
    'Perfil lista o endereço salvo',
    (await page.textContent('.address-saved')).includes('Rua das Estrelas'),
  );
  await page.fill('#profile-form [name=nome]', 'Ana Maria da Silva');
  await page.click('#profile-form [type=submit]');
  await page.waitForFunction(() => document.querySelector('.account-btn').textContent.includes('Ana'));
  ok('Perfil salvo', true);

  // Cliente não acessa admin
  await page.goto(BASE + '#admin', { waitUntil: 'networkidle' });
  ok(
    'Cliente não vê o painel admin',
    (await page.locator('.admin-tabs').count()) === 0 && !(await page.textContent('.nav')).includes('Admin'),
  );
  const r403 = await page.evaluate(
    async () => (await fetch('/api/admin/produtos', { credentials: 'include' })).status,
  );
  ok('API responde 403 ao cliente em /api/admin', r403 === 403);

  // ===================== ADMIN =====================
  const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adm = await ctxA.newPage();
  vigiar(adm, 'admin', problemas);
  await adm.goto(BASE, { waitUntil: 'networkidle' });
  await adm.click('[data-action="account"]');
  await adm.fill('[name=email]', 'admin@pizzet.dev');
  await adm.fill('[name=senha]', 'senhaErrada1');
  await adm.click('#auth-form [type=submit]');
  await adm.waitForSelector('#toast.visible');
  ok(
    'Login com senha errada mostra mensagem genérica',
    (await adm.textContent('#toast')).includes('E-mail ou senha inválidos'),
  );
  await adm.fill('[name=senha]', ADMIN_SENHA);
  await adm.click('#auth-form [type=submit]');
  await adm.waitForSelector('.nav [data-nav="admin"]');
  ok('Admin vê o link "Admin"', true);
  await adm.click('.nav [data-nav="admin"]');
  await adm.waitForSelector('.admin-row');
  ok('Admin lista 11 produtos (inclui inativo)', (await adm.locator('.admin-row').count()) === 11);

  // CRUD: criar
  await adm.click('[data-action="new-product"]');
  await adm.fill('#product-form [name=nome]', 'Pizza Saturno');
  await adm.fill('#product-form [name=descricao]', 'Anéis de cebola e queijo cósmico.');
  await adm.selectOption('#product-form [name=categoria]', 'PREMIUM');
  await adm.fill('#product-form [name=preco]', '72,50');
  await adm.fill('#product-form [name=imagemUrl]', 'assets/pizza-5.webp');
  await adm.click('#product-form [type=submit]');
  await adm.waitForFunction(() => document.querySelectorAll('.admin-row').length === 12);
  ok('Admin cria produto (persistido)', true);
  // Duplicado
  await adm.click('[data-action="new-product"]');
  await adm.fill('#product-form [name=nome]', 'Pizza Saturno');
  await adm.fill('#product-form [name=preco]', '10');
  await adm.click('#product-form [type=submit]');
  await adm.waitForSelector('#product-form .field-error');
  ok(
    'Nome duplicado mostra erro no campo',
    (await adm.textContent('#product-form .field-error')).includes('Já existe'),
  );
  await adm.click('[data-action="cancel-edit"]');
  // Editar
  const idNovo = await adm.evaluate(
    () => [...document.querySelectorAll('[data-edit-product]')].pop().dataset.editProduct,
  );
  await adm.click(`[data-edit-product="${idNovo}"]`);
  await adm.fill('#product-form [name=preco]', '70,00');
  await adm.click('#product-form [type=submit]');
  await adm.waitForFunction(() => document.querySelector('.admin-list')?.textContent.includes('70,00'));
  ok('Admin edita preço', true);
  // Desativar
  adm.once('dialog', (d) => d.accept());
  await adm.click(`[data-deactivate-product="${idNovo}"]`);
  await adm.waitForSelector(`[data-activate-product="${idNovo}"]`);
  ok('Admin desativa produto (exclusão lógica)', true);
  const noBanco = await adm.evaluate(async (id) => (await fetch(`/api/produtos/${id}`)).status, idNovo);
  ok('Produto desativado some do catálogo público (404)', noBanco === 404);
  await adm.click(`[data-activate-product="${idNovo}"]`);
  await adm.waitForSelector(`[data-deactivate-product="${idNovo}"]`);
  ok('Admin reativa produto', true);

  // Pedidos: mudar status
  await adm.click('[data-admin-tab="pedidos"]');
  await adm.waitForSelector('.admin-order');
  ok('Admin vê pedido da cliente com nome', (await adm.textContent('.admin-order')).includes('Ana'));
  await adm.click('[data-set-status="EM_PREPARO"]');
  await adm.waitForSelector('[data-set-status="SAIU_PARA_ENTREGA"]');
  ok('Admin muda status para Em preparo', true);

  // Cliente vê o novo status
  await page.goto(BASE + `#tracking/${pedidoId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.steps');
  ok(
    'Cliente vê "Em preparo" no acompanhamento',
    (await page.textContent('.tracking .status')).includes('Em preparo'),
  );
  await adm.click('[data-set-status="SAIU_PARA_ENTREGA"]');
  await adm.waitForSelector('[data-set-status="ENTREGUE"]');
  ok(
    'Após "Saiu para entrega", não há botão Cancelar',
    (await adm.locator('[data-set-status="CANCELADO"]').count()) === 0,
  );

  // Logout
  await page.click('[data-action="account"]');
  await page.waitForSelector('[data-action="logout"]');
  await page.click('[data-action="logout"]');
  await page.waitForFunction(() => document.querySelector('.account-btn').textContent.includes('Entrar'));
  const pos = await page.evaluate(
    async () => (await fetch('/api/pedidos', { credentials: 'include' })).status,
  );
  ok('Logout encerra a sessão (401 depois)', pos === 401);

  // Tema persistente
  await page.click('[data-action="theme"]');
  await page.reload({ waitUntil: 'networkidle' });
  ok(
    'Tema claro persiste após recarregar',
    (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light',
  );

  console.log(resultados.join('\n'));
  console.log(`\nProblemas de console/rede: ${problemas.length ? '\n' + problemas.join('\n') : 'nenhum'}`);
  await browser.close();
})().catch((e) => {
  console.log(resultados.join('\n'));
  console.error('FALHOU:', e.message);
  process.exit(1);
});
