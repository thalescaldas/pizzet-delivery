var fs = require('fs');
var assert = require('assert');
var biblioteca = process.env.PLAYWRIGHT_PATH || 'C:/Users/thales/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
var chromium = require(biblioteca).chromium;

(async function() {
  var navegador = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  var pagina = await navegador.newPage();
  var erros = [];
  var resultados = [];
  pagina.on('pageerror', function(erro) { erros.push(erro.message); });
  pagina.on('response', function(resposta) {
    if(resposta.url().startsWith('http://127.0.0.1:8080') && resposta.status() >= 400) erros.push(resposta.url());
  });
  await pagina.goto('http://127.0.0.1:8080/');
  assert.equal(await pagina.locator('html').getAttribute('data-tema'), 'claro');
  await pagina.locator('#alternar-tema').click();
  await pagina.goto('http://127.0.0.1:8080/cardapio.html');
  assert.equal(await pagina.locator('html').getAttribute('data-tema'), 'escuro');
  await pagina.reload();
  assert.equal(await pagina.locator('html').getAttribute('data-tema'), 'escuro');
  await pagina.locator('#alternar-tema').click();
  assert.equal(await pagina.evaluate(function() { return localStorage.getItem('pizzet-tema'); }), 'claro');

  var paginas = ['index','cardapio','pizza','carrinho','checkout','confirmacao','login','cadastro','perfil','meus-pedidos','rastreamento','sobre','contato','admin','admin-produtos','admin-pedidos'];
  for(var tema of ['claro','escuro']) {
    await pagina.evaluate(function(valor) { localStorage.setItem('pizzet-tema', valor); }, tema);
    for(var largura of [1440,768,390,320]) {
      await pagina.setViewportSize({width:largura,height:950});
      for(var nome of paginas) {
        await pagina.goto('http://127.0.0.1:8080/' + nome + '.html');
        await pagina.locator('main h1').waitFor();
        assert.equal(await pagina.locator('html').getAttribute('data-tema'), tema);
        assert(await pagina.evaluate(function() { return document.documentElement.scrollWidth <= innerWidth; }), nome+' '+tema+' '+largura+'px: rolagem horizontal');
        assert.equal(await pagina.locator('#alternar-tema').getAttribute('aria-label'), tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro');
        if(nome === 'index' && (largura === 1440 || largura === 390)) {
          await pagina.evaluate(function() { return document.fonts.ready; });
          await pagina.screenshot({path:'capturas/home-'+tema+'-'+largura+'.png',fullPage:true});
        }
      }
      if(largura <= 390) {
        await pagina.locator('#abrir-menu').click();
        assert(await pagina.locator('.navegacao').isVisible());
      }
      resultados.push(tema+' '+largura+'px: 16 páginas OK');
    }
  }
  assert.deepEqual(erros, []);
  resultados.push('Alternância, persistência, navegação e menu mobile OK. Sem erros JavaScript ou HTTP locais.');
  fs.writeFileSync('capturas/verificacao-temas.txt', resultados.join('\n'));
  console.log(resultados.join('\n'));
  await navegador.close();
})().catch(function(erro) { console.error(erro); process.exit(1); });
