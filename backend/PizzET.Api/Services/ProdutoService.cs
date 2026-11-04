using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using PizzET.Api.Data;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;

namespace PizzET.Api.Services;

/// <summary>Regras de negócio de produtos: consulta pública e CRUD do administrador.</summary>
public class ProdutoService
{
    private readonly PizzetDbContext _db;

    public ProdutoService(PizzetDbContext db)
    {
        _db = db;
    }

    // ===================== CONSULTA PÚBLICA =====================

    /// <summary>
    /// Lista os produtos ATIVOS, com filtros opcionais por texto e categoria.
    /// A busca ignora acentos e maiúsculas por causa da collation do banco
    /// (utf8mb4_0900_ai_ci): "lactea" encontra "Láctea".
    /// </summary>
    public async Task<List<ProdutoResposta>> ListarAtivosAsync(string? busca, CategoriaProduto? categoria)
    {
        IQueryable<Produto> consulta = _db.Produtos.Where(p => p.Ativo);
        consulta = AplicarFiltros(consulta, busca, categoria);
        List<Produto> produtos = await consulta.OrderBy(p => p.Id).ToListAsync();
        return ParaRespostas(produtos);
    }

    /// <summary>Busca um produto ativo pelo id. Devolve null se não existir ou estiver inativo.</summary>
    public async Task<ProdutoResposta?> ObterAtivoAsync(int id)
    {
        Produto? produto = await _db.Produtos.FirstOrDefaultAsync(p => p.Id == id && p.Ativo);
        return produto == null ? null : ParaResposta(produto);
    }

    // ===================== ADMINISTRADOR =====================

    /// <summary>Lista TODOS os produtos, inclusive desativados.</summary>
    public async Task<List<ProdutoResposta>> ListarTodosAsync(string? busca)
    {
        IQueryable<Produto> consulta = AplicarFiltros(_db.Produtos, busca, null);
        List<Produto> produtos = await consulta.OrderBy(p => p.Id).ToListAsync();
        return ParaRespostas(produtos);
    }

    public async Task<ProdutoResposta> CriarAsync(ProdutoRequest dados)
    {
        var produto = new Produto();
        Preencher(produto, dados);
        _db.Produtos.Add(produto);
        await SalvarComVerificacaoDeNomeAsync();
        return ParaResposta(produto);
    }

    public async Task<ProdutoResposta> AtualizarAsync(int id, ProdutoRequest dados)
    {
        Produto produto = await _db.Produtos.FindAsync(id)
            ?? throw ErroDeNegocio.NaoEncontrado("Produto não encontrado.");
        Preencher(produto, dados);
        await SalvarComVerificacaoDeNomeAsync();
        return ParaResposta(produto);
    }

    /// <summary>Exclusão LÓGICA: o produto continua no banco (pedidos antigos dependem dele).</summary>
    public async Task DesativarAsync(int id)
    {
        Produto produto = await _db.Produtos.FindAsync(id)
            ?? throw ErroDeNegocio.NaoEncontrado("Produto não encontrado.");
        produto.Ativo = false;
        await _db.SaveChangesAsync();
    }

    // ===================== AUXILIARES =====================

    private static IQueryable<Produto> AplicarFiltros(IQueryable<Produto> consulta, string? busca, CategoriaProduto? categoria)
    {
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
        return consulta;
    }

    private static void Preencher(Produto produto, ProdutoRequest dados)
    {
        if (!TextoEnum.TentarConverter(dados.Categoria, out CategoriaProduto categoria))
        {
            throw new ErroDeNegocio($"Categoria inválida. Use: {TextoEnum.Opcoes<CategoriaProduto>()}.", campo: "categoria");
        }
        produto.Nome = dados.Nome.Trim();
        produto.Descricao = (dados.Descricao ?? "").Trim();
        produto.Categoria = categoria;
        produto.Preco = Math.Round(dados.Preco, 2);
        produto.ImagemUrl = string.IsNullOrWhiteSpace(dados.ImagemUrl) ? null : dados.ImagemUrl.Trim();
        produto.Ativo = dados.Ativo;
    }

    /// <summary>Salva e transforma o erro de nome duplicado do MySQL (código 1062) em mensagem amigável.</summary>
    private async Task SalvarComVerificacaoDeNomeAsync()
    {
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException erro) when (erro.InnerException is MySqlException { Number: 1062 })
        {
            throw ErroDeNegocio.Conflito("Já existe um produto com este nome.", "nome");
        }
    }

    private static List<ProdutoResposta> ParaRespostas(List<Produto> produtos)
    {
        var resposta = new List<ProdutoResposta>();
        foreach (Produto produto in produtos)
        {
            resposta.Add(ParaResposta(produto));
        }
        return resposta;
    }

    private static ProdutoResposta ParaResposta(Produto produto)
    {
        return new ProdutoResposta
        {
            Id = produto.Id,
            Nome = produto.Nome,
            Descricao = produto.Descricao,
            Categoria = TextoEnum.ParaTexto(produto.Categoria),
            Preco = produto.Preco,
            ImagemUrl = produto.ImagemUrl,
            Ativo = produto.Ativo
        };
    }
}
