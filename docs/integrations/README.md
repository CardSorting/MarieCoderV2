# Cline Integrations

This directory contains guides for integrating Cline into your applications and services.

## Headless Backend Integration

Learn how to use Cline as a backend service for building platforms like Replit, online IDEs, or any service that needs AI-powered code generation.

### Documentation

- **[Overview](./headless-backend/overview.mdx)** - Introduction to using Cline as a headless backend
- **[Architecture](./headless-backend/architecture.mdx)** - Detailed architecture and component interactions
- **[Implementation Guide](./headless-backend/implementation.mdx)** - Step-by-step implementation guide
- **[API Reference](./headless-backend/api-reference.mdx)** - Complete reference for all gRPC services
- **[Multi-Instance Management](./headless-backend/multi-instance.mdx)** - Managing multiple Cline instances

### Quick Start

1. Build the standalone version:
   ```bash
   npm run compile-standalone
   ```

2. Start a Cline instance:
   ```bash
   node dist-standalone/cline-core.js --port 26040
   ```

3. Connect via gRPC:
   ```typescript
   import { ClineClient } from './cline-client'
   const client = new ClineClient('127.0.0.1:26040')
   await client.connect()
   const taskId = await client.Task.newTask({ text: 'Create a REST API' })
   ```

See the [Implementation Guide](./headless-backend/implementation.mdx) for complete examples.

## Future Integrations

Additional integration guides will be added here for:
- CI/CD pipeline integration
- API service integration
- Custom tool development
- Plugin system

