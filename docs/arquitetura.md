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
Recomendação inicial para simplificar: a própria API serve os arquivos de `frontend/` como estáticos (`UseStaticFiles` apontando para a pasta). Assim front e API ficam na **mesma origem**, evitando CORS e simplificando cookies. Se no deploy o front ficar no FTP e a API em outro host, ativa-se CORS restrito (ver §6).

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
    ├── 03_consultas_demo.sql # consultas para apresentação
    └── der/                  # DER exportado
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
| Identity (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`…) | id, email, password_hash, nome, telefone | hash gerado pelo Identity |
| `produtos` | id PK, nome, descricao, categoria, preco DECIMAL(10,2), imagem_url, ativo, criado_em | CHECK preco > 0; índice em nome/categoria |
| `enderecos` | id PK, usuario_id FK, cep, logradouro, numero, complemento, bairro, cidade, uf | índice em usuario_id |
| `pedidos` | id PK, usuario_id FK, status, subtotal, taxa_entrega, total, forma_pagamento, entrega_* (snapshot), criado_em, atualizado_em | índice em (usuario_id, criado_em) e status |
| `itens_pedido` | id PK, pedido_id FK, produto_id FK, nome_produto (snapshot), preco_unitario, quantidade | CHECK quantidade > 0 |

O DER definitivo será produzido na Fase 2.

## 6. Autenticação e segurança

**Estratégia:** ASP.NET Core Identity com **cookie de autenticação** (não JWT). Motivos: senhas com hash pelo Identity, cookie `HttpOnly` não é lido por JavaScript (protege contra roubo por XSS), e é mais simples de explicar.

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

- Páginas HTML separadas; cada uma carrega `tema.js`, `api.js` e seu script.
- Temas via variáveis CSS (`:root` e `[data-theme="dark"]`), preferência em `localStorage`, padrão segue `prefers-color-scheme`.
- Carrinho guardado em `localStorage` com **apenas** `produtoId` e `quantidade`; preços exibidos são buscados da API e o total oficial vem da resposta do pedido.
- Máscaras simples em JS puro (telefone, CEP); campos numéricos com `inputmode="numeric"` e filtragem que não bloqueia teclas de navegação/edição.
- Visual final só após o protótipo Figma aprovado (P-09, P-17).
