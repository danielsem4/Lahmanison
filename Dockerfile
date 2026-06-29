# syntax=docker/dockerfile:1

# ─── Stage 1: build the React SPA ────────────────────────
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ─── Stage 2: build the API (TypeScript → dist) ──────────
FROM node:20-slim AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
# prisma.config.ts resolves DATABASE_URL eagerly via Prisma's strict env() helper,
# so it must be set for `prisma generate` to load the config. `generate` never
# connects to a DB — this placeholder is build-time only and never reaches the
# final image; Render injects the real DATABASE_URL at runtime.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate && npm run build

# ─── Stage 3: slim runtime image ─────────────────────────
FROM node:20-slim AS runtime
ENV NODE_ENV=production \
    PORT=3001 \
    CLIENT_DIST_PATH=/app/public
WORKDIR /app

# Prisma needs openssl present at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Reuse the server's installed modules (incl. the generated Prisma client and
# the prisma CLI used by the entrypoint to run migrations).
COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/prisma ./prisma
COPY --from=server-build /app/server/package.json ./package.json
COPY --from=server-build /app/server/prisma.config.ts ./prisma.config.ts
COPY --from=server-build /app/server/tsconfig.json ./tsconfig.json

# Built SPA served by Express in production (see server/src/index.ts).
COPY --from=client-build /app/client/dist ./public

COPY server/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
