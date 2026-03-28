FROM node:20-alpine

WORKDIR /app

# Disable Next.js telemetry at build time
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Expose dev server port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default to dev mode; docker-compose overrides this via `command:`
CMD ["npm", "run", "dev"]
