// Verificação de desenvolvimento. Playwright não faz parte do site entregue.
var fs = require('fs');
var assert = require('assert');
var biblioteca = process.env.PLAYWRIGHT_PATH || 'C:/Users/thales/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
var chromium = require(biblioteca).chromium;
(async function() {
  var navegador = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  var contexto = await navegador.newContext({viewport:{width:1440,height:1000}});
  var pagina = await contexto.newPage();
  var erros = [];
  pagina.on('pageerror',function(erro){erros.push(erro.message);});
  pagina.on('response',function(resposta){if(resposta.url().startsWith('http://127.0.0.1:8080') && resposta.status()>=400){erros.push(resposta.status()+' '+resposta.url());}});
  var paginas = ['index','cardapio','pizza','carrinho','checkout','confirmacao','login','cadastro','perfil','meus-pedidos','rastreamento','sobre','contato','admin','admin-produtos','admin-pedidos'];
  var resultados = [];
  async function abrir(nome) {await pagina.goto('http://127.0.0.1:8080/'+nome+'.html'); await pagina.locator('main h1').waitFor();}
  await abrir('index'); await pagina.evaluate(function(){localStorage.clear();});
  for(var largura of [1440,390]) {
    await pagina.setViewportSize({width:largura,height:1000});
    for(var nome of paginas) {
      await abrir(nome);
      assert(await pagina.locator('main').innerText(),nome+' vazio');
      assert(await pagina.evaluate(function(){return document.documentElement.scrollWidth<=window.innerWidth;}),nome+' com rolagem horizontal em '+largura);
      resultados.push(nome+' '+largura+'px OK');
    }
  }
  await abrir('cardapio');
  await pagina.locator('#busca').fill('Margherita');assert.equal(await pagina.locator('.cartao').count(),1);
  await pagina.locator('[data-adicionar="101"]').click();
  await abrir('pizza');await pagina.locator('[data-detalhe="1"]').click();await pagina.locator('#adicionar-detalhe').click();
  await abrir('carrinho');assert.equal(await pagina.locator('.quantidade span').innerText(),'3');
  await pagina.locator('[data-valor="-1"]').click();assert.equal(await pagina.locator('.quantidade span').innerText(),'2');
  await abrir('checkout');
  await pagina.locator('[name="nome"]').fill('Explorador Teste');await pagina.locator('[name="endereco"]').fill('Rua Fictícia, 42');await pagina.locator('[name="bairro"]').fill('Centro');await pagina.locator('[name="cidade"]').fill('Cidade Demo');await pagina.locator('[name="cep"]').fill('12345-678');
  await pagina.locator('button[type="submit"]').click();await pagina.waitForURL('**/confirmacao.html?id=*');
  assert(await pagina.locator('h1').innerText(),'Confirmação');
  var dados = await pagina.evaluate(function(){return {pedidos:JSON.parse(localStorage.getItem('pizzet-pedidos')),carrinho:JSON.parse(localStorage.getItem('pizzet-carrinho'))};});
  assert.equal(dados.pedidos.length,1);assert.equal(dados.pedidos[0].total,95.7);assert.equal(dados.carrinho.length,0);
  await abrir('rastreamento');await pagina.locator('#simular-etapa').click();assert.equal(await pagina.locator('.etapas .feita').count(),2);
  await abrir('admin-pedidos');await pagina.locator('[data-status]').selectOption('4');
  await abrir('rastreamento');assert.equal(await pagina.locator('.etapas .feita').count(),5);assert(await pagina.locator('#simular-etapa').isDisabled());
  await abrir('cadastro');await pagina.locator('[name="nome"]').fill('Alien Teste');await pagina.locator('[name="email"]').fill('teste@example.com');await pagina.locator('[name="telefone"]').fill('11999999999');await pagina.locator('[name="senha"]').fill('teste123');await pagina.locator('[name="confirmar"]').fill('teste123');await pagina.locator('button[type="submit"]').click();await pagina.waitForURL('**/perfil.html');
  assert.equal(await pagina.evaluate(function(){return JSON.parse(localStorage.getItem('pizzet-usuario')).senha;}),undefined);
  await abrir('admin-produtos');await pagina.locator('#novo-produto').click();await pagina.locator('[name="nome"]').fill('Pizza de teste');await pagina.locator('[name="preco"]').fill('32.50');await pagina.locator('[name="descricao"]').fill('Ingredientes fictícios para teste.');await pagina.locator('#form-produto button[type="submit"]').click();
  await abrir('cardapio');await pagina.locator('#busca').fill('Pizza de teste');assert.equal(await pagina.locator('.cartao').count(),1);
  await abrir('admin-produtos');await pagina.locator('#busca-admin').fill('Pizza de teste');await pagina.locator('[data-desativar]').click();
  await abrir('cardapio');await pagina.locator('#busca').fill('Pizza de teste');assert.equal(await pagina.locator('.cartao').count(),0);
  await abrir('contato');await pagina.locator('[name="nome"]').fill('Teste');await pagina.locator('[name="email"]').fill('teste@example.com');await pagina.locator('[name="mensagem"]').fill('Esta é uma mensagem fictícia de teste.');await pagina.locator('button[type="submit"]').click();assert((await pagina.locator('#aviso').innerText()).includes('Nenhuma mensagem'));
  await pagina.evaluate(function(){localStorage.clear();});
  await pagina.setViewportSize({width:1440,height:1000});await abrir('index');await pagina.evaluate(function(){return document.fonts.ready;});await pagina.locator('.hero-fundo').evaluate(function(img){return img.decode();});await pagina.screenshot({path:'capturas/home-desktop.png',fullPage:true});
  await pagina.setViewportSize({width:390,height:844});await abrir('index');await pagina.evaluate(function(){return document.fonts.ready;});await pagina.screenshot({path:'capturas/home-mobile.png',fullPage:true});
  await pagina.locator('#abrir-menu').click();assert.equal(await pagina.locator('#abrir-menu').getAttribute('aria-expanded'),'true');
  assert.deepEqual(erros,[]);
  resultados.push('Busca, carrinho, checkout, confirmação, rastreamento, cadastro sem senha persistida, produtos, status administrativo, contato e menu mobile: OK.');
  fs.writeFileSync('capturas/verificacao.txt',resultados.join('\n')+'\nErros JavaScript e HTTP locais: 0\n');
  console.log(resultados.join('\n'));
  await navegador.close();
})().catch(function(erro){console.error(erro);process.exit(1);});
