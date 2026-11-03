# database/

Scripts do banco MySQL do PizzET. Estes arquivos são a **fonte da verdade** do banco. A API (EF Core) apenas mapeia as tabelas que eles criam, sem gerar migrações.

| Arquivo | Conteúdo |
|---------|----------|
| `01_schema.sql` | Cria o banco `pizzet` e todas as tabelas com PK, FK, índices e CHECKs. **Recria do zero** (DROP TABLE). |
| `02_dados_demo.sql` | Papéis (Cliente, Administrador) e 12 produtos de exemplo, sendo 1 inativo. Sem usuários nem senhas. |
| `99_testes_restricoes.sql` | Testes das restrições (insere dados fictícios; só para banco de teste). |
| `der.md` | DER (Mermaid) e explicação das relações. |

## Requisitos
MySQL **8.0.16 ou superior**, porque os `CHECK` só são aplicados a partir dessa versão.

## Como executar

**MySQL Workbench:** abra cada arquivo em *File → Open SQL Script* e execute (raio ⚡), na ordem `01` e depois `02`.

**Linha de comando** (pede a senha; não escreva a senha no comando):

```bash
mysql -u root -p < database/01_schema.sql
```

```bash
mysql -u root -p < database/02_dados_demo.sql
```

## Usuário do banco para a API
Não use `root` na aplicação. Crie um usuário próprio, com uma senha escolhida por você e **guardada fora do repositório**:

```sql
CREATE USER 'pizzet_app'@'localhost' IDENTIFIED BY '<escolha-uma-senha>';
GRANT SELECT, INSERT, UPDATE, DELETE ON pizzet.* TO 'pizzet_app'@'localhost';
```

A connection string será configurada na API via `dotnet user-secrets`, em etapa futura.
