using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;

namespace PizzET.Api.Controllers;

/// <summary>Dados do PRÓPRIO usuário logado. Não há como alterar outro usuário nem o papel.</summary>
[ApiController]
[Route("api/perfil")]
[Authorize]
public class PerfilController : ControllerBase
{
    private readonly UserManager<Usuario> _usuarios;

    public PerfilController(UserManager<Usuario> usuarios)
    {
        _usuarios = usuarios;
    }

    [HttpGet]
    public async Task<ActionResult<UsuarioResposta>> Obter()
    {
        Usuario usuario = await BuscarUsuarioLogadoAsync();
        return Ok(await AuthController.MontarUsuarioResposta(_usuarios, usuario));
    }

    [HttpPut]
    public async Task<ActionResult<UsuarioResposta>> Atualizar(PerfilRequest dados)
    {
        Usuario usuario = await BuscarUsuarioLogadoAsync();
        usuario.Nome = dados.Nome.Trim();
        usuario.PhoneNumber = ValidadorCpf.SomenteDigitos(dados.Telefone);
        await _usuarios.UpdateAsync(usuario);
        return Ok(await AuthController.MontarUsuarioResposta(_usuarios, usuario));
    }

    private async Task<Usuario> BuscarUsuarioLogadoAsync()
    {
        Usuario? usuario = await _usuarios.FindByIdAsync(User.ObterUsuarioId().ToString());
        return usuario ?? throw ErroDeNegocio.NaoEncontrado("Usuário não encontrado.");
    }
}
