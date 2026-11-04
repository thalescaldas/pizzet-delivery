using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;
using PizzET.Api.Services;

namespace PizzET.Api.Controllers;

/// <summary>
/// Endpoints PÚBLICOS do cardápio. Qualquer visitante pode consultar.
/// O CRUD de produtos fica no AdminController (somente administradores).
/// </summary>
[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private const int TamanhoMaximoBusca = 100;
    private readonly ProdutoService _produtoService;

    public ProdutosController(ProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    /// <summary>
    /// GET /api/produtos?busca=marg&amp;categoria=TRADICIONAL
    /// Ambos os parâmetros são opcionais.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProdutoResposta>>> Listar(
        [FromQuery] string? busca,
        [FromQuery] string? categoria)
    {
        if (busca != null && busca.Length > TamanhoMaximoBusca)
        {
            throw new ErroDeNegocio($"A busca pode ter no máximo {TamanhoMaximoBusca} caracteres.", campo: "busca");
        }

        CategoriaProduto? categoriaFiltro = null;
        if (!string.IsNullOrWhiteSpace(categoria))
        {
            if (!TextoEnum.TentarConverter(categoria, out CategoriaProduto convertida))
            {
                throw new ErroDeNegocio($"Categoria inválida. Use: {TextoEnum.Opcoes<CategoriaProduto>()}.", campo: "categoria");
            }
            categoriaFiltro = convertida;
        }

        return Ok(await _produtoService.ListarAtivosAsync(busca, categoriaFiltro));
    }

    /// <summary>GET /api/produtos/5</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProdutoResposta>> Detalhar(int id)
    {
        ProdutoResposta? produto = await _produtoService.ObterAtivoAsync(id);
        if (produto == null)
        {
            return NotFound(new { title = "Produto não encontrado." });
        }
        return Ok(produto);
    }
}
