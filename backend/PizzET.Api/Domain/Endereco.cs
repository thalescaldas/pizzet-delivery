namespace PizzET.Api.Domain;

/// <summary>Endereço de entrega salvo por um usuário (tabela "enderecos").</summary>
public class Endereco
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Apelido { get; set; } = "Casa";
    public string Cep { get; set; } = "";          // só dígitos
    public string Logradouro { get; set; } = "";
    public string Numero { get; set; } = "";       // só dígitos
    public string? Complemento { get; set; }
    public string Bairro { get; set; } = "";
    public string Cidade { get; set; } = "";
    public string Uf { get; set; } = "";           // 2 letras maiúsculas
    public DateTime CriadoEm { get; set; }
}
