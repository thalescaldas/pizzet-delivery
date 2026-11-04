using Microsoft.EntityFrameworkCore;
using PizzET.Api.Data;
using PizzET.Api.Domain;
using PizzET.Api.Dtos;
using PizzET.Api.Infra;

namespace PizzET.Api.Services;

/// <summary>
/// Regras de pedidos. Pontos de segurança importantes:
///  - preços e totais são SEMPRE calculados aqui, com os preços do banco;
///  - o cliente só vê os próprios pedidos;
///  - mudanças de status seguem RegrasStatusPedido.
/// </summary>
public class PedidoService
{
    /// <summary>Taxa de entrega fixa (regra da equipe para o projeto).</summary>
    public const decimal TaxaEntrega = 7.90m;

    private readonly PizzetDbContext _db;
    private readonly EnderecoService _enderecos;

    public PedidoService(PizzetDbContext db, EnderecoService enderecos)
    {
        _db = db;
        _enderecos = enderecos;
    }

    public async Task<PedidoResposta> CriarAsync(int usuarioId, CriarPedidoRequest dados)
    {
        if (!TextoEnum.TentarConverter(dados.FormaPagamento, out FormaPagamento forma))
        {
            throw new ErroDeNegocio($"Forma de pagamento inválida. Use: {TextoEnum.Opcoes<FormaPagamento>()}.", campo: "formaPagamento");
        }

        // 1) Endereço precisa ser do próprio usuário
        Endereco endereco = await _enderecos.BuscarDoUsuarioAsync(usuarioId, dados.EnderecoId!.Value);

        // 2) Junta itens repetidos (ex.: o mesmo produto enviado duas vezes)
        var quantidades = new Dictionary<int, int>();
        foreach (ItemPedidoRequest item in dados.Itens)
        {
            quantidades.TryGetValue(item.ProdutoId, out int atual);
            quantidades[item.ProdutoId] = atual + item.Quantidade;
        }

        // 3) Busca os produtos no banco e confere se existem e estão ativos
        List<int> ids = quantidades.Keys.ToList();
        List<Produto> produtos = await _db.Produtos.Where(p => ids.Contains(p.Id) && p.Ativo).ToListAsync();

        var pedido = new Pedido
        {
            UsuarioId = usuarioId,
            Status = StatusPedido.Recebido,
            FormaPagamento = forma,
            // Snapshot do endereço
            EntregaCep = endereco.Cep,
            EntregaLogradouro = endereco.Logradouro,
            EntregaNumero = endereco.Numero,
            EntregaComplemento = endereco.Complemento,
            EntregaBairro = endereco.Bairro,
            EntregaCidade = endereco.Cidade,
            EntregaUf = endereco.Uf
        };

        decimal subtotal = 0;
        foreach (KeyValuePair<int, int> par in quantidades)
        {
            Produto? produto = produtos.FirstOrDefault(p => p.Id == par.Key);
            if (produto == null)
            {
                throw new ErroDeNegocio("Um dos produtos do carrinho não está mais disponível. Atualize o carrinho.");
            }
            if (par.Value > 20)
            {
                throw new ErroDeNegocio($"Quantidade máxima por item é 20 ({produto.Nome}).");
            }

            pedido.Itens.Add(new ItemPedido
            {
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,       // snapshot do nome
                PrecoUnitario = produto.Preco,    // snapshot do preço — vem do BANCO
                Quantidade = par.Value
            });
            subtotal += produto.Preco * par.Value;
        }

        pedido.Subtotal = subtotal;
        pedido.TaxaEntrega = TaxaEntrega;
        pedido.Total = subtotal + TaxaEntrega;

        // SaveChanges grava pedido + itens numa única transação
        _db.Pedidos.Add(pedido);
        await _db.SaveChangesAsync();

        return await ObterAsync(pedido.Id, usuarioId, ehAdministrador: false);
    }

    public async Task<List<PedidoResposta>> ListarDoUsuarioAsync(int usuarioId)
    {
        List<Pedido> pedidos = await _db.Pedidos
            .Include(p => p.Itens)
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.CriadoEm).ThenByDescending(p => p.Id)
            .ToListAsync();
        return pedidos.Select(p => ParaResposta(p, incluirCliente: false)).ToList();
    }

    /// <summary>Detalhe: o dono vê o próprio pedido; o administrador vê qualquer um.</summary>
    public async Task<PedidoResposta> ObterAsync(int id, int usuarioId, bool ehAdministrador)
    {
        Pedido? pedido = await _db.Pedidos
            .Include(p => p.Itens)
            .Include(p => p.Usuario)
            .FirstOrDefaultAsync(p => p.Id == id);

        // Para quem não é dono, responde 404 (não revela que o pedido existe)
        if (pedido == null || (!ehAdministrador && pedido.UsuarioId != usuarioId))
        {
            throw ErroDeNegocio.NaoEncontrado("Pedido não encontrado.");
        }
        return ParaResposta(pedido, incluirCliente: ehAdministrador);
    }

    public async Task<List<PedidoResposta>> ListarTodosAsync(StatusPedido? status)
    {
        IQueryable<Pedido> consulta = _db.Pedidos.Include(p => p.Itens).Include(p => p.Usuario);
        if (status != null)
        {
            consulta = consulta.Where(p => p.Status == status);
        }
        List<Pedido> pedidos = await consulta
            .OrderByDescending(p => p.CriadoEm).ThenByDescending(p => p.Id)
            .Take(200)
            .ToListAsync();
        return pedidos.Select(p => ParaResposta(p, incluirCliente: true)).ToList();
    }

    public async Task<PedidoResposta> AlterarStatusAsync(int id, string novoStatusTexto)
    {
        if (!TextoEnum.TentarConverter(novoStatusTexto, out StatusPedido novoStatus))
        {
            throw new ErroDeNegocio($"Status inválido. Use: {TextoEnum.Opcoes<StatusPedido>()}.", campo: "status");
        }

        Pedido pedido = await _db.Pedidos.Include(p => p.Itens).Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw ErroDeNegocio.NaoEncontrado("Pedido não encontrado.");

        if (!RegrasStatusPedido.PodeMudar(pedido.Status, novoStatus))
        {
            throw ErroDeNegocio.Conflito(
                $"Não é possível mudar de {TextoEnum.ParaTexto(pedido.Status)} para {TextoEnum.ParaTexto(novoStatus)}.", "status");
        }

        pedido.Status = novoStatus;
        await _db.SaveChangesAsync();
        await _db.Entry(pedido).ReloadAsync();   // relê atualizado_em, preenchido pelo MySQL
        return ParaResposta(pedido, incluirCliente: true);
    }

    private static PedidoResposta ParaResposta(Pedido p, bool incluirCliente)
    {
        var resposta = new PedidoResposta
        {
            Id = p.Id,
            Status = TextoEnum.ParaTexto(p.Status),
            FormaPagamento = TextoEnum.ParaTexto(p.FormaPagamento),
            Subtotal = p.Subtotal,
            TaxaEntrega = p.TaxaEntrega,
            Total = p.Total,
            CriadoEm = p.CriadoEm,
            AtualizadoEm = p.AtualizadoEm,
            ClienteNome = incluirCliente ? p.Usuario?.Nome : null,
            Entrega = new EnderecoResposta
            {
                Cep = p.EntregaCep,
                Logradouro = p.EntregaLogradouro,
                Numero = p.EntregaNumero,
                Complemento = p.EntregaComplemento,
                Bairro = p.EntregaBairro,
                Cidade = p.EntregaCidade,
                Uf = p.EntregaUf
            }
        };

        foreach (ItemPedido item in p.Itens)
        {
            resposta.Itens.Add(new ItemPedidoResposta
            {
                ProdutoId = item.ProdutoId,
                Nome = item.NomeProduto,
                PrecoUnitario = item.PrecoUnitario,
                Quantidade = item.Quantidade,
                Subtotal = item.Subtotal
            });
        }

        foreach (StatusPedido proximo in RegrasStatusPedido.ProximosPossiveis(p.Status))
        {
            resposta.ProximosStatus.Add(TextoEnum.ParaTexto(proximo));
        }
        return resposta;
    }
}
