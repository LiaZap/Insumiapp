# Insumia

App mobile (iOS + Android) de gestão de **pedidos**, **estoque** e **financeiro** de insumos farmacêuticos. Monorepo com Expo (mobile) + NestJS (api) + Prisma + Postgres.

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | Expo SDK 52, Expo Router, TypeScript, NativeWind v4, TanStack Query, Zustand, RHF + Zod, MMKV |
| API | NestJS 10, Prisma 5, Postgres 16, JWT, Swagger, Helmet |
| Tipos compartilhados | Zod schemas em `packages/shared` (reusados no mobile e na API) |
| Infra dev | Docker Compose (Postgres) |
| Build mobile | EAS Build + EAS Submit |

## Estrutura

```
INSUMIAAPP/
├─ apps/
│  ├─ mobile/                 # Expo Router
│  │  └─ src/
│  │     ├─ app/              # rotas: (auth), (app)/dashboard, pedidos, estoque, financeiro, menu
│  │     ├─ components/ui/    # Button, Input, Card
│  │     ├─ features/         # auth.store, ...
│  │     ├─ lib/              # api (axios), storage (MMKV+SecureStore), query-client, env
│  │     └─ theme/            # tokens.ts + global.css
│  └─ api/                    # NestJS
│     └─ src/
│        ├─ auth/             # signup, login (JWT)
│        ├─ medicamentos/     # busca paginada
│        ├─ pedidos/          # stub CRUD
│        ├─ estoque/          # stub estoque + movimentações
│        ├─ financeiro/       # stub contas + dashboard
│        ├─ prisma/           # PrismaService global
│        ├─ health/           # /api/v1/health
│        └─ common/           # ZodValidationPipe
├─ packages/
│  └─ shared/                 # Zod schemas: auth, medicamento, pedido, estoque, financeiro
├─ docker-compose.yml         # Postgres 16
├─ pnpm-workspace.yaml
├─ .env.example
└─ package.json
```

## Setup

### 1. Pré-requisitos

- Node ≥ 20
- pnpm ≥ 10
- Docker Desktop (para o Postgres local)
- App **Expo Go** no celular OU emulador Android / simulador iOS

### 2. Instalar dependências

```bash
pnpm install
cp .env.example .env
```

### 3. Subir o Postgres + migrar

```bash
pnpm dev:db                                 # sobe Postgres em :5432
pnpm --filter @insumia/api prisma:migrate   # cria as tabelas
pnpm --filter @insumia/api seed             # popula medicamentos
```

### 4. Rodar API

```bash
pnpm dev:api
# → http://localhost:3333/api/v1/health
# → http://localhost:3333/docs  (Swagger)
```

### 5. Rodar Mobile

```bash
pnpm dev:mobile
# Aperte 'i' (iOS), 'a' (Android), ou escaneie o QR Code com Expo Go
```

## Scripts úteis (raiz)

| Comando | Descrição |
|---|---|
| `pnpm dev` | Sobe Postgres + API + Mobile em paralelo |
| `pnpm dev:db` | Sobe só o Postgres |
| `pnpm dev:api` | Sobe só a API em watch mode |
| `pnpm dev:mobile` | Sobe só o Metro |
| `pnpm typecheck` | TS em todos os pacotes |
| `pnpm lint` | ESLint em todos os pacotes |
| `pnpm test` | Testes em todos os pacotes |

## Plano de evolução (sprints)

| Sprint | Objetivo | Telas / módulos |
|---|---|---|
| **S1** ✅ | Scaffolding | Monorepo + Auth UI + Dashboard placeholder + API stubs |
| **S2** | Auth real + Design System | Integração `/auth/*`, extração de tokens do Figma, ícones Solar, componentes (Chip, Sheet, Header, EmptyState, Skeleton) |
| **S3** | Pedido — fluxo principal | Busca de Medicamento, Carrinho, Confirmação, integração `/medicamentos` + `/pedidos` |
| **S4** | Pedido — pós-venda | Lista de Pedidos, Detalhe (tela longa do Figma), timeline de status, Notificações |
| **S5** | Estoque | Estoque atual, Movimentações, criação de movimentação, alertas de validade |
| **S6** | Financeiro (módulo extra) | Contas a pagar/receber, dashboard com fluxo mensal, conciliação com pedidos |
| **S7** | Polish | Empty/error states, animações Reanimated, modo offline (TanStack persisted) |
| **S8** | Release | EAS Build, TestFlight, Play Internal Testing, Sentry, PostHog, LGPD |

## Notas de arquitetura

- **Validação compartilhada**: schemas Zod em `@insumia/shared` são usados no front (RHF) e no back (`ZodValidationPipe`) — uma única fonte de verdade.
- **Auth**: JWT em `expo-secure-store` (não MMKV), seguindo OWASP. Refresh token a implementar em S2.
- **Decimal/dinheiro**: Postgres `Decimal(12,2)`; nunca usar `float`. No mobile, validação via `moneySchema.multipleOf(0.01)`.
- **New Architecture**: já habilitada no `app.json` (Fabric/TurboModules). Reanimated 3 e MMKV compatíveis.
- **Edge-to-edge** no Android 15+ habilitado por padrão.
- **LGPD / saúde**: medicamentos com `receituario: true` exigem comprovante; modelar fluxo de upload em S3.

## Próximos passos imediatos

1. Rodar `pnpm install` (a primeira vez baixa ~1.5GB)
2. Criar assets em `apps/mobile/assets/` (icon.png 1024×1024, splash.png, adaptive-icon.png, favicon.png) — placeholders OK no início
3. Rodar `pnpm dev:db` + `pnpm --filter @insumia/api prisma:migrate`
4. Extrair tokens reais do Figma (rodar `get_design_context` nos 11 nodeIds) e atualizar `tailwind.config.js` + `theme/tokens.ts`
5. Substituir `Pill`/`Syringe` do lucide pelos ícones **Solar** usados no design (via `react-native-svg`)

## Licença

Proprietário — Insumia.
