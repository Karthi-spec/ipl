@echo off
echo.
echo 🚀 ========================================
echo    DEPLOY IPL AUCTION GAME TO RAILWAY
echo ========================================
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

echo 📦 Installing Railway CLI...
npm install -g @railway/cli

echo.
echo 🔑 Login to Railway...
echo.
echo 📝 INSTRUCTIONS:
echo    1. You'll be redirected to Railway website
echo    2. Create account or login with GitHub
echo    3. Come back to this terminal after login
echo.

railway login

echo.
echo 🏗️ Initializing Railway project...
railway init

echo.
echo 🚀 Deploying to Railway...
echo.
echo 📝 DEPLOYMENT PROCESS:
echo    1. Railway will detect your Next.js app
echo    2. It will automatically build and deploy
echo    3. Both frontend and backend can be deployed
echo.

railway up

echo.
echo ✅ ========================================
echo    DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo 🌐 Your IPL Auction Game is now live!
echo.
echo 📋 NEXT STEPS:
echo    1. Check the deployment URL provided above
echo    2. Test all features on the live site
echo    3. Deploy backend separately if needed:
echo       cd backend
echo       railway up
echo.
echo 🎯 Your cricket auction game is ready for the world! 🏏
echo.
pause