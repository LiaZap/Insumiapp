# Servidor Expo (Metro) — hospeda o app para acesso via Expo Go, sempre online.
# Uso de FASE DE TESTE: é um dev server. Para produção, usar EAS Build.
# Build context: raiz do monorepo. Porta exposta: 8081.

FROM node:20-slim
# Corepack do node:20-slim tem bug com pnpm 10 — instala explicitamente via npm
RUN npm install -g pnpm@10.30.3
WORKDIR /app

COPY . .
RUN pnpm install --filter "@insumia/mobile..." --no-frozen-lockfile

ENV CI=1
ENV EXPO_NO_TELEMETRY=1
# Definido no EasyPanel — host público pelo qual o Expo Go alcança o Metro
# ENV REACT_NATIVE_PACKAGER_HOSTNAME=<dominio-ou-ip-do-vps>

EXPOSE 8081

CMD ["pnpm", "--filter", "@insumia/mobile", "exec", "expo", "start", "--port", "8081"]
