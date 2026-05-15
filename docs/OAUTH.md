# Autenticação & OAuth

## Estado atual — JWT (e-mail + senha)

Fluxo implementado em `apps/api/src/auth`:

1. **Signup** `POST /api/v1/auth/signup` — cria `User`, senha com **bcrypt** (hash, salt 10).
2. **Login** `POST /api/v1/auth/login` — valida credenciais, devolve `accessToken` (JWT) + `user`.
3. **JWT** — assinado com `JWT_SECRET`, expira em `JWT_EXPIRES_IN` (default `7d`).
   Payload atual: `{ sub: userId }`.
4. **Proteção de rota** — `AuthGuard` lê `Authorization: Bearer <token>`, verifica e injeta
   `req.user = { id }`.

### Armazenamento do token

| Cliente | Onde guarda |
|---------|-------------|
| Mobile | `expo-secure-store` (Keychain / Keystore) |
| Back-office | `localStorage` |

### Variáveis de ambiente

```
JWT_SECRET       segredo de assinatura (obrigatório, forte em produção)
JWT_EXPIRES_IN   validade do token (default 7d)
```

## Lacunas a corrigir

1. **`role` no token** — incluir `role` no payload p/ habilitar RBAC sem consultar o banco.
2. **Refresh token** — hoje só há access token de 7d; sem renovação nem revogação.
3. **Recuperação de senha** — tela existe no mobile, fluxo de backend ainda não.
4. **Rate limiting** no login (`@nestjs/throttler`).

## Plano — Login social (OAuth 2.0 / OIDC)

Objetivo: permitir entrar com **Google** (e futuramente Apple), reduzindo atrito de cadastro
das clínicas.

### Arquitetura alvo

```
App / Back-office  →  provedor OAuth (Google)  →  callback na API
   →  API valida o id_token  →  encontra/cria User  →  emite JWT Insumia
```

- Manter o **JWT próprio** como token de sessão — o OAuth é só para *identificação inicial*.
- `User` ganha campos: `authProvider` (`local` | `google` | `apple`) e `providerId`.
- Vincular conta: se o e-mail do provedor já existe como `local`, oferecer vínculo.

### Implementação prevista

| Camada | Como |
|--------|------|
| API | `passport` + `passport-google-oauth20` (ou validar `id_token` direto) → módulo `auth` |
| Mobile | `expo-auth-session` (fluxo OAuth nativo, PKCE) |
| Back-office | redirect OAuth web padrão |

### Variáveis previstas

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
OAUTH_CALLBACK_URL
```

### Segurança

- Sempre **PKCE** em clientes públicos (mobile/SPA).
- Validar `aud`/`iss`/`exp` do `id_token`.
- Não confiar em e-mail não verificado pelo provedor.
- Segredos OAuth só via env — nunca no repositório.

## Regras invioláveis

- Senha nunca em texto puro — sempre bcrypt.
- `passwordHash` nunca retorna em resposta de API.
- Token expirado/ inválido → `401`; o cliente limpa a sessão e volta ao login.
