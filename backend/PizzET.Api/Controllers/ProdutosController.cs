using Microsoft.AspNetCore.Mvc;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Services;

namespace PizzET.Api.Controllers;

/// <summary>
/// Endpoints PÚBLICOS do cardápio. Qualquer visitante pode consultar.
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
    /// GET /api/produtos?busca=marg&amp;categoria=PIZZA_SALGADA
    /// Ambos os parâmetros são opcionais.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProdutoResposta>>> Listar(
        [FromQuery] string? busca,
        [FromQuery] string? categoria)
    {
        if (busca != null && busca.Length > TamanhoMaximoBusca)
        {
            ModelState.AddModelError("busca", $"A busca pode ter no máximo {TamanhoMaximoBusca} caracteres.");
            return ValidationProblem(ModelState);
        }

        CategoriaProduto? categoriaFiltro = null;
        if (!string.IsNullOrWhiteSpace(categoria))
        {
            if (!CategoriaProdutoTexto.TentarConverter(categoria, out CategoriaProduto convertida))
            {
                ModelState.AddModelError("categoria", "Use PIZZA_SALGADA, PIZZA_DOCE ou BEBIDA.");
                return ValidationProblem(ModelState);
            }
            categoriaFiltro = convertida;
        }

        List<ProdutoResposta> produtos = await _produtoService.ListarAtivosAsync(busca, categoriaFiltro);
        return Ok(produtos);
    }

    /// <summary>GET /api/produtos/5</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProdutoResposta>> Detalhar(int id)
    {
        ProdutoResposta? produto = await _produtoService.ObterAtivoAsync(id);
        if (produto == null)
        {
            return NotFound();
        }
        return Ok(produto);
    }
}
