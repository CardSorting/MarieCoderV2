# Cline Backend MVP

Enterprise-grade headless backend service for Cline that enables building scalable Replit-like platforms and AI-powered coding services. Built with TypeScript following clean architecture principles and industry best practices.

## Table of Contents

- [What is Cline Backend?](#what-is-cline-backend)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## What is Cline Backend?

Cline Backend MVP provides a RESTful API gateway to Cline's gRPC services. It manages multiple isolated Cline instances for different users and projects, implementing enterprise-grade features including:

- **Multi-tenant isolation**: Each user/project operates in a completely isolated environment
- **Connection management**: Efficient gRPC client pooling with automatic lifecycle management
- **Error handling**: Comprehensive typed error hierarchy with proper status code mapping
- **Input validation**: Request validation before processing
- **Observability**: Structured logging, metrics, and health monitoring

## Key Features

### Instance Management

- **Automatic lifecycle**: Instances start on demand and can be reused across requests
- **Health monitoring**: Continuous health checks ensure instance availability
- **Port allocation**: OS-level port allocation prevents conflicts
- **Workspace isolation**: Secure, isolated filesystem per user/project

### Security

- **JWT authentication**: Token-based authentication with configurable claims
- **Rate limiting**: Per-IP and per-user rate limits with Redis support for distributed systems
- **Input validation**: Type-safe validation with detailed error messages
- **Security headers**: Helmet.js integration for HTTP security headers
- **CORS configuration**: Configurable cross-origin resource sharing

### Reliability

- **Connection pooling**: Reuses gRPC connections to reduce latency
- **Graceful shutdown**: Coordinated shutdown with cleanup hooks
- **Error recovery**: Automatic retry and error handling
- **Health probes**: Kubernetes-ready readiness and liveness endpoints

### Observability

- **Structured logging**: JSON-formatted logs with request correlation IDs
- **Prometheus metrics**: Comprehensive metrics for monitoring and alerting
- **Request tracing**: Unique request IDs for distributed tracing
- **Health endpoints**: System and instance health status

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **Cline standalone build**: `dist-standalone/cline-core.js`
- **Cline host binary**: `cline-host` executable
- **Proto files**: Protocol buffer definitions from `proto/cline/`

### Installation

```bash
# Clone repository
git clone <repository-url>
cd cline-backend-mvp

# Install dependencies
npm install
```

### Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Configure required variables:

```env
# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Cline Paths
CLINE_CORE_PATH=./dist-standalone/cline-core.js
CLINE_HOST_PATH=./cline-host
WORKSPACE_DIR=./workspaces
CLINE_DIR=~/.cline

# Security (Required)
JWT_SECRET=your-secret-key-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:3000

# API Keys (At least one required)
ANTHROPIC_API_KEY=sk-ant-...
# OR
CLINE_API_KEY=...
# OR
OPENAI_API_KEY=sk-...

# Optional: Redis for distributed rate limiting
REDIS_URL=redis://localhost:6379
```

### Build and Run

```bash
# Build TypeScript
npm run build

# Start server
npm start

# Development mode (auto-reload)
npm run dev
```

The server starts on `http://localhost:3000` by default.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│              (Web, Mobile, CLI, etc.)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cline Backend MVP Service                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │  Middleware  │  │   Services   │  │
│  │  (HTTP API)  │→ │ (Auth, Rate  │→ │ (Business    │  │
│  │              │  │  Limit, etc) │  │   Logic)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ gRPC
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Cline Core Instances (Per User/Project)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  gRPC Server │  │ Host Bridge  │  │  Workspace   │  │
│  │  (Core)      │  │  (File Ops)  │  │  (Isolated)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
cline-backend-mvp/
├── src/
│   ├── index.ts                    # Application entry point
│   │
│   ├── config/                      # Configuration management
│   │   ├── config-service.ts        # Centralized config with validation
│   │   └── index.ts                 # Public API
│   │
│   ├── api/                         # HTTP API layer
│   │   ├── routes/                  # Route handlers
│   │   │   ├── tasks.ts             # Task management endpoints
│   │   │   ├── files.ts             # File search endpoints
│   │   │   └── health.ts            # Health check endpoints
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── error-handler.ts     # Centralized error handling
│   │   │   ├── rate-limiter.ts      # Rate limiting
│   │   │   └── request-context.ts    # Request ID tracking
│   │   └── utils/
│   │       └── response.ts          # Response utilities
│   │
│   ├── services/                    # Business logic layer
│   │   ├── cline-instance-manager.ts   # Instance lifecycle management
│   │   ├── cline-client.ts          # gRPC client wrapper
│   │   ├── cline-client-factory.ts  # Connection pooling
│   │   ├── health-check-service.ts  # Health check utilities
│   │   ├── port-manager.ts          # Port allocation
│   │   ├── workspace-manager.ts     # Workspace management
│   │   ├── shutdown-service.ts      # Graceful shutdown
│   │   ├── task-service.ts          # Task business logic
│   │   ├── file-service.ts          # File search logic
│   │   ├── instance-service.ts      # Instance orchestration
│   │   └── provider-config.ts       # AI provider configuration
│   │
│   ├── errors/                      # Error class hierarchy
│   │   ├── app-error.ts             # Base error class
│   │   ├── validation-error.ts       # Validation errors
│   │   ├── instance-error.ts        # Instance-related errors
│   │   ├── grpc-error.ts            # gRPC error wrapper
│   │   ├── client-error.ts          # Client connection errors
│   │   └── index.ts                 # Public API
│   │
│   ├── validators/                  # Input validation
│   │   ├── common.ts                # Shared validators
│   │   ├── task-validator.ts        # Task request validation
│   │   └── file-validator.ts        # File search validation
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── index.ts                 # Core domain types
│   │   ├── grpc.ts                  # gRPC type definitions
│   │   └── errors.ts                # Error type definitions
│   │
│   └── utils/                       # Shared utilities
│       ├── logger.ts                # Winston logger configuration
│       └── metrics.ts               # Prometheus metrics
│
├── proto/                           # Protocol buffer definitions
├── dist-standalone/                 # Cline standalone build
├── cline-host                       # Cline host binary
├── workspaces/                      # User workspaces (auto-created)
└── logs/                            # Application logs (auto-created)
```

### Design Patterns

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| **Service Layer** | Separate HTTP from business logic | Dedicated service classes (`TaskService`, `FileService`) |
| **Factory** | Manage connection lifecycle | `ClineClientFactory` for connection pooling |
| **Singleton** | Shared service instances | Service exports (e.g., `configService`, `taskService`) |
| **Error Hierarchy** | Typed error handling | Error classes extending `AppError` |
| **Validation Layer** | Centralized input validation | Validator functions before service calls |

### Data Flow

1. **Request arrives** → Route handler receives HTTP request
2. **Authentication** → JWT middleware validates token
3. **Rate limiting** → Rate limiter checks request frequency
4. **Validation** → Validator checks request parameters
5. **Service layer** → Business logic processes request
6. **Instance management** → Gets or creates Cline instance
7. **gRPC call** → Client factory provides pooled client
8. **Response** → Error handler formats response

## API Documentation

### Authentication

All endpoints except health checks require JWT authentication:

```http
Authorization: Bearer <jwt-token>
```

**JWT Token Requirements:**

| Claim | Required | Description |
|-------|----------|-------------|
| `userId` or `id` | Yes | Unique user identifier |
| `email` | No | User email address |
| `role` | No | User role (defaults to `user`) |

### Endpoints

#### Health Checks

##### `GET /health`

Returns system health status and metrics.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "instances": {
    "active": 5,
    "total": 5
  },
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 45678901,
    "external": 1234567
  },
  "version": "1.0.0",
  "environment": "production"
}
```

**Status Codes:**
- `200`: Service is healthy

##### `GET /health/ready`

Kubernetes readiness probe. Indicates whether the service can accept traffic.

**Response:**
```json
{
  "status": "ready"
}
```

**Status Codes:**
- `200`: Service is ready
- `503`: Service is not ready

##### `GET /health/live`

Kubernetes liveness probe. Indicates whether the process is running.

**Response:**
```json
{
  "status": "alive"
}
```

**Status Codes:**
- `200`: Process is alive

##### `GET /metrics`

Prometheus metrics endpoint. Returns metrics in Prometheus exposition format.

**Content-Type:** `text/plain; version=0.0.4`

#### Tasks

##### `POST /api/v1/projects/:projectId/tasks`

Creates a new AI coding task.

**Path Parameters:**
- `projectId` (string, required): Project identifier

**Request Body:**
```json
{
  "prompt": "Create a REST API with Express.js",
  "files": ["package.json", "src/index.ts"],
  "provider": "ANTHROPIC"
}
```

**Request Body Schema:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `prompt` | string | Yes | 1-10,000 characters | Task description or prompt |
| `files` | string[] | No | Max 50 items | File paths to include in context |
| `provider` | enum | No | `ANTHROPIC`, `OPENAI`, `CLINE` | AI provider (default: `CLINE`) |

**Response:**
```json
{
  "taskId": "task-abc123",
  "instanceId": "user-456-project-789",
  "status": "created",
  "estimatedDuration": "30-60 seconds"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Task created successfully |
| `400` | Validation error (invalid request parameters) |
| `401` | Unauthorized (missing or invalid token) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

**Example Request:**
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

##### `GET /api/v1/projects/:projectId/tasks/:taskId`

Retrieves task status and details.

**Path Parameters:**
- `projectId` (string, required): Project identifier
- `taskId` (string, required): Task identifier

**Response:**
```json
{
  "id": "task-abc123",
  "task": "Create a REST API with Express.js",
  "ts": 1704110400000,
  "is_favorited": false,
  "size": 1024,
  "total_cost": 0.05,
  "tokens_in": 100,
  "tokens_out": 200,
  "cache_writes": 5,
  "cache_reads": 10,
  "model_id": "claude-3-5-sonnet-20241022"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Task found |
| `401` | Unauthorized |
| `404` | Task or instance not found |
| `500` | Internal server error |

#### Files

##### `GET /api/v1/projects/:projectId/files/search`

Searches for files in the workspace using fuzzy matching.

**Path Parameters:**
- `projectId` (string, required): Project identifier

**Query Parameters:**

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `q` | string | Yes | 1-200 characters | Search query |
| `limit` | number | No | 1-100 | Maximum results (default: 10) |

**Response:**
```json
{
  "files": [
    "src/auth/middleware.ts",
    "src/auth/routes.ts",
    "src/auth/types.ts"
  ]
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Search completed successfully |
| `400` | Validation error (missing or invalid query) |
| `401` | Unauthorized |
| `404` | Instance not found |
| `500` | Internal server error |

**Example Request:**
```bash
curl "http://localhost:3000/api/v1/projects/my-project/files/search?q=auth&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration

### Configuration Service

Configuration is managed through `ConfigService`, providing type-safe access and validation:

```typescript
import { configService } from './config'

// Access configuration sections
const server = configService.getServer()      // Server config
const cline = configService.getCline()        // Cline paths
const security = configService.getSecurity()  // Security settings
const apiKeys = configService.getApiKeys()    // API keys
const redis = configService.getRedis()        // Redis config
const monitoring = configService.getMonitoring() // Monitoring config

// Environment checks
if (configService.isDevelopment()) { /* ... */ }
if (configService.isProduction()) { /* ... */ }
if (configService.isTest()) { /* ... */ }
```

### Environment Variables

#### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |
| `LOG_LEVEL` | No | `info` | Log level (`error`, `warn`, `info`, `debug`) |

#### Cline Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLINE_CORE_PATH` | No | `./dist-standalone/cline-core.js` | Path to Cline core executable |
| `CLINE_HOST_PATH` | No | `./cline-host` | Path to Cline host binary |
| `WORKSPACE_DIR` | No | `./workspaces` | Base directory for user workspaces |
| `CLINE_DIR` | No | `~/.cline` | Cline configuration directory |

#### Security Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing (minimum 32 characters) |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed CORS origins |

#### API Keys

At least one API key is required:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Conditional | Anthropic API key |
| `CLINE_API_KEY` | Conditional | Cline API key |
| `OPENAI_API_KEY` | Conditional | OpenAI API key |

#### Optional Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | - | Redis connection URL for distributed rate limiting |
| `ENABLE_METRICS` | No | `true` | Enable Prometheus metrics |

### Validation

The configuration service validates environment variables on startup:

- **Port validation**: Ensures port is between 1 and 65535
- **Required fields**: Warns if `JWT_SECRET` is missing
- **API keys**: Warns if no API keys are configured

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript 5.3+

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Type check without emitting files |
| `npm run lint` | Lint code with ESLint |
| `npm run clean` | Remove build artifacts |

### Code Quality Standards

The project enforces:

- **TypeScript strict mode**: Full type safety enabled
- **ESLint**: Code style and best practices
- **Type safety**: Minimal use of `any`, preferring `unknown`
- **Error handling**: All errors are typed and handled appropriately
- **No legacy code**: Clean break from legacy patterns

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Project Standards

1. **Type Safety**: All code must pass TypeScript strict mode
2. **Error Handling**: Use typed error classes from `src/errors/`
3. **Validation**: Validate all inputs using validators from `src/validators/`
4. **Services**: Business logic belongs in service classes
5. **Configuration**: Use `configService` for all configuration access
6. **Logging**: Use structured logging with request context

## Deployment

### Docker

#### Build Image

```bash
docker build -t cline-backend:latest .
```

#### Run Container

```bash
docker run -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/workspaces:/app/workspaces \
  -v $(pwd)/logs:/app/logs \
  cline-backend:latest
```

#### Docker Compose

```yaml
version: '3.8'

services:
  cline-backend:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./workspaces:/app/workspaces
      - ./logs:/app/logs
      - ./dist-standalone:/app/dist-standalone
      - ./cline-host:/app/cline-host
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Kubernetes

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cline-backend
  labels:
    app: cline-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cline-backend
  template:
    metadata:
      labels:
        app: cline-backend
    spec:
      containers:
      - name: cline-backend
        image: cline-backend:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: cline-backend-secrets
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

#### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cline-backend
spec:
  selector:
    app: cline-backend
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  type: LoadBalancer
```

## Monitoring & Observability

### Metrics

Prometheus metrics are exposed at `/metrics`:

#### HTTP Metrics

- `http_requests_total`: Counter of HTTP requests by method, route, and status
- `http_request_duration_seconds`: Histogram of request duration

#### Instance Metrics

- `cline_instances_active`: Gauge of active Cline instances
- `cline_instance_start_duration_seconds`: Histogram of instance startup time

#### Task Metrics

- `cline_tasks_created_total`: Counter of tasks created by provider
- `cline_task_duration_seconds`: Histogram of task execution duration

### Logging

Structured JSON logging with Winston:

**Log Levels:**
- `error`: Error events that might still allow the application to continue
- `warn`: Warning messages for potentially harmful situations
- `info`: Informational messages about general operation
- `debug`: Detailed information for debugging

**Log Features:**
- **Request correlation**: Each request has a unique ID (`X-Request-ID` header)
- **Structured format**: JSON logs for parsing and analysis
- **File rotation**: Separate files for errors and combined logs
- **Console output**: Human-readable format in development

**Example Log Entry:**
```json
{
  "level": "info",
  "message": "Task created",
  "taskId": "task-123",
  "userId": "user-456",
  "projectId": "project-789",
  "duration": 1250,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "cline-backend",
  "version": "1.0.0"
}
```

### Health Monitoring

Monitor system health programmatically:

```bash
# Overall health
curl http://localhost:3000/health

# Readiness probe
curl http://localhost:3000/health/ready

# Liveness probe
curl http://localhost:3000/health/live

# Metrics
curl http://localhost:3000/metrics
```

## Troubleshooting

### Common Issues

#### Instance Creation Fails

**Symptoms:**
- Requests return `503 Service Unavailable`
- Logs show "Instance not ready" errors
- Instance startup times out

**Diagnosis:**
1. Check application logs: `tail -f logs/combined.log`
2. Verify Cline paths are correct and executable
3. Check instance logs: `~/.cline/instances/{instanceId}/logs/`
4. Verify workspace directory permissions
5. Check system resources (memory, file descriptors)

**Solutions:**
- Ensure `CLINE_CORE_PATH` and `CLINE_HOST_PATH` are absolute paths or relative to working directory
- Verify Cline binaries have execute permissions
- Check available ports (OS allocates automatically)
- Ensure sufficient disk space for workspaces

#### gRPC Connection Errors

**Symptoms:**
- `UNAVAILABLE` status codes
- Connection refused errors
- Timeout errors

**Diagnosis:**
1. Verify instance health: `curl http://localhost:3000/health`
2. Check instance process: `ps aux | grep cline`
3. Review instance logs for errors
4. Test network connectivity

**Solutions:**
- Restart unhealthy instances
- Check firewall rules for gRPC ports
- Verify instance processes are running
- Check for port conflicts

#### Authentication Failures

**Symptoms:**
- `401 Unauthorized` responses
- "Invalid token" errors

**Diagnosis:**
1. Verify `JWT_SECRET` is set correctly
2. Check token expiration time
3. Validate token format: `Bearer <token>`
4. Verify token claims include `userId` or `id`

**Solutions:**
- Ensure `JWT_SECRET` is at least 32 characters
- Check token hasn't expired
- Verify token signature is valid
- Ensure Authorization header format is correct

#### Rate Limiting Issues

**Symptoms:**
- `429 Too Many Requests` responses
- Rate limit headers in response

**Diagnosis:**
1. Check rate limit configuration
2. Review rate limit metrics
3. Verify Redis connection (if using distributed rate limiting)

**Solutions:**
- Adjust rate limits in configuration
- Use Redis for distributed rate limiting across instances
- Implement exponential backoff in clients
- Monitor rate limit metrics

#### High Memory Usage

**Symptoms:**
- Memory consumption grows over time
- Out of memory errors
- Slow performance

**Diagnosis:**
1. Monitor metrics: `curl http://localhost:3000/metrics | grep memory`
2. Check instance count: `curl http://localhost:3000/health`
3. Review connection pool size
4. Check for memory leaks in logs

**Solutions:**
- Monitor active instance count
- Review connection pooling settings
- Check for memory leaks in application code
- Consider implementing instance limits

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** following project standards
4. **Run quality checks**:
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```
5. **Commit changes**: Use conventional commit messages
6. **Push and create pull request**

### Code Standards

- **TypeScript**: Strict mode enabled, minimal `any` types
- **Error Handling**: Use typed error classes from `src/errors/`
- **Validation**: Validate all inputs using validators
- **Services**: Business logic in service classes, not routes
- **Configuration**: Use `configService` for all config access
- **Testing**: Include tests for new features
- **Documentation**: Update README and code comments

### Pull Request Checklist

- [ ] Code passes `npm run type-check`
- [ ] Code passes `npm run lint`
- [ ] All tests pass (`npm test`)
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] No breaking changes (or documented if necessary)

## License

Apache-2.0

## Support

- **Documentation**: [Cline Headless Backend Docs](../docs/integrations/headless-backend/)
- **Issues**: [GitHub Issues](https://github.com/cline/cline/issues)
- **Community**: [Discord](https://discord.gg/cline)
