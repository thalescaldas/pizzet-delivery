using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;
using PizzET.Api.Services;

namespace PizzET.Api.Controllers;

/// <summary>CRUD dos endereços do usuário logado.</summary>
[ApiController]
[Route("api/enderecos")]
[Authorize]
public class EnderecosController : ControllerBase
{
    private readonly EnderecoService _enderecos;

    public EnderecosController(EnderecoService enderecos)
    {
        _enderecos = enderecos;
    }

    [HttpGet]
    public async Task<ActionResult<List<EnderecoResposta>>> Listar()
        => Ok(await _enderecos.ListarAsync(User.ObterUsuarioId()));

    [HttpPost]
    public async Task<ActionResult<EnderecoResposta>> Criar(EnderecoRequest dados)
    {
        EnderecoResposta criado = await _enderecos.CriarAsync(User.ObterUsuarioId(), dados);
        return StatusCode(StatusCodes.Status201Created, criado);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EnderecoResposta>> Atualizar(int id, EnderecoRequest dados)
        => Ok(await _enderecos.AtualizarAsync(User.ObterUsuarioId(), id, dados));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        await _enderecos.ExcluirAsync(User.ObterUsuarioId(), id);
        return NoContent();
    }
}
