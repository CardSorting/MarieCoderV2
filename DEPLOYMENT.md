# Deployment Guide

Self-hosted deployment guide for Cline IDE MVP.

## Prerequisites

- Docker and Docker Compose installed
- 4GB+ RAM available
- 20GB+ disk space
- Node.js 18+ (for local development only)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cline-main
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build Cline standalone** (if not already built)
   ```bash
   cd cline-main
   npm install
   npm run compile-standalone
   ```

4. **Copy Cline files to backend directory**
   ```bash
   cp -r dist-standalone cline-backend-mvp/
   cp cli/bin/cline-host cline-backend-mvp/  # Or build from CLI
   ```

5. **Start services**
   ```bash
   docker-compose up -d
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Environment Variables

Create a `.env` file in the root directory:

```env
# Security (Required)
JWT_SECRET=your-secret-key-minimum-32-characters-change-in-production

# API Keys (At least one required)
ANTHROPIC_API_KEY=sk-ant-...
# OR
CLINE_API_KEY=...
# OR
OPENAI_API_KEY=sk-...

# Optional: Custom paths
CLINE_CORE_PATH=./dist-standalone/cline-core.js
CLINE_HOST_PATH=./cline-host
WORKSPACE_DIR=./workspaces
DB_PATH=./data/cline.db
```

## Directory Structure

After first run, the following directories will be created:

```
cline-main/
├── data/              # SQLite database
├── workspaces/        # User project workspaces
│   └── {userId}/
│       └── {projectId}/
└── logs/              # Application logs (if configured)
```

## Building Cline Standalone

If you need to build the Cline standalone version:

```bash
cd cline-main
npm install
npm run compile-standalone
```

This creates `dist-standalone/cline-core.js` which needs to be copied to `cline-backend-mvp/dist-standalone/`.

## Building Cline Host Binary

The `cline-host` binary is required. You can:

1. Build from the CLI directory:
   ```bash
   cd cli
   go build -o ../cline-backend-mvp/cline-host ./cmd/cline-host
   ```

2. Or download a pre-built binary if available

## Troubleshooting

### Backend won't start

- Check logs: `docker-compose logs backend`
- Verify Cline paths are correct
- Ensure ports 3000 is available
- Check environment variables are set

### Frontend can't connect to backend

- Verify backend is running: `curl http://localhost:3000/health`
- Check CORS settings in backend
- Verify proxy configuration in nginx.conf

### Database errors

- Ensure data directory is writable
- Check disk space
- Verify SQLite file permissions

### Instance creation fails

- Check workspace directory permissions
- Verify Cline core and host binaries exist
- Review instance logs in `~/.cline/instances/{instanceId}/logs/`

## Production Considerations

1. **Change JWT_SECRET** to a strong random value
2. **Use HTTPS** - Set up reverse proxy (nginx/traefik) with SSL
3. **Backup database** - Regularly backup `data/cline.db`
4. **Monitor resources** - Set up monitoring for CPU, memory, disk
5. **Limit workspaces** - Implement storage quotas
6. **Secure API keys** - Use secret management (Docker secrets, etc.)

## Scaling

For MVP, this setup runs on a single server. For scaling:

- Use load balancer for multiple backend instances
- Move SQLite to PostgreSQL for multi-instance support
- Add Redis for distributed rate limiting
- Use shared storage for workspaces (NFS, S3, etc.)

