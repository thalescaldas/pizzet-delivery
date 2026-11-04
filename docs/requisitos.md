# PizzET — Checklist de requisitos

Fonte: `CLAUDE.md` (enunciado repassado pela equipe). Nada aqui foi inventado; o que depende de confirmação dos professores está marcado como **PENDENTE** e detalhado em [`pendencias.md`](pendencias.md).

**Legenda de origem**
- **[C] Confirmado** — consta no enunciado fornecido.
- **[D] Decisão da equipe** — escolha técnica/de escopo registrada no `CLAUDE.md`, não exigida explicitamente pelo professor.
- **[P] Pendente** — precisa de confirmação.

**Legenda de estado:** `[ ]` não iniciado · `[~]` em andamento · `[x]` concluído e verificado (com evidência no plano de testes).

> Estado atual (03/11/2026): apenas a fundação documental existe. **Nenhum requisito funcional foi implementado.**

---

## 1. Front-End

| ID | Requisito | Origem | Estado | Teste (plano-de-testes.md) |
|----|-----------|--------|--------|------------------------------|
| FE-01 | Home com apresentação, barra de navegação, botões de login e cadastro e rodapé | [C] | [ ] | T-FE-01 |
| FE-02 | Login, preferencialmente em **modal** acessível (professor: "é melhor modal") | [C] | [ ] | T-AUTH-02, T-UX-06 |
| FE-03 | Cadastro, preferencialmente em **modal** acessível | [C] | [ ] | T-AUTH-01, T-UX-06 |
| FE-04 | Catálogo de produtos | [C] | [ ] | T-CAT-01 |
| FE-05 | Busca de produtos | [C] | [ ] | T-CAT-02 |
| FE-06 | Carrinho de compras | [C] | [ ] | T-CAR-01..03 |
| FE-07 | Página de pedidos realizados | [C] | [ ] | T-PED-03 |
| FE-08 | Perfil / dados do usuário | [C] | [ ] | T-PER-01 |
| FE-09 | Layout responsivo em celular | [C] | [ ] | T-UX-01 |
| FE-10 | Protótipo no Figma: **opcional**, o professor disse que não precisa entregar. Recomendado um rascunho rápido. | [C] (opcional) | [ ] | T-UX-04 |
| FE-11 | Somente HTML, CSS e JavaScript puros (sem frameworks) | [C] | [ ] | T-UX-05 |
| FE-12 | Máscaras em "basicamente todos os campos" do cadastro: **Nome, CPF, Telefone, CEP** (e demais aplicáveis: UF, número) | [C] | [ ] | T-VAL-01 |
| FE-12a | CPF coletado no cadastro, com validação dos dígitos verificadores no servidor e unicidade | [C] (P-10) | [ ] | T-VAL-04 |
| FE-13 | Campos numéricos aceitam apenas números, sem prejudicar acessibilidade/edição | [C] | [ ] | T-VAL-02 |
| FE-14 | Modo claro/escuro | [C] | [ ] | T-UX-02 |
| FE-15 | Preferência de tema persistida localmente (`localStorage`) | [D] | [ ] | T-UX-02 |
| FE-16 | Acessibilidade básica: labels, teclado, foco visível, contraste, mensagens de erro | [D] | [ ] | T-UX-03 |
| FE-17 | Identidade visual espacial/alienígena criada do zero; marca PizzET, slogan "A pizza mais rápida da galáxia" | [D] | [ ] | T-UX-04 |
| FE-18 | Tela de acompanhamento de status do pedido (único extra aprovado) | [D] | [ ] | T-PED-04 |
| FE-19 | Telas administrativas: CRUD de produtos e gestão de status de pedidos | [D] (necessário para CS-03/CS-10) | [ ] | T-ADM-01..03 |

Sobre as máscaras do FE-12: em **Nome**, "máscara" significa aceitar apenas letras (com acentos), espaço, apóstrofo e hífen, removendo espaços duplicados. Não haverá capitalização automática, que erraria nomes como "da Silva". Esta interpretação é da equipe.

## 2. Lógica e Programação (C#)

| ID | Requisito | Origem | Estado | Teste |
|----|-----------|--------|--------|-------|
| CS-01 | API em C# com ASP.NET Core Web API | [D] — adequação [P] | [~] esqueleto .NET 8 compilando | T-INT-01 |
| CS-02 | API integrada ao Front-End e ao MySQL (integração real, sem dados fixos no JS) | [C] | [~] API ↔ MySQL ok (produtos); front pendente | T-INT-01 |
| CS-03 | CRUD real de produtos: criar, ler, atualizar, desativar (exclusão lógica) | [C] | [ ] | T-ADM-01 |
| CS-04 | CRUD de produtos restrito a Administrador | [D] | [ ] | T-ADM-02 |
| CS-05 | Uso de classes, métodos, listas, condicionais, laços e orientação a objetos onde fizer sentido | [C] — tópicos específicos [P] | [ ] | revisão de código |
| CS-06 | Exemplos didáticos separados de vetores/matrizes, se o professor exigir | [P] | [ ] | — |
| CS-07 | Autenticação com ASP.NET Core Identity; senhas apenas com hash | [D] | [ ] | T-SEG-01 |
| CS-08 | Papéis Cliente e Administrador; admin criado por seed de desenvolvimento | [D] | [ ] | T-ADM-02 |
| CS-09 | Preços e totais calculados no servidor; permissões validadas no servidor | [D] | [ ] | T-CAR-03, T-SEG-02 |
| CS-10 | Status do pedido com transições validadas no servidor | [D] | [ ] | T-PED-05 |
| CS-11 | Checkout com pagamento **simulado**; apenas delivery | [D] | [ ] | T-PED-01 |
| CS-12 | Endpoints de autenticação, produtos, perfil, endereços, pedidos e admin (ver `arquitetura.md`) | [D] | [ ] | vários |
| CS-13 | Validação de entrada e erros de API padronizados | [D] | [ ] | T-VAL-03 |

## 3. Banco de Dados (MySQL)

| ID | Requisito | Origem | Estado | Teste |
|----|-----------|--------|--------|-------|
| DB-01 | MySQL 8 | [C] versão [D] | [x] testado no 8.0.46 | T-DB-01 |
| DB-02 | Chaves primárias, estrangeiras, índices e restrições (NOT NULL, UNIQUE, CHECK) | [C] | [x] testado (T-DB-01/02) | T-DB-02 |
| DB-03 | Script SQL versionado no repositório (`database/`). **É o entregável de BD**, com dados completados pelo C# | [C] | [x] testado (T-DB-01/02) | T-DB-01 |
| DB-04 | DER: **não obrigatório**, só base de projeto (Prof. Thiago, 03/11) | [C] opcional | [x] `database/der.md` | revisão |
| DB-05 | Consultas de demonstração: **não exigidas** (Prof. Thiago, 04/11) | [C] não exigido | — | — |
| DB-06 | Tabelas: usuários, produtos, endereços, pedidos, itens_pedido (+ tabelas do Identity) | [D] | [x] testado (T-DB-01/02) | T-DB-02 |
| DB-07 | Snapshot do endereço de entrega e do preço unitário no pedido | [D] | [~] colunas criadas; uso depende da API | T-DB-04 |
| DB-08 | Procedures, views, triggers ou relatórios: **não exigidos** (Prof. Thiago, 04/11) | [C] não exigido | — | — |
| DB-09 | Dados de demonstração sem segredos | [D] | [~] `02_dados_demo.sql` | T-DB-01 |

## 4. Deploy (atividade "Trabalho Interdisciplinar", Prof. Mauricio, 3 pontos)

Fonte: documento "Evidências_Deploy_App_FileZilla". Roteiro detalhado em [`deploy.md`](deploy.md).

| ID | Requisito | Origem | Estado | Teste |
|----|-----------|--------|--------|-------|
| DEP-01 | Publicar a aplicação via **FileZilla (FTP/SFTP)** | [C] | [ ] | T-DEP-01..04 |
| DEP-02 | Cabeçalho de identificação preenchido (sistema, versão, ambiente, host, diretório, data/hora, responsável, status) | [C] | [ ] | revisão |
| DEP-03 | EVID-01: print da conexão com log "Autenticado" e "Listagem do diretório concluída" destacado em vermelho, senha oculta | [C] | [ ] | T-DEP-01 |
| DEP-04 | EVID-02: print local × remoto pré-upload | [C] | [ ] | T-DEP-02 |
| DEP-05 | EVID-03: print da fila com **0 falhas** (destacado em vermelho) e fila vazia | [C] | [ ] | T-DEP-03 |
| DEP-06 | EVID-04: print da listagem remota com data/hora do deploy e permissões 0755/0644 | [C] | [ ] | T-DEP-04 |
| DEP-07 | EVID-05: URL pública com **HTTPS válido**, documento **200 OK**, console **sem erros 404/500/CORS** | [C] | [ ] | T-DEP-05 |
| DEP-08 | Prints com interface completa, data/hora e barras de status legíveis; dados sensíveis ocultos | [C] | [ ] | revisão |
| DEP-09 | Checklist: backup prévio, config de produção preservada, histórico de logins limpo, cache limpo | [C] | [ ] | revisão |
| DEP-10 | Prazo e formato de entrega da atividade de deploy | [P] (P-24) | [ ] | — |

## 5. Entrega, apresentação e hospedagem

| ID | Requisito | Origem | Estado |
|----|-----------|--------|--------|
| EN-01 | Entrega até 15/11/2026 | [C] | [ ] |
| EN-02 | Dados do FTP do professor (ainda não fornecidos) | [P] (P-12) | [ ] |
| EN-03 | Hospedagem da API .NET e do MySQL com HTTPS | [P] (P-13, P-22, P-23) | [ ] |
| EN-06 | Apresentação ao vivo + leitura de código + **perguntas individuais**: os dois integrantes explicam todo o sistema | [C] | [ ] |
| EN-04 | README com instalação, configuração, execução e roteiro de demonstração | [D] | [~] |
| EN-05 | Nenhum segredo versionado | [D] | [~] (`.gitignore` criado) |
