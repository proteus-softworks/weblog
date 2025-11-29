# ---- Base image ----
FROM node:lts AS base
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# ---- Production dependencies ----
FROM base AS prod-deps
# Fetch all dependencies to pnpm store (no install yet)
RUN pnpm fetch --prod
# Install ONLY prod deps from the store
RUN pnpm install --offline --prod

# ---- Build dependencies ----
FROM base AS build-deps
RUN pnpm fetch
RUN pnpm install --offline

# ---- Build ----
FROM build-deps AS build
COPY . .
RUN pnpm run build

# ---- Runtime ----
FROM node:lts AS runtime
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built dist
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
