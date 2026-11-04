# PizzET Front-End V2

Interface de delivery de pizzas em HTML, CSS e JavaScript puros, com versão desktop/mobile e temas claro/escuro.

## Rodar localmente

Na pasta do projeto:

```bash
python -m http.server 8000
```

Abra http://localhost:8000. Para conectar a API, defina `window.PIZZET_API_URL` antes do módulo `js/app.js`, ou use a configuração de ambiente que o Claude Code estabelecer.

## Estrutura

- `index.html` — entrada
- `css/style.css` — layout, identidade visual, responsividade e temas
- `js/app.js` — navegação, carrinho, formulários e UI
- `js/api.js` — adaptador de API ASP.NET Core
- `js/data.js` — catálogo de demonstração
- `assets/` — imagens de hero e pizzas recortadas dos protótipos aprovados
- `INTEGRACAO_CLAUDE.md` — instruções para Claude Code

## Limitações

Sem API configurada, login, cadastro, perfil e pedidos não funcionam. Pagamento é simulado. Não há GPS real. A interface administrativa não faz parte desta versão. As artes conceituais são recortes, portanto não representam uma reprodução pixel-perfect dos mockups.
