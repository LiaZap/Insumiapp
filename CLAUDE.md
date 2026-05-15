# Insumia — Guia do Projeto

Plataforma B2B de gestão de **insumos estéticos** (toxinas, preenchedores, bioestimuladores).
Conecta **clínicas** (app mobile) à operação da **Insumia** (back-office web), cobrindo
cotação, pedidos, estoque e financeiro.

## Monorepo

| Pacote | Tecnologia | Função |
|--------|-----------|--------|
| `apps/mobile` | Expo SDK 52 · Expo Router · NativeWind | App das clínicas (iOS/Android) |
| `apps/api` | NestJS 10 · Prisma 5 · PostgreSQL | API REST |
| `apps/admin` | Vite · React 18 · Tailwind | Back-office web |
| `packages/shared` | Zod | Schemas e tipos compartilhados (fonte única de verdade) |

Gerenciador: **pnpm workspaces**. Node ≥ 20.

## Comandos

```bash
pnpm dev:db        # sobe Postgres (docker compose)
pnpm dev:api       # API em watch  (:3333)
pnpm dev:mobile    # Metro / Expo
pnpm --filter @insumia/admin dev   # back-office (:5173)

pnpm typecheck     # tsc em todos os pacotes  ← rodar SEMPRE antes de commit
pnpm --filter @insumia/api run seed             # popular banco de demo
pnpm --filter @insumia/api exec prisma migrate dev   # criar migração
```

## Convenções

- **TypeScript estrito** em todos os pacotes. `typecheck` verde é obrigatório antes de commit.
- **Validação nas bordas**: todo input de API valida com Zod (`packages/shared`) via `ZodValidationPipe`.
  Forms no front usam os mesmos schemas.
- **Domínio em português** (`pedido`, `cotacao`, `estoque`, `medicamento`); código/infra em inglês.
- **Dinheiro**: `Decimal(12,2)` no Postgres; nunca `float`. No JSON o Prisma serializa como string.
- Componentes/arquivos < 500 linhas. Sem arquivos soltos na raiz — usar `apps/`, `packages/`, `docs/`, `scripts/`.
- **Nunca** commitar `.env`, segredos ou credenciais.
- Ler um arquivo antes de editá-lo. Preferir editar a criar.

## Padrões de arquitetura

- **API**: um módulo NestJS por domínio (`auth`, `medicamentos`, `pedidos`, `estoque`, `financeiro`).
  `AuthGuard` (JWT Bearer) protege rotas autenticadas.
- **Mobile**: Expo Router (file-based). Estado de servidor com TanStack Query; estado local com Zustand.
  Cada domínio em `src/features/<dominio>/` (`.api.ts`, `.hooks.ts`, `.store.ts`).
- **Admin**: páginas em `src/pages/`, libs em `src/lib/`, componentes em `src/components/`.

## Documentação

Detalhes em [`docs/`](docs/):
[RBAC](docs/RBAC.md) · [Frontend](docs/FRONTEND.md) · [Backend](docs/BACKEND.md) ·
[Regras de Negócio](docs/REGRAS-DE-NEGOCIO.md) · [OAuth](docs/OAUTH.md)

## Deploy

- **API + Postgres** → `Dockerfile` (raiz) — EasyPanel/Docker.
- **Back-office** → `apps/admin/Dockerfile` (build estático + nginx).
- **Mobile** → EAS Build (`apps/mobile/eas.json`).

Migrações Prisma rodam no start do container (`prisma migrate deploy`).
