namespace PizzET.Api.Domain;

/// <summary>
/// Um item do cardápio (pizza ou bebida). Corresponde à tabela "produtos".
/// Produtos não são apagados: são desativados (Ativo = false).
/// </summary>
public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Descricao { get; set; } = "";
    public CategoriaProduto Categoria { get; set; }
    public decimal Preco { get; set; }
    public string? ImagemUrl { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
