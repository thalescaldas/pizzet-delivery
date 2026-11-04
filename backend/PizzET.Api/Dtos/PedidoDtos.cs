using System.ComponentModel.DataAnnotations;

namespace PizzET.Api.Dtos;

/// <summary>
/// POST /api/pedidos — o navegador envia SÓ o que o cliente escolheu:
/// produtos, quantidades, endereço e forma de pagamento.
/// Preços e totais são calculados no servidor (nunca confiamos no navegador).
/// </summary>
public class CriarPedidoRequest
{
    [Required(ErrorMessage = "Escolha um endereço de entrega.")]
    public int? EnderecoId { get; set; }

    [Required(ErrorMessage = "Escolha a forma de pagamento.")]
    public string FormaPagamento { get; set; } = "";

    [Required(ErrorMessage = "O carrinho está vazio.")]
    [MinLength(1, ErrorMessage = "O carrinho está vazio.")]
    [MaxLength(30, ErrorMessage = "Pedido com itens demais.")]
    public List<ItemPedidoRequest> Itens { get; set; } = new List<ItemPedidoRequest>();
}

public class ItemPedidoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Produto inválido.")]
    public int ProdutoId { get; set; }

    [Range(1, 20, ErrorMessage = "A quantidade de cada item deve ser de 1 a 20.")]
    public int Quantidade { get; set; }
}

public class PedidoResposta
{
    public int Id { get; set; }
    public string Status { get; set; } = "";
    public string FormaPagamento { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal TaxaEntrega { get; set; }
    public decimal Total { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
    public EnderecoResposta Entrega { get; set; } = new EnderecoResposta();
    public List<ItemPedidoResposta> Itens { get; set; } = new List<ItemPedidoResposta>();

    /// <summary>Preenchido apenas para o administrador.</summary>
    public string? ClienteNome { get; set; }

    /// <summary>Próximos status permitidos (usado pelo painel do administrador).</summary>
    public List<string> ProximosStatus { get; set; } = new List<string>();
}

public class ItemPedidoResposta
{
    public int ProdutoId { get; set; }
    public string Nome { get; set; } = "";
    public decimal PrecoUnitario { get; set; }
    public int Quantidade { get; set; }
    public decimal Subtotal { get; set; }
}

/// <summary>PATCH /api/admin/pedidos/{id}/status</summary>
public class AlterarStatusRequest
{
    [Required(ErrorMessage = "Informe o novo status.")]
    public string Status { get; set; } = "";
}
