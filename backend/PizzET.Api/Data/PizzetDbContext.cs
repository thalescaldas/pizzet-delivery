using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using PizzET.Api.Domain;

namespace PizzET.Api.Data;

/// <summary>
/// Ponte entre as classes C# e as tabelas do MySQL.
/// IMPORTANTE: as tabelas são criadas pelos scripts em database/ (fonte da verdade).
/// Aqui apenas dizemos ao EF Core qual classe corresponde a qual tabela/coluna.
/// Não usamos migrações.
///
/// Herda de IdentityDbContext para que o ASP.NET Identity (login, senhas, papéis)
/// use as nossas tabelas "usuarios", "papeis" etc.
/// </summary>
public class PizzetDbContext : IdentityDbContext<Usuario, IdentityRole<int>, int>
{
    public PizzetDbContext(DbContextOptions<PizzetDbContext> options) : base(options)
    {
    }

    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Endereco> Enderecos => Set<Endereco>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<ItemPedido> ItensPedido => Set<ItemPedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);   // configuração padrão do Identity

        // ----- Nomes das tabelas (iguais aos de database/01_schema.sql) -----
        modelBuilder.Entity<Usuario>().ToTable("usuarios");
        modelBuilder.Entity<IdentityRole<int>>().ToTable("papeis");
        modelBuilder.Entity<IdentityUserRole<int>>().ToTable("usuarios_papeis");
        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("usuarios_claims");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("papeis_claims");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("usuarios_logins");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("usuarios_tokens");
        modelBuilder.Entity<Produto>().ToTable("produtos");
        modelBuilder.Entity<Endereco>().ToTable("enderecos");
        modelBuilder.Entity<Pedido>().ToTable("pedidos");
        modelBuilder.Entity<ItemPedido>().ToTable("itens_pedido");

        // ----- Relacionamentos -----
        modelBuilder.Entity<Pedido>()
            .HasMany(p => p.Itens).WithOne().HasForeignKey(i => i.PedidoId);
        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Usuario).WithMany().HasForeignKey(p => p.UsuarioId);
        modelBuilder.Entity<Endereco>()
            .HasOne<Usuario>().WithMany().HasForeignKey(e => e.UsuarioId);
        modelBuilder.Entity<ItemPedido>()
            .HasOne<Produto>().WithMany().HasForeignKey(i => i.ProdutoId);

        // ----- Enums gravados como texto ("TRADICIONAL", "EM_PREPARO", ...) -----
        modelBuilder.Entity<Produto>().Property(p => p.Categoria).HasConversion(
            valor => TextoEnum.ParaTexto(valor), texto => TextoEnum.ParaEnum<CategoriaProduto>(texto));
        modelBuilder.Entity<Pedido>().Property(p => p.Status).HasConversion(
            valor => TextoEnum.ParaTexto(valor), texto => TextoEnum.ParaEnum<StatusPedido>(texto));
        modelBuilder.Entity<Pedido>().Property(p => p.FormaPagamento).HasConversion(
            valor => TextoEnum.ParaTexto(valor), texto => TextoEnum.ParaEnum<FormaPagamento>(texto));

        // ----- Valores preenchidos pelo próprio MySQL (o EF só lê) -----
        SomenteLeitura(modelBuilder.Entity<ItemPedido>().Property(i => i.Subtotal).ValueGeneratedOnAddOrUpdate());
        SomenteLeitura(modelBuilder.Entity<Usuario>().Property(u => u.CriadoEm).ValueGeneratedOnAdd());
        SomenteLeitura(modelBuilder.Entity<Endereco>().Property(e => e.CriadoEm).ValueGeneratedOnAdd());
        SomenteLeitura(modelBuilder.Entity<Produto>().Property(p => p.CriadoEm).ValueGeneratedOnAdd());
        SomenteLeitura(modelBuilder.Entity<Produto>().Property(p => p.AtualizadoEm).ValueGeneratedOnAddOrUpdate());
        SomenteLeitura(modelBuilder.Entity<Pedido>().Property(p => p.CriadoEm).ValueGeneratedOnAdd());
        SomenteLeitura(modelBuilder.Entity<Pedido>().Property(p => p.AtualizadoEm).ValueGeneratedOnAddOrUpdate());

        // ----- Nomes das colunas: PropriedadeEmCSharp -> coluna_em_snake_case -----
        // Ex.: PasswordHash -> password_hash, EntregaCep -> entrega_cep, UsuarioId -> usuario_id
        foreach (var entidade in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var propriedade in entidade.GetProperties())
            {
                propriedade.SetColumnName(ParaSnakeCase(propriedade.Name));
            }
        }
    }

    /// <summary>Diz ao EF para nunca enviar este campo em INSERT/UPDATE (o banco calcula).</summary>
    private static void SomenteLeitura<T>(Microsoft.EntityFrameworkCore.Metadata.Builders.PropertyBuilder<T> propriedade)
    {
        propriedade.Metadata.SetBeforeSaveBehavior(PropertySaveBehavior.Ignore);
        propriedade.Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);
    }

    private static string ParaSnakeCase(string nome)
    {
        var texto = new StringBuilder();
        for (int i = 0; i < nome.Length; i++)
        {
            if (i > 0 && char.IsUpper(nome[i]))
            {
                texto.Append('_');
            }
            texto.Append(char.ToLowerInvariant(nome[i]));
        }
        return texto.ToString();
    }
}
