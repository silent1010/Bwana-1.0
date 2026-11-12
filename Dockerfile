# ========================================================
# Bwana Multi-Stage High-Performance Production Dockerfile
# Optimized for Node.js 22, Vite SPA & Express API Services
# ========================================================

# --- Stage 1: Dependency Cache & Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package manifests first for efficient layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies required for compilation)
RUN npm ci --ignore-scripts || npm install

# Copy application source code and configuration files
COPY . .

# Run build step to produce optimized client bundle and type verification
ENV NODE_ENV=production
RUN npm run build

# Prune devDependencies to keep container footprint minimal
RUN npm prune --production

# --- Stage 2: Hardened Production Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create unprivileged system group and user for security hardening
RUN addgroup --system --gid 1001 bwanagroup && \
    adduser --system --uid 1001 bwanauser

# Copy built application assets and production node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Set correct file ownership
RUN chown -R bwanauser:bwanagroup /app

# Switch to non-root user
USER bwanauser

# Expose HTTP traffic port
EXPOSE 3000

# Container healthcheck targeting the Bwana API health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/v1/health || exit 1

# Start production server
CMD ["node", "server.js"]
