# tests/

Testes automatizados de ponta a ponta. Eles **apagam e recriam dados**, então use só em banco de desenvolvimento.

| Arquivo | O que testa |
|---------|-------------|
| `api_test.sh` | API com `curl`: CSRF, cadastro, login, CPF, endereços, pedidos, preço adulterado, isolamento entre clientes, CRUD admin, transições de status e logout |
| `e2e.js` | Navegador (Playwright): fluxo completo do cliente e do administrador pela interface |
| `console_limpo.js` | Visitante anônimo: console e rede sem erros (exigência do Print 5 do deploy) |
| `responsivo.js` | Rolagem horizontal em 320, 360, 390, 768, 1024 e 1440 px; gera prints em `tests/saida/` |

## Como rodar
1. Recrie o banco (`database/01_schema.sql` e `02_dados_demo.sql`) e suba a API (`backend/README.md`).
2. Defina a senha do admin de desenvolvimento (a mesma dos user-secrets) na variável `PIZZET_ADMIN_SENHA`.
3. Instale o Playwright uma vez (`npm i -D playwright` e `npx playwright install chromium`).

Linux/macOS, na raiz do projeto:

```bash
PIZZET_ADMIN_SENHA='sua-senha' ./tests/api_test.sh
```

Recrie o banco antes de rodar o próximo, porque os dois cadastram os mesmos usuários:

```bash
PIZZET_ADMIN_SENHA='sua-senha' node tests/e2e.js
```

```bash
node tests/console_limpo.js
```

`responsivo.js` usa a cliente criada pelo `e2e.js` (ana@teste.dev), então rode depois dele:

```bash
PIZZET_ADMIN_SENHA='sua-senha' node tests/responsivo.js
```
