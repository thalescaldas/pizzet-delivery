namespace PizzET.Api.Domain;

/// <summary>
/// Valida um CPF pelos dígitos verificadores (algoritmo oficial da Receita).
/// Exemplo: em 529.982.247-25, os dois últimos dígitos (2 e 5) são calculados a partir dos 9 primeiros.
/// </summary>
public static class ValidadorCpf
{
    public static bool EhValido(string? cpf)
    {
        string digitos = SomenteDigitos(cpf);
        if (digitos.Length != 11)
        {
            return false;
        }

        // CPFs com todos os dígitos iguais (111.111.111-11) passam na conta, mas são inválidos
        bool todosIguais = true;
        for (int i = 1; i < 11; i++)
        {
            if (digitos[i] != digitos[0])
            {
                todosIguais = false;
                break;
            }
        }
        if (todosIguais)
        {
            return false;
        }

        int primeiro = CalcularDigito(digitos, 9);
        int segundo = CalcularDigito(digitos, 10);
        return primeiro == digitos[9] - '0' && segundo == digitos[10] - '0';
    }

    /// <summary>Calcula um dígito verificador usando os "quantidade" primeiros dígitos.</summary>
    private static int CalcularDigito(string digitos, int quantidade)
    {
        int soma = 0;
        int peso = quantidade + 1;          // 10 para o 1º dígito, 11 para o 2º
        for (int i = 0; i < quantidade; i++)
        {
            soma += (digitos[i] - '0') * peso;
            peso--;
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    /// <summary>Remove pontos, traços, espaços etc. Usado também para telefone e CEP.</summary>
    public static string SomenteDigitos(string? texto)
    {
        if (texto == null)
        {
            return "";
        }
        return new string(texto.Where(char.IsDigit).ToArray());
    }
}
