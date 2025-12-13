#!/bin/bash
# Quick local testing script

set -e

echo "🚀 Cline IDE Local Testing Setup"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
node --version > /dev/null && echo -e "${GREEN}✅ Node.js${NC}" || { echo -e "${RED}❌ Node.js not found${NC}"; exit 1; }
npm --version > /dev/null && echo -e "${GREEN}✅ npm${NC}" || { echo -e "${RED}❌ npm not found${NC}"; exit 1; }
go version > /dev/null && echo -e "${GREEN}✅ Go${NC}" || echo -e "${YELLOW}⚠️  Go not found (needed for cline-host)${NC}"

echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
cd cline-backend-mvp
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo "Backend dependencies already installed"
fi
cd ..

# Frontend dependencies
cd frontend
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo "Frontend dependencies already installed"
fi
cd ..

echo ""
echo "🔧 Setting up environment..."

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env file - please edit it with your API keys!"
  echo ""
  echo "Minimum required in .env:"
  echo "  JWT_SECRET=your-secret-key-minimum-32-characters"
  echo "  ANTHROPIC_API_KEY=sk-ant-... (or CLINE_API_KEY or OPENAI_API_KEY)"
  echo ""
  read -p "Press Enter to continue after editing .env..."
fi

# Create directories
mkdir -p cline-backend-mvp/data
mkdir -p cline-backend-mvp/workspaces

echo ""
echo "🏗️  Building components..."

# Build backend
cd cline-backend-mvp
echo "Building backend..."
npm run build
cd ..

# Build frontend
cd frontend
echo "Building frontend..."
npm run build
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start testing:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd cline-backend-mvp"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Note: Full Cline functionality requires:"
echo "  - cline-host binary (build with: cd cli && go build -o ../cline-backend-mvp/cline-host ./cmd/cline-host)"
echo "  - dist-standalone/cline-core.js (build with: npm run compile-standalone)"

