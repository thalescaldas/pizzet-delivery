-- =====================================================================
-- PizzET - "A pizza mais rápida da galáxia"
-- 01_schema.sql - Criação do banco de dados (MySQL 8.0.16 ou superior)
-- =====================================================================
-- ATENÇÃO: este script RECRIA as tabelas do zero (DROP TABLE).
-- Use apenas em ambiente de desenvolvimento/demonstração.
-- Não contém usuários, senhas nem qualquer segredo.
--
-- Ordem de execução: 01_schema.sql -> 02_dados_demo.sql
--
-- Convenções:
--   * Tabelas e colunas em snake_case.
--   * Tabelas do domínio em português.
--   * Tabelas de login usam a estrutura exigida pelo ASP.NET Core
--     Identity, renomeadas para português, mas com as colunas no nome
--     original do framework (ex.: password_hash, normalized_email).
--   * Valores monetários em DECIMAL(10,2) (nunca FLOAT/DOUBLE).
--   * CPF, CEP e telefone guardados SOMENTE com dígitos (sem máscara).
-- =====================================================================

-- Garante que os acentos do script sejam lidos corretamente em qualquer cliente
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS pizzet
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;   -- "ai_ci": ignora acentos e maiúsculas na busca

USE pizzet;

-- Remove na ordem inversa das dependências (filhas antes das mães)
DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS enderecos;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS usuarios_tokens;
DROP TABLE IF EXISTS usuarios_logins;
DROP TABLE IF EXISTS usuarios_claims;
DROP TABLE IF EXISTS papeis_claims;
DROP TABLE IF EXISTS usuarios_papeis;
DROP TABLE IF EXISTS papeis;
DROP TABLE IF EXISTS usuarios;

-- =====================================================================
-- PARTE 1 - USUÁRIOS E PAPÉIS (estrutura do ASP.NET Core Identity)
-- =====================================================================

-- Usuários do sistema (clientes e administradores).
-- A senha NUNCA é guardada: apenas o hash gerado pelo Identity.
CREATE TABLE usuarios (
    id                     INT          NOT NULL AUTO_INCREMENT,
    nome                   VARCHAR(120) NOT NULL,
    cpf                    CHAR(11)     NULL,     -- obrigatório no cadastro público (validado na API); NULL só para o admin de seed
    criado_em              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Colunas exigidas pelo Identity
    user_name              VARCHAR(256) NULL,
    normalized_user_name   VARCHAR(256) NULL,
    email                  VARCHAR(256) NULL,
    normalized_email       VARCHAR(256) NULL,
    email_confirmed        BOOLEAN      NOT NULL DEFAULT FALSE,
    password_hash          VARCHAR(255) NULL,
    security_stamp         VARCHAR(255) NULL,
    concurrency_stamp      VARCHAR(255) NULL,
    phone_number           VARCHAR(11)  NULL,     -- telefone: só dígitos, DDD + número
    phone_number_confirmed BOOLEAN      NOT NULL DEFAULT FALSE,
    two_factor_enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
    lockout_end            DATETIME(6)  NULL,
    lockout_enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    access_failed_count    INT          NOT NULL DEFAULT 0,

    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_normalized_user_name UNIQUE (normalized_user_name),
    CONSTRAINT uq_usuarios_normalized_email     UNIQUE (normalized_email),
    CONSTRAINT uq_usuarios_cpf                  UNIQUE (cpf),
    CONSTRAINT ck_usuarios_nome_preenchido CHECK (CHAR_LENGTH(TRIM(nome)) >= 2),
    CONSTRAINT ck_usuarios_cpf_digitos     CHECK (REGEXP_LIKE(cpf, '^[0-9]{11}$')),
    CONSTRAINT ck_usuarios_telefone        CHECK (REGEXP_LIKE(phone_number, '^[0-9]{10,11}$')),
    CONSTRAINT ck_usuarios_falhas          CHECK (access_failed_count >= 0)
) ENGINE = InnoDB;
-- Observação: em MySQL, um CHECK sobre valor NULL não é violado,
-- por isso cpf e phone_number podem ficar vazios (NULL) no admin.

-- Papéis (perfis de acesso): Cliente e Administrador.
CREATE TABLE papeis (
    id                INT          NOT NULL AUTO_INCREMENT,
    name              VARCHAR(256) NULL,
    normalized_name   VARCHAR(256) NULL,
    concurrency_stamp VARCHAR(255) NULL,

    CONSTRAINT pk_papeis PRIMARY KEY (id),
    CONSTRAINT uq_papeis_normalized_name UNIQUE (normalized_name)
) ENGINE = InnoDB;

-- Relação N:N entre usuários e papéis.
CREATE TABLE usuarios_papeis (
    user_id INT NOT NULL,
    role_id INT NOT NULL,

    CONSTRAINT pk_usuarios_papeis PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_usuarios_papeis_usuario FOREIGN KEY (user_id)
        REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_usuarios_papeis_papel FOREIGN KEY (role_id)
        REFERENCES papeis (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- As três tabelas abaixo são exigidas internamente pelo Identity.
-- O PizzET quase não as utiliza, mas elas precisam existir.
CREATE TABLE usuarios_claims (
    id          INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    claim_type  VARCHAR(255) NULL,
    claim_value VARCHAR(255) NULL,

    CONSTRAINT pk_usuarios_claims PRIMARY KEY (id),
    CONSTRAINT fk_usuarios_claims_usuario FOREIGN KEY (user_id)
        REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE papeis_claims (
    id          INT          NOT NULL AUTO_INCREMENT,
    role_id     INT          NOT NULL,
    claim_type  VARCHAR(255) NULL,
    claim_value VARCHAR(255) NULL,

    CONSTRAINT pk_papeis_claims PRIMARY KEY (id),
    CONSTRAINT fk_papeis_claims_papel FOREIGN KEY (role_id)
        REFERENCES papeis (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE usuarios_logins (
    login_provider        VARCHAR(128) NOT NULL,
    provider_key          VARCHAR(128) NOT NULL,
    provider_display_name VARCHAR(255) NULL,
    user_id               INT          NOT NULL,

    CONSTRAINT pk_usuarios_logins PRIMARY KEY (login_provider, provider_key),
    CONSTRAINT fk_usuarios_logins_usuario FOREIGN KEY (user_id)
        REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE usuarios_tokens (
    user_id        INT          NOT NULL,
    login_provider VARCHAR(128) NOT NULL,
    name           VARCHAR(128) NOT NULL,
    value          TEXT         NULL,

    CONSTRAINT pk_usuarios_tokens PRIMARY KEY (user_id, login_provider, name),
    CONSTRAINT fk_usuarios_tokens_usuario FOREIGN KEY (user_id)
        REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================================
-- PARTE 2 - DOMÍNIO DA PIZZARIA
-- =====================================================================

-- Produtos do cardápio. Nunca são apagados: são DESATIVADOS (ativo = FALSE)
-- para não quebrar o histórico de pedidos (exclusão lógica).
CREATE TABLE produtos (
    id            INT           NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(100)  NOT NULL,
    descricao     VARCHAR(500)  NOT NULL DEFAULT '',
    categoria     VARCHAR(20)   NOT NULL,
    preco         DECIMAL(10,2) NOT NULL,
    imagem_url    VARCHAR(255)  NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_produtos PRIMARY KEY (id),
    CONSTRAINT uq_produtos_nome UNIQUE (nome),
    CONSTRAINT ck_produtos_preco     CHECK (preco > 0 AND preco <= 9999.99),
    CONSTRAINT ck_produtos_categoria CHECK (categoria IN ('TRADICIONAL', 'ESPECIAL', 'PREMIUM', 'DOCE', 'BEBIDA')),
    CONSTRAINT ck_produtos_nome      CHECK (CHAR_LENGTH(TRIM(nome)) >= 2)
) ENGINE = InnoDB;

-- Índice para o catálogo: "produtos ativos de uma categoria".
CREATE INDEX ix_produtos_ativo_categoria ON produtos (ativo, categoria);

-- Endereços de entrega cadastrados por cada usuário (1 usuário : N endereços).
CREATE TABLE enderecos (
    id          INT          NOT NULL AUTO_INCREMENT,
    usuario_id  INT          NOT NULL,
    apelido     VARCHAR(30)  NOT NULL DEFAULT 'Casa',   -- ex.: Casa, Trabalho
    cep         CHAR(8)      NOT NULL,
    logradouro  VARCHAR(150) NOT NULL,
    numero      VARCHAR(6)   NOT NULL,
    complemento VARCHAR(60)  NULL,
    bairro      VARCHAR(80)  NOT NULL,
    cidade      VARCHAR(80)  NOT NULL,
    uf          CHAR(2)      NOT NULL,
    criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_enderecos PRIMARY KEY (id),
    CONSTRAINT fk_enderecos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT ck_enderecos_cep    CHECK (REGEXP_LIKE(cep, '^[0-9]{8}$')),
    CONSTRAINT ck_enderecos_numero CHECK (REGEXP_LIKE(numero, '^[0-9]{1,6}$')),
    CONSTRAINT ck_enderecos_uf     CHECK (REGEXP_LIKE(uf, '^[A-Z]{2}$', 'c'))  -- 'c' = diferencia maiúsculas
) ENGINE = InnoDB;
-- A FK fk_enderecos_usuario já cria automaticamente um índice em usuario_id.

-- Pedidos. O endereço é COPIADO (snapshot) para o pedido: se o cliente
-- editar ou apagar o endereço depois, o pedido antigo não muda.
CREATE TABLE pedidos (
    id                  INT           NOT NULL AUTO_INCREMENT,
    usuario_id          INT           NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'RECEBIDO',
    forma_pagamento     VARCHAR(10)   NOT NULL,   -- pagamento SIMULADO, nenhuma cobrança real
    subtotal            DECIMAL(10,2) NOT NULL,
    taxa_entrega        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total               DECIMAL(10,2) NOT NULL,

    -- Snapshot do endereço de entrega
    entrega_cep         CHAR(8)       NOT NULL,
    entrega_logradouro  VARCHAR(150)  NOT NULL,
    entrega_numero      VARCHAR(6)    NOT NULL,
    entrega_complemento VARCHAR(60)   NULL,
    entrega_bairro      VARCHAR(80)   NOT NULL,
    entrega_cidade      VARCHAR(80)   NOT NULL,
    entrega_uf          CHAR(2)       NOT NULL,

    criado_em           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_pedidos PRIMARY KEY (id),
    -- RESTRICT: não deixa apagar um usuário que tem pedidos (preserva o histórico)
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT ck_pedidos_status CHECK (status IN
        ('RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO')),
    CONSTRAINT ck_pedidos_pagamento CHECK (forma_pagamento IN ('PIX', 'CARTAO', 'DINHEIRO')),
    CONSTRAINT ck_pedidos_subtotal  CHECK (subtotal > 0),
    CONSTRAINT ck_pedidos_taxa      CHECK (taxa_entrega >= 0),
    CONSTRAINT ck_pedidos_total     CHECK (total = subtotal + taxa_entrega),
    CONSTRAINT ck_pedidos_cep       CHECK (REGEXP_LIKE(entrega_cep, '^[0-9]{8}$')),
    CONSTRAINT ck_pedidos_uf        CHECK (REGEXP_LIKE(entrega_uf, '^[A-Z]{2}$', 'c'))
) ENGINE = InnoDB;

-- "Meus pedidos, do mais recente ao mais antigo" (página de histórico).
CREATE INDEX ix_pedidos_usuario_data ON pedidos (usuario_id, criado_em);
-- "Pedidos por status" (painel do administrador).
CREATE INDEX ix_pedidos_status_data  ON pedidos (status, criado_em);

-- Itens de cada pedido. O nome e o preço do produto são COPIADOS
-- (snapshot): mudar o preço no cardápio não altera pedidos antigos.
CREATE TABLE itens_pedido (
    id             INT           NOT NULL AUTO_INCREMENT,
    pedido_id      INT           NOT NULL,
    produto_id     INT           NOT NULL,
    nome_produto   VARCHAR(100)  NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade     INT           NOT NULL,
    -- Coluna calculada pelo próprio MySQL: sempre igual a preço x quantidade
    subtotal       DECIMAL(10,2) AS (preco_unitario * quantidade) STORED,

    CONSTRAINT pk_itens_pedido PRIMARY KEY (id),
    CONSTRAINT fk_itens_pedido_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos (id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_pedido_produto FOREIGN KEY (produto_id)
        REFERENCES produtos (id) ON DELETE RESTRICT,
    -- Um mesmo produto aparece uma única vez por pedido (usa-se a quantidade)
    CONSTRAINT uq_itens_pedido_produto UNIQUE (pedido_id, produto_id),
    CONSTRAINT ck_itens_preco      CHECK (preco_unitario > 0),
    CONSTRAINT ck_itens_quantidade CHECK (quantidade BETWEEN 1 AND 20)
) ENGINE = InnoDB;
