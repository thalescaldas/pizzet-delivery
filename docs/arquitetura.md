# PizzET — Arquitetura

> Documento de **projeto**. Nada aqui está implementado ainda. Decisões marcadas com (P-xx) dependem de [`pendencias.md`](pendencias.md).

## 1. Visão geral

```
┌────────────────────┐   HTTP/JSON (fetch)   ┌──────────────────────────┐   EF Core / SQL   ┌───────────┐
│ Front-End          │ ───────────────────▶ │ API ASP.NET Core (C#)    │ ────────────────▶ │ MySQL 8   │
│ HTML + CSS + JS    │ ◀─────────────────── │ Controllers → Services   │ ◀──────────────── │           │
│ (navegador)        │  cookie de sessão     │ → Persistência           │                   │           │
└────────────────────┘                       └──────────────────────────┘                   └───────────┘
```

- O navegador **nunca** acessa o banco diretamente.
- O Front-End só exibe dados e envia intenções (ex.: "produto 3, quantidade 2"). **Preços, totais, permissões e status são decididos pela API.**

### Hospedagem local (desenvolvimento)
Para simplificar, a própria API serve os arquivos de `frontend/` como estáticos (`UseStaticFiles` apontando para a pasta). Assim front e API ficam na **mesma origem**, o que evita CORS e simplifica cookies.

### Hospedagem pública (deploy avaliado)
O deploy é avaliado por **upload via FileZilla** (ver `deploy.md`). O provável cenário é:

```
Navegador ──HTTPS──▶ Servidor do FTP (arquivos de frontend/)
    └──────HTTPS + CORS──▶ Host da API C# ──▶ MySQL   (host a definir: P-13, P-23)
```

Consequências:
- A URL da API fica em **um único arquivo** (`frontend/js/config.js`), trocado no deploy.
- Todos os caminhos do front são **relativos**, para funcionar em qualquer subpasta do servidor.
- A API libera CORS **apenas** para a origem pública do front.
- Se as origens forem de sites diferentes, a estratégia de autenticação precisa ser revista (ver §6, risco R-01).

## 2. Estrutura de pastas proposta

```
pizzet-delivery/
├── CLAUDE.md                 # instruções permanentes do projeto
├── README.md
├── .gitignore
├── docs/
│   ├── requisitos.md
│   ├── pendencias.md
│   ├── arquitetura.md
│   ├── plano-de-testes.md
│   └── (futuro) deploy.md, der.png, figma.md
├── frontend/
│   ├── index.html            # Home
│   ├── pages/                # login, cadastro, catalogo, carrinho, pedidos, pedido, perfil, admin-*
│   ├── css/                  # base.css (variáveis/temas), layout.css, componentes.css
│   ├── js/
│   │   ├── api.js            # único lugar que chama fetch()
│   │   ├── tema.js           # claro/escuro + localStorage
│   │   ├── mascaras.js       # máscaras e filtro numérico
│   │   ├── carrinho.js       # carrinho (localStorage, só ids/quantidades)
│   │   └── paginas/          # um script por página
│   └── assets/               # logo, ícones, imagens (criados pela equipe)
├── backend/
│   ├── PizzET.sln
│   └── PizzET.Api/
│       ├── Controllers/      # recebem HTTP, chamam serviços
│       ├── Dtos/             # objetos de entrada/saída (não expõem entidades)
│       ├── Domain/           # entidades e regras (Produto, Pedido, StatusPedido…)
│       ├── Services/         # regras de negócio (PedidoService, ProdutoService…)
│       ├── Data/             # DbContext, configurações, seed
│       ├── Program.cs
│       └── appsettings.json  # SEM segredos
└── database/
    ├── 01_schema.sql         # criação de tabelas, PK, FK, índices, restrições
    ├── 02_dados_demo.sql     # produtos de exemplo (sem usuários/senhas)
    ├── 99_testes_restricoes.sql # testes opcionais das restrições
    └── der.md                # DER (apoio; não obrigatório)
```

**Padrão escolhido: Controllers** (em vez de Minimal APIs). Motivo: organização por classe é mais fácil de explicar e conecta diretamente com o conteúdo de orientação a objetos.

## 3. Camadas do back-end

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| Controller | Receber requisição, validar formato, devolver código HTTP | `PedidosController.Criar(CriarPedidoDto)` |
| Service | Regra de negócio | calcular total, validar transição de status |
| Domain | Entidades e enums | `Pedido`, `ItemPedido`, `enum StatusPedido` |
| Data | Acesso ao MySQL | `PizzetDbContext` |

Persistência prevista: **EF Core + provedor MySQL** (P-04, P-08). Se o professor exigir SQL manual, troca-se só a camada Data.

## 4. Módulos e endpoints previstos

Prefixo `/api`. 🔒 = exige login; 👑 = exige papel Administrador.

| Módulo | Método e rota | Acesso |
|--------|---------------|--------|
| Auth | `POST /api/auth/registrar` | público (sempre cria **Cliente**) |
| | `POST /api/auth/entrar` | público |
| | `POST /api/auth/sair` | 🔒 |
| | `GET /api/auth/eu` | 🔒 |
| Produtos | `GET /api/produtos?busca=&categoria=` | público (só ativos) |
| | `GET /api/produtos/{id}` | público |
| | `GET /api/admin/produtos` (inclui inativos) | 👑 |
| | `POST /api/admin/produtos` | 👑 |
| | `PUT /api/admin/produtos/{id}` | 👑 |
| | `DELETE /api/admin/produtos/{id}` (desativa) | 👑 |
| Perfil | `GET /api/perfil`, `PUT /api/perfil` | 🔒 (só o próprio) |
| Endereços | `GET/POST /api/enderecos`, `PUT/DELETE /api/enderecos/{id}` | 🔒 (só os próprios) |
| Pedidos | `POST /api/pedidos` | 🔒 |
| | `GET /api/pedidos` (meus) | 🔒 |
| | `GET /api/pedidos/{id}` | 🔒 dono ou 👑 |
| Admin pedidos | `GET /api/admin/pedidos?status=` | 👑 |
| | `PATCH /api/admin/pedidos/{id}/status` | 👑 |

### Criação de pedido (regra central)
1. Cliente envia `{ enderecoId, itens: [{ produtoId, quantidade }], formaPagamentoSimulada }`.
2. API verifica: endereço pertence ao usuário; produtos existem e estão ativos; quantidade entre 1 e um limite.
3. API busca preços **no banco**, calcula subtotal, taxa de entrega (regra a definir) e total.
4. Grava `pedidos` com snapshot do endereço e `itens_pedido` com `preco_unitario` copiado — em uma transação.
5. Status inicial: **Recebido**. Pagamento: apenas registrado como "simulado/aprovado".

### Status do pedido
```
Recebido ──▶ Em preparo ──▶ Saiu para entrega ──▶ Entregue
   │              │
   └──────────────┴──▶ Cancelado
```
Transições inválidas (ex.: Entregue → Em preparo) retornam `400`/`409`. Implementação simples: um `switch` ou dicionário de transições permitidas no `PedidoService`. (Se cliente pode cancelar enquanto "Recebido": decisão da equipe a registrar.)

## 5. Modelo de dados inicial

| Tabela | Campos principais | Observações |
|--------|-------------------|-------------|
| Identity (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`…) | id, email, password_hash, nome, **cpf** (11 dígitos, sem máscara), telefone | hash gerado pelo Identity; **UNIQUE** em cpf e email |
| `produtos` | id PK, nome, descricao, categoria, preco DECIMAL(10,2), imagem_url, ativo, criado_em | CHECK preco > 0; índice em nome/categoria |
| `enderecos` | id PK, usuario_id FK, cep, logradouro, numero, complemento, bairro, cidade, uf | índice em usuario_id |
| `pedidos` | id PK, usuario_id FK, status, subtotal, taxa_entrega, total, forma_pagamento, entrega_* (snapshot), criado_em, atualizado_em | índice em (usuario_id, criado_em) e status |
| `itens_pedido` | id PK, pedido_id FK, produto_id FK, nome_produto (snapshot), preco_unitario, quantidade | CHECK quantidade > 0 |

**Implementado em `database/01_schema.sql`** (DER em `database/der.md`). Detalhes que diferem da tabela acima:
- Chaves `INT AUTO_INCREMENT`. Na API, o Identity será configurado com chave `int` (`IdentityUser<int>`).
- Tabelas do Identity renomeadas: `usuarios`, `papeis`, `usuarios_papeis`, `usuarios_claims`, `papeis_claims`, `usuarios_logins`, `usuarios_tokens`. As colunas mantêm o nome do framework em snake_case (`password_hash`, `normalized_email`…). O telefone usa a coluna `phone_number` do Identity.
- Enums gravados como texto: categoria `PIZZA_SALGADA | PIZZA_DOCE | BEBIDA`; status `RECEBIDO | EM_PREPARO | SAIU_PARA_ENTREGA | ENTREGUE | CANCELADO`; pagamento simulado `PIX | CARTAO | DINHEIRO`.
- `itens_pedido.subtotal` é uma coluna calculada pelo MySQL (`STORED`), e `pedidos` tem um CHECK `total = subtotal + taxa_entrega`.

**Persistência:** o script SQL é a fonte da verdade. O EF Core mapeia as tabelas existentes (`ToTable`, nomes de coluna em snake_case), **sem migrações**. Rever se P-04/P-08 forem respondidas de outra forma.

## 6. Autenticação e segurança

**Estratégia preferida:** ASP.NET Core Identity com **cookie de autenticação**. Motivos: senhas com hash pelo Identity, o cookie `HttpOnly` não é lido por JavaScript (protege contra roubo por XSS) e é mais simples de explicar.

**Condição (risco R-01):** o cookie só funciona bem se front e API estiverem no **mesmo site** (mesmo domínio ou subdomínios do mesmo domínio). Se o front ficar no servidor do FTP e a API em um domínio de outro serviço, o cookie passa a ser "de terceiros" e muitos navegadores o bloqueiam. Nesse caso a alternativa é usar o **token Bearer do próprio Identity** (`AddIdentityApiEndpoints`, .NET 8+), enviado no cabeçalho `Authorization`. O token fica em `sessionStorage` e a proteção contra XSS vem do uso de `textContent`. A decisão final será tomada quando P-13/P-23 forem respondidas, **antes** de implementar a autenticação.

**Dados pessoais (R-02):** o CPF é validado no servidor (dígitos verificadores) e armazenado só com dígitos. Nunca aparece em logs nem em mensagens de erro. Nos dados de demonstração, usar apenas CPFs fictícios.

| Cuidado | Como |
|---------|------|
| Senhas | Somente hash do Identity; política mínima de senha |
| Cookie | `HttpOnly`, `Secure` (em HTTPS), `SameSite=Lax` (mesma origem) ou `None`+`Secure` se origens diferentes |
| CSRF | Mesma origem + `SameSite=Lax` + exigir `Content-Type: application/json` nas escritas; se houver origens separadas, adicionar token antiforgery |
| Autorização | `[Authorize]` e `[Authorize(Roles = "Administrador")]`; checar dono do recurso no serviço |
| Admin | Criado por seed **só em desenvolvimento**, com senha vinda de user-secrets/variável de ambiente; cadastro público nunca cria admin |
| Preços/totais | Sempre recalculados no servidor; valores vindos do navegador são ignorados |
| Entradas | Validação com DataAnnotations nos DTOs; consultas parametrizadas (EF Core) contra SQL injection |
| XSS | No front, usar `textContent` em vez de `innerHTML` para dados vindos da API |
| Segredos | Connection string via `dotnet user-secrets` ou variável de ambiente `ConnectionStrings__Pizzet`; `appsettings.*.example.json` no repositório |
| CORS | Desligado se mesma origem; se separado, liberar apenas a origem exata do front |
| Erros | Respostas padronizadas (`ProblemDetails`), sem stack trace em produção |
| HTTPS | Obrigatório em produção |

## 7. Front-End

- Páginas HTML separadas; cada uma carrega `config.js`, `tema.js`, `api.js` e seu script.
- **Login e cadastro em modal** com o elemento nativo `<dialog>` (`showModal()`): foco preso dentro do modal, fecha com Esc e devolve o foco ao botão que o abriu. Os botões da navbar abrem os modais em qualquer página (`js/modais-auth.js`). Opcionalmente, `?entrar` na URL abre o login direto, para redirecionar quem tenta finalizar o pedido sem estar logado.
- Máscaras: Nome (letras/acentos/espaço/'/-), CPF `000.000.000-00`, Telefone `(00) 00000-0000`, CEP `00000-000`, UF (2 letras maiúsculas). O valor é enviado **sem máscara** à API, que valida de novo.
- Temas via variáveis CSS (`:root` e `[data-theme="dark"]`), preferência em `localStorage`, padrão segue `prefers-color-scheme`.
- Carrinho guardado em `localStorage` com **apenas** `produtoId` e `quantidade`; preços exibidos são buscados da API e o total oficial vem da resposta do pedido.
- Máscaras simples em JS puro (telefone, CEP); campos numéricos com `inputmode="numeric"` e filtragem que não bloqueia teclas de navegação/edição.
- Figma é **opcional** (P-09 respondida). Recomenda-se um rascunho rápido de paleta, logo e 2–3 telas antes do visual final, para alinhar a dupla.
- Sem erros no console em produção: caminhos relativos, `favicon` presente, nenhum `console.error` em fluxo normal (exigência do EVID-05).
