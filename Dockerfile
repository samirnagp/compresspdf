FROM node:25-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:25-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:25-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ghostscript \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=10000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Run as an unprivileged user, so a bug in a PDF/image library cannot act as root.
USER node
EXPOSE 10000
CMD ["node", "server.js"]
