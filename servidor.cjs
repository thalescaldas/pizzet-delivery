// Ferramenta local de visualização; não é o back-end do PizzET.
var http = require('http');
var fs = require('fs');
var path = require('path');
var raiz = __dirname;
var tipos = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
http.createServer(function(requisicao, resposta) {
  var caminho;
  try { caminho = decodeURIComponent(new URL(requisicao.url, 'http://localhost').pathname); }
  catch (erro) { resposta.writeHead(400); resposta.end(); return; }
  if(caminho === '/') { caminho = '/index.html'; }
  var arquivo = path.resolve(raiz, '.' + caminho);
  if(!arquivo.startsWith(raiz + path.sep)) { resposta.writeHead(403); resposta.end(); return; }
  fs.readFile(arquivo, function(erro, conteudo) {
    if(erro) { resposta.writeHead(404); resposta.end('Arquivo nao encontrado'); return; }
    resposta.writeHead(200, {'Content-Type':tipos[path.extname(arquivo)] || 'application/octet-stream'});
    resposta.end(conteudo);
  });
}).listen(8080, '127.0.0.1', function() { console.log('PizzET: http://127.0.0.1:8080'); });
