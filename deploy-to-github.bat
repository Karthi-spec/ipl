@echo off
title IPL Auction - Deploy to GitHub Pages
color 0A

echo.
echo ================================================================================
echo                    IPL AUCTION GAME - GITHUB PAGES DEPLOYMENT
echo ================================================================================
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

REM Check if this is a git repository
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
    echo.
)

echo 📦 Adding all files to Git...
git add .
echo.

echo 📝 Creating commit...
git commit -m "🚀 Deploy IPL Auction Game to GitHub Pages

✨ Features:
• Real-time multiplayer auction system
• Global access for friends worldwide
• Professional IPL team management
• Live bidding with animations
• Mobile-responsive design

🌍 Ready for worldwide deployment!"

echo.

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No GitHub repository connected!
    echo.
    echo 🔗 SETUP INSTRUCTIONS:
    echo    1. Create a new repository on GitHub.com
    echo    2. Copy the repository URL
    echo    3. Run: git remote add origin YOUR_REPO_URL
    echo    4. Run this script again
    echo.
    set /p repo_url="📝 Enter your GitHub repository URL (or press Enter to exit): "
    
    if not "%repo_url%"=="" (
        echo 🔗 Adding remote repository...
        git remote add origin %repo_url%
        echo ✅ Remote added successfully
        echo.
    ) else (
        echo ℹ️  Exiting. Add remote manually and run script again.
        pause
        exit /b 0
    )
)

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
    
    REM Get repository URL for display
    for /f "tokens=*" %%i in ('git remote get-url origin') do set REPO_URL=%%i
    
    echo 🌐 Your repository: %REPO_URL%
    echo.
    echo 🚀 ENABLE GITHUB PAGES:
    echo    1. Go to your repository on GitHub
    echo    2. Click "Settings" tab
    echo    3. Scroll to "Pages" section
    echo    4. Source: "GitHub Actions"
    echo    5. Save settings
    echo.
    echo ⏱️  GitHub will automatically build and deploy your game!
    echo    Build status: %REPO_URL%/actions
    echo.
    echo 🎮 Your game will be live at:
    
    REM Extract username and repo name for GitHub Pages URL
    for /f "tokens=4,5 delims=/" %%a in ("%REPO_URL%") do (
        set USERNAME=%%a
        set REPONAME=%%b
    )
    
    REM Remove .git extension if present
    set REPONAME=%REPONAME:.git=%
    
    echo    https://%USERNAME%.github.io/%REPONAME%
    echo.
    echo 📚 DOCUMENTATION:
    echo    • README.md - Complete overview
    echo    • DEPLOYMENT_GUIDE.md - Deployment instructions
    echo    • COMPLETE_AUCTION_FLOW.md - Game features
    echo.
    echo 🎯 Share your auction game with cricket fans worldwide! 🏏
    
) else (
    echo.
    echo ❌ Push failed. Common solutions:
    echo    1. Check if the repository URL is correct
    echo    2. Make sure you have push permissions
    echo    3. Try: git push --force origin main
    echo.
)

echo.
pause