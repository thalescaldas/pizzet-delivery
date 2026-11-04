using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using PizzET.Api.Data;
using PizzET.Api.Domain;
using PizzET.Api.Infra;
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
// 2. Login com ASP.NET Identity (senhas com hash + papéis)
// ---------------------------------------------------------------------
builder.Services
    .AddIdentity<Usuario, IdentityRole<int>>(opcoes =>
    {
        opcoes.User.RequireUniqueEmail = true;
        opcoes.Password.RequiredLength = 8;
        opcoes.Password.RequireDigit = true;
        opcoes.Password.RequireLowercase = true;
        opcoes.Password.RequireUppercase = false;
        opcoes.Password.RequireNonAlphanumeric = false;
        opcoes.Lockout.MaxFailedAccessAttempts = 5;
        opcoes.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    })
    .AddEntityFrameworkStores<PizzetDbContext>()
    .AddErrorDescriber<ErrosIdentityPtBr>();

// Cookie de autenticação
builder.Services.ConfigureApplicationCookie(opcoes =>
{
    opcoes.Cookie.Name = "PizzET.Auth";
    opcoes.Cookie.HttpOnly = true;                              // JavaScript não lê o cookie
    opcoes.Cookie.SameSite = SameSiteMode.Lax;                  // não é enviado por outros sites em POST
    opcoes.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // em HTTPS, vira "Secure"
    opcoes.ExpireTimeSpan = TimeSpan.FromHours(8);
    opcoes.SlidingExpiration = true;

    // Uma API não redireciona para página de login: responde 401/403 e o Front-End decide.
    opcoes.Events.OnRedirectToLogin = contexto =>
    {
        contexto.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    opcoes.Events.OnRedirectToAccessDenied = contexto =>
    {
        contexto.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

// ---------------------------------------------------------------------
// 3. CORS — só é necessário se o Front-End ficar em OUTRO endereço (deploy separado).
// Em desenvolvimento a própria API serve o Front-End (mesma origem), e a lista fica vazia.
// ---------------------------------------------------------------------
string[] origensPermitidas = builder.Configuration.GetSection("Cors:OrigensPermitidas").Get<string[]>() ?? Array.Empty<string>();
if (origensPermitidas.Length > 0)
{
    builder.Services.AddCors(opcoes => opcoes.AddDefaultPolicy(politica => politica
        .WithOrigins(origensPermitidas)
        .AllowCredentials()
        .AllowAnyHeader()
        .AllowAnyMethod()));
}

// ---------------------------------------------------------------------
// 4. Serviços da aplicação (regras de negócio). AddScoped = um por requisição.
// ---------------------------------------------------------------------
builder.Services.AddScoped<ProdutoService>();
builder.Services.AddScoped<EnderecoService>();
builder.Services.AddScoped<PedidoService>();

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ---------------------------------------------------------------------
// 5. Pipeline: a ordem dos "app.Use..." importa!
// ---------------------------------------------------------------------
app.UseMiddleware<TratadorDeErrosMiddleware>();   // ErroDeNegocio -> resposta JSON

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler();   // erro inesperado vira 500 genérico, sem detalhes internos
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Serve os arquivos do Front-End (pasta ../../frontend) na mesma origem da API.
string pastaFrontend = Path.GetFullPath(
    builder.Configuration["Frontend:Pasta"] ?? Path.Combine(app.Environment.ContentRootPath, "..", "..", "frontend"));
if (Directory.Exists(pastaFrontend))
{
    var arquivos = new PhysicalFileProvider(pastaFrontend);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = arquivos });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = arquivos });
}
else
{
    app.Logger.LogWarning("Pasta do Front-End não encontrada em {Pasta}.", pastaFrontend);
}

if (origensPermitidas.Length > 0)
{
    app.UseCors();
}

app.UseMiddleware<ProtecaoCsrfMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Admin de desenvolvimento (e-mail/senha vindos dos user-secrets)
if (app.Environment.IsDevelopment())
{
    await SeedAdmin.ExecutarAsync(app.Services, app.Configuration, app.Logger);
}

app.Run();
