FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production

# Copy application
COPY dist ./dist
COPY proto ./proto

# Copy Cline standalone build (should be mounted or copied)
# COPY dist-standalone ./dist-standalone
# COPY cline-host ./cline-host

# Create workspace and cline directories
RUN mkdir -p /workspaces /root/.cline

# Run as non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app /workspaces /root/.cline

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]

