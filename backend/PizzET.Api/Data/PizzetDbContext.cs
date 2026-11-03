using Microsoft.EntityFrameworkCore;
using PizzET.Api.Domain;

namespace PizzET.Api.Data;

/// <summary>
/// Ponte entre as classes C# e as tabelas do MySQL.
/// IMPORTANTE: as tabelas são criadas pelos scripts em database/ (fonte da verdade).
/// Aqui apenas dizemos ao EF Core qual classe corresponde a qual tabela/coluna.
/// Não usamos migrações.
/// </summary>
public class PizzetDbContext : DbContext
{
    public PizzetDbContext(DbContextOptions<PizzetDbContext> options) : base(options)
    {
    }

    public DbSet<Produto> Produtos => Set<Produto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Produto>(produto =>
        {
            produto.ToTable("produtos");
            produto.HasKey(p => p.Id);

            produto.Property(p => p.Id).HasColumnName("id");
            produto.Property(p => p.Nome).HasColumnName("nome").HasMaxLength(100);
            produto.Property(p => p.Descricao).HasColumnName("descricao").HasMaxLength(500);
            produto.Property(p => p.Preco).HasColumnName("preco").HasPrecision(10, 2);
            produto.Property(p => p.ImagemUrl).HasColumnName("imagem_url").HasMaxLength(255);
            produto.Property(p => p.Ativo).HasColumnName("ativo");

            // O enum é gravado como texto ("PIZZA_SALGADA", ...)
            produto.Property(p => p.Categoria)
                .HasColumnName("categoria")
                .HasConversion(
                    categoria => CategoriaProdutoTexto.ParaTexto(categoria),
                    texto => CategoriaProdutoTexto.ParaEnum(texto));

            // Datas preenchidas pelo próprio MySQL (DEFAULT / ON UPDATE)
            produto.Property(p => p.CriadoEm).HasColumnName("criado_em").ValueGeneratedOnAdd();
            produto.Property(p => p.AtualizadoEm).HasColumnName("atualizado_em").ValueGeneratedOnAddOrUpdate();
        });
    }
}
