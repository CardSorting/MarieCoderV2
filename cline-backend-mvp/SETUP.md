# Setup Guide

This guide will help you set up the Cline Backend MVP from scratch.

## Step 1: Prerequisites

1. **Node.js 18+**: Install from [nodejs.org](https://nodejs.org/)
2. **Cline Standalone Build**: You need the built Cline standalone files
3. **Proto Files**: Copy proto files from Cline repository

## Step 2: Get Cline Standalone Build

### Option A: Build from Source

```bash
# Clone Cline repository
git clone https://github.com/cline/cline.git
cd cline

# Install dependencies
npm install

# Build standalone
npm run compile-standalone

# Copy required files to your backend project
cp -r dist-standalone ../cline-backend-mvp/
cp cline-host ../cline-backend-mvp/
```

### Option B: Use npm Package (if available)

```bash
npm install -g cline
# Then locate the installation directory
```

## Step 3: Copy Proto Files

```bash
# From Cline repository
cp -r proto ../cline-backend-mvp/
```

## Step 4: Install Dependencies

```bash
cd cline-backend-mvp
npm install
```

## Step 5: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

1. **CLINE_CORE_PATH**: Path to `cline-core.js` (relative to project root)
2. **CLINE_HOST_PATH**: Path to `cline-host` binary
3. **JWT_SECRET**: Generate with `openssl rand -base64 32`
4. **API Keys**: At least one of:
   - `ANTHROPIC_API_KEY`
   - `CLINE_API_KEY`
   - `OPENAI_API_KEY`

## Step 6: Build

```bash
npm run build
```

## Step 7: Test

```bash
# Start the server
npm start

# In another terminal, test health endpoint
curl http://localhost:3000/health
```

## Step 8: Generate JWT Token (for testing)

Create a simple script to generate test tokens:

```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId: 'test-user', email: 'test@example.com', role: 'user'}, process.env.JWT_SECRET || 'test-secret'));"
```

## Directory Structure After Setup

```
cline-backend-mvp/
├── dist-standalone/          # From Cline build
│   └── cline-core.js
├── cline-host                # From Cline build
├── proto/                    # From Cline repo
│   └── cline/
├── src/                      # Your code
├── dist/                     # Compiled output
├── workspaces/               # Created automatically
└── .cline/                   # Created automatically
```

## Troubleshooting

### "cline-core.js not found"

- Verify `CLINE_CORE_PATH` in `.env` is correct
- Ensure you've built Cline standalone: `npm run compile-standalone` in Cline repo
- Check the path is relative to project root or absolute

### "cline-host not found"

- Verify `CLINE_HOST_PATH` in `.env` is correct
- Ensure `cline-host` binary exists and is executable
- On Linux/Mac: `chmod +x cline-host`

### "Proto files not found"

- Copy proto directory from Cline repository
- Update `protoDir` in `src/services/cline-client.ts` if using different location

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

## Next Steps

- Read the [README.md](./README.md) for API usage
- Check [implementation guide](../docs/integrations/headless-backend/implementation.mdx) for details
- Set up monitoring and logging
- Configure production deployment

