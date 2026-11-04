using System.ComponentModel.DataAnnotations;

namespace PizzET.Api.Dtos;

/// <summary>
/// Dados de um produto devolvidos pela API ao Front-End.
/// Usamos um DTO em vez da entidade para controlar exatamente o que sai.
/// </summary>
public class ProdutoResposta
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Descricao { get; set; } = "";
    public string Categoria { get; set; } = "";   // "TRADICIONAL", "ESPECIAL", "PREMIUM", "DOCE" ou "BEBIDA"
    public decimal Preco { get; set; }
    public string? ImagemUrl { get; set; }

    /// <summary>Só aparece com valor "false" na listagem do administrador.</summary>
    public bool Ativo { get; set; }
}

/// <summary>Criar ou editar produto (somente administrador).</summary>
public class ProdutoRequest
{
    [Required(ErrorMessage = "Informe o nome.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome com 2 a 100 caracteres.")]
    public string Nome { get; set; } = "";

    [StringLength(500, ErrorMessage = "Descrição com no máximo 500 caracteres.")]
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "Informe a categoria.")]
    public string Categoria { get; set; } = "";

    [Range(typeof(decimal), "0.01", "9999.99", ErrorMessage = "Preço deve ficar entre R$ 0,01 e R$ 9.999,99.")]
    public decimal Preco { get; set; }

    [StringLength(255)]
    [RegularExpression(Padroes.ImagemUrl, ErrorMessage = "Imagem deve ser assets/arquivo.webp ou um endereço https://")]
    public string? ImagemUrl { get; set; }

    public bool Ativo { get; set; } = true;
}
