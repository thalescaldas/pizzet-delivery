# PizzET 🛸🍕

> *A pizza mais rápida da galáxia.*

Sistema web acadêmico de delivery de pizzas com tema espacial, desenvolvido como trabalho interdisciplinar de **Front-End**, **Lógica e Programação (C#)** e **Banco de Dados (MySQL)**. Entrega: **15/11/2026**.

## ⚠️ Estado atual

**O sistema ainda não está funcional para o usuário final.** Já existem:
- o banco MySQL (`database/`), com script testado;
- uma API C# inicial (`backend/`) que lista, busca e detalha produtos.

Ainda não há telas, autenticação, carrinho nem pedidos.

## Tecnologias previstas

| Camada | Tecnologia |
|--------|------------|
| Front-End | HTML, CSS e JavaScript puros (sem frameworks) |
| Back-End | C# — ASP.NET Core Web API |
| Banco de dados | MySQL 8 |
| Pagamento | Simulado (nenhuma cobrança real) |

Escopo: apenas **delivery** (sem retirada). Extra aprovado: acompanhamento de status do pedido.

## Estrutura

```
docs/       requisitos, arquitetura, pendências e plano de testes
frontend/   páginas HTML, CSS e JS (a criar)
backend/    API ASP.NET Core (a criar)
database/   scripts SQL, DER e consultas de demonstração (a criar)
CLAUDE.md   instruções permanentes do projeto
```

## Documentação

- [Requisitos por disciplina](docs/requisitos.md)
- [Arquitetura](docs/arquitetura.md)
- [Pendências](docs/pendencias.md)
- [Plano de testes](docs/plano-de-testes.md)
- [Deploy e evidências (FileZilla)](docs/deploy.md)

## Como executar

Por enquanto: banco em [`database/README.md`](database/README.md) e API em [`backend/README.md`](backend/README.md). Esta seção será completada com:

1. Pré-requisitos (.NET SDK, MySQL 8).
2. Criação do banco a partir de `database/`.
3. Configuração da connection string via `dotnet user-secrets` (nunca no repositório).
4. Execução da API e acesso ao Front-End.
5. Roteiro de demonstração.

## Equipe

A definir (2 integrantes).
