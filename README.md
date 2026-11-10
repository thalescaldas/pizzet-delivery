# PizzET — Front-End escolar

Site de delivery com temática extraterrestre, inspirado em `referencia/PizzET_ Pizza Delivery Intergaláctica.png`. Usa HTML5, CSS3 e JavaScript puro, sem frameworks e sem bibliotecas no código do site.

## Como executar

Abra o terminal nesta pasta e execute:

```text
node servidor.cjs
```

Abra http://127.0.0.1:8080 no navegador. Para encerrar, pressione Ctrl+C no terminal. Também é possível usar a extensão Live Server do VS Code. Prefira HTTP: abrir arquivos por `file://` pode mudar o comportamento do localStorage entre páginas.

`servidor.cjs` é apenas uma ferramenta estática para visualizar os arquivos. Não implementa API, autenticação, pagamentos ou banco. Não é necessário npm install. As fontes do Google são opcionais; sem internet o CSS usa Arial.

## Organização dos arquivos

O site tem modo claro e escuro. O botão de lua/sol no cabeçalho alterna os temas e salva a escolha em `localStorage`, na chave `pizzet-tema`. O modo claro é o padrão quando não há preferência salva. `js/tema.js` aplica a escolha antes do CSS; `css/tema-claro.css` reúne as diferenças visuais. A imagem `assets/hero-claro.png` é a versão clara do cenário, preservando a original escura.

Para a prova, entenda também `aplicarTema()` (atualiza o atributo `data-tema`, a cor do navegador e o botão) e `alternarTema()` (troca a variável com `if/else`, aplica e salva). Seletores como `[data-tema="claro"]` ativam as cores claras no CSS.

O site tem modo claro e escuro. O botão de lua/sol no cabeçalho alterna os temas e salva a escolha em `localStorage`, na chave `pizzet-tema`. O modo claro é o padrão quando não há preferência salva. `js/tema.js` aplica a escolha antes do CSS; `css/tema-claro.css` reúne as diferenças visuais. A imagem `assets/hero-claro.png` é a versão clara do cenário, preservando a original escura.

Para a prova, entenda também `aplicarTema()` (atualiza o atributo `data-tema`, a cor do navegador e o botão) e `alternarTema()` (troca a variável com `if/else`, aplica e salva). Seletores como `[data-tema="claro"]` ativam as cores claras no CSS.

| Arquivo/pasta | Responsabilidade |
|---|---|
| `index.html` | Home |
| `cardapio.html` | Busca e categorias |
| `pizza.html?id=1` | Detalhes do produto selecionado |
| `carrinho.html` | Quantidades, remoção e total |
| `checkout.html` | Formulário de entrega e pagamento simulado |
| `confirmacao.html` | Confirmação do pedido local |
| `login.html` / `cadastro.html` | Entrada demonstrativa e cadastro |
| `perfil.html` | Edição dos dados fictícios e saída |
| `meus-pedidos.html` / `rastreamento.html` | Histórico e etapas do pedido |
| `sobre.html` / `contato.html` | Apresentação e contato simulado |
| `admin.html` | Indicadores locais e gráfico ilustrativo |
| `admin-produtos.html` | Criar, editar, ativar e desativar produtos |
| `admin-pedidos.html` | Consultar pedidos e alterar status |
| `css/style.css` | Cores, tipografia, componentes e responsividade |
| `js/dados.js` | Dados fictícios, leitura/gravação local e pontos da futura API |
| `js/script.js` | Montagem das páginas e interações |
| `assets/` | Imagens geradas para este projeto |
| `referencia/` | Protótipo original, preservado |
| `backup/projeto-anterior/` | Cópia dos arquivos originais, que estavam vazios |
| `capturas/` | Home desktop/mobile e relatório dos testes |
| `criar-paginas.cjs` | Ferramenta usada para gerar os 16 HTMLs iniciais |
| `verificar.cjs` | Testes de desenvolvimento; não é carregado pelo site |

Cada HTML identifica sua página com `data-pagina` no elemento `body`. Os scripts são carregados com `defer`: executam depois que o HTML foi lido. O cabeçalho, rodapé e conteúdo são montados pelo JavaScript para evitar copiar a mesma navegação 16 vezes. Portanto, este exercício precisa de JavaScript habilitado.

## Roteiro para testar na apresentação

1. Home → Cardápio: busque “calabresa”, filtre categorias e abra uma pizza.
2. Aumente a quantidade e adicione ao carrinho. Volte ao cardápio e adicione outro produto.
3. No carrinho, altere quantidades, remova um item e confira subtotal + R$ 5,90 de entrega.
4. Finalize usando **apenas dados fictícios**. O checkout valida campos e CEP; não coleta número de cartão.
5. Na confirmação, acompanhe o pedido. Use “Simular próxima etapa” para avançar o rastreamento.
6. Abra Meus pedidos e consulte os itens. A lista começa vazia até o primeiro pedido.
7. Cadastre um perfil fictício; a confirmação da senha deve ser igual à senha. Edite o perfil e saia.
8. No rodapé, abra Admin demo. Crie/edite um produto, desative-o e veja a mudança no cardápio.
9. Em Gerenciar pedidos, altere o status e confira a mudança no rastreamento.
10. No celular, teste o menu, formulários e a rolagem interna da tabela de produtos.

## JavaScript para entender para a prova

Comece por estas funções, nesta ordem:

1. **`dinheiro(valor)`**: recebe um número e retorna texto em reais. Diferencie o valor numérico do texto formatado.
2. **`encontrarProduto(id)`**: percorre um array com `for`; usa `if` para comparar IDs e `return` para devolver o produto.
3. **`lerDados(chave, padrao)` e `salvarDados(chave, valor)`**, em `dados.js`: `localStorage` guarda texto; `JSON.stringify` transforma objetos em texto e `JSON.parse` faz o caminho inverso. `try/catch` trata falhas de leitura ou gravação.
4. **`montarEstrutura()`**: encontra elementos com `getElementById`, monta trechos usando `innerHTML` e conecta o menu com `addEventListener`. `classList.toggle` abre/fecha o menu.
5. **`filtrarProdutos()`**: lê o campo de busca pelo `.value`, percorre produtos e combina condições com `&&` e `||`. `indexOf` verifica se o texto procurado aparece no nome/descrição.
6. **`adicionarCarrinho(id, quantidade)`**: procura um item existente; soma sua quantidade ou usa `push` para adicionar um novo objeto. Depois persiste e atualiza a interface.
7. **`subtotalCarrinho()`**: usa uma variável acumuladora; soma `preço × quantidade` para cada produto.
8. **`finalizarPedido(evento)`**: `preventDefault()` evita o envio tradicional do formulário; `FormData` lê campos; cria um objeto pedido, salva e navega com `location.href`.
9. **`montarRastreamento()`**: percorre os status e aplica uma classe conforme o índice da etapa atual.
10. **`editarProduto(id)`**: reutiliza o mesmo formulário para criar e editar; valida nome/preço e atualiza o array.

Também saiba explicar:

- **`var`** declara variáveis; funções tradicionais agrupam tarefas; parâmetros são os dados de entrada.
- **Array** representa uma lista; **objeto** reúne propriedades de um item.
- **`if/else`** escolhe o comportamento conforme uma condição.
- **DOM** é a representação do HTML que o JavaScript consegue consultar e modificar.
- O ouvinte de clique no final de `script.js` usa **delegação de eventos**: `closest('button')` identifica o botão e `data-*` informa a ação e o ID, mesmo para botões criados depois.
- **`filter(function...)`** cria uma lista filtrada; **`map(function...)`** transforma cada item; **`join('')`** une os trechos de texto.
- **`escapar(texto)`** protege os trechos de HTML contra texto digitado que contenha `<`, `>` ou aspas. Não remova ao inserir dados de formulários no `innerHTML`.
- **`URLSearchParams`** lê `?id=...` para saber qual pizza ou pedido mostrar.
- CSS **Grid**, **Flexbox** e **media queries** organizam os elementos e adaptam a interface ao celular.

Exemplo do raciocínio do carrinho: uma pizza de R$ 49,90 com quantidade 2 custa R$ 99,80; com entrega de R$ 5,90, o pedido totaliza R$ 105,70.

## O que é demonstrativo

Todos os produtos, preços, avaliações, endereço da loja e pedidos são fictícios. O catálogo tem 23 produtos: uma bebida original e 22 novidades com imagens próprias em `assets/cardapio/`. As cinco pizzas antigas que repetiam a imagem genérica foram retiradas; todas as imagens são ilustrativas, e os ingredientes estão nas descrições.

## Como acrescentar outro produto

Adicione um objeto em `novosProdutos`, em `js/dados.js`, com `id` único e estável, `nome`, `categoria`, `preco`, `descricao`, `selo`, `ativo`, `imagem`, `textoAlternativo` e `tamanho`. Use uma das categorias existentes: Tradicionais, Especiais, Doces ou Bebidas. O preço deve ser um número; `tamanho` informa, por exemplo, “Grande · 35 cm · 8 fatias” ou “Lata · 350 ml”. Salve a imagem em `assets/cardapio/` e informe esse caminho em `imagem`.

`atualizarCatalogo()` acrescenta os produtos ausentes ao catálogo salvo no navegador e completa os novos campos quando ainda não existem. Ela preserva preços, nomes, status e imagens editados pelo administrador e não apaga carrinho, pedidos, perfil ou tema. Não é necessário limpar o localStorage para receber os novos produtos.

`imagemProduto()` monta a imagem específica, e `tamanhoProduto()` escolhe a informação de tamanho/volume, mantendo compatibilidade com produtos antigos. A administração permite selecionar uma das 22 imagens, editar sua descrição alternativa e informar o tamanho ou volume.

Execute `node verificar-catalogo.cjs`, com o servidor local ativo, para verificar a atualização sem perda dos dados antigos, as imagens, os filtros, um pedido misto e a edição administrativa. O relatório fica em `capturas/verificacao-catalogo.txt`.

Login aceita qualquer e-mail válido e senha fictícia de pelo menos seis caracteres. Não confere credenciais. Cadastro e perfil salvam somente nome, e-mail e telefone; **senhas não são persistidas**. Não há separação real de clientes: os pedidos são compartilhados pelo navegador. O painel administrativo é público e demonstrativo.

O formulário de contato não envia nem salva mensagens. O Pix não gera código de pagamento. Rastreamento não usa GPS ou relógio de entrega: avança manualmente. O gráfico administrativo é ilustrativo, enquanto os números dos indicadores vêm dos pedidos locais.

Para reiniciar os dados de demonstração, abra o console do navegador e execute:

```js
localStorage.removeItem('pizzet-produtos');
localStorage.removeItem('pizzet-carrinho');
localStorage.removeItem('pizzet-pedidos');
localStorage.removeItem('pizzet-usuario');
location.reload();
```

## Integração futura com C# e MySQL

Os comentários `INTEGRAÇÃO` em `js/dados.js` e `js/script.js` identificam os pontos de substituição. Nenhuma chamada de API foi implementada.

| Funcionalidade | Rota sugerida |
|---|---|
| Carregar catálogo | `GET /api/produtos` |
| Carrinho do cliente | `GET/POST /api/carrinho` |
| Cadastrar usuário | `POST /api/usuarios` |
| Login | `POST /api/auth/login` |
| Consultar/atualizar perfil | `GET/PUT /api/usuarios/me` |
| Criar pedido | `POST /api/pedidos` |
| Histórico | `GET /api/pedidos` |
| Rastrear pedido | `GET /api/pedidos/{id}` |
| Criar/editar produto | `POST /api/produtos`, `PUT /api/produtos/{id}` |
| Desativar produto | `PATCH /api/produtos/{id}/status` |
| Alterar etapa | `PATCH /api/pedidos/{id}/status` |
| Contato | `POST /api/contato` |

A API deve consultar o MySQL, autenticar usuários, autorizar administradores, validar os dados e recalcular preços, frete e disponibilidade. O Front-End não deve acessar o MySQL diretamente. Substitua a leitura local por chamadas `fetch` quando estudar requisições assíncronas; dados do navegador não são uma fonte confiável para compras reais.

## Verificação de desenvolvimento

`node verificar-temas.cjs` verifica as 16 páginas nos dois temas, em larguras de 1440, 768, 390 e 320 pixels, além da alternância e persistência. O relatório está em `capturas/verificacao-temas.txt`; as capturas da Home seguem o padrão `home-claro-1440.png` e `home-escuro-390.png`.

`node verificar-temas.cjs` verifica as 16 páginas nos dois temas, em larguras de 1440, 768, 390 e 320 pixels, além da alternância e persistência. O relatório está em `capturas/verificacao-temas.txt`; as capturas da Home seguem o padrão `home-claro-1440.png` e `home-escuro-390.png`.

`capturas/verificacao.txt` registra navegação por todas as páginas em desktop e celular, ausência de rolagem horizontal na página, erros de JavaScript/HTTP locais e os fluxos principais.

O teste `verificar.cjs` usa Playwright instalado no ambiente de desenvolvimento, fora do projeto. Para executá-lo em outra máquina, ajuste `PLAYWRIGHT_PATH` para uma instalação do Playwright e o caminho do Chrome no script. Essa ferramenta não é uma dependência do Front-End. O arquivo `criar-paginas.cjs` só deve ser executado para regenerar os HTMLs, pois sobrescreve suas estruturas iniciais.
