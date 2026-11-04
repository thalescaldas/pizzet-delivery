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

-- Cardápio de exemplo (preços fictícios). Nomes, preços e imagens seguem o
-- protótipo do Front-End V2. imagem_url é relativa à pasta frontend/.
INSERT INTO produtos (nome, descricao, categoria, preco, imagem_url, ativo) VALUES
    ('Marguerita Marciana',    'Muçarela, tomate fresco, manjericão e molho artesanal.', 'TRADICIONAL', 49.90, 'assets/pizza-1.webp', TRUE),
    ('Calabresa Cósmica',      'Calabresa especial, muçarela, cebola roxa e orégano.',   'TRADICIONAL', 49.90, 'assets/pizza-2.webp', TRUE),
    ('Quatro Queijos Lunares', 'Muçarela, provolone, parmesão e gorgonzola.',            'ESPECIAL',    54.90, 'assets/pizza-3.webp', TRUE),
    ('Frango Galáctico',       'Frango desfiado, muçarela, requeijão e milho.',          'ESPECIAL',    54.90, 'assets/pizza-4.webp', TRUE),
    ('Pepperoni Plutoniano',   'Pepperoni crocante, muçarela e toque de pimenta.',       'PREMIUM',     67.90, 'assets/pizza-5.webp', TRUE),
    ('Nutella Nebulosa',       'Chocolate com avelã, morangos e granulado.',             'DOCE',        59.90, 'assets/pizza-6.webp', TRUE),
    ('Via Láctea',             'Chocolate branco e ao leite com confeitos.',             'DOCE',        59.90, 'assets/pizza-7.webp', TRUE),
    ('Refrigerante 2L',        'Refrigerante gelado para sua missão.',                   'BEBIDA',      13.90, NULL, TRUE),
    ('Suco Galáctico 500ml',   'Suco natural de laranja, 500 ml.',                       'BEBIDA',      11.50, NULL, TRUE),
    ('Água Cósmica 500ml',     'Água mineral sem gás, 500 ml.',                          'BEBIDA',       5.00, NULL, TRUE),
    -- Produto INATIVO: não deve aparecer no catálogo público (teste T-CAT-01)
    ('Pizza Eclipse',          'Sabor de edição limitada, fora do cardápio.',            'ESPECIAL',    61.90, NULL, FALSE);
