@echo off
echo.
echo 🚀 ========================================
echo    DEPLOY IPL AUCTION GAME TO NETLIFY
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

echo 📦 Installing Netlify CLI...
npm install -g netlify-cli

echo.
echo 🏗️ Building the application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

echo 🔑 Login to Netlify...
netlify login

echo.
echo 🚀 Deploying to Netlify...
echo.
echo 📝 DEPLOYMENT PROCESS:
echo    1. Netlify will create a new site
echo    2. Your built files will be uploaded
echo    3. You'll get a live URL
echo.

netlify deploy --prod --dir=out

echo.
echo ✅ ========================================
echo    DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo 🌐 Your IPL Auction Game is now live on Netlify!
echo.
echo 📋 NEXT STEPS:
echo    1. Copy the live URL from above
echo    2. Test your website
echo    3. Configure custom domain if desired
echo.
echo 🔧 BACKEND DEPLOYMENT:
echo    Deploy your backend separately to Railway or Heroku
echo    See PUBLICATION_GUIDE.md for instructions
echo.
pause