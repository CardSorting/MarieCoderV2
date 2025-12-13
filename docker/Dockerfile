# Multi-stage build for Cloud Run optimization
# Stage 1: Build dependencies (for native modules if needed)
FROM node:18-slim AS deps

WORKDIR /app

# Install build dependencies only when needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building if needed)
# In production, we'll only copy production deps
RUN npm ci

# Stage 2: Production image
FROM node:18-slim AS production

WORKDIR /app

# Install runtime dependencies only (minimal for Cloud Run)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code from build context
COPY dist ./dist
COPY proto ./proto

# Copy Cline standalone build (should be provided at build time or mounted)
# COPY dist-standalone ./dist-standalone
# COPY cline-host ./cline-host

# Create workspace and cline directories with proper permissions
RUN mkdir -p /workspaces /root/.cline && \
    chmod 755 /workspaces /root/.cline

# Create non-root user for security
RUN groupadd -r appuser -g 1000 && \
    useradd -r -u 1000 -g appuser -d /app -s /bin/bash appuser && \
    chown -R appuser:appuser /app /workspaces /root/.cline

USER appuser

# Cloud Run requires PORT env var, but we expose default for documentation
EXPOSE 8080

# Use exec form for better signal handling (important for graceful shutdown)
CMD ["node", "dist/index.js"]

