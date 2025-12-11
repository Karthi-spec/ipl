@echo off
title IPL Auction Game Launcher
color 0A

echo.
echo  ██╗██████╗ ██╗         █████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
echo  ██║██╔══██╗██║        ██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
echo  ██║██████╔╝██║        ███████║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║
echo  ██║██╔═══╝ ██║        ██╔══██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║
echo  ██║██║     ███████╗   ██║  ██║╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
echo  ╚═╝╚═╝     ╚══════╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo                           🏏 GAME LAUNCHER 🏏
echo.
echo ================================================================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check dependencies
echo.
echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies... (this may take a few minutes)
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Check server dependencies
echo.
echo [3/4] Checking server dependencies...
if not exist "server\node_modules" (
    echo 📦 Installing server dependencies...
    cd server
    npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
    echo ✅ Server dependencies installed
) else (
    echo ✅ Server dependencies already installed
)

echo.
echo [4/4] Starting IPL Auction Game...
echo.
echo ================================================================================
echo                              🚀 STARTING SERVERS 🚀
echo ================================================================================
echo.
echo 🌐 Frontend (Next.js): http://localhost:3000
echo 🔧 Backend (Socket.IO): http://localhost:3001  
echo.
echo 📋 How to use:
echo    👑 Admin Panel  - Full auction control
echo    🏏 Join as Team - Participate in bidding  
echo    👀 Watch Live   - Spectator mode
echo.
echo ⚠️  Keep this window open while using the auction
echo ⏹️  Press Ctrl+C in any server window to stop
echo.

REM Start frontend server
echo Starting frontend server...
start "IPL Auction - Frontend" cmd /k "echo 🌐 Frontend Server Running && echo. && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start backend server  
echo Starting backend server...
start "IPL Auction - Backend" cmd /k "echo 🔧 Backend Server Running && echo. && cd server && node index.js"

REM Wait for servers to start
echo.
echo ⏳ Waiting for servers to start...
timeout /t 8 /nobreak >nul

echo.
echo ✅ Servers started successfully!
echo.
echo 🌐 Opening auction in your browser...
start http://localhost:3000

echo.
echo ================================================================================
echo                            🎉 AUCTION IS READY! 🎉
echo ================================================================================
echo.
echo 🎯 Your IPL Auction Game is now running!
echo.
echo 📱 Access URLs:
echo    Main App: http://localhost:3000
echo    Admin:    http://localhost:3000 (click Admin Panel)
echo.
echo 🔧 Server Status:
echo    Frontend: Running on port 3000
echo    Backend:  Running on port 3001
echo.
echo 💡 Tips:
echo    - Use Admin Panel to control the auction
echo    - Teams can join and place bids in real-time
echo    - All actions are synchronized across all connected users
echo    - Audio effects and animations enhance the experience
echo.
echo ⚠️  Important: Keep this launcher window open!
echo.

pause