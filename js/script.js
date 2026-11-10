var pagina = document.body.getAttribute('data-pagina');
var conteudo = document.getElementById('conteudo');
var categoriaAtual = 'Todas';
var quantidadePizza = 1;
var temporizadorAviso;
var statusPedidos = ['Pedido recebido', 'Em preparação', 'Pronto', 'Saiu para entrega', 'Entregue'];

function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', {
    style:'currency', currency:'BRL'
  });
}
function escapar(texto) {
  return String(texto).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function icone(nome) {
  var desenhos = {
    carrinho:'<path d="M3 3h2l2 12h12l2-9H6M9 20h.01M18 20h.01"/>', usuario:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>', busca:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>', foguete:'<path d="M8 16c-1-7 4-12 12-13 0 8-5 13-12 13ZM8 9 3 11v6l5-1m7 0-2 5H7v-5m-3 4-2 2"/><circle cx="15" cy="8" r="2"/>', pizza:'<path d="m3 21 6-18a23 23 0 0 1 12 12L3 21Zm5-14a19 19 0 0 1 9 9"/><circle cx="10" cy="13" r="1"/><circle cx="7" cy="17" r="1"/>', estrela:'<path d="m12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/>', alien:'<path d="M12 22C-3 12 2 2 12 2s15 10 0 20Z"/><path d="M6 9c4 0 5 3 4 5-3 0-4-2-4-5Zm12 0c-4 0-5 3-4 5 3 0 4-2 4-5Z"/>'
  };
  return '<span class="icone"><svg viewBox="0 0 24 24" aria-hidden="true">'+(desenhos[nome] || desenhos.estrela)+'</svg></span>';
}
function marca() {
  return '<a class="marca" href="index.html" aria-label="PizzET, início"><img class="marca-imagem" src="assets/logo-pizzet-verde-neon.png" alt="PizzET" width="1792" height="896"></a>';
}
function aviso(texto) {
  var elemento = document.getElementById('aviso');
  elemento.textContent = texto;
  elemento.classList.add('visivel');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function(){
    elemento.classList.remove('visivel');
  },3000);
}
function montarEstrutura() {
  if (pagina !== 'index' && !document.querySelector('.cenario-interno')) {
    var cenario = document.createElement('div');
    cenario.className = 'cenario-interno';
    cenario.setAttribute('aria-hidden', 'true');
    cenario.innerHTML = '<img class="hero-fundo" src="assets/hero.png" alt="">';
    document.body.insertBefore(cenario, document.getElementById('cabecalho'));
  }
  var links = [['index','Home'],['cardapio','Cardápio'],['sobre','Sobre'],['contato','Contato']];
  var navegacao = '';
  for(var i=0;i<links.length;i++){
    navegacao += '<a '+(pagina===links[i][0]?'class="ativo" aria-current="page"':'')+' href="'+links[i][0]+'.html">'+links[i][1]+'</a>';
  }
  document.getElementById('cabecalho').innerHTML = '<div class="container cabecalho">'+marca()+'<nav class="navegacao" id="navegacao" aria-label="Navegação principal">'+navegacao+'</nav><div class="acoes"><button class="alternar-tema" id="alternar-tema" type="button" aria-label="Alternar tema"></button><a href="cardapio.html" aria-label="Buscar pizzas"><span class="emoji-cabecalho" aria-hidden="true">🔍</span></a><a class="conta" href="'+(usuario?'perfil':'login')+'.html" aria-label="Minha conta"><span class="emoji-cabecalho" aria-hidden="true">👤</span></a><a class="sacola" href="carrinho.html" aria-label="Abrir carrinho"><span class="emoji-cabecalho" aria-hidden="true">🛒</span> <span class="contador" id="contador">0</span></a><button class="menu" id="abrir-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="navegacao"><span class="emoji-cabecalho" aria-hidden="true">📋</span></button></div></div>';
  document.getElementById('rodape').innerHTML = '<div class="container rodape"><div class="rodape-topo"><div>'+marca()+'<p>O sabor da Terra. A experiência de outro planeta.</p></div><nav class="rodape-links" aria-label="Links do rodapé"><a href="cardapio.html">Cardápio</a><a href="meus-pedidos.html">Meus pedidos</a><a href="perfil.html">Minha conta</a><a href="admin.html">Admin demo</a></nav></div><div class="rodape-base"><span>© 2026 PizzET · Feito para exploradores de novos sabores.</span><span class="demonstracao">Projeto escolar • Dados fictícios • Nenhuma compra real</span></div></div>';
  document.getElementById('abrir-menu').addEventListener('click',function(){
    var aberto = document.getElementById('navegacao').classList.toggle('aberto');this.setAttribute('aria-expanded',aberto);
  });
  document.getElementById('alternar-tema').addEventListener('click', alternarTema);
  aplicarTema();
  atualizarContador();
}
function encontrarProduto(id) {
  for(var i=0;i<produtos.length;i++){
    if(produtos[i].id===Number(id)){
      return produtos[i];
    }
  }
  return null;
}
function atualizarContador() {
  var total=0;
  for(var i=0;i<carrinho.length;i++){
    total+=carrinho[i].quantidade;
  }
  document.getElementById('contador').textContent=total;
}
function adicionarCarrinho(id,quantidade) {
  var produto = encontrarProduto(id);
  if(!produto || !produto.ativo){
    aviso('Produto indisponível.');
    return;
  }
  var encontrado=false;
  for(var i=0;i<carrinho.length;i++){
    if(carrinho[i].id===id){
      carrinho[i].quantidade+=quantidade;
      encontrado=true;
    }
  }
  if(!encontrado){
    carrinho.push({
      id:id,quantidade:quantidade
    });
  }
  salvarDados('pizzet-carrinho',carrinho);
  atualizarContador();
  aviso('Produto a bordo! Adicionado ao carrinho.');
}
function imagemProduto(produto) {
  if (produto.imagem && produto.imagem.indexOf('assets/') === 0) {
    return '<img src="'+escapar(produto.imagem)+'" alt="'+escapar(produto.textoAlternativo || 'Imagem ilustrativa de '+produto.nome)+'" width="1254" height="1254" loading="lazy">';
  }
  if(produto.categoria==='Bebidas'){
    return '<span class="emoji-produto" role="img" aria-label="Bebida ilustrativa">🥤</span>';
  }
  return '<img src="assets/pizza.png" alt="Imagem ilustrativa de pizza; o sabor real é descrito abaixo" width="1536" height="1024" loading="lazy">';
}
function tamanhoProduto(produto) {
  if (produto.tamanho) {
    return produto.tamanho;
  }
  if (produto.categoria === 'Bebidas') {
    return 'Garrafa · 2 litros';
  }
  return 'Grande · 35 cm · 8 fatias';
}
function cartaoProduto(produto,indice) {
  return '<article class="cartao"><a href="pizza.html?id='+produto.id+'" class="foto-produto"><span class="selo">'+escapar(produto.selo || produto.categoria)+'</span>'+imagemProduto(produto)+'</a><div class="cartao-corpo"><h3><a href="pizza.html?id='+produto.id+'">'+escapar(produto.nome)+'</a></h3><p>'+escapar(produto.descricao)+'</p><div class="preco-linha"><div><small>'+escapar(tamanhoProduto(produto))+'</small><strong>'+dinheiro(produto.preco)+'</strong></div><button class="adicionar" data-adicionar="'+produto.id+'" aria-label="Adicionar '+escapar(produto.nome)+' ao carrinho">+</button></div></div></article>';
}
function montarHome() {
  var beneficios=[['🚀','Entrega na velocidade da luz','Quentinha na sua órbita'],['🍕','Ingredientes selecionados','Qualidade de outro planeta'],['⭐','Sabores exclusivos','Uma descoberta a cada fatia'],['👽','Experiência intergaláctica','Do primeiro clique à última fatia']];
  var lista='';
  for(var i=0;i<beneficios.length;i++){
    lista+='<div class="beneficio"><span class="icone" aria-hidden="true">'+beneficios[i][0]+'</span><div><strong>'+beneficios[i][1]+'</strong><small>'+beneficios[i][2]+'</small></div></div>';
  }
  var cards='';
  var ativos=produtos.filter(function(produto){
    return produto.ativo && produto.imagem;
  });
  if (ativos.length < 3) {
    ativos = produtos.filter(function(produto) { return produto.ativo; });
  }
  for(var j=0;j<Math.min(3,ativos.length);j++){
    cards+=cartaoProduto(ativos[j],j);
  }
  conteudo.innerHTML='<div class="home-cenario"><img class="hero-fundo" src="assets/hero.png" alt="Mascote alienígena astronauta saboreando pizza no espaço"><section class="hero"><div class="container hero-conteudo"><span class="etiqueta">Houston, encontramos a pizza perfeita.</span><h1>A PIZZA MAIS<br><span>RÁPIDA DA<br>GALÁXIA.</span></h1><p>Pizzas artesanais, ingredientes selecionados<br>e uma entrega que desafia a gravidade.<br>Prepare-se para uma viagem de sabor.</p><a class="botao" href="cardapio.html">Explorar o cardápio <span>↗</span></a><div class="hero-info"><span class="estrelas">★★★★★</span><span><strong>4,9/5</strong> · aprovação intergaláctica*</span></div></div></section><div class="container"><section class="beneficios" aria-label="Por que escolher PizzET">'+lista+'</section><section class="secao"><div class="secao-topo"><div><span class="etiqueta">As estrelas do nosso universo</span><h2>Favoritas da galáxia</h2></div><a class="link-verde" href="cardapio.html">Ver todo o cardápio ↗</a></div><div class="grade">'+cards+'</div><p class="aviso-demo">*Avaliação, produtos e preços fictícios. Imagens de pizza ilustrativas.</p></section><section class="convite"><div><span class="etiqueta">Embarque nessa experiência</span><h2>Seu próximo destino: uma pizza incrível.</h2><p>Escolha seu sabor. A gente cuida da viagem.</p></div><a class="botao" href="cardapio.html">Fazer meu pedido ↗</a></section></div></div>';
}
function inicioPagina(titulo,descricao) {
  return '<div class="container pagina"><header class="pagina-topo"><span class="etiqueta">PizzET · delivery intergaláctico</span><h1>'+titulo+'</h1><p class="subtitulo">'+descricao+'</p></header>';
}
function montarCardapio() {
  conteudo.innerHTML=inicioPagina('Cardápio','Encontre seu próximo sabor favorito. Pizzas grandes com 8 fatias.')+'<label class="busca">Buscar no universo PizzET<input id="busca" type="search" placeholder="Buscar pizzas, ingredientes..."></label><div class="filtros" role="group" aria-label="Categorias">'+['Todas','Tradicionais','Especiais','Doces','Bebidas'].map(function(categoria){
    return '<button class="filtro '+(categoria==='Todas'?'ativo':'')+'" data-categoria="'+categoria+'" aria-pressed="'+(categoria==='Todas')+'">'+categoria+'</button>';
  }).join('')+'</div><div class="grade" id="lista-produtos"></div><p class="aviso-demo">Catálogo e preços fictícios. Imagens ilustrativas dos produtos.</p></div>';
  filtrarProdutos();
  document.getElementById('busca').addEventListener('input',filtrarProdutos);
}
function filtrarProdutos() {
  var busca=document.getElementById('busca').value.toLocaleLowerCase('pt-BR');
  var html='';
  for(var i=0;i<produtos.length;i++){
    var produto=produtos[i];
    if(produto.ativo && (categoriaAtual==='Todas'||produto.categoria===categoriaAtual) && (produto.nome+' '+produto.descricao).toLocaleLowerCase('pt-BR').indexOf(busca)!==-1){
      html+=cartaoProduto(produto,i);
    }
  }
  document.getElementById('lista-produtos').innerHTML=html || '<p>Nenhum produto encontrado. Tente outro sabor.</p>';
}
function montarPizza() {
  var id=new URLSearchParams(location.search).get('id') || '101';
  var produto=encontrarProduto(id);
  if(!produto || !produto.ativo){
    conteudo.innerHTML=inicioPagina('Produto não encontrado','Esse sabor não está disponível.')+'<a class="botao" href="cardapio.html">Voltar ao cardápio</a></div>';
    return;
  }
  conteudo.innerHTML=inicioPagina(escapar(produto.nome),'Conheça os detalhes do seu próximo sabor favorito.')+'<p><a class="link-verde" href="cardapio.html">← Voltar ao cardápio</a></p><div class="duas-colunas"><div class="detalhe-img">'+imagemProduto(produto).replace(' loading="lazy"','')+'</div><section class="detalhe-info"><span class="badge">'+escapar(produto.categoria)+'</span><h2>'+(produto.categoria==='Bebidas'?'Sobre a bebida':'Ingredientes e tamanho')+'</h2><p>'+escapar(produto.descricao)+'</p><p>'+escapar(tamanhoProduto(produto))+'</p><div class="preco-grande">'+dinheiro(produto.preco)+'</div><div class="linha"><span>Quantidade</span><div class="quantidade"><button data-detalhe="-1" aria-label="Diminuir quantidade">−</button><span id="quantidade-pizza">1</span><button data-detalhe="1" aria-label="Aumentar quantidade">+</button></div></div><p></p><button class="botao" id="adicionar-detalhe">'+icone('carrinho')+'Adicionar ao carrinho</button><p class="aviso-demo">Imagem ilustrativa. Produto e ingredientes fictícios. Consulte a equipe sobre alergênicos em uma operação real.</p></section></div></div>';
  document.getElementById('adicionar-detalhe').addEventListener('click',function(){
    adicionarCarrinho(produto.id,quantidadePizza);
  });
}
function subtotalCarrinho() {
  var total=0;
  for(var i=0;i<carrinho.length;i++){
    var produto=encontrarProduto(carrinho[i].id);
    if(produto){
      total+=produto.preco*carrinho[i].quantidade;
    }
  }
  return total;
}
function resumoCarrinho(botao) {
  var subtotal=subtotalCarrinho();
  return '<aside class="painel resumo"><h2>Resumo da missão</h2><p>Subtotal <span>'+dinheiro(subtotal)+'</span></p><p>Taxa de entrega <span>'+dinheiro(5.90)+'</span></p><p class="total"><strong>Total</strong><strong>'+dinheiro(subtotal+5.90)+'</strong></p>'+botao+'<p class="aviso-demo">Simulação escolar. Nenhuma cobrança será realizada.</p></aside>';
}
function vazio(titulo,texto) {
  return '<div class="painel vazio"><h2>'+titulo+'</h2><p>'+texto+'</p><a class="botao" href="cardapio.html">Explorar o cardápio ↗</a></div>';
}
function montarCarrinho() {
  var html=inicioPagina('Meu carrinho','Sua tripulação de sabores está quase pronta para decolar.');
  if(carrinho.length===0){
    conteudo.innerHTML=html+vazio('Sua nave está vazia','Adicione uma pizza para começar sua missão.')+'</div>';
    return;
  }
  var itens='';
  for(var i=0;i<carrinho.length;i++){
    var item=carrinho[i];
    var produto=encontrarProduto(item.id);
    if(!produto){
      continue;
    }
    itens+='<article class="item-carrinho"><div>'+imagemProduto(produto)+'</div><div><h3>'+escapar(produto.nome)+'</h3><span>'+dinheiro(produto.preco)+'</span></div><div class="quantidade"><button data-quantidade="'+item.id+'" data-valor="-1" aria-label="Diminuir '+escapar(produto.nome)+'">−</button><span>'+item.quantidade+'</span><button data-quantidade="'+item.id+'" data-valor="1" aria-label="Aumentar '+escapar(produto.nome)+'">+</button></div><button class="excluir" data-remover="'+item.id+'" aria-label="Remover '+escapar(produto.nome)+'">✕</button></article>';
  }
  conteudo.innerHTML=html+'<div class="duas-colunas"><section class="painel">'+itens+'<p></p><a class="link-verde" href="cardapio.html">← Continuar comprando</a></section>'+resumoCarrinho('<a class="botao" href="checkout.html">Finalizar pedido →</a>')+'</div></div>';
}
function campo(nome,titulo,tipo,valor,extra) {
  return '<label>'+titulo+'<input name="'+nome+'" type="'+(tipo||'text')+'" value="'+escapar(valor||'')+'" '+(extra||'required maxlength="120"')+'></label>';
}
function montarCheckout() {
  if(!carrinho.length){
    conteudo.innerHTML=inicioPagina('Checkout','Adicione produtos antes de continuar.')+vazio('Nada a bordo','Seu carrinho está vazio.')+'</div>';
    return;
  }
  conteudo.innerHTML=inicioPagina('Checkout','Última etapa antes da decolagem. Use somente dados fictícios nesta demonstração.')+'<form id="form-checkout" class="duas-colunas"><section class="painel"><h2>Dados de entrega</h2>'+campo('nome','Nome do destinatário','text',usuario?usuario.nome:'')+campo('endereco','Rua e número','text','')+campo('complemento','Complemento (opcional)','text','','maxlength="100"')+'<div class="campos">'+campo('bairro','Bairro')+campo('cidade','Cidade')+'</div>'+campo('cep','CEP','text','','required pattern="[0-9]{5}-?[0-9]{3}" placeholder="00000-000" inputmode="numeric" maxlength="9"')+'<h3>Pagamento demonstrativo</h3><label><input type="radio" name="pagamento" value="Pix" checked> Pix (simulado)</label><label><input type="radio" name="pagamento" value="Cartão na entrega"> Cartão na entrega (simulado)</label><label><input type="radio" name="pagamento" value="Dinheiro na entrega"> Dinheiro na entrega (simulado)</label><label>Observações (opcional)<textarea name="observacoes" maxlength="300" placeholder="Ex.: tocar a campainha"></textarea></label></section>'+resumoCarrinho('<button class="botao" type="submit">Confirmar pedido demonstrativo ✓</button>')+'</form></div>';
  document.getElementById('form-checkout').addEventListener('submit',finalizarPedido);
}
function finalizarPedido(evento) {
  evento.preventDefault();
  if(!carrinho.length){
    aviso('Carrinho vazio.');
    return;
  }
  for(var i=0;i<carrinho.length;i++){
    var produto=encontrarProduto(carrinho[i].id);
    if(!produto||!produto.ativo){
      aviso('Um produto ficou indisponível. Remova-o do carrinho.');
      return;
    }
  }
  var dados=new FormData(evento.target);
  var itens=[];
  for(var j=0;j<carrinho.length;j++){
    var pizza=encontrarProduto(carrinho[j].id);
    itens.push({
      nome:pizza.nome,quantidade:carrinho[j].quantidade,preco:pizza.preco
    });
  }
  var pedido={
    id:'PZ'+Date.now(),data:new Date().toLocaleString('pt-BR'),itens:itens,total:Math.round((subtotalCarrinho()+5.90)*100)/100,status:0,nome:dados.get('nome'),endereco:dados.get('endereco')+', '+dados.get('bairro')+', '+dados.get('cidade'),cep:dados.get('cep'),complemento:dados.get('complemento'),pagamento:dados.get('pagamento'),observacoes:dados.get('observacoes')
  };
  // INTEGRAÇÃO C#: POST /api/pedidos. A API deverá recalcular o total e retornar o ID.
  pedidos.unshift(pedido);
  salvarDados('pizzet-pedidos',pedidos);
  carrinho=[];
  salvarDados('pizzet-carrinho',carrinho);
  location.href='confirmacao.html?id='+pedido.id;
}
function pedidoSelecionado() {
  var id=new URLSearchParams(location.search).get('id');
  if(!id){
    return pedidos[0]||null;
  }
  for(var i=0;i<pedidos.length;i++){
    if(pedidos[i].id===id){
      return pedidos[i];
    }
  }
  return null;
}
function montarConfirmacao() {
  var pedido=pedidoSelecionado();
  if(!pedido){
    conteudo.innerHTML=inicioPagina('Nenhum pedido encontrado','Finalize um pedido demonstrativo para ver a confirmação.')+vazio('Vamos começar?','Escolha seu sabor favorito.')+'</div>';
    return;
  }
  conteudo.innerHTML=inicioPagina('Pedido confirmado','Sua missão foi registrada neste navegador.')+'<section class="painel sucesso"><div class="sucesso-icone">✓</div><h2>Pedido realizado<br>com sucesso!</h2><p>Seu pedido <strong>#'+escapar(pedido.id)+'</strong> foi registrado neste navegador.</p><p>Total: '+dinheiro(pedido.total)+' · '+escapar(pedido.pagamento)+'</p><a class="botao" href="rastreamento.html?id='+pedido.id+'">Acompanhar pedido →</a><a class="botao secundario" href="cardapio.html">Voltar ao cardápio</a><p class="aviso-demo">Pedido fictício. Não houve cobrança ou envio à cozinha.</p></section></div>';
}
function montarConta(cadastro) {
  conteudo.innerHTML=inicioPagina(cadastro?'Criar conta':'Entrar na sua conta',cadastro?'Embarque no universo PizzET.':'Acesse sua base de comando pessoal.')+'<form id="form-conta" class="painel formulario">'+marca()+'<p class="aviso-demo">Acesso demonstrativo. Use e-mail e senha fictícios. Nenhuma autenticação real é realizada.</p><br>'+(cadastro?campo('nome','Nome completo'):'')+campo('email','E-mail','email','', 'required autocomplete="email" maxlength="120"')+(cadastro?campo('telefone','Telefone','tel','','required pattern="[0-9() +\\-]{10,16}" placeholder="(11) 99999-9999" maxlength="16"'):'')+campo('senha','Senha fictícia','password','','required minlength="6" maxlength="100" autocomplete="'+(cadastro?'new-password':'current-password')+'"')+(cadastro?campo('confirmar','Confirmar senha','password','','required minlength="6" maxlength="100" autocomplete="new-password"'):'')+'<label><input id="mostrar-senha" type="checkbox"> Mostrar senha</label><button class="botao" type="submit">'+(cadastro?'Cadastrar':'Entrar na demonstração')+'</button><p>'+(cadastro?'Já tem uma conta? <a href="login.html">Entrar</a>':'Não tem uma conta? <a href="cadastro.html">Cadastre-se</a>')+'</p></form></div>';
  document.getElementById('mostrar-senha').addEventListener('change',function(){
    var senhas=document.querySelectorAll('[name="senha"], [name="confirmar"]');for(var i=0;i<senhas.length;i++){
      senhas[i].type=this.checked?'text':'password';
    }
  });
  document.getElementById('form-conta').addEventListener('submit',function(evento){
    evento.preventDefault();var dados=new FormData(this);if(cadastro && dados.get('senha')!==dados.get('confirmar')){
      aviso('As senhas precisam ser iguais.');return;
    }
    usuario={
      nome:cadastro?dados.get('nome'):'Explorador PizzET',email:dados.get('email'),telefone:cadastro?dados.get('telefone'):''
    };salvarDados('pizzet-usuario',usuario);location.href='perfil.html';
  });
}
function montarPerfil() {
  if(!usuario){
    conteudo.innerHTML=inicioPagina('Minha conta','Entre na demonstração para editar seu perfil.')+'<a class="botao" href="login.html">Entrar</a> <a class="botao secundario" href="cadastro.html">Criar conta</a></div>';
    return;
  }
  conteudo.innerHTML=inicioPagina('Olá, '+escapar(usuario.nome)+'!','Sua base de comando pessoal. Perfil fictício salvo neste navegador.')+'<div class="duas-colunas"><form class="painel" id="form-perfil"><h2>Meus dados</h2>'+campo('nome','Nome','text',usuario.nome)+campo('email','E-mail','email',usuario.email)+campo('telefone','Telefone','tel',usuario.telefone,'maxlength="16"')+'<button class="botao">Salvar alterações</button></form><aside class="painel"><h2>Sua conta</h2><p><a class="link-verde" href="meus-pedidos.html">Ver meus pedidos →</a></p><p><a class="link-verde" href="rastreamento.html">Acompanhar último pedido →</a></p><button class="botao secundario" id="sair">Sair da demonstração</button><p class="aviso-demo">Os pedidos são compartilhados por este navegador e não estão vinculados a uma conta autenticada.</p></aside></div></div>';
  document.getElementById('form-perfil').addEventListener('submit',function(evento){
    evento.preventDefault();var dados=new FormData(this);usuario={
      nome:dados.get('nome'),email:dados.get('email'),telefone:dados.get('telefone')
    };salvarDados('pizzet-usuario',usuario);montarPerfil();aviso('Perfil atualizado.');
  });
  document.getElementById('sair').addEventListener('click',function(){
    usuario=null;salvarDados('pizzet-usuario',null);location.href='login.html';
  });
}
function montarPedidos() {
  var html=inicioPagina('Meus pedidos','Histórico demonstrativo deste navegador.');
  if(!pedidos.length){
    conteudo.innerHTML=html+vazio('Nenhuma missão por aqui','Faça seu primeiro pedido demonstrativo.')+'</div>';
    return;
  }
  for(var i=0;i<pedidos.length;i++){
    var pedido=pedidos[i];
    html+='<article class="painel pedido"><div class="linha"><h3>#'+escapar(pedido.id)+'</h3><span class="badge">'+statusPedidos[pedido.status]+'</span></div><p>'+escapar(pedido.data)+' · '+dinheiro(pedido.total)+'</p><details><summary>Ver itens do pedido</summary><ul>'+pedido.itens.map(function(item){
      return '<li>'+item.quantidade+' × '+escapar(item.nome)+' · '+dinheiro(item.preco*item.quantidade)+'</li>';
    }).join('')+'</ul></details><p></p><a class="link-verde" href="rastreamento.html?id='+pedido.id+'">Acompanhar missão →</a></article>';
  }
  conteudo.innerHTML=html+'</div>';
}
function montarRastreamento() {
  var pedido=pedidoSelecionado();
  if(!pedido){
    conteudo.innerHTML=inicioPagina('Acompanhar pedido','Nenhum pedido encontrado.')+vazio('Sua missão ainda não começou','Faça um pedido para acompanhar as etapas.')+'</div>';
    return;
  }
  var descricoes=['Pedido confirmado neste navegador.','Sua pizza está sendo preparada.','Sua pizza está pronta para a viagem.','A caminho do endereço informado.','Missão concluída. Bom apetite!'];
  var etapas='';
  for(var i=0;i<statusPedidos.length;i++){
    etapas+='<li '+(i<=pedido.status?'class="feita"':'')+'><strong>'+statusPedidos[i]+'</strong><small>'+descricoes[i]+'</small></li>';
  }
  conteudo.innerHTML=inicioPagina('Acompanhar pedido','Cada etapa da sua missão intergaláctica.')+'<div class="duas-colunas"><section class="painel"><h2>Pedido #'+escapar(pedido.id)+'</h2><p>'+escapar(pedido.data)+'</p><ol class="etapas">'+etapas+'</ol><button class="botao secundario" id="simular-etapa" '+(pedido.status===4?'disabled':'')+'>Simular próxima etapa →</button></section><aside class="painel"><h2>Destino da missão</h2><p>'+escapar(pedido.nome)+'<br>'+escapar(pedido.endereco)+'</p><p>Total: '+dinheiro(pedido.total)+'</p><p class="aviso-demo">Rastreamento fictício, sem localização real. Use o botão para avançar; a administração também pode alterar o status.</p><a class="link-verde" href="meus-pedidos.html">Ver todos os pedidos →</a></aside></div></div>';
  document.getElementById('simular-etapa').addEventListener('click',function(){
    if(pedido.status<4){
      pedido.status++;salvarDados('pizzet-pedidos',pedidos);montarRastreamento();
    }
  });
}
function montarSobre() {
  conteudo.innerHTML=inicioPagina('De outro planeta. Feita aqui.','Conheça o universo PizzET.')+'<div class="duas-colunas"><section class="painel texto"><span class="etiqueta">Nossa história fictícia</span><h2>Uma missão movida a pizza.</h2><p>Quando nosso pequeno explorador chegou à Terra, descobriu algo que nenhuma outra galáxia tinha: pizza quentinha, feita com carinho. Assim nasceu a PizzET.</p><p>Nosso universo mistura receitas artesanais, ingredientes selecionados e uma boa dose de imaginação. Da massa à última fatia, cada detalhe faz parte da viagem.</p><h3>Sobre este projeto</h3><p>Este site é um projeto escolar de Front-End desenvolvido com HTML5, CSS3 e JavaScript puro. Marca, produtos, história e operações são demonstrativos.</p><a class="botao" href="cardapio.html">Descobrir os sabores ↗</a></section><div class="detalhe-img"><img src="assets/sobre-cozinha-pizzet.png" alt="Alienígena chef preparando uma pizza em frente à pizzaria espacial PizzET" width="1448" height="1086"></div></div></div>';
}
function montarContato() {
  conteudo.innerHTML=inicioPagina('Entre em contato','Abra um canal com nossa base de comando.')+'<div class="duas-colunas"><form class="painel" id="form-contato"><h2>Envie uma mensagem</h2>'+campo('nome','Nome')+campo('email','E-mail','email')+'<label>Assunto<select name="assunto"><option>Dúvida sobre o cardápio</option>Pedido</option>Sugestão</option>Outro assunto</option></select></label><label>Mensagem<textarea name="mensagem" required minlength="10" maxlength="1000"></textarea></label><button class="botao" type="submit">Simular envio →</button></form><aside class="painel"><h2>Base terrestre</h2><p>Rua da Galáxia, 42 · Planeta Terra<br>Endereço fictício</p><h3>Horário de missão</h3><p>Terça a domingo · 18h às 23h<br>Horários demonstrativos</p><p class="aviso-demo">Este formulário apenas confirma a demonstração na tela. A mensagem não é enviada nem armazenada.</p></aside></div></div>';
  document.getElementById('form-contato').addEventListener('submit',function(evento){
    evento.preventDefault();this.reset();aviso('Simulação concluída. Nenhuma mensagem foi enviada.');
  });
}
function estruturaAdmin(titulo,corpo) {
  return inicioPagina(titulo,'Base administrativa · demonstração local.')+'<div class="admin-layout"><aside class="painel barra-admin"><small>BASE ADMINISTRATIVA<br>Demonstração pública</small>'+[['admin','Dashboard'],['admin-produtos','Produtos'],['admin-pedidos','Pedidos']].map(function(item){
    return '<a '+(pagina===item[0]?'class="ativo" aria-current="page"':'')+' href="'+item[0]+'.html">'+item[1]+'</a>';
  }).join('')+'<a href="index.html">← Voltar à loja</a></aside><section><p class="aviso-demo">Área fictícia sem autenticação. Alterações afetam somente este navegador. A API C# deverá proteger as rotas administrativas.</p>'+corpo+'</section></div></div>';
}
function montarDashboard() {
  var total=0;
  var andamento=0;
  for(var i=0;i<pedidos.length;i++){
    total+=pedidos[i].total;
    if(pedidos[i].status<4){
      andamento++;
    }
  }
  conteudo.innerHTML=estruturaAdmin('Dashboard','<div class="metricas"><div class="painel metrica">Pedidos locais<strong>'+pedidos.length+'</strong></div><div class="painel metrica">Em andamento<strong>'+andamento+'</strong></div><div class="painel metrica">Total simulado<strong>'+dinheiro(total)+'</strong></div></div><section class="painel"><h2>Sua base está pronta.</h2><p>'+produtos.filter(function(produto){
    return produto.ativo;
  }).length+' produtos ativos no cardápio demonstrativo.</p><a class="botao" href="admin-produtos.html">Gerenciar produtos →</a> <a class="botao secundario" href="admin-pedidos.html">Ver pedidos</a></section><section class="painel editor"><h3>Órbita de vendas · exemplo visual</h3><div class="vendas" role="img" aria-label="Gráfico ilustrativo de vendas fictícias, sem relação com os pedidos"><span style="height:25%"></span><span style="height:45%"></span><span style="height:35%"></span><span style="height:65%"></span><span style="height:55%"></span><span style="height:85%"></span><span style="height:95%"></span></div><p class="aviso-demo">Gráfico apenas ilustrativo. Os indicadores acima são calculados pelos pedidos locais.</p></section>');
}
function montarAdminProdutos() {
  conteudo.innerHTML=estruturaAdmin('Produtos','<button class="botao" id="novo-produto">+ Novo produto</button><section id="editor-produto" class="editor"></section><label class="busca">Buscar produto<input id="busca-admin" type="search" placeholder="Nome do produto..."></label><div class="painel tabela-container"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody id="tabela-produtos"></tbody></table></div>');
  tabelaProdutos();
  document.getElementById('novo-produto').addEventListener('click',function(){
    editarProduto(null);
  });
  document.getElementById('busca-admin').addEventListener('input',tabelaProdutos);
}
function tabelaProdutos() {
  var busca=document.getElementById('busca-admin').value.toLowerCase();
  var html='';
  for(var i=0;i<produtos.length;i++){
    var produto=produtos[i];
    if(produto.nome.toLowerCase().indexOf(busca)===-1){
      continue;
    }
    html+='<tr><td>'+escapar(produto.nome)+'</td><td>'+escapar(produto.categoria)+'</td><td>'+dinheiro(produto.preco)+'</td><td><span class="badge">'+(produto.ativo?'Ativo':'Inativo')+'</span></td><td><button class="botao secundario pequeno" data-editar="'+produto.id+'">Editar</button><button class="excluir" data-desativar="'+produto.id+'">'+(produto.ativo?'Desativar':'Ativar')+'</button></td></tr>';
  }
  document.getElementById('tabela-produtos').innerHTML=html||'<tr><td colspan="5">Nenhum produto encontrado.</td></tr>';
}
function editarProduto(id) {
  var produto=id?encontrarProduto(id):{
    nome:'',categoria:'Tradicionais',preco:'',descricao:''
  };
  var imagens = '<option value="">Imagem padrão</option>';
  for (var i = 0; i < novosProdutos.length; i++) {
    var opcao = novosProdutos[i];
    imagens += '<option value="'+escapar(opcao.imagem)+'" '+(produto.imagem === opcao.imagem ? 'selected' : '')+'>'+escapar(opcao.nome)+'</option>';
  }
  document.getElementById('editor-produto').innerHTML='<form class="painel" id="form-produto"><h2>'+(id?'Editar produto':'Novo produto')+'</h2>'+campo('nome','Nome','text',produto.nome)+'<div class="campos"><label>Categoria<select name="categoria">'+['Tradicionais','Especiais','Doces','Bebidas'].map(function(categoria){
    return '<option '+(categoria===produto.categoria?'selected':'')+'>'+categoria+'</option>';
  }).join('')+'</select></label>'+campo('preco','Preço (R$)','number',produto.preco,'required min="0.01" max="9999" step="0.01"')+'</div>'+campo('tamanho','Tamanho ou volume','text',tamanhoProduto(produto),'required maxlength="80"')+'<label>Imagem ilustrativa<select name="imagem">'+imagens+'</select></label>'+campo('textoAlternativo','Descrição da imagem','text',produto.textoAlternativo || 'Imagem ilustrativa de '+produto.nome,'maxlength="180"')+'<label>Descrição<textarea name="descricao" required maxlength="300">'+escapar(produto.descricao)+'</textarea></label><button class="botao" type="submit">Salvar produto</button> <button class="botao secundario" type="button" id="cancelar-edicao">Cancelar</button></form>';
  document.getElementById('cancelar-edicao').addEventListener('click',function(){
    document.getElementById('editor-produto').innerHTML='';
  });
  document.getElementById('form-produto').addEventListener('submit',function(evento){
    evento.preventDefault();var dados=new FormData(this);var preco=Number(dados.get('preco'));if(!dados.get('nome').trim()||!isFinite(preco)||preco<=0){
      aviso('Preencha um nome e preço válidos.');return;
    }
    if(!id){
      produto={
        id:Date.now(),ativo:true,selo:'Novo na galáxia'
      };produtos.push(produto);
    }
    produto.nome=dados.get('nome').trim();
    produto.categoria=dados.get('categoria');
    produto.preco=preco;
    produto.descricao=dados.get('descricao');
    produto.tamanho=dados.get('tamanho').trim();
    produto.imagem=dados.get('imagem');
    produto.textoAlternativo=dados.get('textoAlternativo');
    salvarDados('pizzet-produtos',produtos);
    document.getElementById('editor-produto').innerHTML='';
    tabelaProdutos();
    aviso('Produto salvo na demonstração.');
  });
  document.getElementById('form-produto').scrollIntoView({
    behavior:'smooth',block:'center'
  });
}
function montarAdminPedidos() {
  var html='';
  if(!pedidos.length){
    html=vazio('Nenhum pedido recebido','Crie um pedido na loja para testar o gerenciamento.');
  }
  for(var i=0;i<pedidos.length;i++){
    var pedido=pedidos[i];
    html+='<article class="painel pedido"><div class="linha"><h3>#'+escapar(pedido.id)+'</h3><strong>'+dinheiro(pedido.total)+'</strong></div><p>'+escapar(pedido.nome)+' · '+escapar(pedido.data)+'<br>'+escapar(pedido.endereco)+'</p><ul>'+pedido.itens.map(function(item){
      return '<li>'+item.quantidade+' × '+escapar(item.nome)+'</li>';
    }).join('')+'</ul>'+(pedido.observacoes?'<p>Observações: '+escapar(pedido.observacoes)+'</p>':'')+'<label>Status do pedido<select data-status="'+pedido.id+'">'+statusPedidos.map(function(status,indice){
      return '<option value="'+indice+'" '+(indice===pedido.status?'selected':'')+'>'+status+'</option>';
    }).join('')+'</select></label><a class="link-verde" href="rastreamento.html?id='+pedido.id+'">Ver rastreamento →</a></article>';
  }
  conteudo.innerHTML=estruturaAdmin('Gerenciar pedidos',html);
}

// Um único ouvinte atende botões criados dinamicamente com innerHTML.
conteudo.addEventListener('click',function(evento){
  var botao=evento.target.closest('button');
  if(!botao){
    return;
  }
  if(botao.hasAttribute('data-adicionar')){
    adicionarCarrinho(Number(botao.getAttribute('data-adicionar')),1);
  }
  else if(botao.hasAttribute('data-categoria')){
    categoriaAtual=botao.getAttribute('data-categoria');
    var filtros=document.querySelectorAll('.filtro');
    for(var i=0;i<filtros.length;i++){
      var ativo=filtros[i]===botao;
      filtros[i].classList.toggle('ativo',ativo);
      filtros[i].setAttribute('aria-pressed',ativo);
    }
    filtrarProdutos();
  }
  else if(botao.hasAttribute('data-detalhe')){
    quantidadePizza=Math.max(1,Math.min(99,quantidadePizza+Number(botao.getAttribute('data-detalhe'))));
    document.getElementById('quantidade-pizza').textContent=quantidadePizza;
  }
  else if(botao.hasAttribute('data-quantidade')){
    var id=Number(botao.getAttribute('data-quantidade'));
    for(var j=0;j<carrinho.length;j++){
      if(carrinho[j].id===id){
        carrinho[j].quantidade=Math.max(1,Math.min(99,carrinho[j].quantidade+Number(botao.getAttribute('data-valor'))));
      }
    }
    salvarDados('pizzet-carrinho',carrinho);
    atualizarContador();
    montarCarrinho();
  }
  else if(botao.hasAttribute('data-remover')){
    var remover=Number(botao.getAttribute('data-remover'));
    carrinho=carrinho.filter(function(item){
      return item.id!==remover;
    });
    salvarDados('pizzet-carrinho',carrinho);
    atualizarContador();
    montarCarrinho();
  }
  else if(botao.hasAttribute('data-editar')){
    editarProduto(Number(botao.getAttribute('data-editar')));
  }
  else if(botao.hasAttribute('data-desativar')){
    var produto=encontrarProduto(botao.getAttribute('data-desativar'));
    produto.ativo=!produto.ativo;
    salvarDados('pizzet-produtos',produtos);
    tabelaProdutos();
    aviso(produto.ativo?'Produto ativado.':'Produto desativado.');
  }
});
conteudo.addEventListener('change',function(evento){
  if(evento.target.hasAttribute('data-status')){
    var id=evento.target.getAttribute('data-status');for(var i=0;i<pedidos.length;i++){
      if(pedidos[i].id===id){
        pedidos[i].status=Number(evento.target.value);
      }
    }
    salvarDados('pizzet-pedidos',pedidos);aviso('Status atualizado.');
  }
});

montarEstrutura();
if(pagina==='index'){
  montarHome();
}
else if(pagina==='cardapio'){
  montarCardapio();
}
else if(pagina==='pizza'){
  montarPizza();
}
else if(pagina==='carrinho'){
  montarCarrinho();
}
else if(pagina==='checkout'){
  montarCheckout();
}
else if(pagina==='confirmacao'){
  montarConfirmacao();
}
else if(pagina==='login'){
  montarConta(false);
}
else if(pagina==='cadastro'){
  montarConta(true);
}
else if(pagina==='perfil'){
  montarPerfil();
}
else if(pagina==='meus-pedidos'){
  montarPedidos();
}
else if(pagina==='rastreamento'){
  montarRastreamento();
}
else if(pagina==='sobre'){
  montarSobre();
}
else if(pagina==='contato'){
  montarContato();
}
else if(pagina==='admin'){
  montarDashboard();
}
else if(pagina==='admin-produtos'){
  montarAdminProdutos();
}
else if(pagina==='admin-pedidos'){
  montarAdminPedidos();
}
