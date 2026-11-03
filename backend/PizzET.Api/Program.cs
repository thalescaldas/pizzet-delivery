using Microsoft.EntityFrameworkCore;
using PizzET.Api.Data;
using PizzET.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------
// 1. Conexão com o MySQL
// A connection string NUNCA fica no repositório. Ela vem de:
//   - desenvolvimento: dotnet user-secrets (ver backend/README.md)
//   - produção: variável de ambiente ConnectionStrings__Pizzet
// ---------------------------------------------------------------------
string? connectionString = builder.Configuration.GetConnectionString("Pizzet");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'Pizzet' não configurada. Veja backend/README.md (dotnet user-secrets).");
}

builder.Services.AddDbContext<PizzetDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 16))));

// ---------------------------------------------------------------------
// 2. Serviços da aplicação (regras de negócio)
// AddScoped = uma instância nova por requisição HTTP
// ---------------------------------------------------------------------
builder.Services.AddScoped<ProdutoService>();

// ---------------------------------------------------------------------
// 3. Controllers e documentação Swagger (só em desenvolvimento)
// ---------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddProblemDetails();   // erros no formato padrão JSON, sem stack trace
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler();   // em produção, erro inesperado vira 500 genérico
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
