namespace PizzET.Api.Domain;

/// <summary>
/// Define quais mudanças de status são permitidas.
///
///   Recebido -> Em preparo -> Saiu para entrega -> Entregue
///      |             |
///      +-------------+--> Cancelado
///
/// Entregue e Cancelado são finais: não mudam mais.
/// </summary>
public static class RegrasStatusPedido
{
    private static readonly Dictionary<StatusPedido, List<StatusPedido>> Permitidas = new()
    {
        [StatusPedido.Recebido] = new List<StatusPedido> { StatusPedido.EmPreparo, StatusPedido.Cancelado },
        [StatusPedido.EmPreparo] = new List<StatusPedido> { StatusPedido.SaiuParaEntrega, StatusPedido.Cancelado },
        [StatusPedido.SaiuParaEntrega] = new List<StatusPedido> { StatusPedido.Entregue },
        [StatusPedido.Entregue] = new List<StatusPedido>(),
        [StatusPedido.Cancelado] = new List<StatusPedido>()
    };

    public static bool PodeMudar(StatusPedido atual, StatusPedido novo)
    {
        return Permitidas[atual].Contains(novo);
    }

    public static List<StatusPedido> ProximosPossiveis(StatusPedido atual)
    {
        return new List<StatusPedido>(Permitidas[atual]);
    }
}
