// Visitante anônimo navegando pelas páginas públicas: console e rede devem ficar limpos
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  p.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) erros.push(`${m.type()}: ${m.text()}`);
  });
  p.on('pageerror', (e) => erros.push('JS: ' + e.message));
  p.on('response', (r) => {
    if (r.status() >= 400) erros.push(`HTTP ${r.status()} ${r.url()}`);
  });
  const docs = [];
  p.on('response', (r) => {
    if (r.request().resourceType() === 'document') docs.push(`${r.status()} ${r.url()}`);
  });
  for (const h of ['', '#menu', '#about', '#cart', '#orders']) {
    await p.goto('http://localhost:5039/' + h, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
  }
  await p.click('[data-action="theme"]');
  await p.waitForTimeout(300);
  console.log('Documento principal:', docs[0]);
  console.log(
    erros.length
      ? 'ERROS:\n' + erros.join('\n')
      : '✅ Console e rede sem erros (visitante anônimo, 5 páginas + troca de tema)',
  );
  await b.close();
})();
