# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- Cline standalone build (see SETUP.md)

## Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your paths and API keys
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Start server**
   ```bash
   npm start
   ```

5. **Test**
   ```bash
   curl http://localhost:3000/health
   ```

## Generate Test JWT Token

```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId: 'test-user', email: 'test@example.com', role: 'user'}, 'your-jwt-secret'));"
```

## Create Your First Task

```bash
curl -X POST http://localhost:3000/api/v1/projects/test-project/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hello world function in Python",
    "provider": "ANTHROPIC"
  }'
```

That's it! You're ready to build your AI-powered coding platform.

For more details, see [README.md](./README.md) and [SETUP.md](./SETUP.md).
