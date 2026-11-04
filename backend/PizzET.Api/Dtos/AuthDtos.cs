using System.ComponentModel.DataAnnotations;

namespace PizzET.Api.Dtos;

/// <summary>Dados do formulário de cadastro (POST /api/auth/registrar).</summary>
public class RegistroRequest
{
    [Required(ErrorMessage = "Informe seu nome.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "O nome deve ter de 2 a 120 caracteres.")]
    [RegularExpression(Padroes.Nome, ErrorMessage = "O nome deve conter apenas letras.")]
    public string Nome { get; set; } = "";

    [Required(ErrorMessage = "Informe seu CPF.")]
    [Cpf]
    public string Cpf { get; set; } = "";

    [Required(ErrorMessage = "Informe seu telefone.")]
    [Digitos(10, 11, ErrorMessage = "Telefone deve ter DDD + número (10 ou 11 dígitos).")]
    public string Telefone { get; set; } = "";

    [Required(ErrorMessage = "Informe seu e-mail.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    [StringLength(256)]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe uma senha.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "A senha deve ter pelo menos 8 caracteres.")]
    public string Senha { get; set; } = "";
}

/// <summary>POST /api/auth/entrar</summary>
public class LoginRequest
{
    [Required(ErrorMessage = "Informe seu e-mail.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe sua senha.")]
    public string Senha { get; set; } = "";
}

/// <summary>Dados do usuário logado devolvidos ao Front-End (GET /api/auth/eu e /api/perfil).</summary>
public class UsuarioResposta
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Telefone { get; set; }

    /// <summary>CPF parcialmente oculto, ex.: ***.982.247-**</summary>
    public string? CpfMascarado { get; set; }

    public bool EhAdministrador { get; set; }
}

/// <summary>PUT /api/perfil — o usuário só pode alterar o próprio nome e telefone.</summary>
public class PerfilRequest
{
    [Required(ErrorMessage = "Informe seu nome.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "O nome deve ter de 2 a 120 caracteres.")]
    [RegularExpression(Padroes.Nome, ErrorMessage = "O nome deve conter apenas letras.")]
    public string Nome { get; set; } = "";

    [Required(ErrorMessage = "Informe seu telefone.")]
    [Digitos(10, 11, ErrorMessage = "Telefone deve ter DDD + número (10 ou 11 dígitos).")]
    public string Telefone { get; set; } = "";
}
