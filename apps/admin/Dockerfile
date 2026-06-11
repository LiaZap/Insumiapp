# Back-office Insumia (Vite + React) — build estático servido por nginx.
# Build context: raiz do monorepo.  Build arg: VITE_API_URL (URL pública da API).

FROM node:20-slim AS build
# Corepack do node:20-slim tem bug com pnpm 10 — instala explicitamente via npm
RUN npm install -g pnpm@10.30.3
WORKDIR /app

ARG VITE_API_URL=http://localhost:3333
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN pnpm install --filter "@insumia/admin..." --no-frozen-lockfile
RUN pnpm --filter @insumia/admin build

# --- Serve ---
FROM nginx:alpine
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
