# PizzET — Pendências

Questões que **não podem ser decididas pela equipe** sem confirmação. Ao obter resposta, registre data, quem respondeu e a decisão, e atualize `requisitos.md`.

> ⚠️ **Prazo:** hoje é 03/11/2026 e a entrega é 15/11/2026 (12 dias). Pendências marcadas como **BLOQUEANTE** precisam de resposta nesta semana.

## Professores — Lógica e Programação (C#)

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-01 | ASP.NET Core Web API é aceito como "programação em C#"? | Define toda a arquitetura do back-end | **BLOQUEANTE** | — |
| P-02 | Há tópicos obrigatórios a demonstrar (vetores, matrizes, herança, interfaces, tratamento de exceções, etc.)? | Pode exigir exemplos didáticos em `backend/` | Alta | — |
| P-03 | Qual versão do .NET usar (ex.: .NET 8 LTS)? Há restrição de IDE? | Compatibilidade com máquinas do laboratório/hospedagem | Alta | — |
| P-04 | Uso de Entity Framework Core é permitido, ou o professor quer SQL manual (ADO.NET/MySqlConnector)? | Muda a camada de persistência | Alta | — |

## Professores — Banco de Dados (MySQL)

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-05 | O DER é obrigatório? Em qual ferramenta/formato (MySQL Workbench, brModelo, imagem)? | Entregável de documentação | Alta | — |
| P-06 | Modelo conceitual/lógico também é exigido? | Entregável | Média | — |
| P-07 | São obrigatórias consultas especiais (JOIN, GROUP BY, subconsultas), views, procedures, triggers ou relatórios? | Escopo de `database/` | Alta | — |
| P-08 | O script deve ser SQL puro executável no Workbench, ou migrações do EF Core são aceitas? | Se SQL puro, script vira a fonte da verdade | **BLOQUEANTE** (com P-04) | — |

## Professores — Front-End

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-09 | Como entregar o protótipo Figma (link público, PDF, prints)? Precisa de aprovação antes de codificar? | Ordem das fases | **BLOQUEANTE** | — |
| P-10 | Quais campos do cadastro devem ter máscara? CPF é esperado? | Coleta de dados pessoais; máscaras | Média | — |
| P-11 | Login/cadastro podem ser modal ou devem ser páginas? | Estrutura de páginas | Baixa (padrão: páginas) | — |

## Hospedagem e entrega

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-12 | Dados do FTP: host, porta, usuário, diretório — **entregar por canal privado, nunca no repositório** | Publicação do front | Alta | — |
| P-13 | O servidor do FTP executa ASP.NET Core? Tem MySQL? HTTPS? Domínio? | FTP normalmente só serve arquivos estáticos; a API pode precisar de outro host | **BLOQUEANTE** para deploy | — |
| P-14 | Se a API não puder ser hospedada, a apresentação pode ser feita rodando localmente? | Plano B de demonstração | Alta | — |
| P-15 | Formato da entrega: link do repositório, zip, apresentação ao vivo? | Preparação final | Média | — |

## Equipe

| # | Pergunta | Prioridade | Resposta |
|---|----------|------------|----------|
| P-16 | Nomes dos 2 integrantes e divisão de tarefas | Alta | — |
| P-17 | Quem cria e aprova a identidade visual e o protótipo no Figma | **BLOQUEANTE** para Fase 3 | — |
| P-18 | Ambiente de cada integrante: .NET SDK e MySQL 8 instalados? | Alta | — |

## Ambiente verificado nesta sessão (03/11/2026)

Verificado no container de desenvolvimento em nuvem (não nas máquinas da equipe):

- `git` 2.43.0 — disponível.
- `dotnet` — **não instalado**.
- `mysql` / `mysqld` / `mysqlsh` — **não instalados**.

Nada foi instalado. Para compilar e testar a API aqui, será preciso autorizar a instalação do .NET SDK e de um MySQL 8 (ou testar nas máquinas da equipe).
