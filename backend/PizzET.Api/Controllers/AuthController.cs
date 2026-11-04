using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;

namespace PizzET.Api.Controllers;

/// <summary>
/// Cadastro, login e logout. Usa o ASP.NET Identity:
///  - a senha é guardada apenas como HASH (nunca em texto puro);
///  - o login cria um cookie HttpOnly (o JavaScript não consegue lê-lo);
///  - após 5 senhas erradas a conta fica bloqueada por 5 minutos.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<Usuario> _usuarios;
    private readonly SignInManager<Usuario> _login;

    public AuthController(UserManager<Usuario> usuarios, SignInManager<Usuario> login)
    {
        _usuarios = usuarios;
        _login = login;
    }

    /// <summary>POST /api/auth/registrar — cria SEMPRE uma conta de Cliente.</summary>
    [HttpPost("registrar")]
    public async Task<ActionResult<UsuarioResposta>> Registrar(RegistroRequest dados)
    {
        string cpf = ValidadorCpf.SomenteDigitos(dados.Cpf);
        if (await _usuarios.Users.AnyAsync(u => u.Cpf == cpf))
        {
            throw ErroDeNegocio.Conflito("Este CPF já está cadastrado.", "cpf");
        }

        var usuario = new Usuario
        {
            Nome = dados.Nome.Trim(),
            Cpf = cpf,
            Email = dados.Email.Trim(),
            UserName = dados.Email.Trim(),
            PhoneNumber = ValidadorCpf.SomenteDigitos(dados.Telefone)
        };

        IdentityResult criado = await _usuarios.CreateAsync(usuario, dados.Senha);
        if (!criado.Succeeded)
        {
            foreach (IdentityError erro in criado.Errors)
            {
                string campo = erro.Code.StartsWith("Password") ? "senha" : "email";
                if (!ModelState.TryGetValue(campo, out var existente) || existente.Errors.All(e => e.ErrorMessage != erro.Description))
                {
                    ModelState.AddModelError(campo, erro.Description);
                }
            }
            return ValidationProblem(ModelState);
        }

        await _usuarios.AddToRoleAsync(usuario, Papeis.Cliente);
        await _login.SignInAsync(usuario, isPersistent: false);   // já entra logado
        return Ok(await MontarRespostaAsync(usuario));
    }

    /// <summary>POST /api/auth/entrar</summary>
    [HttpPost("entrar")]
    public async Task<ActionResult<UsuarioResposta>> Entrar(LoginRequest dados)
    {
        Usuario? usuario = await _usuarios.FindByEmailAsync(dados.Email.Trim());
        if (usuario == null)
        {
            return Unauthorized(new { title = "E-mail ou senha inválidos." });
        }

        Microsoft.AspNetCore.Identity.SignInResult resultado = await _login.PasswordSignInAsync(usuario, dados.Senha, isPersistent: false, lockoutOnFailure: true);
        if (resultado.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status423Locked,
                new { title = "Muitas tentativas. Aguarde alguns minutos e tente de novo." });
        }
        if (!resultado.Succeeded)
        {
            // Mensagem genérica: não revela se o erro foi no e-mail ou na senha
            return Unauthorized(new { title = "E-mail ou senha inválidos." });
        }
        return Ok(await MontarRespostaAsync(usuario));
    }

    /// <summary>POST /api/auth/sair</summary>
    [HttpPost("sair")]
    [Authorize]
    public async Task<IActionResult> Sair()
    {
        await _login.SignOutAsync();
        return NoContent();
    }

    /// <summary>
    /// GET /api/auth/eu — quem está logado?
    /// Responde 204 (sem conteúdo) quando ninguém está logado. Não usamos 401 aqui porque
    /// esta consulta é feita em TODA abertura do site, e um 401 apareceria como erro no
    /// console do navegador para qualquer visitante (o deploy exige console sem erros).
    /// </summary>
    [HttpGet("eu")]
    public async Task<ActionResult<UsuarioResposta>> Eu()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return NoContent();
        }
        Usuario? usuario = await _usuarios.FindByIdAsync(User.ObterUsuarioId().ToString());
        if (usuario == null)
        {
            return NoContent();
        }
        return Ok(await MontarRespostaAsync(usuario));
    }

    private async Task<UsuarioResposta> MontarRespostaAsync(Usuario usuario)
    {
        return await MontarUsuarioResposta(_usuarios, usuario);
    }

    /// <summary>Também usado pelo PerfilController.</summary>
    public static async Task<UsuarioResposta> MontarUsuarioResposta(UserManager<Usuario> usuarios, Usuario usuario)
    {
        return new UsuarioResposta
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email ?? "",
            Telefone = usuario.PhoneNumber,
            CpfMascarado = MascararCpf(usuario.Cpf),
            EhAdministrador = await usuarios.IsInRoleAsync(usuario, Papeis.Administrador)
        };
    }

    /// <summary>52998224725 -> ***.982.247-** (mostra só o meio, como em comprovantes).</summary>
    private static string? MascararCpf(string? cpf)
    {
        if (cpf == null || cpf.Length != 11)
        {
            return null;
        }
        return $"***.{cpf.Substring(3, 3)}.{cpf.Substring(6, 3)}-**";
    }
}
