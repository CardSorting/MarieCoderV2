# Quick Start - Local Testing

## ✅ Current Status

- ✅ Backend: Built and ready
- ✅ Frontend: Built and ready  
- ✅ Dependencies: Installed
- ⚠️  cline-host: Not built (optional for full functionality)
- ⚠️  standalone: Not built (optional for AI tasks)

## 🚀 Start Testing Now

### 1. Configure Environment (Optional)

Edit `.env` file if needed:
```env
# Optional: Override Cline API URL (defaults to https://api.cline.bot)
CLINE_API_BASE_URL=https://api.cline.bot

# Optional: Frontend URL for OAuth callbacks (defaults to http://localhost:5173)
FRONTEND_URL=http://localhost:5173
```

**Note**: No API keys needed! Authentication goes through Cline OAuth, which provides access to free models.

### 2. Start Backend

```bash
cd cline-backend-mvp
npm run dev
```

✅ Backend will be available at: http://localhost:3000

### 3. Start Frontend (New Terminal)

```bash
cd frontend  
npm run dev
```

✅ Frontend will be available at: http://localhost:5173

### 4. Open in Browser

Navigate to: **http://localhost:5173**

## 🧪 What You Can Test

### ✅ Fully Working
- User registration and login
- Project creation and management
- File operations (create, read, edit, delete)
- File tree navigation
- Code editor (Monaco)
- Database persistence

### ⚠️ Limited (without cline-host/standalone)
- Terminal: UI works, commands won't execute
- AI Chat: Interface works, tasks won't run

## 📝 Quick Test

1. Open http://localhost:5173
2. Click "Sign up"
3. Create account (username, email, password)
4. Click "New Project"
5. Enter project name
6. Click on project to open IDE
7. Try creating/editing files

## 🔍 Verify Backend

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

## 📚 More Information

- `TESTING_GUIDE.md` - Detailed testing instructions
- `SETUP_LOCAL_TESTING.md` - Complete setup guide
- `DEPLOYMENT.md` - Production deployment guide

## 🐛 Troubleshooting

**Backend won't start?**
- Check port 3000: `lsof -i :3000`
- Verify .env has JWT_SECRET
- Check terminal for errors

**Frontend can't connect?**
- Verify backend is running
- Check browser console
- Ensure CORS allows localhost:5173

**Database errors?**
- Ensure `data/` directory exists
- Check write permissions
- Delete `data/cline.db` to reset

## 🎯 Next Steps

Once basic testing works:
1. Build cline-host for terminal execution
2. Build standalone for AI tasks  
3. Test with Docker Compose
4. Deploy to production

