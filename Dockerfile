# API Insumia (NestJS + Prisma) — build para EasyPanel / qualquer Docker host.
FROM node:20-slim

# openssl: requerido pela engine do Prisma
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable
WORKDIR /app

# Copia o monorepo (node_modules ignorado via .dockerignore)
COPY . .

# Instala apenas a API e suas dependências (inclui @insumia/shared)
RUN pnpm install --filter "@insumia/api..." --no-frozen-lockfile

# Gera o Prisma Client
RUN pnpm --filter @insumia/api exec prisma generate

ENV NODE_ENV=production
ENV API_PORT=3333
EXPOSE 3333

# Aplica migrações e sobe a API
CMD ["sh", "-c", "pnpm --filter @insumia/api exec prisma migrate deploy && pnpm --filter @insumia/api start"]
