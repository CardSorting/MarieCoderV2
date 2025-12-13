# Local Testing Guide

## Quick Start (Without Full Cline Integration)

You can test most features without building cline-host and standalone:

### Step 1: Configure Environment

Edit `.env` file:
```bash
JWT_SECRET=test-secret-key-minimum-32-characters-for-local-testing-only
# At least one API key (for AI tasks):
ANTHROPIC_API_KEY=sk-ant-...
# OR
CLINE_API_KEY=...
# OR  
OPENAI_API_KEY=sk-...
```

### Step 2: Start Backend

```bash
cd cline-backend-mvp
npm run dev
```

Backend will start on http://localhost:3000

Verify it's running:
```bash
curl http://localhost:3000/health
```

### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:5173

### Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Register a new user
3. Create a project
4. Test features:
   - ✅ File operations (create, read, edit, delete)
   - ✅ File tree navigation
   - ✅ Project management
   - ✅ User authentication
   - ⚠️ Terminal (will work but commands won't execute without cline-host)
   - ⚠️ AI Chat (will work but tasks won't execute without standalone)

## What Works Without Full Build

### ✅ Fully Functional
- User registration and login
- Project creation and management
- File CRUD operations
- File tree display
- Code editor (Monaco)
- WebSocket connections
- Database operations

### ⚠️ Partially Functional
- Terminal: UI works, but commands won't execute (needs cline-host)
- AI Chat: Interface works, but tasks won't run (needs standalone)

## Testing Individual Features

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
# Save the token from response
```

### Test Projects
```bash
# Create project (use token from login)
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Project","description":"My test project"}'

# List projects
curl http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test File Operations
```bash
# Get file tree (replace PROJECT_ID)
curl http://localhost:3000/api/v1/projects/PROJECT_ID/files/tree \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create file
curl -X POST http://localhost:3000/api/v1/projects/PROJECT_ID/files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"path":"test.js","content":"console.log(\"Hello World\");"}'

# Read file
curl http://localhost:3000/api/v1/projects/PROJECT_ID/files/test.js \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Building Full Components (Optional)

### Build cline-host (for terminal execution)

This requires Go protobuf generation which has dependencies. For now, you can:
1. Skip it and test other features
2. Or use a pre-built binary if available

### Build Standalone (for AI tasks)

```bash
npm run compile-standalone
```

If it fails due to TypeScript issues, you can:
1. Test without it (other features work)
2. Fix the TypeScript config issue
3. Or use a pre-built standalone if available

## Troubleshooting

### Backend won't start
- Check if port 3000 is in use: `lsof -i :3000`
- Verify .env file exists and has JWT_SECRET
- Check logs in terminal

### Frontend can't connect
- Verify backend is running: `curl http://localhost:3000/health`
- Check browser console for errors
- Verify CORS settings (should allow localhost:5173)

### Database errors
- Ensure `data/` directory exists and is writable
- Check disk space
- Delete `data/cline.db` to reset (⚠️ loses data)

### Instance creation fails
- This is expected without standalone/cline-host
- File operations and projects still work
- This only affects AI tasks and terminal execution

## Next Steps

Once basic testing works:
1. Fix Go protobuf generation for cline-host
2. Fix TypeScript config for standalone build
3. Test full integration with Docker Compose
4. Deploy to production

## Quick Test Script

```bash
# Test backend health
echo "Testing backend..."
curl -s http://localhost:3000/health | jq . || echo "Backend not running"

# Test frontend
echo "Testing frontend..."
curl -s http://localhost:5173 | grep -q "root" && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"
```

