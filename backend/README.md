# backend/

API do PizzET em **C# / ASP.NET Core 8 (Web API com Controllers)**, usando EF Core + Pomelo para acessar o MySQL e ASP.NET Identity para login.

```
PizzET.Api/
├── Controllers/   recebem as requisições HTTP (Auth, Perfil, Enderecos, Produtos, Pedidos, Admin)
├── Services/      regras de negócio (ProdutoService, EnderecoService, PedidoService)
├── Domain/        entidades, enums e regras (Produto, Pedido, Usuario, RegrasStatusPedido, ValidadorCpf)
├── Dtos/          dados que entram/saem pela API, com validação
├── Data/          PizzetDbContext (mapeia classes ↔ tabelas de database/*.sql) e SeedAdmin
├── Infra/         proteção CSRF, tratamento de erros, mensagens do Identity em português
└── Program.cs     configuração e inicialização
```

A API também **serve o Front-End** (pasta `../../frontend`): abrindo `http://localhost:5039` você vê o site. Assim site e API ficam na mesma origem, sem CORS e sem cookie de terceiros.

## Endpoints

🔒 = exige login · 👑 = exige papel Administrador · alterações (POST/PUT/PATCH/DELETE) exigem o cabeçalho `X-PizzET-Csrf: 1`.

| Método | Rota | Acesso | Observação |
|--------|------|--------|------------|
| POST | `/api/auth/registrar` | público | cria sempre um **Cliente** e já entra logado |
| POST | `/api/auth/entrar` | público | bloqueia por 5 min após 5 senhas erradas |
| POST | `/api/auth/sair` | 🔒 | |
| GET | `/api/auth/eu` | público | 200 com o usuário, ou **204** se ninguém estiver logado |
| GET/PUT | `/api/perfil` | 🔒 | só nome e telefone do próprio usuário |
| GET/POST | `/api/enderecos` | 🔒 | só os próprios endereços |
| PUT/DELETE | `/api/enderecos/{id}` | 🔒 | 404 se o endereço for de outro usuário |
| GET | `/api/produtos?busca=&categoria=` | público | só ativos; busca ignora acentos |
| GET | `/api/produtos/{id}` | público | 404 se inativo |
| POST | `/api/pedidos` | 🔒 | recebe só ids e quantidades; **preços e total calculados no servidor** |
| GET | `/api/pedidos` | 🔒 | pedidos do próprio cliente |
| GET | `/api/pedidos/{id}` | 🔒 | dono ou 👑 |
| GET/POST | `/api/admin/produtos` | 👑 | lista inclui inativos |
| PUT/DELETE | `/api/admin/produtos/{id}` | 👑 | DELETE = desativar (exclusão lógica) |
| GET | `/api/admin/pedidos?status=` | 👑 | |
| PATCH | `/api/admin/pedidos/{id}/status` | 👑 | transições validadas (`RegrasStatusPedido`) |

Status: `RECEBIDO → EM_PREPARO → SAIU_PARA_ENTREGA → ENTREGUE`. `CANCELADO` só a partir de RECEBIDO ou EM_PREPARO. Taxa de entrega fixa: R$ 7,90.

## Pré-requisitos
- .NET 8 SDK (`dotnet --version` deve mostrar 8.x)
- MySQL 8 com `database/01_schema.sql` e `database/02_dados_demo.sql` executados
- Usuário do banco `pizzet_app` criado (ver `database/README.md`)

## Configurar (uma vez por computador)
Tudo fica nos **user-secrets**, fora do repositório. Dentro de `backend/PizzET.Api`:

```bash
dotnet user-secrets set "ConnectionStrings:Pizzet" "Server=localhost;Port=3306;Database=pizzet;User=pizzet_app;Password=SUA_SENHA_DO_BANCO"
```

Conta de administrador de desenvolvimento, criada automaticamente ao iniciar a API. A senha precisa de 8 ou mais caracteres, com letras minúsculas e números:

```bash
dotnet user-secrets set "Seed:AdminEmail" "admin@pizzet.dev"
```

```bash
dotnet user-secrets set "Seed:AdminSenha" "ESCOLHA_UMA_SENHA"
```

## Executar
Dentro de `backend/`:

```bash
dotnet build
```

```bash
dotnet run --project PizzET.Api --launch-profile http
```

- Site: `http://localhost:5039`
- Documentação interativa (Swagger): `http://localhost:5039/swagger`
- Requisições prontas: `PizzET.Api.http` (VS Code com REST Client, ou Visual Studio)

No perfil `http` aparece o aviso `Failed to determine the https port for redirect`. Ele é esperado e não impede o funcionamento.

## Deploy com Front-End em outro endereço
Se o site for publicado no FTP e a API em outro servidor:
1. Em `frontend/js/config.js`, coloque o endereço público da API.
2. Libere o endereço do site na API com a variável de ambiente `Cors__OrigensPermitidas__0=https://endereco-do-site`.
3. **Atenção:** se os domínios forem diferentes, o cookie de login vira "de terceiros" e pode ser bloqueado pelos navegadores (risco R-01 em `docs/pendencias.md`). O ideal é site e API no mesmo domínio.
