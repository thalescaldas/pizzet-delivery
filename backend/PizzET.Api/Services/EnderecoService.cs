using Microsoft.EntityFrameworkCore;
using PizzET.Api.Data;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;

namespace PizzET.Api.Services;

/// <summary>
/// Endereços de entrega. Cada usuário só enxerga e altera os PRÓPRIOS endereços:
/// todas as consultas filtram por usuarioId.
/// </summary>
public class EnderecoService
{
    private const int LimitePorUsuario = 10;
    private readonly PizzetDbContext _db;

    public EnderecoService(PizzetDbContext db)
    {
        _db = db;
    }

    public async Task<List<EnderecoResposta>> ListarAsync(int usuarioId)
    {
        List<Endereco> enderecos = await _db.Enderecos
            .Where(e => e.UsuarioId == usuarioId)
            .OrderByDescending(e => e.Id)
            .ToListAsync();

        var resposta = new List<EnderecoResposta>();
        foreach (Endereco endereco in enderecos)
        {
            resposta.Add(ParaResposta(endereco));
        }
        return resposta;
    }

    public async Task<EnderecoResposta> CriarAsync(int usuarioId, EnderecoRequest dados)
    {
        int quantidade = await _db.Enderecos.CountAsync(e => e.UsuarioId == usuarioId);
        if (quantidade >= LimitePorUsuario)
        {
            throw new ErroDeNegocio($"Limite de {LimitePorUsuario} endereços atingido. Exclua um para cadastrar outro.");
        }

        var endereco = new Endereco { UsuarioId = usuarioId };
        Preencher(endereco, dados);
        _db.Enderecos.Add(endereco);
        await _db.SaveChangesAsync();
        return ParaResposta(endereco);
    }

    public async Task<EnderecoResposta> AtualizarAsync(int usuarioId, int id, EnderecoRequest dados)
    {
        Endereco endereco = await BuscarDoUsuarioAsync(usuarioId, id);
        Preencher(endereco, dados);
        await _db.SaveChangesAsync();
        return ParaResposta(endereco);
    }

    /// <summary>Pode excluir mesmo que já tenha sido usado: os pedidos guardam uma cópia do endereço.</summary>
    public async Task ExcluirAsync(int usuarioId, int id)
    {
        Endereco endereco = await BuscarDoUsuarioAsync(usuarioId, id);
        _db.Enderecos.Remove(endereco);
        await _db.SaveChangesAsync();
    }

    /// <summary>Busca o endereço garantindo que pertence ao usuário (senão responde 404).</summary>
    public async Task<Endereco> BuscarDoUsuarioAsync(int usuarioId, int id)
    {
        Endereco? endereco = await _db.Enderecos.FirstOrDefaultAsync(e => e.Id == id && e.UsuarioId == usuarioId);
        return endereco ?? throw ErroDeNegocio.NaoEncontrado("Endereço não encontrado.");
    }

    private static void Preencher(Endereco endereco, EnderecoRequest dados)
    {
        endereco.Apelido = string.IsNullOrWhiteSpace(dados.Apelido) ? "Casa" : dados.Apelido.Trim();
        endereco.Cep = ValidadorCpf.SomenteDigitos(dados.Cep);
        endereco.Logradouro = dados.Logradouro.Trim();
        endereco.Numero = ValidadorCpf.SomenteDigitos(dados.Numero);
        endereco.Complemento = string.IsNullOrWhiteSpace(dados.Complemento) ? null : dados.Complemento.Trim();
        endereco.Bairro = dados.Bairro.Trim();
        endereco.Cidade = dados.Cidade.Trim();
        endereco.Uf = dados.Uf.Trim().ToUpperInvariant();
    }

    public static EnderecoResposta ParaResposta(Endereco e)
    {
        return new EnderecoResposta
        {
            Id = e.Id,
            Apelido = e.Apelido,
            Cep = e.Cep,
            Logradouro = e.Logradouro,
            Numero = e.Numero,
            Complemento = e.Complemento,
            Bairro = e.Bairro,
            Cidade = e.Cidade,
            Uf = e.Uf
        };
    }
}
