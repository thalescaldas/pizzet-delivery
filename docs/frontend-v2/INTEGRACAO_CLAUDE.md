# PizzET — integração com Claude Code Desktop

Este é o frontend visual V2 em HTML, CSS e JavaScript sem frameworks. Não substitua o design por componentes genéricos. Preserve as imagens originais em `assets/`, a identidade neon, a versão mobile e o tema claro.

## Primeira tarefa
1. Abra `index.html` em servidor HTTP local (não via file://).
2. Verifique em 1440×900, 390×844 e 360×800; ajuste quebras e sobreposições sem descaracterizar o visual.
3. Inspecione `js/api.js`, `js/app.js` e os endpoints da API ASP.NET Core existente antes de alterar as rotas.
4. Adapte o frontend à autenticação segura por cookie, configure CORS/CSRF conforme a arquitetura da API, sem guardar senha ou token sensível no localStorage.
5. Integre produtos, cadastro, login, perfil, carrinho, checkout simulado, pedidos e status; não invente GPS em tempo real.
6. Garanta validação de CEP, telefone, campos numéricos, estados de carregamento e erros; teste CRUD administrativo de produtos no backend.
7. Execute testes de ponta a ponta para desktop e mobile e reporte o que está funcional e o que falta.

## Observações
- Assets de pizzas e hero foram recortados dos mockups conceituais aprovados; não são arquivos-fonte originais isolados. Pequenos vestígios de fundo podem permanecer.
- Em `js/api.js`, sem URL de API, só o catálogo é demonstrativo. Cadastro, pedidos e perfil requerem backend.
- O site não executa pagamentos reais nem rastreamento GPS.
- O mockup administrativo é referência visual; interface administrativa funcional ainda não está implementada neste pacote.
- A hospedagem FTP da escola pode servir os arquivos estáticos, mas a API C# e o MySQL precisam de infraestrutura compatível.
