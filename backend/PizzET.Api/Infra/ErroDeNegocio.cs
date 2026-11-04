namespace PizzET.Api.Infra;

/// <summary>
/// Erro "esperado" de regra de negócio (ex.: produto inativo, transição de status inválida).
/// Os serviços lançam este erro; o TratadorDeErros o transforma em resposta HTTP
/// com a mensagem em português para o Front-End mostrar.
/// </summary>
public class ErroDeNegocio : Exception
{
    public int StatusHttp { get; }
    public string? Campo { get; }

    public ErroDeNegocio(string mensagem, int statusHttp = StatusCodes.Status400BadRequest, string? campo = null)
        : base(mensagem)
    {
        StatusHttp = statusHttp;
        Campo = campo;
    }

    public static ErroDeNegocio NaoEncontrado(string mensagem) => new(mensagem, StatusCodes.Status404NotFound);
    public static ErroDeNegocio Conflito(string mensagem, string? campo = null) => new(mensagem, StatusCodes.Status409Conflict, campo);
}

/// <summary>Converte ErroDeNegocio em resposta JSON padrão (ProblemDetails).</summary>
public class TratadorDeErrosMiddleware
{
    private readonly RequestDelegate _proximo;

    public TratadorDeErrosMiddleware(RequestDelegate proximo)
    {
        _proximo = proximo;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _proximo(contexto);
        }
        catch (ErroDeNegocio erro)
        {
            contexto.Response.StatusCode = erro.StatusHttp;
            var corpo = new Dictionary<string, object?>
            {
                ["title"] = erro.Message,
                ["status"] = erro.StatusHttp
            };
            if (erro.Campo != null)
            {
                corpo["errors"] = new Dictionary<string, string[]> { [erro.Campo] = new[] { erro.Message } };
            }
            await contexto.Response.WriteAsJsonAsync(corpo);
        }
    }
}
