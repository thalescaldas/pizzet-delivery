using Microsoft.AspNetCore.Identity;

namespace PizzET.Api.Domain;

/// <summary>
/// Usuário do sistema (tabela "usuarios"). Herda do IdentityUser, que já traz
/// e-mail, hash da senha, telefone (PhoneNumber), bloqueio por tentativas etc.
/// Aqui acrescentamos apenas o que é próprio da PizzET.
/// </summary>
public class Usuario : IdentityUser<int>
{
    public string Nome { get; set; } = "";

    /// <summary>CPF somente com dígitos. Só o admin criado pelo seed pode ficar sem CPF.</summary>
    public string? Cpf { get; set; }

    public DateTime CriadoEm { get; set; }
}

/// <summary>Nomes dos papéis (perfis de acesso), iguais aos da tabela "papeis".</summary>
public static class Papeis
{
    public const string Cliente = "Cliente";
    public const string Administrador = "Administrador";
}
