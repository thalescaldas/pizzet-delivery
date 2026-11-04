using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;
using PizzET.Api.Services;

namespace PizzET.Api.Controllers;

/// <summary>Pedidos do cliente logado: criar (checkout simulado), listar e acompanhar.</summary>
[ApiController]
[Route("api/pedidos")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly PedidoService _pedidos;

    public PedidosController(PedidoService pedidos)
    {
        _pedidos = pedidos;
    }

    [HttpPost]
    public async Task<ActionResult<PedidoResposta>> Criar(CriarPedidoRequest dados)
    {
        PedidoResposta pedido = await _pedidos.CriarAsync(User.ObterUsuarioId(), dados);
        return StatusCode(StatusCodes.Status201Created, pedido);
    }

    [HttpGet]
    public async Task<ActionResult<List<PedidoResposta>>> ListarMeus()
        => Ok(await _pedidos.ListarDoUsuarioAsync(User.ObterUsuarioId()));

    /// <summary>Dono do pedido ou administrador.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PedidoResposta>> Detalhar(int id)
        => Ok(await _pedidos.ObterAsync(id, User.ObterUsuarioId(), User.IsInRole(Papeis.Administrador)));
}
