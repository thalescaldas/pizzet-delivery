# PizzET — Plano de testes de aceite

Cada cenário deve ser executado de verdade e registrado na tabela de execução (§ final) com data, responsável e evidência (print, saída de comando ou consulta SQL). **Cenário não executado = não comprovado.**

Pré-condições gerais: MySQL 8 rodando com o script de `database/`; API em execução; usuário admin criado pelo seed de desenvolvimento; ao menos 5 produtos ativos e 1 inativo.

## Autenticação (FE-02, FE-03, CS-07, CS-08)
- **T-AUTH-01 Cadastro válido** — preencher cadastro com dados válidos → conta criada com papel Cliente; senha **não** aparece em texto no banco (`SELECT PasswordHash FROM AspNetUsers` mostra hash).
- **T-AUTH-02 Login/logout** — entrar com credenciais corretas → cabeçalho mostra nome; `GET /api/auth/eu` retorna 200. Sair → `GET /api/auth/eu` retorna 401.
- **T-AUTH-03 Login inválido** — senha errada → mensagem genérica ("e-mail ou senha inválidos"), sem dizer qual campo errou.
- **T-AUTH-04 E-mail duplicado** — cadastrar o mesmo e-mail duas vezes → erro claro, nenhuma conta duplicada.
- **T-SEG-01 Cookie** — no DevTools, cookie de sessão marcado `HttpOnly` (e `Secure` quando em HTTPS); `document.cookie` não o mostra.

## Administração (CS-03, CS-04, FE-19)
- **T-ADM-01 CRUD de produtos** — admin cria produto → aparece no catálogo e em `SELECT * FROM produtos`; edita preço → valor muda no banco; desativa → some do catálogo público mas continua no banco com `ativo = 0`.
- **T-ADM-02 Acesso negado** — logado como Cliente, chamar `POST /api/admin/produtos` (via fetch/Postman) → 403; sem login → 401; página admin redireciona/avisa.
- **T-ADM-03 Status pelo admin** — admin altera pedido de Recebido → Em preparo → Saiu para entrega → Entregue; cada passo persiste no banco.

## Catálogo e busca (FE-04, FE-05)
- **T-CAT-01 Catálogo** — lista apenas produtos ativos vindos da API (desligar a API → página mostra erro amigável, não dados falsos).
- **T-CAT-02 Busca** — buscar parte do nome (ex.: "marg") encontra "Margherita"; busca sem resultado mostra mensagem; caracteres especiais (`' " <script>`) não quebram a página nem a consulta.

## Carrinho e checkout (FE-06, CS-09, CS-11)
- **T-CAR-01 Adicionar/remover** — adicionar 2 produtos, alterar quantidades, remover um → totais exibidos atualizam; carrinho persiste ao recarregar a página.
- **T-CAR-02 Checkout exige login e endereço** — sem login, finalizar → redireciona ao login; sem endereço → solicita cadastro de endereço.
- **T-CAR-03 Preço calculado no servidor** — alterar no DevTools o preço exibido ou enviar requisição com campo `preco`/`total` adulterado → pedido gravado usa o preço do banco.
- **T-CAR-04 Produto inválido** — enviar pedido com produto inativo/inexistente ou quantidade 0/negativa → 400, nada gravado.

## Pedidos e status (FE-07, FE-18, CS-10, DB-07)
- **T-PED-01 Pedido registrado** — checkout simulado → pedido com status Recebido, itens e total corretos no banco; nenhuma cobrança real.
- **T-PED-02 Isolamento** — Cliente A tenta `GET /api/pedidos/{id do Cliente B}` → 403/404.
- **T-PED-03 Histórico** — página de pedidos lista apenas os pedidos do usuário, do mais recente ao mais antigo.
- **T-PED-04 Acompanhamento** — após admin mudar status, a tela de acompanhamento do cliente mostra o novo status (ao recarregar ou por atualização periódica).
- **T-PED-05 Transição inválida** — tentar Entregue → Em preparo ou Cancelado → Recebido → 400/409, status inalterado.
- **T-DB-04 Snapshot** — após pedido, alterar preço do produto e editar/excluir o endereço → pedido antigo mantém preço unitário e endereço originais.

## Perfil e endereços (FE-08)
- **T-PER-01 Perfil** — usuário vê e edita nome/telefone; não consegue editar dados de outro usuário nem o próprio papel.
- **T-PER-02 Endereços** — criar, editar e excluir endereço próprio; tentar alterar endereço de outro usuário → 403/404.

## Validação e máscaras (FE-12, FE-13, CS-13)
- **T-VAL-01 Máscaras** — digitar telefone/CEP → formatação aplicada; colar valor sem formatação → formatado; apagar com Backspace funciona normalmente.
- **T-VAL-02 Numéricos** — campos numéricos rejeitam letras, mas setas, Tab, Backspace, Delete e colar números funcionam; teclado numérico aparece no celular (`inputmode`).
- **T-VAL-04 CPF** — CPF com dígitos verificadores inválidos (ex.: `111.111.111-11`) → recusado no front e **na API** (enviando direto); CPF já cadastrado → erro; no banco o CPF fica só com dígitos. Máscara de Nome recusa números e símbolos.
- **T-VAL-03 Erros de API** — campos obrigatórios vazios enviados direto à API → 400 com mensagens por campo, exibidas junto aos campos no front.

## UX e acessibilidade (FE-09, FE-10, FE-11, FE-14..17)
- **T-UX-01 Responsivo** — testar em 375px, 768px e 1280px: sem rolagem horizontal, menu utilizável, botões tocáveis.
- **T-UX-02 Tema** — alternar claro/escuro; recarregar e abrir outra página → preferência mantida.
- **T-UX-03 Acessibilidade** — navegar todo o fluxo só com teclado; foco sempre visível; todos os campos com `<label>`; contraste verificado (ex.: Lighthouse/DevTools) nos dois temas.
- **T-UX-04 Figma (opcional)** — se o rascunho for feito, registrar o link em `docs/`.
- **T-UX-05 Tecnologias** — repositório não contém React/Vue/Angular/jQuery nem bundlers no front.
- **T-UX-06 Modais de login/cadastro** — abrir pelo teclado; foco vai para o primeiro campo; Tab não sai do modal; Esc fecha e devolve o foco ao botão; erros anunciados junto aos campos; funciona em 375px.

## Deploy (DEP-01..10) — roteiro em `deploy.md`
- **T-DEP-01** — FileZilla conecta; log mostra "Autenticado" e "Listagem do diretório concluída".
- **T-DEP-02** — origem local `frontend/` e destino remoto lado a lado antes do envio.
- **T-DEP-03** — após o envio: 0 falhas e fila vazia.
- **T-DEP-04** — listagem remota com data/hora do deploy; pastas 0755, arquivos 0644.
- **T-DEP-05** — URL pública abre com cadeado HTTPS; Network mostra o documento com 200 OK; Console sem 404/500/CORS; login e catálogo funcionam contra a API pública.

## Banco e integração (DB-01..09, CS-02)
- **T-DB-01 Script reproduzível** — em um MySQL 8 vazio, executar os scripts de `database/` na ordem → sem erros; nenhum segredo nos arquivos.
- **T-DB-02 Restrições** — inserir produto com preço negativo, item com pedido inexistente ou e-mail duplicado → banco recusa.
- **T-DB-03 Consultas de demonstração** — executar `03_consultas_demo.sql` → resultados coerentes com os dados.
- **T-INT-01 Ponta a ponta** — fluxo completo: Home → catálogo/busca → carrinho → cadastro/login → endereço → checkout → acompanhamento → histórico/perfil.

## Build e execução
- **T-BLD-01** — `dotnet build` sem erros; `dotnet run` sobe a API; README permite que o outro integrante rode o projeto do zero.

## Registro de execução

| Teste | Data | Responsável | Resultado | Evidência |
|-------|------|-------------|-----------|-----------|
| T-DB-01 | 03/11/2026 | Claude (container em nuvem, MySQL 8.0.46) | ✅ `01_schema.sql` + `02_dados_demo.sql` executados sem erro, 2 vezes seguidas; 11 tabelas, 12 produtos (1 inativo), 2 papéis | saída do `mysql` na sessão |
| T-DB-02 | 03/11/2026 | Claude (idem) | ✅ `99_testes_restricoes.sql`: 21 inserções/exclusões inválidas recusadas (CHECK, UNIQUE, FK, RESTRICT, coluna calculada) | idem |
| T-DB-04 (parcial, só banco) | 03/11/2026 | Claude (idem) | ✅ alterar preço e apagar endereço não muda o pedido gravado | idem |
| Busca sem acento (banco) | 03/11/2026 | Claude (idem) | ✅ após correção (`SET NAMES utf8mb4`): "lactea" encontra "Láctea" | idem |
| T-BLD-01 (parcial) | 03/11/2026 | Claude (container, .NET 8.0.133) | ✅ `dotnet build -warnaserror`: 0 erros, 0 avisos; `dotnet run` sobe a API | saída na sessão |
| T-CAT-01 (só API) | 03/11/2026 | Claude (idem) | ✅ `GET /api/produtos` devolve 11 ativos e não inclui o inativo; `/api/produtos/12` (inativo) → 404; `/999` → 404 | idem |
| T-CAT-02 (só API) | 03/11/2026 | Claude (idem) | ✅ "lactea" e "CALABRESA" encontram os produtos; `' OR 1=1 --` e `%` → lista vazia (sem injeção); busca com 101 caracteres → 400; categoria inválida → 400 | idem |

Observação: testes feitos no container de desenvolvimento, não nas máquinas da equipe. Recomenda-se repetir no MySQL Workbench.
