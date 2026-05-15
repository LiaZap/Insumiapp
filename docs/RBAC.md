# RBAC — Controle de Acesso por Papéis

Define os papéis do sistema e o que cada um pode fazer. É o **padrão de autorização** do Insumia.

## Papéis

O enum `UserRole` (Prisma + `packages/shared`) define:

| Papel | Onde atua | Descrição |
|-------|-----------|-----------|
| `admin` | Back-office | Equipe Insumia — acesso total à operação |
| `comprador` | App mobile | Usuário da clínica que cria pedidos e gerencia estoque |
| `financeiro` | App mobile / Back-office | Foco em contas a pagar/receber |

> Hoje todo cadastro nasce como `comprador` (ver `signupSchema`). A atribuição de `admin`/`financeiro`
> é manual (via banco) — ver "A implementar".

## Matriz de permissões

| Recurso / Ação | admin | comprador | financeiro |
|---|:---:|:---:|:---:|
| Ver catálogo de medicamentos | ✅ | ✅ | ✅ |
| Criar/editar medicamento | ✅ | ❌ | ❌ |
| Criar pedido | ✅ | ✅ | ❌ |
| Ver **todos** os pedidos (`escopo=todos`) | ✅ | ❌ | ✅ (leitura) |
| Ver os próprios pedidos | ✅ | ✅ | ✅ |
| **Enviar cotação** (preço/prazo) | ✅ | ❌ | ❌ |
| Aceitar/recusar cotação | ❌ | ✅ | ❌ |
| Avançar status do pedido | ✅ | ❌ | ❌ |
| Movimentar estoque | ✅ | ✅ | ❌ |
| Criar/baixar contas | ✅ | ❌ | ✅ |
| Ver dashboards | ✅ | parcial | financeiro |

## Como é aplicado hoje

- **Autenticação**: JWT Bearer via `AuthGuard` (`apps/api/src/common/auth.guard.ts`).
  O guard injeta `req.user = { id }` a partir do `sub` do token.
- **Escopo de pedido**: `aceitarCotacao`/`recusarCotacao` checam `pedido.usuarioId === req.user.id`
  — um usuário não responde cotação de outro.
- O back-office assume operador `admin`; o app mobile assume `comprador`.

## A implementar (padrão alvo)

1. **`role` no JWT** — incluir `role` no payload do token (hoje só `sub`).
2. **`@Roles()` decorator + `RolesGuard`** — proteger rotas por papel:
   ```ts
   @Roles('admin')
   @Patch(':id/cotacao')
   enviarCotacao() { ... }
   ```
3. **Endpoints administrativos** (`POST /medicamentos`, `escopo=todos`, mudança de status)
   restritos a `admin`.
4. **Gestão de papéis** — tela no back-office para promover usuários (admin/financeiro).
5. **Multiusuário por clínica** — quando o Épico "Clientes" entrar, papéis passam a ser
   por-cliente (um comprador, um financeiro por clínica).

## Regras invioláveis

- Toda rota que altera dados exige autenticação.
- Cliente só vê/edita os próprios pedidos; `admin` vê todos.
- Mudança de papel é ação de `admin` e deve ser auditável.
