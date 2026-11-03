# PizzET — Pendências

Questões que **não podem ser decididas pela equipe** sem confirmação. Ao obter resposta, registre data, quem respondeu e a decisão, e atualize `requisitos.md`.

> ⚠️ **Prazo:** a entrega final é 15/11/2026. Pendências marcadas como **BLOQUEANTE** precisam de resposta nesta semana.

## ✅ Respondidas

| # | Pergunta | Resposta | Data / fonte | Impacto |
|---|----------|----------|--------------|---------|
| P-09 | Como entregar o Figma? Precisa de aprovação? | **Não precisa entregar.** O professor disse que fazer é opcional. | 03/11/2026, relato da equipe | FE-10 deixa de ser obrigatório. Recomenda-se um rascunho rápido para alinhar a dupla. |
| P-10 | Quais campos do cadastro têm máscara? CPF é esperado? | **Telefone, CEP, CPF, Nome; "basicamente todos os campos".** CPF passa a ser coletado. | 03/11/2026, relato da equipe | FE-12 ampliado; CPF entra no modelo de dados com validação no servidor. |
| P-11 | Login/cadastro: modal ou página? | **Pode ser separado, mas é melhor modal.** | 03/11/2026, relato da equipe | Login e cadastro serão **modais acessíveis** (`<dialog>`). |
| P-19 | Como será a avaliação? | **Apresentação ao vivo + leitura de código + perguntas individuais.** | 03/11/2026, relato da equipe | Os dois integrantes precisam conseguir explicar todo o código; priorizar simplicidade. |
| P-20 | Há referência específica para responsividade/acessibilidade? | **Não.** | 03/11/2026, relato da equipe | Seguir boas práticas básicas já listadas (FE-09, FE-16). |
| P-21 | Como comprovar o deploy? | Documento **"Evidências_Deploy_App_FileZilla"** (Prof. Mauricio de Souza Fernandes, atividade "Trabalho Interdisciplinar", 3 pontos, publicada em 23/10): 5 prints padronizados via FileZilla + cabeçalho + checklist. | 03/11/2026, documento enviado | Novo grupo de requisitos DEP-01..10; roteiro em `deploy.md`. |

## Professores — Lógica e Programação (C#)

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-01 | ASP.NET Core Web API é aceito como "programação em C#"? | Define toda a arquitetura do back-end | **BLOQUEANTE** | — |
| P-02 | Há tópicos obrigatórios a demonstrar (vetores, matrizes, herança, interfaces, exceções…)? Podem ficar em exemplos separados? | Pode exigir exemplos didáticos em `backend/` | Alta | — |
| P-03 | Qual versão do .NET (ex.: .NET 8 LTS)? Há restrição de IDE? | Compatibilidade | Alta | — |
| P-04 | EF Core é permitido, ou SQL manual (ADO.NET/MySqlConnector)? | Camada de persistência | Alta | — |

## Professores — Banco de Dados (MySQL)

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-05 | O DER é obrigatório? Em qual ferramenta/formato? | Entregável | Alta | — |
| P-06 | Modelo conceitual/lógico também é exigido? | Entregável | Média | — |
| P-07 | Consultas especiais (JOIN, GROUP BY, subconsultas), views, procedures, triggers ou relatórios são obrigatórios? | Escopo de `database/` | Alta | — |
| P-08 | Script SQL puro executável no Workbench, ou migrações EF Core são aceitas? | Fonte da verdade do banco | **BLOQUEANTE** (com P-04) | — |

## Hospedagem e deploy (atividade do Prof. Mauricio)

O roteiro exige, no **Print 5**, uma URL pública com **HTTPS válido**, documento principal com **200 OK** e console **sem erros 404, 500 ou CORS**. Upload por FTP/SFTP publica apenas arquivos; não garante que a API C# e o MySQL rodem no servidor.

| # | Pergunta | Impacto | Prioridade | Resposta |
|---|----------|---------|------------|----------|
| P-12 | Dados de acesso do FTP/SFTP (host, porta, usuário, diretório). **Recebê-los por canal privado; nunca no repositório.** | Prints 1–4 | **BLOQUEANTE** | — |
| P-13 | O servidor do FTP executa **ASP.NET Core** e oferece **MySQL**? | Se não, a API e o banco ficam em outro host | **BLOQUEANTE** | — |
| P-22 | O servidor tem **HTTPS** com certificado válido e domínio próprio? | Print 5 exige cadeado | **BLOQUEANTE** | — |
| P-23 | Para o deploy, basta publicar o **Front-End** via FTP, com a API hospedada em outro serviço? Ou a API também precisa estar no FTP? | Escolha de hospedagem da API | **BLOQUEANTE** | — |
| P-24 | Qual o **prazo** da atividade de deploy e o formato de entrega (Word preenchido, PDF)? | Cronograma | Alta | — |
| P-25 | Protocolo: **FTP ou SFTP**? O exemplo do documento usa SFTP na porta 22. | Print 1 | Média | — |
| P-14 | Se a API não puder ser hospedada, a apresentação pode ser feita localmente? | Plano B | Alta | — |
| P-15 | Formato da entrega final: link do repositório, zip, apresentação? Horário em 15/11? | Preparação | Média | — |
| P-26 | O trabalho é avaliado em conjunto pelos professores ou cada um avalia sua parte? | Priorização | Média | — |

## Equipe

| # | Pergunta | Prioridade | Resposta |
|---|----------|------------|----------|
| P-16 | Nomes dos 2 integrantes e divisão de tarefas; quem será o "Responsável Técnico" do deploy | Alta | — |
| P-17 | Quem define a identidade visual (Figma opcional; um rascunho rápido ajuda) | Média | — |
| P-18 | Ambiente de cada integrante: .NET SDK, MySQL 8 e FileZilla instalados? | Alta | — |

## Riscos registrados

- **R-01: front e API em domínios diferentes.** Se o Front-End ficar no servidor do FTP e a API em outro serviço, a autenticação por cookie vira um cookie de terceiros. Safari, Firefox e o modo anônimo do Chrome costumam bloquear esse tipo de cookie. Isso quebraria o login e pode gerar erros no console, o que conflita com o Print 5. Mitigação a decidir quando P-13/P-23 forem respondidas (ver `arquitetura.md` §6):
  1. front e API no mesmo domínio; ou
  2. trocar o cookie por **token Bearer** do Identity com CORS restrito à origem do front.
- **R-02: CPF é dado pessoal sensível (LGPD).** Validar no servidor, impedir duplicidade, não registrar em logs e usar apenas CPFs fictícios (gerados, válidos no algoritmo) nos dados de demonstração e nos prints.

## Ambiente verificado nesta sessão (03/11/2026)

Verificado no container de desenvolvimento em nuvem (não nas máquinas da equipe):

- `git` 2.43.0: disponível.
- `dotnet`: **não instalado**.
- `mysql` / `mysqld` / `mysqlsh`: **não instalados**.
- Push para o GitHub: **falhou (403)** por falta de acesso do Claude ao repositório.

Nada foi instalado.
