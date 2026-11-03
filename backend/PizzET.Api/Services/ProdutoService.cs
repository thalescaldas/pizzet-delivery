using Microsoft.EntityFrameworkCore;
using PizzET.Api.Data;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;

namespace PizzET.Api.Services;

/// <summary>
/// Regras de negócio de produtos (consulta pública do cardápio).
/// O CRUD administrativo será adicionado depois da autenticação.
/// </summary>
public class ProdutoService
{
    private readonly PizzetDbContext _db;

    public ProdutoService(PizzetDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lista os produtos ATIVOS, com filtros opcionais por texto e categoria.
    /// A busca ignora acentos e maiúsculas por causa da collation do banco
    /// (utf8mb4_0900_ai_ci): "lactea" encontra "Láctea".
    /// </summary>
    public async Task<List<ProdutoResposta>> ListarAtivosAsync(string? busca, CategoriaProduto? categoria)
    {
        IQueryable<Produto> consulta = _db.Produtos.Where(p => p.Ativo);

        if (!string.IsNullOrWhiteSpace(busca))
        {
            string termo = busca.Trim();
            // Contains vira LIKE com parâmetro: protegido contra SQL injection
            consulta = consulta.Where(p => p.Nome.Contains(termo) || p.Descricao.Contains(termo));
        }

        if (categoria != null)
        {
            consulta = consulta.Where(p => p.Categoria == categoria);
        }

        List<Produto> produtos = await consulta
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nome)
            .ToListAsync();

        // Laço simples convertendo cada entidade em DTO
        var resposta = new List<ProdutoResposta>();
        foreach (Produto produto in produtos)
        {
            resposta.Add(ParaResposta(produto));
        }
        return resposta;
    }

    /// <summary>Busca um produto ativo pelo id. Devolve null se não existir ou estiver inativo.</summary>
    public async Task<ProdutoResposta?> ObterAtivoAsync(int id)
    {
        Produto? produto = await _db.Produtos.FirstOrDefaultAsync(p => p.Id == id && p.Ativo);
        if (produto == null)
        {
            return null;
        }
        return ParaResposta(produto);
    }

    private static ProdutoResposta ParaResposta(Produto produto)
    {
        return new ProdutoResposta
        {
            Id = produto.Id,
            Nome = produto.Nome,
            Descricao = produto.Descricao,
            Categoria = CategoriaProdutoTexto.ParaTexto(produto.Categoria),
            Preco = produto.Preco,
            ImagemUrl = produto.ImagemUrl
        };
    }
}
