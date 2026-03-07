# ═══════════════════════════════════════════════════════════
# XXXIII Next.js App — Multi-stage Dockerfile
# ═══════════════════════════════════════════════════════════
# Build arg selects which app to build:
#   docker build --build-arg APP=hub .
#   docker build --build-arg APP=gmiie .
#   docker build --build-arg APP=lps .
#   docker build --build-arg APP=studio .
# ═══════════════════════════════════════════════════════════
ARG APP=hub

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY packages/seo/package.json packages/seo/
COPY packages/ui/package.json packages/ui/
COPY apps/hub/package.json apps/hub/
COPY apps/gmiie/package.json apps/gmiie/
COPY apps/lps/package.json apps/lps/
COPY apps/studio/package.json apps/studio/
RUN pnpm install --frozen-lockfile

# ─── Build ────────────────────────────────────────────────
FROM base AS builder
ARG APP
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @xxxiii/db run build
RUN pnpm --filter @xxxiii/types run build
RUN pnpm --filter @xxxiii/config run build
RUN pnpm --filter @xxxiii/seo run build
RUN pnpm --filter @xxxiii/ui run build
RUN pnpm --filter ${APP} run build

# ─── Production ───────────────────────────────────────────
FROM base AS runner
ARG APP
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/${APP}/public ./apps/${APP}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/${APP}/server.js"]
