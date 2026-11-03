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
| FE-02 | Página de login | [C] | [ ] | T-AUTH-02 |
| FE-03 | Página de cadastro (preferir página própria a modal) | [C] / forma [D] | [ ] | T-AUTH-01 |
| FE-04 | Catálogo de produtos | [C] | [ ] | T-CAT-01 |
| FE-05 | Busca de produtos | [C] | [ ] | T-CAT-02 |
| FE-06 | Carrinho de compras | [C] | [ ] | T-CAR-01..03 |
| FE-07 | Página de pedidos realizados | [C] | [ ] | T-PED-03 |
| FE-08 | Perfil / dados do usuário | [C] | [ ] | T-PER-01 |
| FE-09 | Layout responsivo em celular | [C] | [ ] | T-UX-01 |
| FE-10 | Protótipo no Figma **antes** de codificar o visual | [C] | [ ] | T-UX-04 |
| FE-11 | Somente HTML, CSS e JavaScript puros (sem frameworks) | [C] | [ ] | T-UX-05 |
| FE-12 | Máscaras de formatação nos campos aplicáveis do cadastro (ex.: telefone, CPF\*, CEP) | [C] / campos [P] | [ ] | T-VAL-01 |
| FE-13 | Campos numéricos aceitam apenas números, sem prejudicar acessibilidade/edição | [C] | [ ] | T-VAL-02 |
| FE-14 | Modo claro/escuro | [C] | [ ] | T-UX-02 |
| FE-15 | Preferência de tema persistida localmente (`localStorage`) | [D] | [ ] | T-UX-02 |
| FE-16 | Acessibilidade básica: labels, teclado, foco visível, contraste, mensagens de erro | [D] | [ ] | T-UX-03 |
| FE-17 | Identidade visual espacial/alienígena criada do zero; marca PizzET, slogan "A pizza mais rápida da galáxia" | [D] | [ ] | T-UX-04 |
| FE-18 | Tela de acompanhamento de status do pedido (único extra aprovado) | [D] | [ ] | T-PED-04 |
| FE-19 | Telas administrativas: CRUD de produtos e gestão de status de pedidos | [D] (necessário para CS-03/CS-10) | [ ] | T-ADM-01..03 |

\* Coletar CPF **não** é requisito confirmado; só incluir se a equipe decidir (ver pendências). Minimizar dados pessoais.

## 2. Lógica e Programação (C#)

| ID | Requisito | Origem | Estado | Teste |
|----|-----------|--------|--------|-------|
| CS-01 | API em C# com ASP.NET Core Web API | [D] — adequação [P] | [ ] | T-INT-01 |
| CS-02 | API integrada ao Front-End e ao MySQL (integração real, sem dados fixos no JS) | [C] | [ ] | T-INT-01 |
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
| DB-01 | MySQL 8 | [C] versão [D] | [ ] | T-DB-01 |
| DB-02 | Chaves primárias, estrangeiras, índices e restrições (NOT NULL, UNIQUE, CHECK) | [C] | [ ] | T-DB-02 |
| DB-03 | Script SQL versionado no repositório (`database/`) | [C] | [ ] | T-DB-01 |
| DB-04 | DER (diagrama entidade-relacionamento) | [D] — obrigatoriedade [P] | [ ] | revisão |
| DB-05 | Consultas de demonstração | [D] — obrigatoriedade/tipo [P] | [ ] | T-DB-03 |
| DB-06 | Tabelas: usuários, produtos, endereços, pedidos, itens_pedido (+ tabelas do Identity) | [D] | [ ] | T-DB-02 |
| DB-07 | Snapshot do endereço de entrega e do preço unitário no pedido | [D] | [ ] | T-DB-04 |
| DB-08 | Procedures, views, triggers ou relatórios | [P] | [ ] | — |
| DB-09 | Dados de demonstração sem segredos | [D] | [ ] | T-DB-01 |

## 4. Entrega e hospedagem

| ID | Requisito | Origem | Estado |
|----|-----------|--------|--------|
| EN-01 | Entrega até 15/11/2026 | [C] | [ ] |
| EN-02 | Publicação via FTP do professor (dados ainda não fornecidos) | [P] | [ ] |
| EN-03 | Hospedagem da API .NET e do MySQL | [P] | [ ] |
| EN-04 | README com instalação, configuração, execução e roteiro de demonstração | [D] | [~] |
| EN-05 | Nenhum segredo versionado | [D] | [~] (`.gitignore` criado) |
