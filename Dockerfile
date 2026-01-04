FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile && mkdir db && touch db/app.db

ENV DATABASE_URL="/app/db/app.db"

COPY . .
RUN bun -c run build


FROM oven/bun:1.3-alpine AS runtime

WORKDIR /app

# Install app

COPY package.json bun.lock ./
RUN bun install drizzle-kit@^0.31.8 @libsql/client@^0.15.15

COPY drizzle.config.ts ./
COPY ./src/lib/server/db/schema.ts ./src/lib/server/db/schema.ts
COPY --from=builder /app/build .

# Metadata

ENV DATABASE_URL="/app/db/app.db"
ENV NODE_ENV="production"
EXPOSE 3000
VOLUME ["/app/db"]

CMD ["sh", "-c", "bun run db:push --force && bun ."]
