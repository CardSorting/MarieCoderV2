# Cline Backend MVP

A production-ready headless backend service for Cline, enabling you to build Replit-like platforms and AI-powered coding services.

## Features

- 🚀 **Multi-Instance Management**: Isolated Cline instances per user/project
- 🔒 **Security**: JWT authentication, rate limiting, input validation
- 📊 **Monitoring**: Prometheus metrics, structured logging, health checks
- ⚡ **Performance**: Instance pooling, connection reuse, auto-shutdown
- 🐳 **Deployment**: Docker, Kubernetes, and cloud-ready

## Prerequisites

- Node.js 18+ installed
- Cline standalone build (`dist-standalone/cline-core.js`)
- `cline-host` binary
- Proto files (from Cline repository)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

**Required environment variables:**
- `CLINE_CORE_PATH`: Path to `cline-core.js`
- `CLINE_HOST_PATH`: Path to `cline-host` binary
- `JWT_SECRET`: Secret for JWT token signing
- At least one API key: `ANTHROPIC_API_KEY`, `CLINE_API_KEY`, or `OPENAI_API_KEY`

### 3. Build

```bash
npm run build
```

### 4. Run

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Project Structure

```
cline-backend-mvp/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── services/
│   │   ├── cline-instance-manager.ts
│   │   ├── cline-client.ts
│   │   └── provider-config.ts
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tasks.ts
│   │   │   ├── files.ts
│   │   │   └── health.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       ├── rate-limiter.ts
│   │       └── error-handler.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── metrics.ts
│   └── types/
│       └── index.ts
├── proto/                        # Copy from Cline repo
├── dist-standalone/              # Copy from Cline build
├── cline-host                    # Copy from Cline build
└── workspaces/                   # Created automatically
```

## API Endpoints

### Health Checks

- `GET /health` - Health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /metrics` - Prometheus metrics

### Tasks

- `POST /api/v1/projects/:projectId/tasks` - Create a new task
- `GET /api/v1/projects/:projectId/tasks/:taskId` - Get task status

### Files

- `GET /api/v1/projects/:projectId/files/search?q=query` - Search files

## Authentication

All API endpoints (except health checks) require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/projects/test/tasks
```

## Example Usage

### Create a Task

```bash
curl -X POST http://localhost:3000/api/v1/projects/my-project/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a REST API with Express.js",
    "files": ["package.json"],
    "provider": "ANTHROPIC"
  }'
```

### Get Task Status

```bash
curl http://localhost:3000/api/v1/projects/my-project/tasks/{taskId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Docker

```bash
docker build -t cline-backend .
docker run -p 3000:3000 --env-file .env cline-backend
```

### Kubernetes

See `k8s/` directory for Kubernetes manifests.

## Configuration

See `.env.example` for all available configuration options.

## Troubleshooting

### Instance Won't Start

1. Check logs in `logs/` directory
2. Verify `CLINE_CORE_PATH` and `CLINE_HOST_PATH` are correct
3. Ensure ports are available
4. Check workspace directory permissions

### gRPC Connection Errors

1. Verify instance is healthy: `GET /health`
2. Check instance logs in `~/.cline/instances/{instanceId}/logs/`
3. Ensure firewall allows gRPC connections

### High Memory Usage

1. Enable auto-shutdown for inactive instances
2. Set instance limits per user
3. Monitor with `/metrics` endpoint

## License

MIT

## Support

For issues and questions:
- Check the [documentation](../docs/integrations/headless-backend/)
- Open an issue on GitHub
- Join the Discord community

