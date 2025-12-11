@echo off
echo 🚀 Starting IPL Auction Game...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

REM Start the existing server (which handles both frontend and backend)
echo 🌐 Starting auction server...
echo.
echo 📊 Server will be available at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 🎯 Admin Panel: Click "Admin Panel" on the landing page
echo 👥 Teams: Click "Join as Team" and select your team
echo 👀 Spectators: Click "Watch Live"
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start both frontend and backend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "Backend Server" cmd /k "cd server && node index.js"

echo ✅ Servers started successfully!
echo.
echo 🌐 Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

pause