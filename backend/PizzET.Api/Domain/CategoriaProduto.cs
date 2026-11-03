namespace PizzET.Api.Domain;

/// <summary>
/// Categorias possíveis de um produto do cardápio.
/// No banco, cada uma é gravada como texto (ver <see cref="CategoriaProdutoTexto"/>).
/// </summary>
public enum CategoriaProduto
{
    PizzaSalgada,
    PizzaDoce,
    Bebida
}

/// <summary>
/// Converte a categoria entre o enum do C# e o texto gravado no MySQL
/// (coluna produtos.categoria, que aceita apenas estes três valores).
/// </summary>
public static class CategoriaProdutoTexto
{
    public static string ParaTexto(CategoriaProduto categoria)
    {
        switch (categoria)
        {
            case CategoriaProduto.PizzaSalgada: return "PIZZA_SALGADA";
            case CategoriaProduto.PizzaDoce:    return "PIZZA_DOCE";
            case CategoriaProduto.Bebida:       return "BEBIDA";
            default: throw new ArgumentOutOfRangeException(nameof(categoria));
        }
    }

    public static CategoriaProduto ParaEnum(string texto)
    {
        switch (texto)
        {
            case "PIZZA_SALGADA": return CategoriaProduto.PizzaSalgada;
            case "PIZZA_DOCE":    return CategoriaProduto.PizzaDoce;
            case "BEBIDA":        return CategoriaProduto.Bebida;
            default: throw new ArgumentException($"Categoria desconhecida: {texto}");
        }
    }

    /// <summary>
    /// Versão "tolerante" usada para ler o parâmetro da URL:
    /// devolve false em vez de lançar erro quando o texto é inválido.
    /// </summary>
    public static bool TentarConverter(string texto, out CategoriaProduto categoria)
    {
        categoria = CategoriaProduto.PizzaSalgada;
        switch (texto.Trim().ToUpperInvariant())
        {
            case "PIZZA_SALGADA": categoria = CategoriaProduto.PizzaSalgada; return true;
            case "PIZZA_DOCE":    categoria = CategoriaProduto.PizzaDoce;    return true;
            case "BEBIDA":        categoria = CategoriaProduto.Bebida;       return true;
            default: return false;
        }
    }
}
