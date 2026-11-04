using System.ComponentModel.DataAnnotations;

namespace PizzET.Api.Dtos;

/// <summary>Criar ou editar endereço (POST /api/enderecos e PUT /api/enderecos/{id}).</summary>
public class EnderecoRequest
{
    [StringLength(30, ErrorMessage = "Apelido com no máximo 30 caracteres.")]
    public string? Apelido { get; set; }

    [Required(ErrorMessage = "Informe o CEP.")]
    [Digitos(8, 8, ErrorMessage = "CEP deve ter 8 dígitos.")]
    public string Cep { get; set; } = "";

    [Required(ErrorMessage = "Informe a rua.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Rua com 2 a 150 caracteres.")]
    public string Logradouro { get; set; } = "";

    [Required(ErrorMessage = "Informe o número.")]
    [Digitos(1, 6, ErrorMessage = "Número deve ter apenas dígitos (até 6).")]
    public string Numero { get; set; } = "";

    [StringLength(60, ErrorMessage = "Complemento com no máximo 60 caracteres.")]
    public string? Complemento { get; set; }

    [Required(ErrorMessage = "Informe o bairro.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Bairro com 2 a 80 caracteres.")]
    public string Bairro { get; set; } = "";

    [Required(ErrorMessage = "Informe a cidade.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Cidade com 2 a 80 caracteres.")]
    public string Cidade { get; set; } = "";

    [Required(ErrorMessage = "Informe a UF.")]
    [RegularExpression(Padroes.Uf, ErrorMessage = "UF deve ter 2 letras.")]
    public string Uf { get; set; } = "";
}

public class EnderecoResposta
{
    public int Id { get; set; }
    public string Apelido { get; set; } = "";
    public string Cep { get; set; } = "";
    public string Logradouro { get; set; } = "";
    public string Numero { get; set; } = "";
    public string? Complemento { get; set; }
    public string Bairro { get; set; } = "";
    public string Cidade { get; set; } = "";
    public string Uf { get; set; } = "";
}
