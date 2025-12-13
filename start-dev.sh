#!/bin/bash
# Start both backend and frontend for development

echo "Starting Cline IDE development servers..."
echo ""

# Start backend in background
cd cline-backend-mvp
npm run dev &
BACKEND_PID=$!
echo "Backend starting on http://localhost:3000 (PID: $BACKEND_PID)"

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../frontend
echo "Frontend starting on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers starting..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
