# backend/

API do PizzET em **C# / ASP.NET Core 8 (Web API com Controllers)**, usando EF Core + Pomelo para acessar o MySQL.

```
PizzET.Api/
├── Controllers/   recebem as requisições HTTP (ProdutosController)
├── Services/      regras de negócio (ProdutoService)
├── Domain/        entidades e enums (Produto, CategoriaProduto)
├── Dtos/          dados que saem/entram pela API (ProdutoResposta)
├── Data/          PizzetDbContext: mapeia classes ↔ tabelas criadas por database/*.sql
└── Program.cs     configuração e inicialização
```

## Estado atual
Somente os endpoints **públicos** de produtos:

| Método | Rota | Resposta |
|--------|------|----------|
| GET | `/api/produtos?busca=&categoria=` | 200 com a lista de produtos ativos; 400 se a categoria for inválida ou a busca passar de 100 caracteres |
| GET | `/api/produtos/{id}` | 200 com o produto; 404 se não existir ou estiver inativo |

Autenticação, CRUD administrativo, endereços e pedidos ainda **não** existem.

## Pré-requisitos
- .NET 8 SDK (`dotnet --version` deve mostrar 8.x)
- MySQL 8 com os scripts `database/01_schema.sql` e `database/02_dados_demo.sql` já executados
- Usuário do banco `pizzet_app` criado (ver `database/README.md`)

## Configurar a conexão (uma vez por computador)
A connection string fica nos **user-secrets**, fora do repositório. Dentro de `backend/PizzET.Api`:

```bash
dotnet user-secrets set "ConnectionStrings:Pizzet" "Server=localhost;Port=3306;Database=pizzet;User=pizzet_app;Password=SUA_SENHA"
```

Troque `SUA_SENHA` pela senha que você escolheu para o `pizzet_app`. Veja o formato em `appsettings.Development.example.json`.

## Executar
Dentro de `backend/`:

```bash
dotnet build
```

```bash
dotnet run --project PizzET.Api --launch-profile http
```

A API sobe em `http://localhost:5039`. Em desenvolvimento, a documentação interativa (Swagger) fica em `http://localhost:5039/swagger`. O arquivo `PizzET.Api.http` tem requisições prontas para testar no VS Code (extensão REST Client) ou no Visual Studio.

No perfil `http` aparece o aviso `Failed to determine the https port for redirect`. Ele é esperado e não impede o funcionamento.
