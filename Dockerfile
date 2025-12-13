FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application
COPY . .

# Create directories for SQLite and workspaces
RUN mkdir -p /app/data /app/workspaces

EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DB_PATH=/app/data/cline.db
ENV WORKSPACE_DIR=/app/workspaces

# Build TypeScript
RUN npm run build

CMD ["node", "dist/index.js"]

