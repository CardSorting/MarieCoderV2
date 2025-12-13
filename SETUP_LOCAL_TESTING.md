# Local Testing Setup Guide

This guide will help you set up and test the Cline IDE locally.

## Prerequisites Check

✅ Node.js v23.5.0
✅ npm 10.9.2  
✅ Go 1.24.7

## Step 1: Build Cline Host Binary

```bash
cd cli
go build -o ../cline-backend-mvp/cline-host ./cmd/cline-host
```

Verify:
```bash
test -f cline-backend-mvp/cline-host && echo "✅ Success" || echo "❌ Failed"
```

## Step 2: Build Cline Standalone (Optional for Testing)

The standalone build may have TypeScript issues. For local testing, you can:

**Option A: Skip standalone build for now**
- The backend will work without it for basic testing
- Instance creation will fail, but other endpoints will work

**Option B: Fix and build standalone**
```bash
npm run compile-standalone
```

If it fails, check the TypeScript configuration.

## Step 3: Set Up Environment Variables

```bash
cd cline-backend-mvp
cp ../.env.example .env
# Edit .env with your configuration
```

Minimum required:
```env
JWT_SECRET=your-secret-key-minimum-32-characters-for-testing
ANTHROPIC_API_KEY=sk-ant-...  # Or CLINE_API_KEY or OPENAI_API_KEY
```

## Step 4: Initialize Database

The database will be created automatically on first run, but you can verify:

```bash
mkdir -p data
# Database will be created at data/cline.db on first run
```

## Step 5: Start Backend

```bash
cd cline-backend-mvp
npm run dev
```

The backend should start on http://localhost:3000 (or PORT from .env)

Verify:
```bash
curl http://localhost:3000/health
```

## Step 6: Start Frontend (in another terminal)

```bash
cd frontend
npm install  # If not already done
npm run dev
```

The frontend should start on http://localhost:5173

## Step 7: Test the Application

1. **Open browser**: http://localhost:5173
2. **Register a new user**: Click "Sign up"
3. **Create a project**: Click "New Project"
4. **Open IDE**: Click on a project to open the IDE
5. **Test features**:
   - Create/edit files
   - Use terminal
   - Try AI chat (requires API key)

## Troubleshooting

### Backend won't start

- Check if port 3000 is available: `lsof -i :3000`
- Verify .env file exists and has JWT_SECRET
- Check logs in terminal

### Frontend can't connect

- Verify backend is running: `curl http://localhost:3000/health`
- Check CORS settings in backend
- Verify VITE_API_URL in frontend/.env (defaults to http://localhost:3000)

### Instance creation fails

- This is expected if standalone isn't built
- Other features (file operations, projects) should still work
- To fix: build standalone and copy to cline-backend-mvp/dist-standalone/

### Database errors

- Ensure data directory is writable
- Check disk space
- Delete data/cline.db to reset (⚠️ loses all data)

## Quick Test Script

```bash
#!/bin/bash
# Quick test script

echo "Testing backend health..."
curl -s http://localhost:3000/health | jq . || echo "Backend not running"

echo "Testing frontend..."
curl -s http://localhost:5173 | grep -q "root" && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"
```

## Next Steps

Once local testing works:
1. Build standalone properly
2. Test with Docker Compose
3. Deploy to production

