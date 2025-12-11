@echo off
title Publish IPL Auction Game to GitHub
color 0A

echo.
echo  ██████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗ 
echo ██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗
echo ██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝
echo ██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗
echo ╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝
echo  ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
echo.
echo                🏏 PUBLISH TO GITHUB 🏏
echo.
echo ================================================================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo 📥 Please install Git first:
    echo    Option 1: Download from https://git-scm.com/download/win
    echo    Option 2: Install GitHub Desktop from https://desktop.github.com/
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Check if this is a git repository
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
    echo.
)

echo 📋 Adding all files to Git...
git add .

echo.
echo 💬 Creating commit...
git commit -m "🏏 IPL Auction Game - Complete System with GitHub Pages Support"

if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit or commit failed
    echo.
)

echo.
echo 🌐 Repository Status:
git status --porcelain
if %errorlevel% equ 0 (
    echo ✅ Repository is clean
) else (
    echo ⚠️  There might be uncommitted changes
)

echo.
echo ================================================================================
echo                           📤 PUSH TO GITHUB
echo ================================================================================
echo.
echo 🔗 To push to GitHub, you need to:
echo.
echo 1️⃣  Create a repository on GitHub.com:
echo     - Go to https://github.com
echo     - Click "New repository"
echo     - Name: ipl-auction-game
echo     - Make it Public
echo     - Don't initialize with README
echo.
echo 2️⃣  Add the remote and push:
echo     git remote add origin https://github.com/YOUR_USERNAME/ipl-auction-game.git
echo     git branch -M main
echo     git push -u origin main
echo.
echo 3️⃣  Enable GitHub Pages:
echo     - Go to repository Settings
echo     - Scroll to Pages section
echo     - Source: GitHub Actions
echo     - Save
echo.
echo ✨ Your game will be live at: https://YOUR_USERNAME.github.io/ipl-auction-game
echo.
echo ================================================================================
echo                           🎉 READY TO PUBLISH! 🎉
echo ================================================================================
echo.

pause