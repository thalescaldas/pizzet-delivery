namespace PizzET.Api.Domain;

// Os enums abaixo são gravados no MySQL como TEXTO em maiúsculas,
// com "_" separando as palavras (ver TextoEnum). Exemplos:
//   CategoriaProduto.Tradicional  -> "TRADICIONAL"
//   StatusPedido.SaiuParaEntrega  -> "SAIU_PARA_ENTREGA"
// Os valores aceitos pelo banco estão nos CHECKs de database/01_schema.sql.

/// <summary>Categorias do cardápio (mesmas do protótipo do Front-End).</summary>
public enum CategoriaProduto
{
    Tradicional,
    Especial,
    Premium,
    Doce,
    Bebida
}

/// <summary>Etapas de um pedido. As transições permitidas estão em <see cref="RegrasStatusPedido"/>.</summary>
public enum StatusPedido
{
    Recebido,
    EmPreparo,
    SaiuParaEntrega,
    Entregue,
    Cancelado
}

/// <summary>Formas de pagamento SIMULADAS. Nenhuma cobrança real é feita.</summary>
public enum FormaPagamento
{
    Pix,
    Cartao,
    Dinheiro
}
