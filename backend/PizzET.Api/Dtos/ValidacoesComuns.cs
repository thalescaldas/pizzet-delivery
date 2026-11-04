using System.ComponentModel.DataAnnotations;
using PizzET.Api.Domain;

namespace PizzET.Api.Dtos;

/// <summary>
/// Atributo de validação: aceita o valor com ou sem máscara, mas exige a quantidade
/// certa de dígitos. Ex.: [Digitos(8, 8)] aceita "70040-010" e "70040010".
/// </summary>
public class DigitosAttribute : ValidationAttribute
{
    private readonly int _minimo;
    private readonly int _maximo;

    public DigitosAttribute(int minimo, int maximo)
    {
        _minimo = minimo;
        _maximo = maximo;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string texto || string.IsNullOrWhiteSpace(texto))
        {
            return ValidationResult.Success;   // obrigatoriedade é verificada pelo [Required]
        }

        int quantidade = ValidadorCpf.SomenteDigitos(texto).Length;
        bool soTemDigitosEMascara = texto.All(c => char.IsDigit(c) || c is '.' or '-' or '(' or ')' or ' ');
        if (!soTemDigitosEMascara || quantidade < _minimo || quantidade > _maximo)
        {
            return new ValidationResult(ErrorMessage ?? $"Informe de {_minimo} a {_maximo} dígitos.");
        }
        return ValidationResult.Success;
    }
}

/// <summary>Valida o CPF pelos dígitos verificadores.</summary>
public class CpfAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string texto || string.IsNullOrWhiteSpace(texto))
        {
            return ValidationResult.Success;
        }
        return ValidadorCpf.EhValido(texto) ? ValidationResult.Success : new ValidationResult("CPF inválido.");
    }
}

/// <summary>Expressões regulares reaproveitadas pelos DTOs.</summary>
public static class Padroes
{
    /// <summary>Nome: letras (com acento), espaço, apóstrofo e hífen; começa com letra.</summary>
    public const string Nome = @"^\p{L}[\p{L} '\-]*$";

    /// <summary>UF: duas letras.</summary>
    public const string Uf = "^[A-Za-z]{2}$";

    /// <summary>Imagem: arquivo da pasta assets do front ou endereço https.</summary>
    public const string ImagemUrl = @"^(assets/[A-Za-z0-9_\-.]+|https://\S+)$";
}
