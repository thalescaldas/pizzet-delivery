namespace PizzET.Api.Infra;

/// <summary>
/// Proteção contra CSRF (um site malicioso tentando usar o cookie do usuário).
///
/// Toda requisição que ALTERA dados na API (POST, PUT, PATCH, DELETE) precisa do
/// cabeçalho "X-PizzET-Csrf: 1". O nosso Front-End sempre envia esse cabeçalho.
/// Um site de terceiros não consegue enviá-lo: o navegador bloqueia cabeçalhos
/// personalizados em requisições para outra origem, a menos que o CORS permita.
/// Somado ao cookie SameSite=Lax, isso impede o ataque.
/// </summary>
public class ProtecaoCsrfMiddleware
{
    public const string NomeCabecalho = "X-PizzET-Csrf";
    private readonly RequestDelegate _proximo;

    public ProtecaoCsrfMiddleware(RequestDelegate proximo)
    {
        _proximo = proximo;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        bool ehApi = contexto.Request.Path.StartsWithSegments("/api");
        bool alteraDados = !HttpMethods.IsGet(contexto.Request.Method)
                           && !HttpMethods.IsHead(contexto.Request.Method)
                           && !HttpMethods.IsOptions(contexto.Request.Method);

        if (ehApi && alteraDados && !contexto.Request.Headers.ContainsKey(NomeCabecalho))
        {
            contexto.Response.StatusCode = StatusCodes.Status400BadRequest;
            await contexto.Response.WriteAsJsonAsync(new
            {
                title = "Requisição recusada.",
                status = 400,
                detail = $"Cabeçalho {NomeCabecalho} ausente."
            });
            return;
        }

        await _proximo(contexto);
    }
}
