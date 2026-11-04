using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;
using PizzET.Api.Services;

namespace PizzET.Api.Controllers;

/// <summary>
/// Área do ADMINISTRADOR. O atributo [Authorize(Roles = ...)] faz o servidor responder
/// 401 (sem login) ou 403 (logado, mas não é administrador) antes de executar qualquer método.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = Papeis.Administrador)]
public class AdminController : ControllerBase
{
    private readonly ProdutoService _produtos;
    private readonly PedidoService _pedidos;

    public AdminController(ProdutoService produtos, PedidoService pedidos)
    {
        _produtos = produtos;
        _pedidos = pedidos;
    }

    // ===================== PRODUTOS (CRUD) =====================

    /// <summary>GET /api/admin/produtos — inclui os desativados.</summary>
    [HttpGet("produtos")]
    public async Task<ActionResult<List<ProdutoResposta>>> ListarProdutos([FromQuery] string? busca)
        => Ok(await _produtos.ListarTodosAsync(busca));

    [HttpPost("produtos")]
    public async Task<ActionResult<ProdutoResposta>> CriarProduto(ProdutoRequest dados)
        => StatusCode(StatusCodes.Status201Created, await _produtos.CriarAsync(dados));

    [HttpPut("produtos/{id:int}")]
    public async Task<ActionResult<ProdutoResposta>> AtualizarProduto(int id, ProdutoRequest dados)
        => Ok(await _produtos.AtualizarAsync(id, dados));

    /// <summary>DELETE = desativar (exclusão lógica).</summary>
    [HttpDelete("produtos/{id:int}")]
    public async Task<IActionResult> DesativarProduto(int id)
    {
        await _produtos.DesativarAsync(id);
        return NoContent();
    }

    // ===================== PEDIDOS =====================

    /// <summary>GET /api/admin/pedidos?status=RECEBIDO</summary>
    [HttpGet("pedidos")]
    public async Task<ActionResult<List<PedidoResposta>>> ListarPedidos([FromQuery] string? status)
    {
        StatusPedido? filtro = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!TextoEnum.TentarConverter(status, out StatusPedido convertido))
            {
                throw new ErroDeNegocio($"Status inválido. Use: {TextoEnum.Opcoes<StatusPedido>()}.", campo: "status");
            }
            filtro = convertido;
        }
        return Ok(await _pedidos.ListarTodosAsync(filtro));
    }

    [HttpPatch("pedidos/{id:int}/status")]
    public async Task<ActionResult<PedidoResposta>> AlterarStatus(int id, AlterarStatusRequest dados)
        => Ok(await _pedidos.AlterarStatusAsync(id, dados.Status));
}
