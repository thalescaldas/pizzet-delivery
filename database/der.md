# PizzET — DER (Diagrama Entidade-Relacionamento)

Diagrama do modelo físico de `01_schema.sql`. O GitHub desenha o bloco abaixo automaticamente. Para gerar imagem, cole o bloco em https://mermaid.live. Outra opção é o **Database → Reverse Engineer** do MySQL Workbench, depois de rodar o script.

As tabelas auxiliares do Identity (`usuarios_claims`, `papeis_claims`, `usuarios_logins`, `usuarios_tokens`) foram omitidas para clareza. Todas se ligam a `usuarios` ou `papeis` por FK com `ON DELETE CASCADE`.

```mermaid
erDiagram
    usuarios ||--o{ usuarios_papeis : "possui"
    papeis   ||--o{ usuarios_papeis : "atribuído a"
    usuarios ||--o{ enderecos       : "cadastra"
    usuarios ||--o{ pedidos         : "faz"
    pedidos  ||--|{ itens_pedido    : "contém"
    produtos ||--o{ itens_pedido    : "aparece em"

    usuarios {
        INT id PK
        VARCHAR nome
        CHAR cpf UK "11 dígitos"
        VARCHAR email
        VARCHAR normalized_email UK
        VARCHAR password_hash "hash do Identity"
        VARCHAR phone_number "telefone"
        DATETIME criado_em
    }
    papeis {
        INT id PK
        VARCHAR name "Cliente / Administrador"
        VARCHAR normalized_name UK
    }
    usuarios_papeis {
        INT user_id PK, FK
        INT role_id PK, FK
    }
    enderecos {
        INT id PK
        INT usuario_id FK
        VARCHAR apelido
        CHAR cep
        VARCHAR logradouro
        VARCHAR numero
        VARCHAR complemento
        VARCHAR bairro
        VARCHAR cidade
        CHAR uf
    }
    produtos {
        INT id PK
        VARCHAR nome UK
        VARCHAR descricao
        VARCHAR categoria "PIZZA_SALGADA / PIZZA_DOCE / BEBIDA"
        DECIMAL preco "maior que 0"
        BOOLEAN ativo "exclusão lógica"
    }
    pedidos {
        INT id PK
        INT usuario_id FK
        VARCHAR status
        VARCHAR forma_pagamento "simulado"
        DECIMAL subtotal
        DECIMAL taxa_entrega
        DECIMAL total "subtotal + taxa"
        CHAR entrega_cep "snapshot"
        VARCHAR entrega_logradouro "snapshot"
        DATETIME criado_em
    }
    itens_pedido {
        INT id PK
        INT pedido_id FK
        INT produto_id FK
        VARCHAR nome_produto "snapshot"
        DECIMAL preco_unitario "snapshot"
        INT quantidade "1 a 20"
        DECIMAL subtotal "calculado"
    }
```

## Cardinalidades

| Relação | Cardinalidade | Regra ao excluir |
|---------|---------------|------------------|
| usuarios → enderecos | 1 : N | apagar usuário apaga seus endereços (CASCADE) |
| usuarios → pedidos | 1 : N | **bloqueado** se o usuário tem pedidos (RESTRICT) |
| usuarios ↔ papeis | N : N via `usuarios_papeis` | CASCADE |
| pedidos → itens_pedido | 1 : N (ao menos 1 item, garantido pela API) | apagar pedido apaga seus itens (CASCADE) |
| produtos → itens_pedido | 1 : N | **bloqueado** (RESTRICT); produtos são desativados, não apagados |

O pedido não tem FK para `enderecos`: o endereço é **copiado** para as colunas `entrega_*` no momento da compra. Assim o histórico não muda se o cliente editar ou apagar o endereço.

## Status do pedido

`RECEBIDO → EM_PREPARO → SAIU_PARA_ENTREGA → ENTREGUE`, com `CANCELADO` possível a partir de `RECEBIDO` ou `EM_PREPARO`. O banco garante apenas que o valor é um dos cinco permitidos (CHECK). A **ordem** das transições é validada na API (C#).
