-- =====================================================================
-- PizzET - 02_dados_demo.sql - Dados de demonstração
-- =====================================================================
-- Executar DEPOIS de 01_schema.sql.
-- NÃO cria usuários: contas exigem hash de senha gerado pelo Identity.
-- O administrador de desenvolvimento será criado pelo seed da API,
-- com senha vinda de user-secrets/variável de ambiente.
-- =====================================================================

SET NAMES utf8mb4;   -- garante a leitura correta dos acentos
USE pizzet;

-- Papéis de acesso. normalized_name é o nome em maiúsculas,
-- que o Identity usa para fazer buscas.
INSERT INTO papeis (name, normalized_name, concurrency_stamp) VALUES
    ('Cliente',       'CLIENTE',       UUID()),
    ('Administrador', 'ADMINISTRADOR', UUID());

-- Cardápio de exemplo (preços fictícios).
INSERT INTO produtos (nome, descricao, categoria, preco, ativo) VALUES
    ('Margherita Marciana',  'Molho de tomate, muçarela, tomate e manjericão fresco.',               'PIZZA_SALGADA', 49.90, TRUE),
    ('Calabresa Cometa',     'Calabresa fatiada, cebola roxa, muçarela e orégano.',                  'PIZZA_SALGADA', 52.90, TRUE),
    ('Frango Supernova',     'Frango desfiado, catupiry, milho e muçarela.',                         'PIZZA_SALGADA', 56.90, TRUE),
    ('Quatro Queijos Lunar', 'Muçarela, provolone, parmesão e gorgonzola.',                          'PIZZA_SALGADA', 59.90, TRUE),
    ('Portuguesa Orbital',   'Presunto, ovo, cebola, ervilha, azeitona e muçarela.',                 'PIZZA_SALGADA', 57.90, TRUE),
    ('Vegana Nebulosa',      'Molho de tomate, abobrinha, berinjela, pimentão e queijo vegetal.',    'PIZZA_SALGADA', 58.90, TRUE),
    ('Chocolate Buraco Negro','Chocolate ao leite com granulado.',                                    'PIZZA_DOCE',    46.90, TRUE),
    ('Banana Via Láctea',    'Banana, canela, açúcar e leite condensado.',                           'PIZZA_DOCE',    44.90, TRUE),
    ('Refrigerante 2L',      'Refrigerante sabor cola, garrafa de 2 litros.',                        'BEBIDA',        14.00, TRUE),
    ('Suco Galáctico 500ml', 'Suco natural de laranja, 500 ml.',                                     'BEBIDA',        11.50, TRUE),
    ('Água Cósmica 500ml',   'Água mineral sem gás, 500 ml.',                                        'BEBIDA',         5.00, TRUE),
    -- Produto INATIVO: não deve aparecer no catálogo público (teste T-CAT-01)
    ('Pizza Eclipse',        'Sabor de edição limitada, fora do cardápio.',                          'PIZZA_SALGADA', 61.90, FALSE);
