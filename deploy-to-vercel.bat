@echo off
echo.
echo 🚀 ========================================
echo    DEPLOY IPL AUCTION GAME TO VERCEL
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

echo 📦 Installing Vercel CLI...
npm install -g vercel

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

echo 🚀 Deploying to Vercel...
echo.
echo 📝 INSTRUCTIONS:
echo    1. You'll be asked to login to Vercel (create account if needed)
echo    2. Choose "Continue with GitHub" for easy setup
echo    3. Select your project settings:
echo       - Set up and deploy: Y
echo       - Which scope: Your username
echo       - Link to existing project: N (for new deployment)
echo       - Project name: ipl-auction-game (or your choice)
echo       - Directory: ./ (current directory)
echo    4. Wait for deployment to complete
echo.

pause

vercel --prod

echo.
echo ✅ ========================================
echo    DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo 🌐 Your IPL Auction Game is now live!
echo.
echo 📋 NEXT STEPS:
echo    1. Copy the deployment URL from above
echo    2. Test your live website
echo    3. Share with friends and cricket fans!
echo.
echo 🔧 BACKEND DEPLOYMENT:
echo    Your frontend is live, but you'll need to deploy the backend separately.
echo    Options:
echo    - Railway: https://railway.app (recommended for backend)
echo    - Heroku: https://heroku.com
echo    - Render: https://render.com
echo.
echo 📚 See PUBLICATION_GUIDE.md for backend deployment instructions
echo.
pause