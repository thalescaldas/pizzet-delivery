using Microsoft.AspNetCore.Identity;
using PizzET.Api.Domain;

namespace PizzET.Api.Data;

/// <summary>
/// Cria a conta de ADMINISTRADOR de desenvolvimento, se ainda não existir.
/// O e-mail e a senha NÃO ficam no código: vêm dos user-secrets
/// (Seed:AdminEmail e Seed:AdminSenha). O cadastro público nunca cria administradores.
/// </summary>
public static class SeedAdmin
{
    public static async Task ExecutarAsync(IServiceProvider servicos, IConfiguration configuracao, ILogger logger)
    {
        string? email = configuracao["Seed:AdminEmail"];
        string? senha = configuracao["Seed:AdminSenha"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(senha))
        {
            logger.LogWarning("Seed do administrador ignorado: configure Seed:AdminEmail e Seed:AdminSenha (user-secrets).");
            return;
        }

        using IServiceScope escopo = servicos.CreateScope();
        var usuarios = escopo.ServiceProvider.GetRequiredService<UserManager<Usuario>>();

        Usuario? admin = await usuarios.FindByEmailAsync(email);
        if (admin == null)
        {
            admin = new Usuario { UserName = email, Email = email, Nome = "Administrador PizzET" };
            IdentityResult criado = await usuarios.CreateAsync(admin, senha);
            if (!criado.Succeeded)
            {
                logger.LogError("Não foi possível criar o administrador: {Erros}",
                    string.Join("; ", criado.Errors.Select(e => e.Description)));
                return;
            }
            logger.LogInformation("Administrador de desenvolvimento criado.");
        }

        if (!await usuarios.IsInRoleAsync(admin, Papeis.Administrador))
        {
            await usuarios.AddToRoleAsync(admin, Papeis.Administrador);
        }
    }
}
