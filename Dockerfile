# ---- Base image with mise ----
FROM debian:12-slim AS base

RUN apt-get update \
    && apt-get -y --no-install-recommends install curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up Mise tooling
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"

RUN curl https://mise.run | sh

WORKDIR /app

COPY mise.toml package.json pnpm-lock.yaml ./

RUN mise trust
RUN mise install

# ---- Production dependencies ----
FROM base AS prod-deps
RUN pnpm fetch --prod
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
FROM debian:12-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get -y --no-install-recommends install curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up Mise tooling
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"

RUN curl https://mise.run | sh

COPY --from=base /app/mise.toml ./mise.toml

RUN mise trust
RUN mise install

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["fnox", "exec", "--", "node", "./dist/server/entry.mjs"]
