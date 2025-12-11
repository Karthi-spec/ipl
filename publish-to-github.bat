@echo off
title IPL Auction - GitHub Setup
color 0A

echo.
echo ================================================================================
echo                    IPL AUCTION GAME - GITHUB SETUP
echo ================================================================================
echo.

echo STEP 1: Install GitHub Desktop (Easiest Way)
echo.
echo 1. Download GitHub Desktop: https://desktop.github.com/
echo 2. Install and sign in with your GitHub account
echo 3. This will automatically install Git for you
echo.
echo ================================================================================
echo.

echo STEP 2: Create Repository on GitHub
echo.
echo 1. Go to: https://github.com
echo 2. Click "New repository" (green button)
echo 3. Repository name: ipl-auction-game
echo 4. Description: IPL Auction Game with Real-time Bidding
echo 5. Make it PUBLIC
echo 6. Do NOT check "Add a README file"
echo 7. Click "Create repository"
echo.
echo ================================================================================
echo.

echo STEP 3: Add Project to GitHub Desktop
echo.
echo 1. Open GitHub Desktop
echo 2. Click "Add an Existing Repository from your hard drive"
echo 3. Browse and select this folder: %CD%
echo 4. Click "Add Repository"
echo.
echo ================================================================================
echo.

echo STEP 4: Publish to GitHub
echo.
echo 1. In GitHub Desktop, you'll see all your files
echo 2. Add commit message: "IPL Auction Game - Complete System"
echo 3. Click "Commit to main"
echo 4. Click "Publish repository"
echo 5. Repository name: ipl-auction-game
echo 6. Keep it public
echo 7. Click "Publish Repository"
echo.
echo ================================================================================
echo.

echo STEP 5: Enable GitHub Pages
echo.
echo 1. Go to your repository on GitHub.com
echo 2. Click Settings tab
echo 3. Scroll down to Pages section
echo 4. Source: GitHub Actions
echo 5. Click Save
echo.
echo Your game will be live at: https://YOUR_USERNAME.github.io/ipl-auction-game
echo.
echo ================================================================================
echo                              ALL DONE!
echo ================================================================================
echo.
echo The workflow is now fixed and ready for GitHub Pages deployment.
echo No more Vercel errors - clean GitHub-only setup!
echo.

pause