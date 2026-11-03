# PizzET — Roteiro de deploy e evidências

Baseado no documento **"Proposição de Evidências de Deploy — Roteiro de Validação e Publicação de Sistema via FileZilla (FTP/SFTP)"**, do Prof. Mauricio de Souza Fernandes (atividade "Trabalho Interdisciplinar", 3 pontos, publicada em 23/10/2026).

> ⚠️ Ainda **não houve deploy**. Dados do FTP, hospedagem da API e HTTPS estão pendentes (P-12, P-13, P-22, P-23 em `pendencias.md`).
> 🔒 **Nunca** coloque host, usuário ou senha do FTP neste repositório. Nos prints, **oculte senhas e tokens**.

## 1. Cabeçalho de identificação (preencher no documento entregue)

| Campo | Valor |
|-------|-------|
| Nome do Sistema / Projeto | PizzET — Delivery de Pizzas |
| Versão / Release | ex.: `v1.0.0`, igual à tag no Git |
| Ambiente de Destino | Produção |
| Protocolo & Host | a definir (P-12, P-25); não versionar |
| Diretório Remoto Alvo | a definir, ex.: `/public_html/` |
| Data e Hora da Execução | DD/MM/AAAA - HH:MM:SS |
| Responsável Técnico | a definir (P-16) |
| Status da Publicação | Concluído com Sucesso / Homologado |

## 2. Os 5 prints obrigatórios

Todo print deve mostrar a **interface completa** com **data, hora e barras de status legíveis**.

| Código | Print | O que precisa aparecer | Destaque exigido |
|--------|-------|------------------------|------------------|
| EVID-01 | Conexão e autenticação | Host, usuário e porta; log com `Status: Autenticado` e `Status: Listagem do diretório "/" concluída` | Caixa **vermelha** na mensagem de sucesso; senha oculta |
| EVID-02 | Local × remoto (pré-upload) | Esquerda: pasta `frontend/` (origem); direita: diretório remoto limpo/pronto | Correspondência visível entre origem e destino |
| EVID-03 | Fila pós-transferência | Aba "Transferências bem-sucedidas" com total de arquivos e tamanho; "Transferências com falha" = **0**; "Fila de arquivos" vazia | **'0' de falhas em vermelho** |
| EVID-04 | Listagem remota | `index.html`, arquivos de `css/` e `js/` (e `.htaccess` se houver); coluna Data/Hora = horário do deploy; permissões **0755** (pastas) e **0644** (arquivos) | Data/hora bem visíveis |
| EVID-05 | Navegador + DevTools | URL pública com **HTTPS/cadeado**; página renderizada sem falha de CSS/JS; Network: documento principal **200 OK**; Console **sem erros 404, 500 ou CORS** | Grifar a barra HTTPS e o **200 OK** |

### O que isso exige do sistema (consequências técnicas)
- **EVID-05 sem erros no console:** todos os caminhos de CSS/JS/imagens precisam ser **relativos e corretos**, incluindo um `favicon`, para não gerar 404. A API precisa estar no ar e com **CORS** configurado para a origem pública do front.
- **Sem pasta de build:** como o front é HTML/CSS/JS puro, a "pasta compilada" do EVID-02 é a própria `frontend/`. A URL da API deve ser configurável em um único arquivo (ex.: `frontend/js/config.js`).
- **HTTPS:** depende do servidor (P-22). Sem certificado válido, o EVID-05 não é atendido.

## 3. Checklist complementar (antes da validação final)

- [ ] **Backup prévio** dos arquivos do servidor e do banco antes de sobrescrever.
- [ ] **Configuração do servidor** (`.env`/`appsettings` de produção) não foi sobrescrita por dados locais de desenvolvimento.
- [ ] **Sanitização de logins:** credenciais removidas do histórico de Conexão Rápida do FileZilla antes dos prints.
- [ ] **Limpeza de cache** da hospedagem e do navegador antes do teste de homologação.

## 4. Passo a passo previsto (a detalhar quando a hospedagem for confirmada)

1. Criar tag de versão no Git (`v1.0.0`).
2. Ajustar `frontend/js/config.js` com a URL pública da API.
3. Conferir localmente que o console não mostra erros.
4. Abrir o FileZilla, conectar (EVID-01), posicionar pastas (EVID-02), enviar (EVID-03), conferir a listagem e as permissões (EVID-04).
5. Abrir a URL pública com o DevTools aberto e fazer os prints (EVID-05).
6. Executar o fluxo mínimo do cliente para homologar.
7. Preencher o Word com cabeçalho, prints e checklist.

**Hospedagem da API e do MySQL:** indefinida. Não escolher serviço definitivo antes das respostas de P-13 e P-23.
