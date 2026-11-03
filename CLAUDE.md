# PizzET — Instruções permanentes para Claude Code

## Missão
Construir um sistema web acadêmico de delivery de pizzas, com interface espacial/alienígena, cumprindo as exigências de Front-End, Lógica e Programação (C#) e Banco de Dados (MySQL). Entrega: 15/11/2026. Equipe: 2 integrantes. Prioridade absoluta: requisitos obrigatórios, integração real e funcionamento demonstrável.

## Regras de trabalho
1. Trabalhe incrementalmente. Antes de alterar arquivos, apresente plano breve e arquivos envolvidos. Não implemente o projeto inteiro em uma única execução.
2. Nunca afirme que executou comandos, testes, migrações ou deploy sem efetivamente fazê-lo. Relate erros e bloqueios.
3. Não substitua tecnologias obrigatórias nem adicione frameworks de Front-End (React, Vue, Angular etc.). Use HTML, CSS e JavaScript puros.
4. Use C# com ASP.NET Core Web API e MySQL 8; mantenha separação clara entre interface, API, domínio e persistência.
5. Não invente requisitos dos professores. Registre incertezas em `docs/pendencias.md`.
6. Prefira soluções simples, legíveis e ensináveis para alunos com conhecimento básico. Explique decisões importantes.
7. Não implemente pagamento real; o checkout será simulado. Apenas delivery, sem retirada.
8. Não implemente extras fora do escopo sem autorização. O único extra aprovado é acompanhamento de status do pedido.
9. Não exponha segredos, senhas, connection strings ou credenciais no repositório. Use variáveis de ambiente, user-secrets e arquivos de exemplo.
10. Após cada etapa, informe arquivos criados, comandos necessários, testes executados e próximos passos. Faça commits pequenos apenas quando solicitado.

## Identidade e UX
- Marca: PizzET; slogan: "A pizza mais rápida da galáxia".
- Criar identidade visual do zero, tema extraterrestre/espacial; visual moderno e responsivo para desktop e celular.
- Modo claro e escuro, com preferência persistida localmente.
- O protótipo Figma deve preceder a implementação visual final. Não presumir que existe um protótipo aprovado.
- Garantir acessibilidade básica: labels, navegação por teclado, foco visível, contraste e mensagens de erro.

## Requisitos de Front-End (enunciado fornecido)
- Home com apresentação, barra de navegação, botões de login e cadastro e rodapé.
- Página de login e cadastro (pode ser modal, mas preferir páginas claras).
- Catálogo de produtos.
- Página de pedidos realizados.
- Carrinho de compras.
- Perfil/dados do usuário.
- Busca de produtos.
- Layout responsivo em celular.
- Protótipo no Figma antes de codificar.
- HTML, CSS e JavaScript puros.
- Máscaras de formatação nos campos aplicáveis do cadastro.
- Campos numéricos devem aceitar apenas números, sem comprometer acessibilidade e edição.
- Modo claro/escuro.

## Requisitos C# e Banco
- API C# integrada ao Front-End e ao MySQL.
- CRUD real de produtos (criar, ler, atualizar e desativar/excluir logicamente), protegido para administradores.
- Empregar, onde fizer sentido, classes, métodos, listas, condicionais, laços e orientação a objetos; não forçar vetores/matrizes artificiais no fluxo de produção. Registrar exemplos didáticos separados se o professor exigir.
- MySQL com PK, FK, índices, restrições e script SQL versionado. Criar DER e consultas de demonstração.
- Modelo inicial: usuários, produtos, endereços, pedidos e itens_pedido; usar tabelas adicionais do Identity quando necessário.
- Guardar no pedido um snapshot do endereço de entrega e do preço unitário de cada item.
- Não confiar em totais, preços ou permissões enviados pelo navegador: calcular e validar no servidor.
- Senhas devem ser armazenadas apenas por hash seguro usando Identity, nunca texto puro.
- Definir papéis Cliente e Administrador; contas administrativas criadas por seed seguro de desenvolvimento, não por cadastro público.
- Status mínimo: Recebido, Em preparo, Saiu para entrega, Entregue, Cancelado; transições validadas no servidor.

## Fluxo mínimo do cliente
Home → catálogo/busca → detalhes ou adicionar ao carrinho → cadastro/login → endereço → checkout simulado → pedido registrado → acompanhamento do status → histórico/perfil.

## Arquitetura sugerida
- `frontend/`: HTML, CSS, JS modular, assets e páginas.
- `backend/`: solução ASP.NET Core Web API com Controllers ou Minimal APIs (escolher um padrão e manter consistência), DTOs, validação, serviços e persistência EF Core.
- `database/`: scripts SQL, DER e dados de demonstração sem segredos.
- `docs/`: requisitos, arquitetura, pendências, plano de testes e instruções de implantação.
- `README.md`: instalação local, configuração, execução e demonstração.

## API mínima a projetar
- Autenticação: registrar, entrar, sair e consultar sessão atual.
- Produtos: listar, pesquisar, detalhar; administração: criar, editar e desativar.
- Perfil: consultar e editar dados do próprio usuário.
- Endereços: cadastrar, consultar, editar e excluir os próprios endereços.
- Pedidos: criar a partir de itens e endereço válidos, listar os próprios pedidos, consultar detalhes e status.
- Administração: listar pedidos e alterar status conforme regras.
- Usar HTTPS em produção, cookies HttpOnly/Secure/SameSite adequados, proteção CSRF quando aplicável, autorização em endpoints e CORS restrito quando houver origens separadas.

## Testes e aceite
- Cadastro, login e logout; acesso negado a rotas administrativas para clientes.
- CRUD completo de produtos persistindo no MySQL.
- Busca, carrinho e checkout com cálculo de preço no servidor.
- Histórico e status restritos ao dono do pedido ou administrador.
- Validação de campos, máscaras, campos numéricos, erros de API.
- Layout desktop e celular, modo claro/escuro persistente.
- Comandos reproduzíveis para build, migração e execução; documentar qualquer teste não realizado.

## Hospedagem
O professor ainda não forneceu dados do FTP. FTP pode publicar arquivos estáticos, mas não garante execução de ASP.NET Core ou MySQL. Não escolher hospedagem definitiva sem confirmar suporte a runtime .NET, banco, HTTPS, domínio/CORS e permissões de deploy. Manter configuração local funcional e plano de deploy separado.

## Método de execução
Fase 1: levantamento final, árvore de arquivos, documentação e ambiente; Fase 2: DER/MySQL/API e autenticação; Fase 3: Figma aprovado e Front-End; Fase 4: integração e testes; Fase 5: hospedagem, documentação e apresentação. Ajustar cronograma para concluir até 15/11/2026.

## Pendências
- Confirmar com os professores a adequação de ASP.NET Core Web API + MySQL e se exigem tópicos específicos de C# ou SQL.
- Confirmar se DER, consultas especiais, procedures ou relatórios são obrigatórios.
- Confirmar o serviço FTP e a hospedagem da API e do MySQL.
- Definir integrantes e divisão de tarefas.
- Criar e aprovar a identidade visual e o protótipo no Figma.
