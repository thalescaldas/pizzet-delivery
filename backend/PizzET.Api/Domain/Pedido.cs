namespace PizzET.Api.Domain;

/// <summary>
/// Pedido de um cliente (tabela "pedidos").
/// O endereço é COPIADO para as propriedades Entrega* no momento da compra (snapshot),
/// e cada item guarda o preço da época. Assim o histórico nunca muda.
/// </summary>
public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public StatusPedido Status { get; set; } = StatusPedido.Recebido;
    public FormaPagamento FormaPagamento { get; set; }

    public decimal Subtotal { get; set; }
    public decimal TaxaEntrega { get; set; }
    public decimal Total { get; set; }

    public string EntregaCep { get; set; } = "";
    public string EntregaLogradouro { get; set; } = "";
    public string EntregaNumero { get; set; } = "";
    public string? EntregaComplemento { get; set; }
    public string EntregaBairro { get; set; } = "";
    public string EntregaCidade { get; set; } = "";
    public string EntregaUf { get; set; } = "";

    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    public List<ItemPedido> Itens { get; set; } = new List<ItemPedido>();
}

/// <summary>Um produto dentro de um pedido (tabela "itens_pedido").</summary>
public class ItemPedido
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public string NomeProduto { get; set; } = "";
    public decimal PrecoUnitario { get; set; }
    public int Quantidade { get; set; }

    /// <summary>Calculado pelo próprio MySQL (preco_unitario * quantidade). Somente leitura.</summary>
    public decimal Subtotal { get; set; }
}
