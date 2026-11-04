Você é o responsável por integrar o Front-End PizzET (HTML, CSS, JS puros) com o Back-End ASP.NET Core Web API e MySQL do trabalho interdisciplinar.

1. Leia README.md, index.html e os arquivos em css/ e js/. Preserve a identidade visual espacial: fundo preto/roxo, verde neon, alien, OVNI, cards sólidos, fontes Oxanium e Inter, modo claro e responsividade mobile.
2. Examine o código existente do Back-End e identifique rotas, DTOs, autenticação, status de pedidos e CORS. NÃO invente endpoints nem diga que algo está integrado sem testar.
3. Adapte SOMENTE js/api.js e os pontos necessários de js/app.js ao contrato real da API. Se for necessário mudar o Back-End, documente o motivo antes de editar. Mantenha C# + MySQL e Front-End vanilla.
4. Implemente autenticação segura usando o mecanismo adotado pelo Back-End. Se usar cookies, configure credentials, CORS explícito e proteção CSRF. Não armazene senhas nem tokens sensíveis em localStorage.
5. Faça cadastro/login/logout, perfil, catálogo, CRUD administrativo, checkout simulado e histórico/status de pedidos realmente funcionarem no banco. O preço e total do pedido devem ser calculados pelo servidor. Restrinja CRUD a administradores.
6. Complete a interface administrativa e adapte o checkout ao fluxo de login. Inclua estados de loading, erros e vazio, validação e máscaras de telefone/CEP. Nunca apresente GPS real sem infraestrutura real.
7. Priorize telas 1440px e 390px, teste 320px, 768px e 1024px. Corrija overflow horizontal, navegação mobile, foco de modais, contraste, teclado e acessibilidade.
8. Troque emojis provisórios por imagens otimizadas e assets autorizados fornecidos pelo usuário. Não use screenshot inteiro como interface.
9. Rode testes manuais e automatizados possíveis; apresente um checklist de requisitos atendidos, pendentes e comandos exatos de execução/deploy. Nunca publique credenciais.

Primeiro passo: faça uma auditoria do Front-End e Back-End, proponha um plano de integração curto e aguarde minha confirmação antes de grandes refatorações.
