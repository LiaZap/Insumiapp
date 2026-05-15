# Frontend — Arquitetura

Dois clientes consomem a mesma API e os mesmos schemas de `packages/shared`.

## App mobile — `apps/mobile`

Stack: **Expo SDK 52 · Expo Router · NativeWind 4 · TanStack Query · Zustand · Reanimated**.

### Estrutura

```
src/
  app/                 rotas (file-based — Expo Router)
    (auth)/            onboarding, login, signup, forgot-password
    (app)/             tabs: dashboard, pedidos, estoque, financeiro, menu
      novo-pedido/     stack: busca → carrinho → confirmação
      pedido/[id]      detalhe do pedido (com cotação)
  features/<dominio>/  api.ts · hooks.ts · store.ts  (auth, pedidos, estoque, ...)
  components/          ui/ (Button, Input, Sheet, Toast...) + de domínio
  lib/                 api (axios), query-client, storage, env
  theme/               tokens + global.css (NativeWind)
  hooks/               compartilhados
```

### Padrões

- **Estado de servidor**: TanStack Query (`use<Dominio>` hooks). Cache persistido em AsyncStorage
  → o app abre offline com os últimos dados.
- **Estado local/UI**: Zustand (`auth.store`, `carrinho.store`).
- **Navegação**: Expo Router, rotas tipadas (`typedRoutes`).
- **Forms**: React Hook Form + resolver Zod (schemas de `packages/shared`).
- **Storage**: `expo-secure-store` para tokens; AsyncStorage para cache/preferências.
- **API base URL**: `app.json` → `extra.apiUrl` (ver `lib/env.ts`).
- **Resiliência**: `ErrorBoundary`, `OfflineBanner`, `ErrorState`, `Toast` globais.

## Back-office — `apps/admin`

Stack: **Vite · React 18 · React Router · TanStack Query · Tailwind · Recharts**.

### Estrutura

```
src/
  pages/        Login, Dashboard, Pedidos, Medicamentos, Estoque, Financeiro
  components/   Layout (sidebar), Logo, ui.tsx (tabela/cards), charts, CotacaoForm
  lib/          api (axios + token), auth, format, csv, useTableControls, labels
```

### Padrões

- **Auth**: token em `localStorage`; `RequireAuth` protege as rotas; 401 → redireciona ao login.
- **Tabelas**: hook `useTableControls` (busca + ordenação + paginação) + export CSV.
- **Gráficos**: Recharts (área, donut, ranking).
- **API base URL**: `import.meta.env.VITE_API_URL` (build-time).

## Design system

Paleta navy `#1B498C` + cyan `#9AECFF`, fundo `#F2F2F2`. Tipografia **Figtree**.
Tokens espelhados em `apps/mobile/src/theme/tokens.ts` e `apps/admin/tailwind.config.js`.

## Regras

- Componentes < 500 linhas; extrair quando crescer.
- Sem `fetch` solto — sempre via `lib/api` (axios com interceptors).
- Tipos sempre de `@insumia/shared` — não redeclarar shape de entidade.
