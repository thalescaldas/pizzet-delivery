// Dados fictícios para o projeto escolar. Nenhuma compra é enviada a um servidor.
var produtosIniciais = [
{
  id:6, nome:'Refrigerante 2 litros', categoria:'Bebidas', preco:12.00, descricao:'Refrigerante de cola, garrafa de 2 litros. Bem gelado!', selo:'Para acompanhar', ativo:true
}
];
var novosProdutos = [
  {
    "id": 101,
    "nome": "Margherita de Marte",
    "categoria": "Tradicionais",
    "preco": 44.9,
    "descricao": "Molho de tomate, mussarela, tomate e manjericão.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/margherita-de-marte.png",
    "textoAlternativo": "Imagem ilustrativa de Margherita de Marte",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 102,
    "nome": "Frango Cósmico",
    "categoria": "Tradicionais",
    "preco": 52.9,
    "descricao": "Frango desfiado, mussarela, requeijão cremoso e milho.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/frango-cosmico.png",
    "textoAlternativo": "Imagem ilustrativa de Frango Cósmico",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 103,
    "nome": "Portuguesa Orbital",
    "categoria": "Tradicionais",
    "preco": 54.9,
    "descricao": "Mussarela, presunto, ovo, cebola, pimentão e azeitonas.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/portuguesa-orbital.png",
    "textoAlternativo": "Imagem ilustrativa de Portuguesa Orbital",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 104,
    "nome": "Bacon de Saturno",
    "categoria": "Especiais",
    "preco": 56.9,
    "descricao": "Mussarela, bacon crocante, milho e cebola roxa.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/bacon-de-saturno.png",
    "textoAlternativo": "Imagem ilustrativa de Bacon de Saturno",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 105,
    "nome": "Pepperoni Supernova",
    "categoria": "Especiais",
    "preco": 59.9,
    "descricao": "Molho de tomate, mussarela e pepperoni.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/pepperoni-supernova.png",
    "textoAlternativo": "Imagem ilustrativa de Pepperoni Supernova",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 106,
    "nome": "Vegetariana de Vênus",
    "categoria": "Especiais",
    "preco": 54.9,
    "descricao": "Mussarela, brócolis, champignon, tomate e azeitonas.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/vegetariana-de-venus.png",
    "textoAlternativo": "Imagem ilustrativa de Vegetariana de Vênus",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 107,
    "nome": "Brócolis Nebulosa",
    "categoria": "Tradicionais",
    "preco": 52.9,
    "descricao": "Mussarela, brócolis, alho dourado e requeijão cremoso.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/brocolis-nebulosa.png",
    "textoAlternativo": "Imagem ilustrativa de Brócolis Nebulosa",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 108,
    "nome": "Camarão Estelar",
    "categoria": "Especiais",
    "preco": 79.9,
    "descricao": "Mussarela, camarão, requeijão cremoso e alho-poró.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/camarao-estelar.png",
    "textoAlternativo": "Imagem ilustrativa de Camarão Estelar",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 109,
    "nome": "Carne Seca de Júpiter",
    "categoria": "Especiais",
    "preco": 69.9,
    "descricao": "Mussarela, carne seca, cebola roxa e requeijão cremoso.",
    "selo": "Novidade da galáxia",
    "ativo": true,
    "imagem": "assets/cardapio/carne-seca-de-jupiter.png",
    "textoAlternativo": "Imagem ilustrativa de Carne Seca de Júpiter",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 110,
    "nome": "Brigadeiro Meteoro",
    "categoria": "Doces",
    "preco": 42.9,
    "descricao": "Chocolate ao leite e granulado.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/brigadeiro-meteoro.png",
    "textoAlternativo": "Imagem ilustrativa de Brigadeiro Meteoro",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 111,
    "nome": "Morango Via Láctea",
    "categoria": "Doces",
    "preco": 49.9,
    "descricao": "Chocolate branco e morangos.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/morango-via-lactea.png",
    "textoAlternativo": "Imagem ilustrativa de Morango Via Láctea",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 112,
    "nome": "Banana Eclipse",
    "categoria": "Doces",
    "preco": 39.9,
    "descricao": "Banana, açúcar, canela e doce de leite.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/banana-eclipse.png",
    "textoAlternativo": "Imagem ilustrativa de Banana Eclipse",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 113,
    "nome": "Romeu e Julieta Lunar",
    "categoria": "Doces",
    "preco": 42.9,
    "descricao": "Mussarela e goiabada cremosa.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/romeu-e-julieta-lunar.png",
    "textoAlternativo": "Imagem ilustrativa de Romeu e Julieta Lunar",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 114,
    "nome": "Órbita de Avelã",
    "categoria": "Doces",
    "preco": 54.9,
    "descricao": "Creme de avelã, morangos e chocolate picado.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/orbita-de-avela.png",
    "textoAlternativo": "Imagem ilustrativa de Órbita de Avelã",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 115,
    "nome": "Cometa de Cookies",
    "categoria": "Doces",
    "preco": 49.9,
    "descricao": "Chocolate branco, biscoito de chocolate e gotas de chocolate.",
    "selo": "Uma órbita de doçura",
    "ativo": true,
    "imagem": "assets/cardapio/cometa-de-cookies.png",
    "textoAlternativo": "Imagem ilustrativa de Cometa de Cookies",
    "tamanho": "Grande · 35 cm · 8 fatias"
  },
  {
    "id": 116,
    "nome": "Refrigerante de Cola — Lata",
    "categoria": "Bebidas",
    "preco": 6.9,
    "descricao": "Refrigerante de cola tradicional, lata de 350 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/refrigerante-cola-lata.png",
    "textoAlternativo": "Imagem ilustrativa de Refrigerante de Cola — Lata",
    "tamanho": "Lata · 350 ml"
  },
  {
    "id": 117,
    "nome": "Refrigerante de Cola Zero — Lata",
    "categoria": "Bebidas",
    "preco": 6.9,
    "descricao": "Refrigerante de cola sem açúcar, lata de 350 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/refrigerante-cola-zero-lata.png",
    "textoAlternativo": "Imagem ilustrativa de Refrigerante de Cola Zero — Lata",
    "tamanho": "Lata · 350 ml"
  },
  {
    "id": 118,
    "nome": "Refrigerante de Guaraná — 2 L",
    "categoria": "Bebidas",
    "preco": 12.9,
    "descricao": "Refrigerante de guaraná, garrafa de 2 litros.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/refrigerante-guarana-2l.png",
    "textoAlternativo": "Imagem ilustrativa de Refrigerante de Guaraná — 2 L",
    "tamanho": "Garrafa · 2 litros"
  },
  {
    "id": 119,
    "nome": "Suco de Laranja",
    "categoria": "Bebidas",
    "preco": 9.9,
    "descricao": "Suco de laranja, garrafa de 500 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/suco-de-laranja.png",
    "textoAlternativo": "Imagem ilustrativa de Suco de Laranja",
    "tamanho": "Garrafa · 500 ml"
  },
  {
    "id": 120,
    "nome": "Suco de Uva",
    "categoria": "Bebidas",
    "preco": 10.9,
    "descricao": "Suco de uva, garrafa de 500 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/suco-de-uva.png",
    "textoAlternativo": "Imagem ilustrativa de Suco de Uva",
    "tamanho": "Garrafa · 500 ml"
  },
  {
    "id": 121,
    "nome": "Água Mineral",
    "categoria": "Bebidas",
    "preco": 4.9,
    "descricao": "Água mineral sem gás, garrafa de 500 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/agua-mineral.png",
    "textoAlternativo": "Imagem ilustrativa de Água Mineral",
    "tamanho": "Garrafa · 500 ml"
  },
  {
    "id": 122,
    "nome": "Água com Gás",
    "categoria": "Bebidas",
    "preco": 5.9,
    "descricao": "Água mineral com gás, garrafa de 500 ml.",
    "selo": "Para acompanhar",
    "ativo": true,
    "imagem": "assets/cardapio/agua-com-gas.png",
    "textoAlternativo": "Imagem ilustrativa de Água com Gás",
    "tamanho": "Garrafa · 500 ml"
  }
];
produtosIniciais = produtosIniciais.concat(novosProdutos);
var produtos = lerDados('pizzet-produtos', produtosIniciais);
atualizarCatalogo();
var carrinho = lerDados('pizzet-carrinho', []);
var carrinhoAtualizado = carrinho.filter(function(item) {
  if (item.id < 1 || item.id > 5) {
    return true;
  }
  for (var i = 0; i < produtos.length; i++) {
    if (produtos[i].id === item.id) {
      return true;
    }
  }
  return false;
});
if (carrinhoAtualizado.length !== carrinho.length) {
  carrinho = carrinhoAtualizado;
  salvarDados('pizzet-carrinho', carrinho);
}
var pedidos = lerDados('pizzet-pedidos', []);
var usuario = lerDados('pizzet-usuario', null);

// Acrescenta novidades sem apagar produtos editados, carrinho, pedidos ou perfil.
function atualizarCatalogo() {
  if (!Array.isArray(produtos)) {
    produtos = [];
  }
  var mudou = false;
  // Retira as cinco pizzas antigas que compartilhavam a imagem genérica.
  produtos = produtos.filter(function(produto) {
    if (produto.id >= 1 && produto.id <= 5 && (!produto.imagem || produto.imagem === 'assets/pizza.png')) {
      mudou = true;
      return false;
    }
    return true;
  });
  for (var i = 0; i < produtosIniciais.length; i++) {
    var original = produtosIniciais[i];
    var encontrado = false;
    for (var j = 0; j < produtos.length; j++) {
      if (produtos[j].id === original.id || produtos[j].nome === original.nome) {
        encontrado = true;
        var campos = ['imagem', 'textoAlternativo', 'tamanho'];
        for (var k = 0; k < campos.length; k++) {
          var campo = campos[k];
          if (produtos[j][campo] === undefined && original[campo] !== undefined) {
            produtos[j][campo] = original[campo];
            mudou = true;
          }
        }
        break;
      }
    }
    if (!encontrado) {
      produtos.push(original);
      mudou = true;
    }
  }
  if (mudou) {
    salvarDados('pizzet-produtos', produtos);
  }
}

function lerDados(chave, padrao) {
  try {
    var valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  }
  catch (erro) {
    return padrao;
  }
}

function salvarDados(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  }
  catch (erro) {
    alert('Não foi possível salvar no navegador. Verifique o espaço disponível e as permissões.');
  }
}

// INTEGRAÇÃO API C#: substituir a leitura local por GET /api/produtos.
// Carrinho: GET/POST /api/carrinho; pedidos: GET/POST /api/pedidos.
// Login/cadastro: POST /api/auth/login e /api/usuarios. Nunca salvar senhas no localStorage.
// Administração: POST/PUT/DELETE /api/produtos e PATCH /api/pedidos/{id}/status.
// A API deverá validar preços, estoque, usuários e permissões administrativas.
