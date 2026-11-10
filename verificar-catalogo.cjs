var assert = require('assert');
var fs = require('fs');
var biblioteca = process.env.PLAYWRIGHT_PATH || 'C:/Users/thales/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
var chromium = require(biblioteca).chromium;

(async function() {
  var navegador = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  var contexto = await navegador.newContext({viewport:{width:1440,height:950}});
  var pagina = await contexto.newPage();
  var erros = [];
  pagina.on('pageerror', function(erro) { erros.push(erro.message); });
  pagina.on('response', function(resposta) {
    if(resposta.url().startsWith('http://127.0.0.1:8080') && resposta.status() >= 400) erros.push(resposta.url());
  });
  async function abrir(nome) { await pagina.goto('http://127.0.0.1:8080/' + nome); }
  await abrir('cardapio.html');
  await pagina.evaluate(function() {
    var antigos = produtosIniciais.slice(0,1);
    antigos[0].nome = 'Nome editado pelo usuário';
    antigos[0].preco = 77;
    antigos[0].ativo = false;
    for(var id=1;id<=5;id++){antigos.push({id:id,nome:'Pizza antiga '+id,categoria:'Tradicionais',preco:40,ativo:true});}
    antigos.push({id:900,nome:'Produto personalizado',categoria:'Doces',preco:19,descricao:'Teste',ativo:true});
    localStorage.setItem('pizzet-produtos', JSON.stringify(antigos));
    localStorage.setItem('pizzet-carrinho', JSON.stringify([{id:6,quantidade:2},{id:1,quantidade:1}]));
    localStorage.setItem('pizzet-pedidos', JSON.stringify([{id:'PZPRESERVAR'}]));
    localStorage.setItem('pizzet-usuario', JSON.stringify({nome:'Perfil preservado'}));
    localStorage.setItem('pizzet-tema', 'escuro');
  });
  await pagina.reload();
  var migracao = await pagina.evaluate(function() {
    return {quantidade:produtos.length,antigo:produtos[0],carrinho:carrinho,pedidos:pedidos,usuario:usuario,tema:temaAtual,novos:produtos.filter(function(produto){return produto.id>=101 && produto.id<=122;}).length};
  });
  assert.equal(migracao.quantidade,24);
  assert.equal(migracao.novos,22);
  assert.equal(migracao.antigo.preco,77);
  assert.equal(migracao.antigo.ativo,false);
  assert.equal(migracao.antigo.nome,'Nome editado pelo usuário');
  assert.equal(migracao.carrinho[0].quantidade,2);
  assert.equal(migracao.carrinho.length,1);
  assert.equal(migracao.pedidos[0].id,'PZPRESERVAR');
  assert.equal(migracao.usuario.nome,'Perfil preservado');
  assert.equal(migracao.tema,'escuro');
  await pagina.reload();
  assert.equal(await pagina.evaluate(function(){return produtos.length;}),24);

  // Limpa somente o armazenamento deste contexto isolado de testes.
  await pagina.evaluate(function(){localStorage.clear();});
  await pagina.reload();
  assert.equal(await pagina.locator('.cartao').count(),23);
  var imagens = await pagina.evaluate(function(){return novosProdutos.map(function(produto){return produto.imagem;});});
  assert.equal(new Set(imagens).size,22);
  await pagina.evaluate(function(caminhos){return Promise.all(caminhos.map(function(caminho){var img=new Image();img.src=caminho;return img.decode();}));},imagens);
  await pagina.locator('[data-categoria="Doces"]').click();
  assert.equal(await pagina.locator('.cartao').count(),6);
  await pagina.screenshot({path:'capturas/cardapio-doces-atualizado.png',fullPage:true});
  await pagina.locator('[data-categoria="Bebidas"]').click();
  assert.equal(await pagina.locator('.cartao').count(),8);
  await pagina.screenshot({path:'capturas/cardapio-bebidas-atualizado.png',fullPage:true});
  await pagina.locator('[data-categoria="Todas"]').click();
  await pagina.locator('#busca').fill('camarão');
  assert.equal(await pagina.locator('.cartao').count(),1);
  await pagina.locator('#busca').fill('goiabada');
  assert.equal(await pagina.locator('.cartao').count(),1);

  for(var id of [101,110,116]) {
    await abrir('pizza.html?id='+id);
    assert(await pagina.locator('.detalhe-img img').getAttribute('src'));
    await pagina.locator('.detalhe-img img').evaluate(function(img){return img.decode();});
    if(id===116) {
      assert((await pagina.locator('.detalhe-info').innerText()).includes('350 ml'));
      assert(!(await pagina.locator('.detalhe-info').innerText()).includes('8 fatias'));
    }
    await pagina.locator('#adicionar-detalhe').click();
  }
  await abrir('carrinho.html');
  assert.equal(await pagina.locator('.item-carrinho').count(),3);
  assert((await pagina.locator('.resumo .total').innerText()).includes('100,60'));
  await abrir('checkout.html');
  for(var par of [['nome','Cliente fictício'],['endereco','Rua Teste, 42'],['bairro','Centro'],['cidade','Cidade Demo'],['cep','12345-678']]) {
    await pagina.locator('[name="'+par[0]+'"]').fill(par[1]);
  }
  await pagina.locator('button[type="submit"]').click();
  await pagina.waitForURL('**/confirmacao.html?id=*');
  assert.equal(await pagina.evaluate(function(){return JSON.parse(localStorage.getItem('pizzet-pedidos'))[0].total;}),100.6);

  await abrir('admin-produtos.html');
  await pagina.locator('[data-editar="101"]').click();
  await pagina.locator('[name="tamanho"]').fill('Grande · tamanho editado');
  await pagina.locator('[name="imagem"]').selectOption('assets/cardapio/bacon-de-saturno.png');
  await pagina.locator('#form-produto button[type="submit"]').click();
  await abrir('pizza.html?id=101');
  assert((await pagina.locator('.detalhe-info').innerText()).includes('tamanho editado'));
  assert.equal(await pagina.locator('.detalhe-img img').getAttribute('src'),'assets/cardapio/bacon-de-saturno.png');
  await abrir('cardapio.html');
  assert.equal(await pagina.locator('.cartao').count(),23);
  await pagina.evaluate(function(){localStorage.clear();});
  for(var tema of ['claro','escuro']) {
    await pagina.evaluate(function(valor){localStorage.setItem('pizzet-tema',valor);},tema);
    for(var largura of [1440,390]) {
      await pagina.setViewportSize({width:largura,height:950});
      await pagina.reload();
      assert(await pagina.evaluate(function(){return document.documentElement.scrollWidth<=innerWidth;}));
      await pagina.locator('[data-categoria="Especiais"]').click();
      await pagina.locator('.foto-produto img').evaluateAll(function(imagens){return Promise.all(imagens.map(function(img){img.loading='eager';return img.decode();}));});
      await pagina.screenshot({path:'capturas/cardapio-novo-'+tema+'-'+largura+'.png',fullPage:true});
    }
  }
  assert.deepEqual(erros,[]);
  var resultado='23 produtos no total; 22 novas imagens carregadas; cinco pizzas com imagem repetida removidas.\nMigração preserva produtos editados, carrinho, pedidos, perfil e tema; sem duplicatas após recarregar.\nFiltros, busca por ingrediente, volumes das bebidas, detalhes, carrinho misto e checkout (R$ 100,60): OK.\nEdição administrativa de tamanho e imagem: OK.\nTemas claro/escuro e layout desktop/mobile: OK.\nErros JavaScript e HTTP locais: 0.\n';
  fs.writeFileSync('capturas/verificacao-catalogo.txt',resultado);
  console.log(resultado);
  await navegador.close();
})().catch(function(erro){console.error(erro);process.exit(1);});
