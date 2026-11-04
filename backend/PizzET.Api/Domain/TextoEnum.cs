using System.Text;

namespace PizzET.Api.Domain;

/// <summary>
/// Converte qualquer enum do sistema para o texto gravado no banco e vice-versa.
/// Regra: cada letra maiúscula (exceto a primeira) ganha um "_" antes e tudo vira maiúsculo.
///   EmPreparo -> "EM_PREPARO"     Pix -> "PIX"
/// </summary>
public static class TextoEnum
{
    public static string ParaTexto<T>(T valor) where T : struct, Enum
    {
        string nome = valor.ToString();
        var texto = new StringBuilder();
        for (int i = 0; i < nome.Length; i++)
        {
            if (i > 0 && char.IsUpper(nome[i]))
            {
                texto.Append('_');
            }
            texto.Append(char.ToUpperInvariant(nome[i]));
        }
        return texto.ToString();
    }

    /// <summary>Converte o texto do banco para o enum. Lança erro se o texto for desconhecido.</summary>
    public static T ParaEnum<T>(string texto) where T : struct, Enum
    {
        if (TentarConverter(texto, out T valor))
        {
            return valor;
        }
        throw new ArgumentException($"Valor desconhecido para {typeof(T).Name}: {texto}");
    }

    /// <summary>Versão segura para dados vindos do navegador: devolve false se o texto for inválido.</summary>
    public static bool TentarConverter<T>(string? texto, out T valor) where T : struct, Enum
    {
        valor = default;
        if (string.IsNullOrWhiteSpace(texto))
        {
            return false;
        }

        string procurado = texto.Trim().ToUpperInvariant();
        foreach (T opcao in Enum.GetValues<T>())
        {
            if (ParaTexto(opcao) == procurado)
            {
                valor = opcao;
                return true;
            }
        }
        return false;
    }

    /// <summary>Lista todos os textos aceitos (usado nas mensagens de erro).</summary>
    public static string Opcoes<T>() where T : struct, Enum
    {
        var textos = new List<string>();
        foreach (T opcao in Enum.GetValues<T>())
        {
            textos.Add(ParaTexto(opcao));
        }
        return string.Join(", ", textos);
    }
}
