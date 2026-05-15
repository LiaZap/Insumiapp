# Backend — Arquitetura

API REST em **NestJS 10 + Prisma 5 + PostgreSQL**. Código em `apps/api`.

## Estrutura

```
src/
  main.ts              bootstrap (Helmet, CORS, ValidationPipe, Swagger /docs)
  app.module.ts        registra os módulos
  prisma/              PrismaService (global)
  common/              AuthGuard, ZodValidationPipe
  auth/                signup, login (JWT + bcrypt)
  medicamentos/        catálogo (busca, criar, editar)
  pedidos/             pedidos + motor de cotação
  estoque/             posição + movimentações
  financeiro/          contas a pagar/receber + dashboard
  health/              GET /health
prisma/
  schema.prisma        modelos
  migrations/          histórico
  seed.ts              dados de demonstração
```

Prefixo global: **`/api/v1`**. Docs Swagger em **`/docs`**.

## Padrões

- **Um módulo por domínio**: `controller` (rotas) + `service` (regra) + `module`.
- **Validação**: `ZodValidationPipe` com schemas de `packages/shared` — valida body/query
  na borda. DTOs não são reescritos; o schema Zod é a fonte.
- **Auth**: `AuthGuard` valida JWT Bearer e injeta `req.user`. Aplicado por rota com `@UseGuards`.
- **Prisma**: `PrismaService` global. Operações multi-passo usam `$transaction`.
- **Dinheiro**: colunas `Decimal(12,2)`. Total de pedido/cotação sempre **recalculado no servidor**
  — nunca confiar no valor enviado pelo cliente.

## Modelos principais (`schema.prisma`)

`User` · `Medicamento` (com `custo` p/ margem) · `Pedido` + `PedidoItem` (campos de cotação) ·
`EstoqueItem` · `Movimentacao` · `Conta`.

## Endpoints (resumo)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/signup` · `/auth/login` | autenticação (JWT) |
| GET | `/medicamentos` | catálogo (busca/filtro) |
| POST/PATCH | `/medicamentos` `/:id` | gestão de catálogo (admin) |
| GET/POST | `/pedidos` `?escopo=todos` | listar/criar pedidos |
| PATCH | `/pedidos/:id/status` | avançar status (admin) |
| PATCH | `/pedidos/:id/cotacao` | enviar cotação (admin) |
| POST | `/pedidos/:id/cotacao/aceitar` `/recusar` | resposta do cliente |
| GET/POST | `/estoque` `/estoque/movimentacoes` | posição e movimentações |
| GET/POST/PATCH | `/financeiro/contas` `/dashboard` | contas e indicadores |

## Banco e migrações

- Local: Postgres via `docker compose` (`pnpm dev:db`).
- Criar migração: `prisma migrate dev --name <descricao>`.
- Deploy: `prisma migrate deploy` roda no start do container.
- `seed.ts` é idempotente (guards) — popula catálogo, clínicas, pedidos e contas de demo.

## Regras

- Toda rota que muda dados: autenticada + validada com Zod.
- Erros de negócio → exceções Nest (`BadRequestException`, `NotFoundException`) com mensagem clara.
- Nunca retornar `passwordHash` nem segredo em resposta.
- `JWT_SECRET` e `DATABASE_URL` sempre via env — nunca hardcoded.
