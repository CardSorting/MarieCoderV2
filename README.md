# Cline Backend MVP

A production-ready, enterprise-grade headless backend service for Cline that enables building scalable Replit-like platforms and AI-powered coding services. Built with TypeScript, following industry best practices and clean architecture principles.

## Overview

This service provides a RESTful API gateway to Cline's gRPC services, managing multiple isolated Cline instances for different users and projects. It implements comprehensive error handling, input validation, connection pooling, and graceful shutdown mechanisms.

## Features

### Core Capabilities

- **Multi-Instance Management**: Isolated Cline instances per user/project with automatic lifecycle management
- **Connection Pooling**: Efficient gRPC client reuse with automatic connection management
- **Health Monitoring**: Built-in health checks for instances and services
- **Workspace Isolation**: Secure, isolated workspaces per user/project

### Security & Reliability

- **JWT Authentication**: Token-based authentication with role-based access control
- **Rate Limiting**: Configurable rate limits per IP and per user with Redis support
- **Input Validation**: Comprehensive request validation with detailed error messages
- **Error Handling**: Typed error hierarchy with proper gRPC status code mapping
- **Security Headers**: Helmet.js integration for secure HTTP headers

### Observability

- **Structured Logging**: Winston-based logging with request correlation IDs
- **Prometheus Metrics**: Comprehensive metrics for monitoring and alerting
- **Health Endpoints**: Kubernetes-ready health, readiness, and liveness probes
- **Request Tracing**: Request ID tracking for distributed tracing

### Architecture

- **Service Layer**: Clean separation of concerns with dedicated service classes
- **Type Safety**: Full TypeScript coverage with minimal `any` types
- **Dependency Injection**: Singleton service pattern for testability
- **Graceful Shutdown**: Coordinated shutdown with cleanup hooks

## Prerequisites

- **Node.js**: Version 18 or higher
- **Cline Standalone Build**: `dist-standalone/cline-core.js` from Cline repository
- **Cline Host Binary**: `cline-host` executable from Cline build
- **Proto Files**: Protocol buffer definitions from Cline repository (`proto/cline/`)

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cline-backend-mvp

# Install dependencies
npm install
```

### Configuration

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Cline Paths
CLINE_CORE_PATH=./dist-standalone/cline-core.js
CLINE_HOST_PATH=./cline-host
WORKSPACE_DIR=./workspaces
CLINE_DIR=~/.cline

# Security
JWT_SECRET=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# API Keys (at least one required)
ANTHROPIC_API_KEY=your-anthropic-key
CLINE_API_KEY=your-cline-key
OPENAI_API_KEY=your-openai-key

# Optional: Redis for distributed rate limiting
REDIS_URL=redis://localhost:6379

# Optional: Monitoring
ENABLE_METRICS=true
```

### Build and Run

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Development mode with auto-reload
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `PORT`).

## Architecture

### Project Structure

```
cline-backend-mvp/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── config/                     # Configuration management
│   │   ├── config-service.ts       # Centralized config with validation
│   │   └── index.ts                # Config exports
│   ├── api/                        # HTTP API layer
│   │   ├── routes/                 # Route handlers
│   │   │   ├── tasks.ts           # Task endpoints
│   │   │   ├── files.ts           # File search endpoints
│   │   │   └── health.ts          # Health check endpoints
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   ├── error-handler.ts   # Centralized error handling
│   │   │   ├── rate-limiter.ts    # Rate limiting
│   │   │   └── request-context.ts # Request ID tracking
│   │   └── utils/
│   │       └── response.ts        # Response utilities
│   ├── services/                   # Business logic layer
│   │   ├── cline-instance-manager.ts  # Instance lifecycle
│   │   ├── cline-client.ts        # gRPC client wrapper
│   │   ├── cline-client-factory.ts # Client connection pooling
│   │   ├── health-check-service.ts # Health check utilities
│   │   ├── port-manager.ts         # Port allocation
│   │   ├── workspace-manager.ts    # Workspace management
│   │   ├── shutdown-service.ts     # Graceful shutdown
│   │   ├── task-service.ts         # Task business logic
│   │   ├── file-service.ts         # File search logic
│   │   ├── instance-service.ts     # Instance orchestration
│   │   └── provider-config.ts     # AI provider configuration
│   ├── errors/                     # Error class hierarchy
│   │   ├── app-error.ts           # Base error class
│   │   ├── validation-error.ts    # Validation errors
│   │   ├── instance-error.ts      # Instance-related errors
│   │   ├── grpc-error.ts          # gRPC error wrapper
│   │   ├── client-error.ts        # Client connection errors
│   │   └── index.ts               # Error exports
│   ├── validators/                 # Input validation
│   │   ├── common.ts              # Shared validators
│   │   ├── task-validator.ts      # Task request validation
│   │   └── file-validator.ts     # File search validation
│   ├── types/                      # TypeScript definitions
│   │   ├── index.ts               # Core types
│   │   ├── grpc.ts                # gRPC type definitions
│   │   └── errors.ts              # Error type definitions
│   └── utils/                      # Shared utilities
│       ├── logger.ts              # Winston logger
│       └── metrics.ts             # Prometheus metrics
├── proto/                          # Protocol buffer definitions
├── dist-standalone/                # Cline standalone build
├── cline-host                      # Cline host binary
├── workspaces/                     # User workspaces (auto-created)
└── logs/                          # Application logs (auto-created)
```

### Design Patterns

- **Service Layer Pattern**: Business logic separated from HTTP layer
- **Factory Pattern**: Client factory for connection pooling
- **Singleton Pattern**: Service instances for dependency management
- **Error Hierarchy**: Typed error classes with proper inheritance
- **Validation Layer**: Centralized input validation before business logic

## API Reference

### Authentication

All API endpoints (except health checks) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

The JWT token should contain at minimum:
- `userId` or `id`: User identifier
- `email` (optional): User email
- `role` (optional): User role (defaults to 'user')

### Health Endpoints

#### `GET /health`

Returns overall health status and system information.

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
  "memory": { ... },
  "version": "1.0.0",
  "environment": "production"
}
```

#### `GET /health/ready`

Kubernetes readiness probe. Returns `200` if the service is ready to accept traffic, `503` otherwise.

#### `GET /health/live`

Kubernetes liveness probe. Returns `200` if the process is running.

#### `GET /metrics`

Prometheus metrics endpoint. Returns metrics in Prometheus format.

### Task Endpoints

#### `POST /api/v1/projects/:projectId/tasks`

Create a new AI coding task.

**Request Body:**
```json
{
  "prompt": "Create a REST API with Express.js",
  "files": ["package.json", "src/index.ts"],
  "provider": "ANTHROPIC"
}
```

**Parameters:**
- `prompt` (required, string, 1-10000 chars): Task description/prompt
- `files` (optional, string[]): File paths to include in context (max 50)
- `provider` (optional, enum): AI provider - `ANTHROPIC`, `OPENAI`, or `CLINE` (default: `CLINE`)

**Response:**
```json
{
  "taskId": "task-123",
  "instanceId": "user-456-project-789",
  "status": "created",
  "estimatedDuration": "30-60 seconds"
}
```

**Status Codes:**
- `200`: Task created successfully
- `400`: Validation error (invalid request)
- `401`: Unauthorized (missing or invalid token)
- `429`: Rate limit exceeded
- `500`: Internal server error

#### `GET /api/v1/projects/:projectId/tasks/:taskId`

Get task status and details.

**Response:**
```json
{
  "id": "task-123",
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
- `200`: Task found
- `401`: Unauthorized
- `404`: Task or instance not found
- `500`: Internal server error

### File Endpoints

#### `GET /api/v1/projects/:projectId/files/search`

Search for files in the workspace.

**Query Parameters:**
- `q` (required, string, 1-200 chars): Search query
- `limit` (optional, number, 1-100): Maximum results (default: 10)

**Example:**
```
GET /api/v1/projects/my-project/files/search?q=auth&limit=20
```

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
- `200`: Search completed successfully
- `400`: Validation error (missing or invalid query)
- `401`: Unauthorized
- `404`: Instance not found
- `500`: Internal server error

## Error Handling

The API uses a consistent error response format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### Error Types

- **ValidationError** (`400`): Invalid request parameters
- **InstanceNotFoundError** (`404`): Instance not found
- **InstanceNotReadyError** (`503`): Instance not ready
- **ClientConnectionError** (`503`): gRPC connection failed
- **GrpcError**: gRPC-specific errors with status code mapping

### gRPC Error Mapping

gRPC status codes are automatically mapped to HTTP status codes:
- `UNAVAILABLE` → `503 Service Unavailable`
- `INVALID_ARGUMENT` → `400 Bad Request`
- `NOT_FOUND` → `404 Not Found`
- `UNAUTHENTICATED` → `401 Unauthorized`
- `PERMISSION_DENIED` → `403 Forbidden`

## Configuration

Configuration is managed through the `ConfigService` class, which provides:

- **Type-safe access**: All config values are typed
- **Validation**: Environment variable validation on startup
- **Centralized management**: Single source of truth for configuration

### Configuration Methods

```typescript
import { configService } from './config'

// Get entire config
const config = configService.getConfig()

// Get specific sections
const server = configService.getServer()
const cline = configService.getCline()
const security = configService.getSecurity()

// Environment checks
if (configService.isDevelopment()) { ... }
if (configService.isProduction()) { ... }
```

## Development

### Available Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Development with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking without emitting
npm run type-check

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

### Code Quality

The project enforces:

- **TypeScript strict mode**: Full type safety
- **ESLint**: Code style and best practices
- **No `any` types**: Minimal use of `any`, preferring `unknown`
- **Error handling**: All errors are typed and handled appropriately

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t cline-backend:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  cline-backend:latest
```

### Docker Compose

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
      - ./workspaces:/workspaces
      - ./logs:/app/logs
    restart: unless-stopped
```

### Kubernetes

The service includes health endpoints compatible with Kubernetes:

- **Readiness Probe**: `GET /health/ready`
- **Liveness Probe**: `GET /health/live`

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cline-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: cline-backend
        image: cline-backend:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
```

## Monitoring

### Metrics

Prometheus metrics are available at `/metrics`:

- `http_requests_total`: Total HTTP requests by method, route, status
- `http_request_duration_seconds`: Request duration histogram
- `cline_instances_active`: Number of active instances
- `cline_instance_start_duration_seconds`: Instance startup time
- `cline_tasks_created_total`: Tasks created by provider

### Logging

Structured JSON logging with Winston:

- **Log Levels**: `error`, `warn`, `info`, `debug`
- **Request Correlation**: Each request has a unique ID
- **Log Files**: Separate files for errors and combined logs
- **Console Output**: Human-readable format in development

### Health Monitoring

Monitor instance health and system status:

```bash
# Check overall health
curl http://localhost:3000/health

# Check readiness
curl http://localhost:3000/health/ready

# Get metrics
curl http://localhost:3000/metrics
```

## Troubleshooting

### Instance Won't Start

**Symptoms**: Instance creation fails or times out

**Solutions**:
1. Check application logs in `logs/` directory
2. Verify `CLINE_CORE_PATH` and `CLINE_HOST_PATH` are correct and executable
3. Ensure ports are available (OS allocates ports automatically)
4. Check workspace directory permissions
5. Review instance-specific logs in `~/.cline/instances/{instanceId}/logs/`

### gRPC Connection Errors

**Symptoms**: `UNAVAILABLE` or connection refused errors

**Solutions**:
1. Verify instance health: `GET /health`
2. Check instance logs in `~/.cline/instances/{instanceId}/logs/`
3. Ensure firewall allows gRPC connections
4. Verify network connectivity between services
5. Check if instance process is running

### High Memory Usage

**Symptoms**: Memory consumption grows over time

**Solutions**:
1. Enable auto-shutdown for inactive instances (future feature)
2. Set instance limits per user (future feature)
3. Monitor with `/metrics` endpoint
4. Review connection pooling settings
5. Check for memory leaks in logs

### Authentication Failures

**Symptoms**: `401 Unauthorized` errors

**Solutions**:
1. Verify `JWT_SECRET` is set correctly
2. Check token expiration
3. Ensure token includes required claims (`userId` or `id`)
4. Verify token signature is valid
5. Check token format: `Bearer <token>`

### Rate Limiting Issues

**Symptoms**: `429 Too Many Requests` errors

**Solutions**:
1. Check rate limit configuration
2. Use Redis for distributed rate limiting
3. Adjust rate limits per use case
4. Implement exponential backoff in clients
5. Monitor rate limit metrics

## Architecture Decisions

### Why Service Layer?

The service layer separates HTTP concerns from business logic, making the codebase:
- **Testable**: Services can be unit tested without HTTP
- **Reusable**: Business logic can be used by other interfaces (CLI, gRPC, etc.)
- **Maintainable**: Clear separation of concerns

### Why Connection Pooling?

gRPC clients are expensive to create. Connection pooling:
- **Reduces latency**: Reuses existing connections
- **Improves performance**: Avoids connection overhead
- **Manages resources**: Prevents connection leaks

### Why Typed Errors?

Typed error classes provide:
- **Type safety**: Compile-time error checking
- **Better debugging**: Stack traces and error context
- **Consistent handling**: Standardized error responses
- **gRPC integration**: Proper status code mapping

## License

Apache-2.0

## Support

For issues, questions, and contributions:

- **Documentation**: See [Cline Headless Backend Docs](../docs/integrations/headless-backend/)
- **Issues**: Open an issue on GitHub
- **Community**: Join the Discord community

## Contributing

Contributions are welcome! Please ensure:

1. Code follows TypeScript best practices
2. All tests pass
3. Type checking passes (`npm run type-check`)
4. Linting passes (`npm run lint`)
5. New features include tests
6. Documentation is updated
