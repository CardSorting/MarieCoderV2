# Project Structure

Complete MVP scaffolding for Cline Backend service.

## Directory Tree

```
cline-backend-mvp/
├── src/                          # Source code
│   ├── index.ts                  # Main entry point
│   ├── config/
│   │   └── index.ts              # Configuration management
│   ├── services/                 # Core services
│   │   ├── cline-instance-manager.ts  # Instance lifecycle management
│   │   ├── cline-client.ts       # gRPC client wrapper
│   │   └── provider-config.ts    # AI provider configuration
│   ├── api/                      # API layer
│   │   ├── routes/
│   │   │   ├── tasks.ts         # Task endpoints
│   │   │   ├── files.ts         # File search endpoints
│   │   │   └── health.ts        # Health check endpoints
│   │   └── middleware/
│   │       ├── auth.ts          # JWT authentication
│   │       ├── rate-limiter.ts  # Rate limiting
│   │       └── error-handler.ts  # Error handling
│   ├── utils/                    # Utilities
│   │   ├── logger.ts            # Winston logger
│   │   └── metrics.ts           # Prometheus metrics
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── docker/                       # Docker configuration
│   ├── Dockerfile               # Docker image definition
│   └── docker-compose.yml       # Docker Compose setup
├── proto/                        # Proto files (copy from Cline repo)
├── dist-standalone/              # Cline standalone build (copy from Cline)
├── cline-host                    # Cline host binary (copy from Cline)
├── workspaces/                   # User workspaces (created at runtime)
├── .cline/                       # Cline data directory (created at runtime)
├── logs/                         # Application logs (created at runtime)
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── .eslintrc.json               # ESLint configuration
├── .npmrc                        # NPM configuration
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variables template
├── Makefile                      # Make commands for common tasks
├── README.md                     # Main documentation
├── SETUP.md                      # Detailed setup guide
├── QUICKSTART.md                 # Quick start guide
├── CONTRIBUTING.md               # Contribution guidelines
└── PROJECT_STRUCTURE.md          # This file

```

## Key Files

### Core Application

- **src/index.ts**: Main server entry point, Express setup, graceful shutdown
- **src/services/cline-instance-manager.ts**: Manages Cline instance lifecycle
- **src/services/cline-client.ts**: gRPC client for Cline services
- **src/services/provider-config.ts**: Configures AI providers

### API Routes

- **src/api/routes/tasks.ts**: Task creation and status endpoints
- **src/api/routes/files.ts**: File search endpoints
- **src/api/routes/health.ts**: Health check endpoints

### Middleware

- **src/api/middleware/auth.ts**: JWT authentication
- **src/api/middleware/rate-limiter.ts**: Rate limiting (in-memory or Redis)
- **src/api/middleware/error-handler.ts**: Centralized error handling

### Utilities

- **src/utils/logger.ts**: Structured logging with Winston
- **src/utils/metrics.ts**: Prometheus metrics collection

## Configuration Files

- **package.json**: Dependencies and npm scripts
- **tsconfig.json**: TypeScript compiler options
- **.env.example**: Environment variables template
- **docker/Dockerfile**: Docker image definition
- **docker/docker-compose.yml**: Docker Compose configuration

## Next Steps

1. Copy Cline standalone build to `dist-standalone/`
2. Copy `cline-host` binary to project root
3. Copy proto files to `proto/`
4. Run `npm install`
5. Copy `.env.example` to `.env` and configure
6. Run `npm run build`
7. Run `npm start`

See [SETUP.md](./SETUP.md) for detailed instructions.

