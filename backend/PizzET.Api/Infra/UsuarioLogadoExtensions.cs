using System.Security.Claims;

namespace PizzET.Api.Infra;

/// <summary>Atalho para descobrir o id do usuário logado a partir do cookie de autenticação.</summary>
public static class UsuarioLogadoExtensions
{
    public static int ObterUsuarioId(this ClaimsPrincipal usuario)
    {
        string? valor = usuario.FindFirstValue(ClaimTypes.NameIdentifier);
        if (valor == null || !int.TryParse(valor, out int id))
        {
            throw new InvalidOperationException("Usuário não autenticado.");
        }
        return id;
    }
}
