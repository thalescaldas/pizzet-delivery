// Verifica rolagem horizontal em várias larguras/páginas e gera prints para revisão
const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2] || 'tests/saida';
const BASE = 'http://localhost:5039/';
const ADMIN = process.env.PIZZET_ADMIN_SENHA;
const larguras = [320, 360, 390, 768, 1024, 1440];
(async () => {
  const b = await chromium.launch();
  async function contexto(w, login, tema = 'dark') {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('pizzet_theme', t);
        localStorage.setItem(
          'pizzet_cart',
          JSON.stringify([
            { id: 1, qty: 2, name: 'x', price: 1 },
            { id: 8, qty: 1, name: 'y', price: 1 },
          ]),
        );
      } catch {}
    }, tema);
    const p = await ctx.newPage();
    if (login) {
      const r = await p.request.post(BASE + 'api/auth/entrar', {
        headers: { 'X-PizzET-Csrf': '1' },
        data: login,
      });
      if (!r.ok()) throw new Error('login falhou ' + r.status());
    }
    return p;
  }
  const problemas = [];
  const paginas = [
    ['home', null],
    ['menu', null],
    ['cart', null],
    ['about', null],
    ['checkout', { email: 'ana@teste.dev', senha: 'senha1234' }],
    ['orders', { email: 'ana@teste.dev', senha: 'senha1234' }],
    ['tracking/1', { email: 'ana@teste.dev', senha: 'senha1234' }],
    ['profile', { email: 'ana@teste.dev', senha: 'senha1234' }],
    ['admin', { email: 'admin@pizzet.dev', senha: ADMIN }],
  ];
  for (const w of larguras) {
    for (const [pg, login] of paginas) {
      const p = await contexto(w, login);
      await p.goto(BASE + '#' + pg, { waitUntil: 'networkidle' });
      await p.waitForTimeout(250);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) {
        const culpados = await p.evaluate(
          (w) =>
            [...document.querySelectorAll('body *')]
              .filter((e) => e.getBoundingClientRect().right > w + 1)
              .slice(0, 4)
              .map((e) => e.tagName + '.' + [...e.classList].join('.')),
          w,
        );
        problemas.push(`${w}px #${pg}: scrollWidth ${sw} ${culpados.join(' ')}`);
      }
      if ([390, 1440].includes(w))
        await p.screenshot({ path: `${S}/r-${pg.replace('/', '-')}-${w}.png`, fullPage: true });
      await p.context().close();
    }
    // modal de cadastro e menu mobile
    const p = await contexto(w, null);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.click('[data-action="account"]');
    await p.click('.auth-tabs [data-action="register"]');
    await p.waitForTimeout(200);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    const modalOk = await p.evaluate(() => {
      const r = document.querySelector('.auth-modal').getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth;
    });
    if (sw > w || !modalOk)
      problemas.push(`${w}px modal cadastro: scrollWidth ${sw}, dentro da tela=${modalOk}`);
    if ([390, 1440].includes(w)) await p.screenshot({ path: `${S}/r-modal-${w}.png` });
    if (w <= 768) {
      await p.keyboard.press('Escape');
      await p.click('[data-action="mobile"]');
      await p.waitForTimeout(200);
      const visivel = await p.isVisible('.nav.open a[data-nav="menu"]');
      if (!visivel) problemas.push(`${w}px menu mobile não abriu`);
      if (w === 390) await p.screenshot({ path: `${S}/r-menu-mobile-390.png` });
    }
    await p.context().close();
  }
  console.log(
    problemas.length
      ? 'PROBLEMAS:\n' + problemas.join('\n')
      : `✅ Sem rolagem horizontal em ${larguras.join(', ')}px (9 páginas + modal + menu mobile)`,
  );
  await b.close();
})();
