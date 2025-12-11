@echo off
echo.
echo 🏏 ========================================
echo    IPL AUCTION GAME - GITHUB PUSH
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo 📥 Please install Git first:
    echo    1. Go to: https://git-scm.com/download/win
    echo    2. Download and install Git for Windows
    echo    3. Restart this script
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo 📦 Adding all files to Git...
git add .

echo.
echo 📝 Creating commit...
git commit -m "🏏 Complete IPL Auction System - Production Ready

✨ FEATURES:
• Real-time bidding with WebSocket synchronization
• Professional animations (SOLD, RTM, RETAINED, UNSOLD)
• Complete admin panel with auction controls
• JSON database with 627+ players and IPL Legacy Ratings
• Production-ready backend API with Express.js
• Mobile-responsive design with Tailwind CSS
• Docker containerization for easy deployment
• Comprehensive documentation and guides

🎯 TECHNICAL STACK:
• Frontend: Next.js 14, TypeScript, Framer Motion
• Backend: Node.js, Express, Socket.IO
• Database: JSON-based with full CRUD operations
• Infrastructure: Docker, Nginx, SSL/TLS ready

🚀 DEPLOYMENT READY:
• Vercel, Railway, Heroku compatible
• Docker Compose for full-stack deployment
• GitHub Actions workflow included
• Environment configuration templates

📊 COMPLETE SYSTEM:
• 10 IPL teams with budgets and RTM
• 627+ players with real ratings
• Timer system with bid extensions
• Unsold player management
• Team analysis and winner display
• Audio effects and visual animations

Ready for immediate deployment to any platform! 🎉"

echo.
echo ⚠️  NEXT STEPS:
echo    1. Create a new repository on GitHub.com
echo    2. Copy the repository URL
echo    3. Run the command below with YOUR repository URL:
echo.
echo 💡 EXAMPLE COMMAND:
echo    git remote add origin https://github.com/YOUR_USERNAME/ipl-auction-game.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 🔗 SUGGESTED REPOSITORY NAMES:
echo    • ipl-auction-game
echo    • cricket-auction-system
echo    • ipl-bidding-platform
echo    • auction-game-pro
echo.

set /p repo_url="📝 Enter your GitHub repository URL (or press Enter to exit): "

if "%repo_url%"=="" (
    echo.
    echo ℹ️  No URL provided. You can manually add the remote later with:
    echo    git remote add origin YOUR_REPO_URL
    echo    git branch -M main
    echo    git push -u origin main
    echo.
    pause
    exit /b 0
)

echo.
echo 🔗 Adding remote repository...
git remote add origin %repo_url%

echo.
echo 🌿 Setting main branch...
git branch -M main

echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ ========================================
    echo    SUCCESS! PUSHED TO GITHUB! 🎉
    echo ========================================
    echo.
    echo 🌐 Your repository is now live at:
    echo    %repo_url%
    echo.
    echo 🚀 NEXT STEPS FOR DEPLOYMENT:
    echo    1. Go to your GitHub repository
    echo    2. Check the PUBLICATION_GUIDE.md for deployment options
    echo    3. Deploy to Vercel, Railway, or Heroku
    echo    4. Share your live auction game with the world!
    echo.
    echo 📚 DOCUMENTATION AVAILABLE:
    echo    • README.md - Complete overview
    echo    • DEPLOYMENT_GUIDE.md - Deployment instructions
    echo    • PROJECT_STRUCTURE.md - Architecture details
    echo    • PUBLICATION_GUIDE.md - Publishing options
    echo.
) else (
    echo.
    echo ❌ Push failed. Common solutions:
    echo    1. Check if the repository URL is correct
    echo    2. Make sure you have push permissions
    echo    3. Try: git push --set-upstream origin main
    echo.
)

echo.
echo 🎯 Your IPL Auction Game is ready for the world! 🏏
pause