@echo off
echo.
echo 🏏 ========================================
echo    IPL AUCTION GAME - DEPLOY NOW!
echo ========================================
echo.

echo 🎯 Choose your deployment platform:
echo.
echo 1. Vercel (Recommended - Easiest for Next.js)
echo 2. Railway (Full-stack with backend)
echo 3. Netlify (Alternative static hosting)
echo 4. Manual deployment instructions
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Deploying to Vercel...
    call deploy-to-vercel.bat
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Deploying to Railway...
    call deploy-to-railway.bat
) else if "%choice%"=="3" (
    echo.
    echo 🚀 Deploying to Netlify...
    call deploy-to-netlify.bat
) else if "%choice%"=="4" (
    echo.
    echo 📚 Opening deployment guide...
    start LIVE_DEPLOYMENT_GUIDE.md
) else (
    echo.
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment process initiated!
echo.
pause