-- =====================================================================
-- PizzET - 99_testes_restricoes.sql - Testes das restrições do banco
-- =====================================================================
-- Use SOMENTE em banco de teste: insere dados fictícios.
-- Depois, rode 01_schema.sql e 02_dados_demo.sql de novo para limpar.
--
-- Linha de comando (continua após cada erro esperado):
--   mysql -u root -p --force < database/99_testes_restricoes.sql
-- Resultado esperado: as consultas válidas passam e cada INSERT/DELETE
-- da seção "INVÁLIDOS" falha (21 erros), cada um com a regra violada.
-- CPF usado: número fictício que apenas passa no algoritmo.
-- =====================================================================
SET NAMES utf8mb4;
USE pizzet;
-- ===== VÁLIDOS (devem passar) =====
INSERT INTO usuarios (nome, cpf, email, normalized_email, user_name, normalized_user_name, phone_number) VALUES ('Ana Teste','52998224725','ana@teste.dev','ANA@TESTE.DEV','ana@teste.dev','ANA@TESTE.DEV','61999998888');
INSERT INTO usuarios (nome, email, normalized_email) VALUES ('Admin Seed','admin@teste.dev','ADMIN@TESTE.DEV');
INSERT INTO usuarios_papeis VALUES (1,1),(2,2);
INSERT INTO enderecos (usuario_id, cep, logradouro, numero, bairro, cidade, uf) VALUES (1,'70040010','Rua das Estrelas','42','Centro','Brasília','DF');
INSERT INTO pedidos (usuario_id, forma_pagamento, subtotal, taxa_entrega, total, entrega_cep, entrega_logradouro, entrega_numero, entrega_bairro, entrega_cidade, entrega_uf) VALUES (1,'PIX',113.80,8.00,121.80,'70040010','Rua das Estrelas','42','Centro','Brasília','DF');
INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade) VALUES (1,1,'Margherita Marciana',49.90,2),(1,9,'Refrigerante 2L',14.00,1);
SELECT 'subtotais calculados' AS t, nome_produto, subtotal FROM itens_pedido;
SELECT 'busca sem acento' AS t, nome FROM produtos WHERE nome LIKE '%lactea%';
-- ===== INVÁLIDOS (cada um deve falhar) =====
SELECT '--- inválidos ---' AS t;
INSERT INTO produtos (nome, categoria, preco) VALUES ('Preco Negativo','PIZZA_SALGADA',-5);
INSERT INTO produtos (nome, categoria, preco) VALUES ('Categoria Errada','SOBREMESA',10);
INSERT INTO produtos (nome, categoria, preco) VALUES ('Margherita Marciana','PIZZA_SALGADA',10);
INSERT INTO usuarios (nome, cpf, email, normalized_email) VALUES ('Cpf Letras','1234567890A','x@t.dev','X@T.DEV');
INSERT INTO usuarios (nome, cpf, email, normalized_email) VALUES ('Cpf Duplicado','52998224725','y@t.dev','Y@T.DEV');
INSERT INTO usuarios (nome, email, normalized_email) VALUES ('Email Duplicado','ana@teste.dev','ANA@TESTE.DEV');
INSERT INTO usuarios (nome, phone_number) VALUES ('Tel Curto','123');
INSERT INTO usuarios (nome) VALUES (' ');
INSERT INTO enderecos (usuario_id, cep, logradouro, numero, bairro, cidade, uf) VALUES (1,'7004-001','R','1','B','C','DF');
INSERT INTO enderecos (usuario_id, cep, logradouro, numero, bairro, cidade, uf) VALUES (1,'70040010','R','S/N','B','C','DF');
INSERT INTO enderecos (usuario_id, cep, logradouro, numero, bairro, cidade, uf) VALUES (1,'70040010','R','1','B','C','df');
INSERT INTO enderecos (usuario_id, cep, logradouro, numero, bairro, cidade, uf) VALUES (999,'70040010','R','1','B','C','DF');
INSERT INTO pedidos (usuario_id, forma_pagamento, subtotal, taxa_entrega, total, entrega_cep, entrega_logradouro, entrega_numero, entrega_bairro, entrega_cidade, entrega_uf) VALUES (1,'PIX',100,8,50,'70040010','R','1','B','C','DF');
INSERT INTO pedidos (usuario_id, status, forma_pagamento, subtotal, total, entrega_cep, entrega_logradouro, entrega_numero, entrega_bairro, entrega_cidade, entrega_uf) VALUES (1,'VOANDO','PIX',10,10,'70040010','R','1','B','C','DF');
INSERT INTO pedidos (usuario_id, forma_pagamento, subtotal, total, entrega_cep, entrega_logradouro, entrega_numero, entrega_bairro, entrega_cidade, entrega_uf) VALUES (1,'BITCOIN',10,10,'70040010','R','1','B','C','DF');
INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade) VALUES (1,2,'X',10,0);
INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade) VALUES (1,2,'X',10,21);
INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade) VALUES (1,1,'Dup',10,1);
INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade, subtotal) VALUES (1,3,'X',10,1,999);
DELETE FROM produtos WHERE id = 1;
DELETE FROM usuarios WHERE id = 1;
-- ===== SNAPSHOT =====
SELECT '--- snapshot ---' AS t;
UPDATE produtos SET preco = 99.99 WHERE id = 1;
DELETE FROM enderecos WHERE usuario_id = 1;
SELECT p.id, p.entrega_logradouro, i.nome_produto, i.preco_unitario, pr.preco AS preco_atual FROM pedidos p JOIN itens_pedido i ON i.pedido_id = p.id JOIN produtos pr ON pr.id = i.produto_id;
