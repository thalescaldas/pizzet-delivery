namespace PizzET.Api.Dtos;

/// <summary>
/// Dados de um produto devolvidos pela API ao Front-End.
/// Usamos um DTO em vez da entidade para controlar exatamente o que sai
/// (ex.: o campo "Ativo" e as datas internas não são expostos ao público).
/// </summary>
public class ProdutoResposta
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Descricao { get; set; } = "";
    public string Categoria { get; set; } = "";   // "PIZZA_SALGADA", "PIZZA_DOCE" ou "BEBIDA"
    public decimal Preco { get; set; }
    public string? ImagemUrl { get; set; }
}
